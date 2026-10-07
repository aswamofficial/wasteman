<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Report;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class StatsController extends Controller
{
    /**
     * Everything the Impact screen renders, for one of three scopes.
     *
     * Rejected reports are excluded from every figure — they were judged not
     * to be waste, so counting them would inflate "reported" with things no
     * crew ever needed to act on.
     */
    public function index(Request $request): JsonResponse
    {
        $data = $request->validate([
            'scope' => ['nullable', 'in:me,ward,city'],
        ]);

        $scope = $data['scope'] ?? 'me';
        $user = $request->user();

        $base = fn (): Builder => Report::query()
            ->whereIn('status', [
                Report::STATUS_PENDING,
                Report::STATUS_IN_PROGRESS,
                Report::STATUS_RESOLVED,
            ])
            ->when($scope === 'me', fn ($q) => $q->where('user_id', $user->id))
            // Ward scope filters on the report's own derived ward, not on the
            // reporter's home ward — a report belongs to where the waste is.
            ->when($scope === 'ward' && $user->ward_id, fn ($q) => $q->where('ward_id', $user->ward_id));

        $reported = (int) $base()->count();
        $resolved = (int) $base()->resolved()->count();
        $clearedKg = (int) $base()->resolved()->sum('estimated_weight_kg');

        $avgHours = $base()->resolved()
            ->whereNotNull('resolved_at')
            ->selectRaw('AVG(TIMESTAMPDIFF(HOUR, created_at, resolved_at)) as h')
            ->value('h');

        // Previous 30 days vs the 30 before that, so the trend pill means
        // something rather than being decorative.
        $thisPeriod = (int) $base()->where('created_at', '>=', now()->subDays(30))->count();
        $prevPeriod = (int) $base()
            ->whereBetween('created_at', [now()->subDays(60), now()->subDays(30)])
            ->count();

        $trend = $prevPeriod > 0
            ? (int) round((($thisPeriod - $prevPeriod) / $prevPeriod) * 100)
            : ($thisPeriod > 0 ? 100 : 0);

        // Waste type split, largest first, capped at five plus "Other".
        $byType = $base()
            ->selectRaw('waste_type, COUNT(*) as total')
            ->whereNotNull('waste_type')
            ->groupBy('waste_type')
            ->orderByDesc('total')
            ->get();

        $typeTotal = max(1, (int) $byType->sum('total'));
        $top = $byType->take(5);
        $otherTotal = (int) $byType->slice(5)->sum('total');

        $breakdown = $top->map(fn ($row) => [
            'label' => $row->waste_type,
            'count' => (int) $row->total,
            'percent' => (int) round(((int) $row->total / $typeTotal) * 100),
        ])->values()->all();

        if ($otherTotal > 0) {
            $breakdown[] = [
                'label' => 'Other',
                'count' => $otherTotal,
                'percent' => (int) round(($otherTotal / $typeTotal) * 100),
            ];
        }

        // Six-month trend. Built from a pre-seeded month map so months with no
        // reports render as a genuine zero rather than being skipped, which
        // would make the line chart lie about the gaps.
        $months = collect(range(5, 0))->mapWithKeys(function (int $back) {
            $m = now()->subMonths($back);

            return [$m->format('Y-m') => ['label' => $m->format('M'), 'count' => 0]];
        });

        $base()
            ->where('created_at', '>=', now()->subMonths(5)->startOfMonth())
            ->selectRaw("DATE_FORMAT(created_at, '%Y-%m') as ym, COUNT(*) as total")
            ->groupBy('ym')
            ->get()
            ->each(function ($row) use ($months) {
                if ($months->has($row->ym)) {
                    $months[$row->ym] = ['label' => $months[$row->ym]['label'], 'count' => (int) $row->total];
                }
            });

        return response()->json([
            'scope' => $scope,
            // Names the scope honestly: a user with no ward set gets told so
            // rather than being shown city numbers under a "My ward" heading.
            'scope_label' => match ($scope) {
                'me' => 'Your reports',
                'ward' => $user->ward?->label() ?? 'No ward set',
                default => 'Coimbatore',
            },
            'scope_available' => $scope !== 'ward' || (bool) $user->ward_id,
            'headline' => [
                'cleared_kg' => $clearedKg,
                'trend_percent' => $trend,
            ],
            'stats' => [
                'reported' => $reported,
                'resolved' => $resolved,
                'resolution_rate' => $reported > 0 ? (int) round(($resolved / $reported) * 100) : 0,
                'avg_days' => round(((float) $avgHours) / 24, 1),
            ],
            'breakdown' => $breakdown,
            'trend' => $months->values()->all(),
            'badges' => $this->badges($user->reports()->count(), $resolved),
        ]);
    }

    /**
     * Achievements are always personal, whatever scope the chart is showing —
     * a badge that changed when you toggled to "City" would be meaningless.
     */
    private function badges(int $ownReports, int $resolvedInScope): array
    {
        $tiers = [
            ['key' => 'first', 'label' => 'First report', 'icon' => 'flag', 'target' => 1],
            ['key' => 'ten', 'label' => '10 reports', 'icon' => 'military_tech', 'target' => 10],
            ['key' => 'hero', 'label' => 'Ward hero', 'icon' => 'workspace_premium', 'target' => 25],
        ];

        return array_map(fn ($t) => [
            'key' => $t['key'],
            'label' => $t['label'],
            'icon' => $t['icon'],
            'earned' => $ownReports >= $t['target'],
            'progress' => min(100, (int) round(($ownReports / $t['target']) * 100)),
        ], $tiers);
    }
}
