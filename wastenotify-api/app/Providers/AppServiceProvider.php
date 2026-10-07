<?php

namespace App\Providers;

use Anthropic\Client as AnthropicClient;
use App\Services\Ai\ClaudeWasteClassifier;
use App\Services\Ai\FallbackWasteClassifier;
use App\Services\Ai\StubWasteClassifier;
use App\Services\Ai\WasteClassifier;
use App\Services\Push\FcmSender;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        // With a key, classify for real and degrade to the stub on failure.
        // Without one, the stub is the whole implementation so the report flow
        // still works end to end on a fresh checkout.
        $this->app->singleton(WasteClassifier::class, function () {
            $key = config('services.anthropic.key');

            if (! $key) {
                return new StubWasteClassifier;
            }

            /*
             * A bounded timeout, well under the SDK's 10-minute default.
             *
             * The citizen is holding their phone up waiting for this. A call
             * that is going to hang should hit the stub quickly rather than
             * keeping the capture screen spinning — one retry inside that
             * window covers a transient blip without stretching the wait.
             */
            $client = new AnthropicClient(
                apiKey: $key,
                requestOptions: ['timeout' => 45.0, 'maxRetries' => 1],
            );

            return new FallbackWasteClassifier(
                new ClaudeWasteClassifier($client),
                new StubWasteClassifier,
            );
        });

        // Always bound. Without credentials it reports itself unconfigured and
        // every send is a logged no-op, so nothing else has to branch on it.
        $this->app->singleton(FcmSender::class, fn () => new FcmSender(
            projectId: config('services.fcm.project_id'),
            clientEmail: config('services.fcm.client_email'),
            privateKey: config('services.fcm.private_key'),
        ));
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        $this->configureRateLimiters();
    }

    /**
     * Named rate limiters applied to route groups in routes/api.php. Blocked
     * requests get an automatic HTTP 429 with a Retry-After header.
     */
    private function configureRateLimiters(): void
    {
        // Sign-in attempts: strict, keyed by email + IP so one attacker can't
        // lock out a victim by guessing their email from another IP.
        RateLimiter::for('login', function (Request $request) {
            $email = (string) $request->input('email');

            return [
                Limit::perMinute(5)->by($email.'|'.$request->ip()),
                Limit::perMinute(20)->by($request->ip()),
            ];
        });

        // Other unauthenticated auth endpoints (register, forgot password).
        RateLimiter::for('auth', fn (Request $request) => Limit::perMinute(10)->by($request->ip()));

        // General API traffic - applied globally via throttleApi() in bootstrap/app.php.
        RateLimiter::for('api', fn (Request $request) => Limit::perMinute(120)->by(
            optional($request->user())->id ?: $request->ip()
        ));

        // User-generated content submissions - curbs spam/flooding.
        RateLimiter::for('content', fn (Request $request) => Limit::perMinute(20)->by(
            optional($request->user())->id ?: $request->ip()
        ));
    }
}
