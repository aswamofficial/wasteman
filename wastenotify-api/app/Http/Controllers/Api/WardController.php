<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\WardResource;
use App\Models\Ward;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Cache;
use Illuminate\Http\Request;

class WardController extends Controller
{
    /**
     * The real ward list, grouped by zone for the picker.
     *
     * Sourced from the imported official boundary data — if the table is empty
     * the API says so instead of returning an empty list the UI would render
     * as "no wards exist".
     */
    public function index(Request $request): JsonResponse
    {
        /*
         * The picker offers wards someone can actually be assigned to, so it
         * is routable-only by default. Mapped-but-unserved cities would
         * otherwise appear as choosable home wards and staff postings that
         * quietly do nothing. `?all=1` returns everything, for screens that
         * are describing the map rather than assigning work.
         */
        $wards = Ward::query()
            ->unless($request->boolean('all'), fn ($q) => $q->routable())
            ->when($request->string('town')->toString(), fn ($q, $town) => $q->where('town', $town))
            ->orderBy('town')->orderBy('ward_no')
            ->get();

        return response()->json([
            'wards' => WardResource::collection($wards),
            'zones' => $wards->pluck('zone')->filter()->unique()->sort()->values(),
            // Which corporations actually have mapped wards, so a picker can
            // group by town instead of running 300 numbers together.
            'towns' => $wards->groupBy('town')->map->count(),
            'imported' => $wards->isNotEmpty(),
        ]);
    }

    /**
     * Ward outlines as a GeoJSON FeatureCollection, for drawing on the map.
     *
     * Served from the pre-simplified `boundary_geojson` column (92 KB for all
     * 100 wards, vs 593 KB at full precision) and cached, because the
     * boundaries only change when the corporation redraws them.
     */
    public function boundaries(Request $request): JsonResponse
    {
        $town = $request->string('town')->toString();

        // Town is part of the cache key: the whole-state payload is ~241 KB
        // and a single city is a third of that, so a phone that only ever
        // shows one city shouldn't pay for both.
        $key = 'wards.boundaries.v2.'.($town ?: 'all');

        $payload = Cache::remember($key, now()->addDay(), function () use ($town) {
            $features = Ward::query()
                ->whereNotNull('boundary_geojson')
                ->when($town, fn ($q) => $q->where('town', $town))
                ->orderBy('town')->orderBy('ward_no')
                ->get(['id', 'ward_no', 'name', 'zone', 'town', 'lgd_code', 'centroid_lat', 'centroid_lng', 'boundary_geojson'])
                ->map(fn (Ward $w) => [
                    'type' => 'Feature',
                    'id' => $w->id,
                    'properties' => [
                        'id' => $w->id,
                        'ward_no' => $w->ward_no,
                        'zone' => $w->zone,
                        'town' => $w->town,
                        // Null wherever the publishing corporation didn't
                        // release one; never minted to fill the gap.
                        'lgd_code' => $w->lgd_code,
                        'label' => $w->label(),
                        'centroid' => ['lat' => $w->centroid_lat, 'lng' => $w->centroid_lng],
                    ],
                    // Already a JSON string in the column — decode so it nests
                    // as an object rather than being double-encoded.
                    'geometry' => json_decode($w->boundary_geojson, true),
                ])
                ->values();

            return [
                'type' => 'FeatureCollection',
                'features' => $features,
                /*
                 * Stated per town rather than as one blanket claim: these are
                 * two separate published datasets with different licences, and
                 * they are the only two Tamil Nadu corporations that publish
                 * ward geometry at all.
                 */
                'sources' => [
                    'Coimbatore' => 'Coimbatore City Municipal Corporation ward boundaries (2024)',
                    'Chennai' => 'Greater Chennai Corporation wards — DataMeet Municipal_Spatial_Data (CC BY 4.0)',
                ],
                'towns' => $features->pluck('properties.town')->unique()->values(),
            ];
        });

        return response()->json($payload);
    }

    /**
     * Which ward contains a point. Used to set a citizen's home ward from
     * their actual location rather than asking them to know their ward number.
     */
    public function locate(Request $request): JsonResponse
    {
        $data = $request->validate([
            'lat' => ['required', 'numeric', 'between:-90,90'],
            'lng' => ['required', 'numeric', 'between:-180,180'],
        ]);

        $ward = Ward::containing((float) $data['lat'], (float) $data['lng']);

        return response()->json([
            'ward' => $ward ? new WardResource($ward) : null,
            'message' => $ward
                ? null
                : 'That location is outside the mapped municipal wards.',
        ]);
    }
}
