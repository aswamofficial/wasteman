<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\District;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class DistrictController extends Controller
{
    /**
     * District outlines as a GeoJSON FeatureCollection — the state-wide
     * context layer under the ward polygons.
     *
     * The response carries its own provenance and a `coverage` note, because
     * the honest answer to "are all the districts here?" is *nearly*: the open
     * dataset predates Mayiladuthurai's 2020 separation from Nagapattinam, and
     * the map should say so rather than let 37 outlines imply 38.
     */
    public function boundaries(Request $request): JsonResponse
    {
        $state = $request->string('state')->toString() ?: 'Tamil Nadu';

        $payload = Cache::remember('districts.boundaries.v1.'.$state, now()->addDay(), function () use ($state) {
            $districts = District::query()
                ->where('state', $state)
                ->whereNotNull('boundary_geojson')
                ->orderBy('name')
                ->get();

            return [
                'type' => 'FeatureCollection',
                'features' => $districts->map(fn (District $d) => [
                    'type' => 'Feature',
                    'id' => $d->id,
                    'properties' => [
                        'id' => $d->id,
                        'name' => $d->name,
                        'state' => $d->state,
                        'dt_code' => $d->dt_code,
                        'centroid' => ['lat' => $d->centroid_lat, 'lng' => $d->centroid_lng],
                    ],
                    'geometry' => json_decode($d->boundary_geojson, true),
                ])->values(),
                'count' => $districts->count(),
                'source' => $districts->first()?->source,
                'source_year' => $districts->first()?->source_year,
                'coverage' => $this->coverageNote($state, $districts->count()),
            ];
        });

        return response()->json($payload);
    }

    /**
     * What this layer does and doesn't show. Only Tamil Nadu has a known gap
     * worth naming; any other state gets a plain count rather than a claim
     * that hasn't been checked.
     */
    private function coverageNote(string $state, int $count): ?string
    {
        if ($state !== 'Tamil Nadu') {
            return $count ? "{$count} districts mapped." : null;
        }

        return "{$count} of Tamil Nadu's 38 districts. Mayiladuthurai, separated from "
            .'Nagapattinam in 2020, is not delineated in the published boundary data and '
            .'is still drawn inside Nagapattinam.';
    }
}
