<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\ReportResource;
use App\Http\Resources\WardResource;
use App\Models\AppNotification;
use App\Models\Report;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    /**
     * Everything the citizen home screen renders, in one round trip — the
     * screen shows all of it above the fold, so splitting it into three
     * requests would only add latency.
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        $mine = Report::where('user_id', $user->id);

        $stats = [
            'reported' => (clone $mine)->count(),
            'resolved' => (clone $mine)->resolved()->count(),
            'in_progress' => (clone $mine)->where('status', Report::STATUS_IN_PROGRESS)->count(),
            'pending' => (clone $mine)->where('status', Report::STATUS_PENDING)->count(),
            // Only resolved reports have actually been cleared.
            'cleared_kg' => (int) (clone $mine)->resolved()->sum('estimated_weight_kg'),
            'this_month' => (clone $mine)->where('created_at', '>=', now()->startOfMonth())->count(),
            // Anything open past the 5-day target — the citizen's own view of
            // what the ward still owes them.
            'overdue' => (clone $mine)->open()->where('created_at', '<=', now()->subDays(5))->count(),
        ];

        /*
         * The "Live activity" strip is neighbourhood-wide, not personal — a new
         * user with no reports of their own should still see the area working.
         * Scoped to the user's real ward when they have one; otherwise it's
         * genuinely city-wide and the UI labels it that way.
         */
        $userWard = $user->ward;

        $area = fn () => Report::query()->when($userWard, fn ($q) => $q->where('ward_id', $userWard->id));

        $community = [
            'reported' => $area()->count(),
            'resolved' => $area()->resolved()->count(),
            'in_progress' => $area()->where('status', Report::STATUS_IN_PROGRESS)->count(),
            'cleared_kg' => (int) $area()->resolved()->sum('estimated_weight_kg'),
        ];

        $recent = Report::where('user_id', $user->id)
            ->latest()
            ->limit(5)
            ->get();

        // Pins for the home map preview: everything nearby, not just this
        // user's, so the map shows real neighbourhood activity.
        $pins = Report::query()
            ->whereIn('status', [
                Report::STATUS_PENDING,
                Report::STATUS_IN_PROGRESS,
                Report::STATUS_RESOLVED,
            ])
            ->latest()
            ->limit(50)
            ->get(['id', 'reference', 'latitude', 'longitude', 'status', 'waste_type']);

        return response()->json([
            'user' => [
                'name' => $user->name,
                'ward' => $userWard ? new WardResource($userWard) : null,
                'avatar_url' => $user->avatar_url,
            ],
            // What the community strip is actually counting.
            'community_scope' => $userWard ? $userWard->label() : 'Coimbatore',
            'stats' => $stats,
            'community' => $community,
            'recent_reports' => ReportResource::collection($recent),
            'pins' => $pins,
            'unread_notifications' => AppNotification::where('user_id', $user->id)->unread()->count(),
        ]);
    }
}
