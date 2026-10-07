<?php

namespace App\Http\Controllers\Api\Contractor;

use App\Http\Controllers\Controller;
use App\Http\Resources\ReportResource;
use App\Models\ContractorProfile;
use App\Models\MaterialRate;
use App\Models\Report;
use App\Services\PickupWorkflow;
use DomainException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PickupController extends Controller
{
    public function __construct(private readonly PickupWorkflow $workflow) {}

    /**
     * The open pool plus this contractor's own jobs.
     *
     * Scoped to the wards on their profile. A contractor with no wards set sees
     * an empty pool rather than the whole city — an unset service area is not a
     * claim to work everywhere, and the screen says so.
     */
    public function index(Request $request): JsonResponse
    {
        $data = $request->validate([
            'tab' => ['nullable', 'in:available,mine,history'],
        ]);

        $profile = $this->profile($request);
        $wardIds = $profile->wards()->pluck('wards.id');

        $tab = $data['tab'] ?? 'available';

        /*
         * Contact details are loaded only for jobs this collector has actually
         * accepted.
         *
         * The open pool is visible to every verified collector covering the
         * ward, so eager-loading the resident's phone there would hand out the
         * number of everyone in the ward with scrap to sell, to anyone who
         * signed up. The address is shown — you cannot judge whether a job is
         * worth taking without it — but the means to contact them arrives with
         * the commitment to turn up.
         */
        $query = Report::query()
            ->with(['ward'])
            ->when($tab === 'available', fn ($q) => $q
                ->availableToContractors()
                ->whereIn('ward_id', $wardIds)
                ->oldest())
            ->when($tab !== 'available', fn ($q) => $q->with('user:id,name,phone'))
            ->when($tab === 'mine', fn ($q) => $q
                ->where('assigned_to', $request->user()->id)
                ->where('status', Report::STATUS_IN_PROGRESS)
                ->oldest('accepted_at'))
            ->when($tab === 'history', fn ($q) => $q
                ->where('assigned_to', $request->user()->id)
                ->where('status', Report::STATUS_RESOLVED)
                ->latest('settled_at'));

        $reports = $query->limit(50)->get();

        return response()->json([
            'reports' => ReportResource::collection($reports),
            'counts' => [
                'available' => Report::availableToContractors()->whereIn('ward_id', $wardIds)->count(),
                'mine' => Report::where('assigned_to', $request->user()->id)
                    ->where('status', Report::STATUS_IN_PROGRESS)->count(),
                'history' => Report::where('assigned_to', $request->user()->id)
                    ->where('status', Report::STATUS_RESOLVED)->count(),
            ],
            'earnings' => [
                // What this contractor has paid out, not earned — the money
                // flows from them to residents, and labelling it "earnings"
                // on their own screen would invert the direction.
                'paid_total' => (float) Report::where('assigned_to', $request->user()->id)
                    ->whereNotNull('settled_at')->sum('settled_amount'),
                'collected_kg' => (float) Report::where('assigned_to', $request->user()->id)
                    ->whereNotNull('settled_at')->sum('settled_weight_kg'),
            ],
            'service_wards' => $profile->wards()->get(['wards.id', 'ward_no', 'zone', 'town'])
                ->map(fn ($w) => ['id' => $w->id, 'label' => $w->label()]),
            'rates' => MaterialRate::where('active', true)->pluck('rate_per_kg', 'material'),
        ]);
    }

    public function accept(Request $request, Report $report): JsonResponse
    {
        return $this->run(fn () => $this->workflow->accept($report, $request->user()));
    }

    public function settle(Request $request, Report $report): JsonResponse
    {
        $data = $request->validate([
            // Bounded rather than open: a mistyped amount here becomes a
            // permanent record of what a resident was supposedly paid.
            'amount' => ['required', 'numeric', 'min:0', 'max:100000'],
            'weight_kg' => ['required', 'numeric', 'min:0.1', 'max:5000'],
            'note' => ['nullable', 'string', 'max:500'],
        ]);

        return $this->run(fn () => $this->workflow->settle(
            $report,
            $request->user(),
            (float) $data['amount'],
            (float) $data['weight_kg'],
            $data['note'] ?? null,
        ));
    }

    public function reject(Request $request, Report $report): JsonResponse
    {
        $data = $request->validate([
            'reason' => ['required', 'string', 'min:4', 'max:255'],
        ]);

        return $this->run(fn () => $this->workflow->rejectToWard($report, $request->user(), $data['reason']));
    }

    public function release(Request $request, Report $report): JsonResponse
    {
        $data = $request->validate(['reason' => ['nullable', 'string', 'max:255']]);

        return $this->run(fn () => $this->workflow->release($report, $request->user(), $data['reason'] ?? null));
    }

    /** Domain refusals are answers, not faults — they come back as 422 with the reason. */
    private function run(callable $action): JsonResponse
    {
        try {
            return response()->json(['report' => new ReportResource($action())]);
        } catch (DomainException $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }
    }

    private function profile(Request $request): ContractorProfile
    {
        return $request->user()->contractorProfile
            ?? abort(403, 'No contractor profile on this account.');
    }
}
