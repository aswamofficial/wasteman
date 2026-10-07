<?php

namespace App\Services\Push;

use App\Models\DeviceToken;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

/**
 * Firebase Cloud Messaging over the HTTP v1 API.
 *
 * v1, not the legacy server-key endpoint, because Google shut that one down in
 * 2024. v1 wants an OAuth2 access token from a service account, which is a
 * signed JWT exchanged at the token endpoint — done here directly rather than
 * pulling in the Firebase SDK for what is one signature and two POSTs.
 *
 * Unconfigured is a normal state, not an error: the app must work end to end
 * without FCM credentials, so every method degrades to a logged no-op. In-app
 * notifications are written regardless and remain the source of truth.
 */
class FcmSender
{
    public function __construct(
        private readonly ?string $projectId,
        private readonly ?string $clientEmail,
        private readonly ?string $privateKey,
    ) {}

    public function configured(): bool
    {
        return $this->projectId && $this->clientEmail && $this->privateKey;
    }

    /**
     * Push to every device registered to a user.
     *
     * @return int number of devices the message was accepted for
     */
    public function toUser(int $userId, string $title, string $body, array $data = []): int
    {
        if (! $this->configured()) {
            Log::debug('FCM not configured; skipping push', ['user_id' => $userId]);

            return 0;
        }

        $tokens = DeviceToken::where('user_id', $userId)->pluck('token', 'id');

        if ($tokens->isEmpty()) {
            return 0;
        }

        $access = $this->accessToken();
        if (! $access) {
            return 0;
        }

        $sent = 0;

        foreach ($tokens as $id => $token) {
            $response = Http::withToken($access)
                ->acceptJson()
                ->post("https://fcm.googleapis.com/v1/projects/{$this->projectId}/messages:send", [
                    'message' => [
                        'token' => $token,
                        'notification' => ['title' => $title, 'body' => $body],
                        // Strings only — FCM rejects non-string data values.
                        'data' => array_map(fn ($v) => (string) $v, $data),
                        'android' => ['priority' => 'high'],
                    ],
                ]);

            if ($response->successful()) {
                $sent++;

                continue;
            }

            /*
             * 404 UNREGISTERED / 400 INVALID_ARGUMENT mean the token is dead —
             * the app was uninstalled or the token rotated. Delete it, or the
             * table fills with addresses that can never be delivered to and
             * every send burns a request on them.
             */
            if (in_array($response->status(), [400, 404], true)) {
                DeviceToken::whereKey($id)->delete();

                continue;
            }

            Log::warning('FCM send failed', [
                'status' => $response->status(),
                'body' => $response->json('error.message'),
            ]);
        }

        return $sent;
    }

    /**
     * Service-account access token, cached just short of its hour-long life.
     */
    private function accessToken(): ?string
    {
        return Cache::remember('fcm.access_token', now()->addMinutes(55), function () {
            $now = time();
            $claims = [
                'iss' => $this->clientEmail,
                'scope' => 'https://www.googleapis.com/auth/firebase.messaging',
                'aud' => 'https://oauth2.googleapis.com/token',
                'iat' => $now,
                'exp' => $now + 3600,
            ];

            $jwt = $this->sign($claims);
            if (! $jwt) {
                return null;
            }

            $response = Http::asForm()->post('https://oauth2.googleapis.com/token', [
                'grant_type' => 'urn:ietf:params:oauth:grant-type:jwt-bearer',
                'assertion' => $jwt,
            ]);

            if (! $response->successful()) {
                Log::error('FCM token exchange failed', ['body' => $response->body()]);

                return null;
            }

            return $response->json('access_token');
        });
    }

    /** RS256-signed JWT from the service account's private key. */
    private function sign(array $claims): ?string
    {
        $segments = [
            $this->base64Url(json_encode(['alg' => 'RS256', 'typ' => 'JWT'])),
            $this->base64Url(json_encode($claims)),
        ];

        $input = implode('.', $segments);

        // The key arrives from .env with literal \n sequences when it's been
        // pasted onto one line; openssl needs real newlines.
        $key = openssl_pkey_get_private(str_replace('\n', "\n", $this->privateKey));

        if (! $key) {
            Log::error('FCM private key could not be read');

            return null;
        }

        if (! openssl_sign($input, $signature, $key, OPENSSL_ALGO_SHA256)) {
            return null;
        }

        return $input.'.'.$this->base64Url($signature);
    }

    private function base64Url(string $value): string
    {
        return rtrim(strtr(base64_encode($value), '+/', '-_'), '=');
    }
}
