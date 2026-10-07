<?php

namespace App\Http\Controllers\Api\Contractor;

use App\Http\Controllers\Controller;
use App\Models\ContractorProfile;
use App\Models\Ward;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class ContractorProfileController extends Controller
{
    /**
     * The signed-in user's collector profile, including its approval state.
     *
     * Deliberately outside the verified-contractor gate: a pending applicant
     * has to be able to see that they are pending. Locking this behind
     * verification would leave them staring at a 403 with no way to learn why.
     */
    public function show(Request $request): JsonResponse
    {
        $profile = $request->user()->contractorProfile;

        return response()->json([
            'profile' => $profile ? $this->present($profile) : null,
            'wards' => Ward::routable()->orderBy('town')->orderBy('ward_no')
                ->get(['id', 'ward_no', 'zone', 'town'])
                ->map(fn (Ward $w) => ['id' => $w->id, 'label' => $w->label()]),
        ]);
    }

    /**
     * Register as a collector, or update the registration.
     *
     * Creating a profile never grants access — status starts 'pending' and only
     * an administrator moves it. Editing an approved profile is allowed, but
     * changing the business identity sends it back for re-approval: the point
     * of verification is that a named business was checked, and letting that
     * name be swapped afterwards would make the check meaningless.
     */
    public function store(Request $request): JsonResponse
    {
        $user = $request->user();

        $data = $request->validate([
            'business_name' => ['required', 'string', 'max:160'],
            'licence_no' => ['nullable', 'string', 'max:80'],
            'contact_phone' => ['nullable', 'string', 'regex:/^\+?[0-9 ]{8,20}$/'],
            'ward_ids' => ['required', 'array', 'min:1', 'max:40'],
            'ward_ids.*' => ['integer', Rule::exists('wards', 'id')],
        ]);

        $profile = $user->contractorProfile;
        $identityChanged = $profile
            && ($profile->business_name !== $data['business_name']
                || ($profile->licence_no ?? '') !== ($data['licence_no'] ?? ''));

        $profile = ContractorProfile::updateOrCreate(
            ['user_id' => $user->id],
            [
                'business_name' => $data['business_name'],
                'licence_no' => $data['licence_no'] ?? null,
                'contact_phone' => $data['contact_phone'] ?? $user->phone,
                ...($profile && ! $identityChanged ? [] : [
                    'status' => ContractorProfile::STATUS_PENDING,
                    'verified_at' => null,
                    'verified_by' => null,
                    'status_reason' => $identityChanged ? 'Business details changed — re-approval required.' : null,
                ]),
            ],
        );

        $profile->wards()->sync($data['ward_ids']);

        // Adding the role here, not at signup, so the account only becomes a
        // collector account once they've actually applied to be one.
        if (! $user->hasRole('contractor')) {
            $user->assignRole('contractor');
        }

        return response()->json([
            'message' => $profile->isVerified()
                ? 'Collector details updated.'
                : 'Registration submitted. The corporation will review it before you can accept pickups.',
            'profile' => $this->present($profile->fresh()),
        ]);
    }

    private function present(ContractorProfile $profile): array
    {
        return [
            'id' => $profile->id,
            'business_name' => $profile->business_name,
            'licence_no' => $profile->licence_no,
            'contact_phone' => $profile->contact_phone,
            'status' => $profile->status,
            'status_reason' => $profile->status_reason,
            'verified_at' => $profile->verified_at?->toIso8601String(),
            'wards' => $profile->wards()->get()->map(fn (Ward $w) => [
                'id' => $w->id,
                'label' => $w->label(),
            ]),
        ];
    }
}
