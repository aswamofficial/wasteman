<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\ReportResource;
use App\Http\Resources\WardResource;
use App\Models\Report;
use App\Models\ReportEvent;
use App\Models\Setting;
use App\Models\User;
use App\Models\Ward;
use App\Services\Ai\Classification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminDashboardController extends Controller
{
    /**
     * The numbers a ward officer needs to run the day, not vanity metrics.
     *
     * Everything is scoped to the admin's ward when they have one, so the
     * figures always match the queue they can actually act on.
     */
    public function index(Request $request): JsonResponse
    {
        $data = $request->validate([
            'range' => ['nullable', 'in:7,14,30'],
        ]);
        $range = (int) ($data['range'] ?? 14);

        $ward = $request->user()->ward;
        $overdueDays = (int) Setting::value('overdue_days', 5);
        $targetDays = (int) Setting::value('resolution_target_days', 4);
        $overdueBefore = now()->subDays($overdueDays);

        /*
         * Every figure on this dashboard is municipal work.
         *
         * Recyclable pickups are a private transaction between a resident and
         * a collector — counting them into "open", "overdue", SLA or crew
         * workload would have the corporation measuring itself on jobs it
         * neither owns nor can action. They get their own summary below.
         */
        $base = fn () => Report::query()
            ->disposal()
            ->when($ward, fn ($q) => $q->where('ward_id', $ward->id));

        $anyStream = fn () => Report::query()->when($ward, fn ($q) => $q->where('ward_id', $ward->id));

        $byStatus = $base()
            ->selectRaw('status, COUNT(*) as total')
            ->groupBy('status')
            ->pluck('total', 'status');

        $open = (int) (($byStatus[Report::STATUS_PENDING] ?? 0) + ($byStatus[Report::STATUS_IN_PROGRESS] ?? 0));
        $overdue = (int) $base()->open()->where('created_at', '<=', $overdueBefore)->count();
        $unassigned = (int) $base()->open()->whereNull('assigned_to')->count();

        $avgHours = $base()->resolved()->whereNotNull('resolved_at')
            ->selectRaw('AVG(TIMESTAMPDIFF(HOUR, created_at, resolved_at)) as h')
            ->value('h');

        /*
         * Intake vs clearance — the only reliable signal of whether the ward is
         * keeping up. Built with two grouped queries rather than 2×N daily
         * counts, which was 28 round trips for a 14-day chart and would have
         * been 60 at the 30-day range.
         */
        $since = now()->subDays($range - 1)->startOfDay();

        $reportedByDay = $base()
            ->where('created_at', '>=', $since)
            ->selectRaw('DATE(created_at) as d, COUNT(*) as total')
            ->groupBy('d')->pluck('total', 'd');

        $resolvedByDay = $base()
            ->whereNotNull('resolved_at')->where('resolved_at', '>=', $since)
            ->selectRaw('DATE(resolved_at) as d, COUNT(*) as total')
            ->groupBy('d')->pluck('total', 'd');

        $days = collect(range($range - 1, 0))->map(function (int $back) use ($reportedByDay, $resolvedByDay) {
            $day = now()->subDays($back);
            $key = $day->toDateString();

            return [
                'label' => $day->format('d M'),
                'reported' => (int) ($reportedByDay[$key] ?? 0),
                'resolved' => (int) ($resolvedByDay[$key] ?? 0),
            ];
        });

        /*
         * How long open work has been sitting. This is the triage view — an
         * "open" count alone says nothing about whether it's fresh or rotting.
         */
        $aging = [
            'fresh' => (int) $base()->open()->where('created_at', '>', now()->subDays(2))->count(),
            'watch' => (int) $base()->open()
                ->whereBetween('created_at', [$overdueBefore, now()->subDays(2)])->count(),
            'overdue' => $overdue,
        ];

        /*
         * SLA against the configured target, measured only on reports that
         * actually closed — counting still-open ones as "missed" would punish
         * work that may yet land inside the target.
         */
        $resolvedTotal = (int) $base()->resolved()->whereNotNull('resolved_at')->count();
        $withinTarget = (int) $base()->resolved()->whereNotNull('resolved_at')
            ->whereRaw('TIMESTAMPDIFF(HOUR, created_at, resolved_at) <= ?', [$targetDays * 24])
            ->count();

        // This period vs the one before it, so the headline numbers carry
        // direction rather than being a bare count.
        $prevFrom = now()->subDays($range * 2 - 1)->startOfDay();
        $prevTo = $since;

        $delta = fn (int $now, int $prev) => $prev > 0
            ? (int) round((($now - $prev) / $prev) * 100)
            : ($now > 0 ? 100 : 0);

        $reportedNow = (int) $reportedByDay->sum();
        $reportedPrev = (int) $base()->whereBetween('created_at', [$prevFrom, $prevTo])->count();
        $resolvedNow = (int) $resolvedByDay->sum();
        $resolvedPrev = (int) $base()->whereNotNull('resolved_at')
            ->whereBetween('resolved_at', [$prevFrom, $prevTo])->count();

        return response()->json([
            'scope' => $ward
                ? ['type' => 'ward', 'ward' => new WardResource($ward)]
                : ['type' => 'city', 'ward' => null],

            'range' => $range,

            'headline' => [
                'open' => $open,
                'overdue' => $overdue,
                'unassigned' => $unassigned,
                'resolved_this_month' => (int) $base()->resolved()
                    ->whereBetween('resolved_at', [now()->startOfMonth(), now()])->count(),
                'avg_resolution_days' => round(((float) $avgHours) / 24, 1),
                'overdue_threshold_days' => $overdueDays,
                'target_days' => $targetDays,
                // Reported/resolved in this window, with the change on the
                // previous window of the same length.
                'reported_period' => $reportedNow,
                'reported_delta' => $delta($reportedNow, $reportedPrev),
                'resolved_period' => $resolvedNow,
                'resolved_delta' => $delta($resolvedNow, $resolvedPrev),
                // Positive means the backlog grew over the window.
                'backlog_change' => $reportedNow - $resolvedNow,
            ],

            'aging' => $aging,

            'sla' => [
                'resolved_total' => $resolvedTotal,
                'within_target' => $withinTarget,
                'percent' => $resolvedTotal > 0
                    ? (int) round(($withinTarget / $resolvedTotal) * 100)
                    : null,
            ],

            // What has actually happened lately, so the console shows activity
            // and not just standing totals.
            'recent_activity' => ReportEvent::query()
                ->when($ward, fn ($q) => $q->whereHas('report', fn ($r) => $r->where('ward_id', $ward->id)))
                ->with(['actor:id,name', 'report:id,reference,waste_type'])
                ->latest()
                ->limit(8)
                ->get()
                ->map(fn (ReportEvent $e) => [
                    'type' => $e->type,
                    'title' => $e->title,
                    'reference' => $e->report?->reference,
                    'report_id' => $e->report_id,
                    'actor' => $e->actor?->name,
                    'at_human' => $e->created_at?->diffForHumans(),
                ]),

            'by_status' => [
                'pending' => (int) ($byStatus[Report::STATUS_PENDING] ?? 0),
                'in_progress' => (int) ($byStatus[Report::STATUS_IN_PROGRESS] ?? 0),
                'resolved' => (int) ($byStatus[Report::STATUS_RESOLVED] ?? 0),
                'rejected' => (int) ($byStatus[Report::STATUS_REJECTED] ?? 0),
            ],

            'by_severity' => $base()->open()
                ->selectRaw('severity, COUNT(*) as total')
                ->groupBy('severity')->pluck('total', 'severity'),

            'by_waste_type' => $base()->open()
                ->selectRaw('waste_type, COUNT(*) as total')
                ->whereNotNull('waste_type')
                ->groupBy('waste_type')->orderByDesc('total')->limit(6)
                ->get()->map(fn ($r) => ['label' => $r->waste_type, 'count' => (int) $r->total]),

            /*
             * How much of the breakdown above rests on a real model.
             *
             * Every waste type here came from a classifier, and the offline
             * stub produces types by hashing the photo's bytes. Charting that
             * without saying so turns placeholder data into an operational
             * statistic someone might plan collection rounds around.
             */
            /*
             * The recycling stream, reported separately because it is diverted
             * from municipal collection rather than performed by it. This is
             * the number that says how much waste the corporation did NOT have
             * to send a crew for.
             */
            'recycling' => [
                'open' => (int) $anyStream()->recyclable()->open()->count(),
                'awaiting_collector' => (int) $anyStream()->availableToContractors()->count(),
                'collected' => (int) $anyStream()->recyclable()->whereNotNull('settled_at')->count(),
                'diverted_kg' => round((float) $anyStream()->recyclable()->sum('settled_weight_kg'), 1),
                'paid_to_residents' => round((float) $anyStream()->recyclable()->sum('settled_amount'), 2),
                // Sent to a collector, refused, and handed back to the ward.
                'returned_to_ward' => (int) $anyStream()
                    ->where('converted_from', Classification::STREAM_RECYCLABLE)->count(),
            ],

            'classification' => [
                'analysed' => (int) $base()->open()->whereNotNull('waste_type')->count(),
                'unverified' => (int) $base()->open()
                    ->whereNotNull('waste_type')
                    ->where(fn ($q) => $q->where('ai_engine', '!=', 'claude')->orWhereNull('ai_engine'))
                    ->count(),
            ],

            'trend' => $days,

            // Who is carrying what, so work can be levelled.
            'workload' => User::role(['admin', 'staff'])
                ->when($ward, fn ($q) => $q->where('ward_id', $ward->id))
                ->withCount([
                    'assignedReports as open_count' => fn ($q) => $q->whereIn('status', [
                        Report::STATUS_PENDING, Report::STATUS_IN_PROGRESS,
                    ]),
                ])
                ->orderByDesc('open_count')
                ->limit(8)
                ->get(['id', 'name', 'email'])
                ->map(fn (User $u) => [
                    'id' => $u->id,
                    'name' => $u->name,
                    'open_count' => (int) $u->open_count,
                ]),

            // Oldest open first — what actually needs a decision now.
            'needs_attention' => ReportResource::collection(
                $base()->open()->with(['user:id,name', 'ward'])->oldest()->limit(5)->get()
            ),

            'coverage' => [
                'wards_total' => $ward ? 1 : Ward::count(),
                'wards_with_staff' => $ward
                    ? (User::role(['admin', 'staff'])->where('ward_id', $ward->id)->exists() ? 1 : 0)
                    : User::role(['admin', 'staff'])->whereNotNull('ward_id')->distinct()->count('ward_id'),
                'citizens' => User::role('citizen')->count(),
            ],
        ]);
    }
}
