<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\ContractorProfile;
use App\Models\MaterialRate;
use App\Models\Report;
use App\Models\Ward;
use App\Services\Notifier;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class AdminContractorController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $data = $request->validate([
            'status' => ['nullable', 'in:all,pending,verified,suspended'],
            'q' => ['nullable', 'string', 'max:120'],
        ]);

        $status = $data['status'] ?? 'pending';

        $profiles = ContractorProfile::query()
            ->with(['user:id,name,email,phone', 'wards:id,ward_no,zone,town'])
            ->when($status !== 'all', fn ($q) => $q->where('status', $status))
            ->when($data['q'] ?? null, fn ($q, $term) => $q
                ->where('business_name', 'like', "%{$term}%")
                ->orWhereHas('user', fn ($u) => $u->where('name', 'like', "%{$term}%")
                    ->orWhere('email', 'like', "%{$term}%")))
            // Oldest application first: the pending list is a queue people are
            // waiting in, not a feed.
            ->oldest('created_at')
            ->limit(100)
            ->get();

        return response()->json([
            'contractors' => $profiles->map(fn (ContractorProfile $p) => $this->present($p)),
            'counts' => [
                'all' => ContractorProfile::count(),
                'pending' => ContractorProfile::where('status', ContractorProfile::STATUS_PENDING)->count(),
                'verified' => ContractorProfile::where('status', ContractorProfile::STATUS_VERIFIED)->count(),
                'suspended' => ContractorProfile::where('status', ContractorProfile::STATUS_SUSPENDED)->count(),
            ],
        ]);
    }

    /**
     * Approve, suspend or send an application back to pending.
     *
     * Suspending does not touch pickups already accepted — the resident is
     * expecting that collector, and silently voiding the job would leave the
     * material sitting there with nobody assigned. It stops them taking
     * anything new; existing jobs are released explicitly if that's wanted.
     */
    public function update(Request $request, ContractorProfile $contractor, Notifier $notifier): JsonResponse
    {
        $data = $request->validate([
            'status' => ['required', Rule::in([
                ContractorProfile::STATUS_PENDING,
                ContractorProfile::STATUS_VERIFIED,
                ContractorProfile::STATUS_SUSPENDED,
            ])],
            'reason' => ['nullable', 'string', 'max:255'],
        ]);

        if ($data['status'] === ContractorProfile::STATUS_SUSPENDED && empty($data['reason'])) {
            return response()->json([
                'message' => 'Give a reason — the collector is shown it, and it is the record of why access was removed.',
            ], 422);
        }

        $contractor->forceFill([
            'status' => $data['status'],
            'status_reason' => $data['reason'] ?? null,
            'verified_at' => $data['status'] === ContractorProfile::STATUS_VERIFIED ? now() : null,
            'verified_by' => $data['status'] === ContractorProfile::STATUS_VERIFIED ? $request->user()->id : null,
        ])->save();

        $notifier->send(
            userId: $contractor->user_id,
            type: 'contractor_status',
            title: match ($data['status']) {
                ContractorProfile::STATUS_VERIFIED => 'You can now accept pickups',
                ContractorProfile::STATUS_SUSPENDED => 'Your collector account is suspended',
                default => 'Your collector application is under review',
            },
            body: $data['reason'] ?? match ($data['status']) {
                ContractorProfile::STATUS_VERIFIED => 'The corporation has approved your registration.',
                default => 'The corporation has changed the status of your registration.',
            },
        );

        return response()->json([
            'message' => 'Collector updated.',
            'contractor' => $this->present($contractor->fresh()->load(['user', 'wards'])),
        ]);
    }

    /** The published rate card. */
    public function rates(): JsonResponse
    {
        $rates = MaterialRate::orderBy('material')->get();

        return response()->json([
            'rates' => MaterialRate::materials()->map(function (string $material) use ($rates) {
                $row = $rates->firstWhere('material', $material);

                return [
                    'material' => $material,
                    // Null, not 0 — "no published rate" and "worth nothing"
                    // are different statements to make about someone's scrap.
                    'rate_per_kg' => $row?->rate_per_kg,
                    'active' => (bool) ($row?->active ?? false),
                ];
            }),
        ]);
    }

    public function saveRates(Request $request): JsonResponse
    {
        $data = $request->validate([
            'rates' => ['required', 'array'],
            'rates.*.material' => ['required', Rule::in(MaterialRate::materials()->all())],
            'rates.*.rate_per_kg' => ['nullable', 'numeric', 'min:0', 'max:10000'],
            'rates.*.active' => ['required', 'boolean'],
        ]);

        foreach ($data['rates'] as $row) {
            if ($row['rate_per_kg'] === null) {
                MaterialRate::where('material', $row['material'])->delete();

                continue;
            }

            MaterialRate::updateOrCreate(
                ['material' => $row['material']],
                ['rate_per_kg' => $row['rate_per_kg'], 'active' => $row['active']],
            );
        }

        return response()->json(['message' => 'Rate card updated.']);
    }

    private function present(ContractorProfile $p): array
    {
        return [
            'id' => $p->id,
            'user_id' => $p->user_id,
            'name' => $p->user?->name,
            'email' => $p->user?->email,
            'phone' => $p->contact_phone ?? $p->user?->phone,
            'business_name' => $p->business_name,
            'licence_no' => $p->licence_no,
            'status' => $p->status,
            'status_reason' => $p->status_reason,
            'verified_at' => $p->verified_at?->toIso8601String(),
            'applied_at' => $p->created_at?->toIso8601String(),
            'wards' => $p->wards->map(fn (Ward $w) => ['id' => $w->id, 'label' => $w->label()]),
            'open_pickups' => Report::where('assigned_to', $p->user_id)
                ->where('status', Report::STATUS_IN_PROGRESS)->count(),
            'completed_pickups' => Report::where('assigned_to', $p->user_id)
                ->whereNotNull('settled_at')->count(),
        ];
    }
}
