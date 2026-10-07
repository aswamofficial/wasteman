<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\DeviceToken;
use App\Services\Push\FcmSender;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DeviceController extends Controller
{
    /**
     * Register this device for push.
     *
     * updateOrCreate on the token, not on (user, token): if the same handset
     * signs in as somebody else, the row moves to the new account instead of
     * leaving a second owner able to receive their notifications.
     */
    public function store(Request $request, FcmSender $fcm): JsonResponse
    {
        $data = $request->validate([
            'token' => ['required', 'string', 'max:255'],
            'platform' => ['nullable', 'in:android,ios,web'],
        ]);

        DeviceToken::updateOrCreate(
            ['token' => $data['token']],
            [
                'user_id' => $request->user()->id,
                'platform' => $data['platform'] ?? null,
                'last_used_at' => now(),
            ],
        );

        return response()->json([
            'message' => 'Device registered.',
            // The client shows a plain "push is off" state rather than
            // promising alerts the server has no way to deliver.
            'push_enabled' => $fcm->configured(),
        ]);
    }

    /** Unregister on sign-out, so the next user of this handset isn't sent someone else's reports. */
    public function destroy(Request $request): JsonResponse
    {
        $data = $request->validate(['token' => ['required', 'string', 'max:255']]);

        DeviceToken::where('token', $data['token'])
            ->where('user_id', $request->user()->id)
            ->delete();

        return response()->json(['message' => 'Device removed.']);
    }
}
