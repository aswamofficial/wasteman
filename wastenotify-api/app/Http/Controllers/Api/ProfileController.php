<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\UserResource;
use App\Models\AppNotification;
use App\Models\Report;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class ProfileController extends Controller
{
    public function show(Request $request): JsonResponse
    {
        $user = $request->user();

        $mine = Report::where('user_id', $user->id);

        return response()->json([
            'user' => new UserResource($user->load('ward')->loadCount('reports')),
            'stats' => [
                'reported' => (clone $mine)->count(),
                'resolved' => (clone $mine)->resolved()->count(),
                'cleared_kg' => (int) (clone $mine)->resolved()->sum('estimated_weight_kg'),
            ],
        ]);
    }

    public function update(Request $request): JsonResponse
    {
        $user = $request->user();

        $data = $request->validate([
            'name' => ['required', 'string', 'max:120'],
            // Ignore this user's own row so re-saving an unchanged address
            // doesn't fail its own uniqueness check.
            'email' => ['required', 'email', 'max:180', Rule::unique('users')->ignore($user->id)],
            'phone' => [
                'required', 'string', 'regex:/^\+?[0-9 ]{8,20}$/',
                Rule::unique('users')->ignore($user->id),
            ],
            'ward_id' => ['nullable', 'integer', 'exists:wards,id'],
        ], [
            'phone.regex' => 'Enter a valid phone number, digits only, with or without a country code.',
        ]);

        $phone = preg_replace('/\s+/', '', $data['phone']);

        // Changing a contact address invalidates its verification — otherwise
        // an unverified new address would inherit the old one's trusted badge.
        if ($data['email'] !== $user->email) {
            $user->email_verified_at = null;
        }
        if ($phone !== $user->phone) {
            $user->phone_verified_at = null;
        }

        $user->fill([
            'name' => $data['name'],
            'email' => $data['email'],
            'phone' => $phone,
            'ward_id' => $data['ward_id'] ?? $user->ward_id,
        ])->save();

        return response()->json([
            'message' => 'Profile updated.',
            'user' => new UserResource($user->fresh()->load('ward')->loadCount('reports')),
        ]);
    }

    public function avatar(Request $request): JsonResponse
    {
        $request->validate([
            'avatar' => ['required', 'image', 'mimes:jpeg,png,webp', 'max:4096'],
        ]);

        $user = $request->user();
        $old = $user->avatar_url;

        $path = $request->file('avatar')->store('avatars', 'public');
        $user->update(['avatar_url' => Storage::disk('public')->url($path)]);

        // Don't accumulate orphaned avatars, but only delete files we stored.
        if ($old && str_contains($old, '/storage/avatars/')) {
            Storage::disk('public')->delete('avatars/'.basename($old));
        }

        return response()->json([
            'message' => 'Photo updated.',
            'user' => new UserResource($user->fresh()->load('ward')->loadCount('reports')),
        ]);
    }

    /**
     * Delete the signed-in user's account.
     *
     * Google Play requires any app offering account creation to also offer
     * in-app account deletion, so this is a store requirement, not a nicety.
     *
     * Reports are kept but anonymised rather than deleted: they are civic
     * records a municipal crew may have acted on, and removing them would
     * rewrite the ward's history. Everything that identifies the person goes.
     */
    public function destroy(Request $request): JsonResponse
    {
        $data = $request->validate([
            'password' => ['required', 'string'],
            'confirm' => ['required', 'accepted'],
        ]);

        $user = $request->user();

        if (! Hash::check($data['password'], $user->password)) {
            throw ValidationException::withMessages([
                'password' => 'That password is not correct.',
            ]);
        }

        DB::transaction(function () use ($user) {
            // Personal photos go; the report and its municipal record stay.
            if ($user->avatar_url && str_contains($user->avatar_url, '/storage/avatars/')) {
                Storage::disk('public')->delete('avatars/'.basename($user->avatar_url));
            }

            AppNotification::where('user_id', $user->id)->delete();
            $user->tokens()->delete();

            $anonymous = User::firstOrCreate(
                ['email' => 'deleted-user@wastenotify.invalid'],
                [
                    'name' => 'Deleted account',
                    'phone' => null,
                    'password' => Str::password(32),
                ]
            );

            Report::where('user_id', $user->id)->update([
                'user_id' => $anonymous->id,
                'note' => null,
            ]);

            $user->delete();
        });

        return response()->json(['message' => 'Your account has been deleted.']);
    }

    public function password(Request $request): JsonResponse
    {
        $data = $request->validate([
            'current_password' => ['required', 'string'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
        ]);

        $user = $request->user();

        if (! Hash::check($data['current_password'], $user->password)) {
            throw ValidationException::withMessages([
                'current_password' => 'That password is not correct.',
            ]);
        }

        $user->update(['password' => $data['password']]);

        // Every other session is now using a password the user just replaced —
        // most likely because they think it was compromised. Revoke them all
        // except the one making this request.
        $current = $user->currentAccessToken();
        $user->tokens()->where('id', '!=', $current->id)->delete();

        return response()->json(['message' => 'Password changed. Other devices have been signed out.']);
    }
}
