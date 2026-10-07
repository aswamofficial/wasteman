<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    /**
     * Manual signup. Phone and email are both mandatory — the phone is how the
     * clean-up crew reaches the reporter on site, the email carries the
     * resolution notice.
     */
    public function register(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:120'],
            'email' => ['required', 'string', 'email', 'max:180', 'unique:users,email'],
            'phone' => ['required', 'string', 'regex:/^\+?[0-9 ]{8,20}$/', 'unique:users,phone'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
            'ward_id' => ['nullable', 'integer', 'exists:wards,id'],
        ], [
            'phone.regex' => 'Enter a valid phone number, digits only, with or without a country code.',
            'phone.unique' => 'That phone number is already registered.',
        ]);

        $user = DB::transaction(function () use ($data) {
            $user = User::create([
                'name' => $data['name'],
                'email' => $data['email'],
                'phone' => $this->normalisePhone($data['phone']),
                'password' => $data['password'],
                'ward_id' => $data['ward_id'] ?? null,
            ]);

            $user->assignRole('citizen');

            return $user;
        });

        return $this->tokenResponse($user, 'Account created.', 201);
    }

    public function login(Request $request): JsonResponse
    {
        $data = $request->validate([
            'email' => ['required', 'string', 'email'],
            'password' => ['required', 'string'],
        ]);

        $user = User::where('email', $data['email'])->first();

        // One message for both cases so the endpoint can't be used to discover
        // which email addresses are registered.
        if (! $user || ! Hash::check($data['password'], $user->password)) {
            throw ValidationException::withMessages([
                'email' => 'Those credentials do not match our records.',
            ]);
        }

        // Checked after the password so a suspended account can't be probed by
        // anyone who doesn't already have the credentials.
        if ($user->isSuspended()) {
            throw ValidationException::withMessages([
                'email' => $user->suspended_reason
                    ? "This account is suspended: {$user->suspended_reason}"
                    : 'This account has been suspended. Contact the municipal office.',
            ]);
        }

        $user->forceFill(['last_seen_at' => now()])->saveQuietly();

        return $this->tokenResponse($user, 'Signed in.');
    }

    public function me(Request $request): JsonResponse
    {
        return response()->json([
            'user' => new UserResource($request->user()->load('ward')->loadCount('reports')),
        ]);
    }

    public function logout(Request $request): JsonResponse
    {
        // Only the token used for this request, so signing out on a phone
        // doesn't sign the same account out on the web.
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Signed out.']);
    }

    private function tokenResponse(User $user, string $message, int $status = 200): JsonResponse
    {
        $token = $user->createToken('wastenotify')->plainTextToken;

        return response()->json([
            'message' => $message,
            'token' => $token,
            'user' => new UserResource($user->load('ward')->loadCount('reports')),
        ], $status);
    }

    private function normalisePhone(string $phone): string
    {
        return preg_replace('/\s+/', '', $phone);
    }
}
