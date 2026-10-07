<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\ReportResource;
use App\Models\Report;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ReportMapController extends Controller
{
    /**
     * Reports for the map screen, with the counts the filter chips display.
     *
     * Rejected reports are never mapped — they were judged not to be waste, so
     * showing them would misrepresent the state of the city.
     */
    public function index(Request $request): JsonResponse
    {
        $data = $request->validate([
            'status' => ['nullable', 'string'],
            'type' => ['nullable', 'string', 'max:120'],
            'lat' => ['nullable', 'numeric', 'between:-90,90'],
            'lng' => ['nullable', 'numeric', 'between:-180,180'],
            'radius_km' => ['nullable', 'numeric', 'min:0.1', 'max:500'],
            'mine' => ['nullable', 'boolean'],
        ]);

        $mappable = [
            Report::STATUS_PENDING,
            Report::STATUS_IN_PROGRESS,
            Report::STATUS_RESOLVED,
        ];

        $base = Report::query()->whereIn('status', $mappable);

        if ($request->boolean('mine')) {
            $base->where('user_id', $request->user()->id);
        }

        // Counts come from the unfiltered-by-status set so the chips always
        // show the full picture, not what's left after the current filter.
        $counts = (clone $base)
            ->selectRaw('status, COUNT(*) as total')
            ->groupBy('status')
            ->pluck('total', 'status');

        $query = clone $base;

        if (! empty($data['status']) && $data['status'] !== 'all') {
            $statuses = array_values(array_intersect(
                array_map('trim', explode(',', $data['status'])),
                $mappable
            ));
            if ($statuses) {
                $query->whereIn('status', $statuses);
            }
        }

        if (! empty($data['type'])) {
            $query->where('waste_type', $data['type']);
        }

        $hasOrigin = isset($data['lat'], $data['lng']);

        if ($hasOrigin) {
            // Haversine in SQL so distance sorting and the radius cut happen in
            // the database rather than after loading every report.
            $haversine = '(6371 * acos(
                least(1, greatest(-1,
                    cos(radians(?)) * cos(radians(latitude))
                    * cos(radians(longitude) - radians(?))
                    + sin(radians(?)) * sin(radians(latitude))
                ))
            ))';

            $query->select('*')
                ->selectRaw("$haversine as distance_km", [$data['lat'], $data['lng'], $data['lat']])
                ->orderBy('distance_km');

            if (! empty($data['radius_km'])) {
                $query->havingRaw('distance_km <= ?', [$data['radius_km']]);
            }
        } else {
            $query->latest();
        }

        $reports = $query->limit(300)->get();

        return response()->json([
            'reports' => ReportResource::collection($reports),
            'counts' => [
                'all' => (int) $counts->sum(),
                'pending' => (int) ($counts[Report::STATUS_PENDING] ?? 0),
                'in_progress' => (int) ($counts[Report::STATUS_IN_PROGRESS] ?? 0),
                'resolved' => (int) ($counts[Report::STATUS_RESOLVED] ?? 0),
            ],
            'waste_types' => (clone $base)
                ->whereNotNull('waste_type')
                ->distinct()
                ->orderBy('waste_type')
                ->pluck('waste_type'),
        ]);
    }

    public function show(Report $report): JsonResponse
    {
        return response()->json([
            'report' => new ReportResource($report->load('user')),
        ]);
    }
}
