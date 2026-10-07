<?php

namespace App\Http\Middleware;

use App\Models\ContractorProfile;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Gate on every contractor endpoint that exposes a pickup.
 *
 * Accepting a pickup gives someone a resident's home address and a reason to
 * be there. That makes verification a safety control, not an admin
 * convenience, so it is enforced once here rather than re-checked inside each
 * controller method — the endpoint someone forgets to check is exactly the one
 * that would leak.
 *
 * The distinct statuses come back as distinct messages, because "we haven't
 * approved you yet" and "we suspended you" need different things from the
 * person reading them.
 */
class EnsureVerifiedContractor
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();
        $profile = $user?->contractorProfile;

        if (! $user || ! $user->hasRole('contractor') || ! $profile) {
            return response()->json(['message' => 'This account is not registered as a collector.'], 403);
        }

        if ($profile->status === ContractorProfile::STATUS_PENDING) {
            return response()->json([
                'message' => 'Your collector account is awaiting approval by the corporation.',
                'contractor_status' => ContractorProfile::STATUS_PENDING,
            ], 403);
        }

        if ($profile->status === ContractorProfile::STATUS_SUSPENDED) {
            return response()->json([
                'message' => $profile->status_reason
                    ? "Your collector account is suspended: {$profile->status_reason}"
                    : 'Your collector account is suspended.',
                'contractor_status' => ContractorProfile::STATUS_SUSPENDED,
            ], 403);
        }

        return $next($request);
    }
}
