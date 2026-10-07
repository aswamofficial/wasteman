<?php

namespace App\Console\Commands;

use App\Models\Ward;
use App\Support\BoundaryGeometry;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class ImportWardsGeoJson extends Command
{
    use BoundaryGeometry;

    protected $signature = 'wards:import-geojson
                            {file : Path to a ward-boundary GeoJSON FeatureCollection}
                            {--town= : Town name to record against every ward}
                            {--state=Tamil Nadu : State name to record}
                            {--ward-field=Ward_No : Property holding the ward number}
                            {--zone-field=Zone_Name : Property holding the zone name}
                            {--lgd-field= : Property holding the ward LGD code, if the source has one}
                            {--routable=0 : 1 if reports should be routed to these wards, 0 to map them for display only}';

    protected $description = 'Import municipal ward boundaries from a GeoJSON FeatureCollection';

    /**
     * Used for Chennai: the Greater Chennai Corporation ward layer published by
     * the DataMeet India community (Municipal_Spatial_Data, CC BY 4.0) —
     * 200 wards across 15 zones.
     *
     * That file does not carry LGD codes, so those wards are stored with a null
     * `lgd_code` rather than a minted one. An invented government identifier
     * would look exactly like a real one to everything downstream.
     *
     * Anything without a usable ward number or polygon is skipped and named in
     * the output, never filled in with a guess.
     */
    public function handle(): int
    {
        $file = $this->argument('file');
        $town = $this->option('town');

        if (! is_readable($file)) {
            $this->error("Cannot read {$file}");

            return self::FAILURE;
        }

        if (! $town) {
            $this->error('--town is required: it is the natural key alongside the ward number.');

            return self::FAILURE;
        }

        $json = json_decode(file_get_contents($file), true);

        if (! is_array($json) || ($json['type'] ?? null) !== 'FeatureCollection') {
            $this->error('Not a GeoJSON FeatureCollection.');

            return self::FAILURE;
        }

        $features = $json['features'] ?? [];
        $this->info(sprintf('Found %d features in %s', count($features), basename($file)));

        $wardField = $this->option('ward-field');
        $zoneField = $this->option('zone-field');
        $lgdField = $this->option('lgd-field');

        /*
         * Defaults to 0. Mapping a city and serving it are separate decisions,
         * and the safe default is the one that can't quietly start accepting
         * reports into a queue nobody is watching.
         */
        $routable = (int) (bool) $this->option('routable');

        $this->line($routable
            ? "<comment>{$town} wards will be ROUTABLE — reports inside them will be assigned here.</comment>"
            : "<info>{$town} wards are display-only; reports will not be routed to them.</info>");

        $imported = 0;
        $skipped = [];

        foreach ($features as $feature) {
            $props = $feature['properties'] ?? [];
            $wardNo = $props[$wardField] ?? null;

            /*
             * Ward 0 is not a ward. Chennai's file carries one extra polygon
             * for the St. Thomas Mount cantonment, which sits inside the city's
             * footprint but is not governed by the corporation — it has no ward
             * number and no zone. Importing it as "Ward 0" would put a
             * non-existent ward in every picker and queue.
             */
            if (! is_numeric($wardNo) || (int) $wardNo < 1) {
                $skipped[] = sprintf(
                    'no ward number (%s)',
                    $props[$zoneField] ?? 'unnamed feature'
                );

                continue;
            }

            $rings = $this->outerRings($feature['geometry'] ?? []);
            if (! $rings) {
                $skipped[] = "ward {$wardNo}: no polygon geometry";

                continue;
            }

            $wkt = $this->toWkt($rings);
            [$lat, $lng] = $this->centroid($rings);

            $geojson = $this->toGeoJson(
                array_map(fn ($ring) => $this->simplify($ring, $this->simplifyTolerance), $rings)
            );

            $lgd = $lgdField && ! empty($props[$lgdField]) ? (string) (int) $props[$lgdField] : null;

            DB::statement(
                'INSERT INTO wards (lgd_code, ward_no, name, zone, town, state, routable, centroid_lat, centroid_lng, boundary, boundary_geojson, created_at, updated_at)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ST_GeomFromText(?), ?, NOW(), NOW())
                 ON DUPLICATE KEY UPDATE
                    lgd_code = VALUES(lgd_code), name = VALUES(name), zone = VALUES(zone),
                    state = VALUES(state), routable = VALUES(routable),
                    centroid_lat = VALUES(centroid_lat), centroid_lng = VALUES(centroid_lng),
                    boundary = VALUES(boundary), boundary_geojson = VALUES(boundary_geojson),
                    updated_at = NOW()',
                [
                    $lgd,
                    (int) $wardNo,
                    'Ward '.(int) $wardNo,
                    $this->zoneName($props[$zoneField] ?? null),
                    $town,
                    $this->option('state'),
                    $routable,
                    $lat,
                    $lng,
                    $wkt,
                    $geojson,
                ]
            );

            $imported++;
        }

        $this->info("Imported/updated {$imported} wards for {$town}.");

        foreach ($skipped as $s) {
            $this->warn("skipped: {$s}");
        }

        $this->table(
            ['Town', 'Zone', 'Wards'],
            Ward::selectRaw('town, zone, COUNT(*) as total')
                ->groupBy('town', 'zone')->orderBy('town')->orderBy('zone')->get()
                ->map(fn ($r) => [$r->town, $r->zone ?? '—', $r->total])->all()
        );

        return self::SUCCESS;
    }

    /**
     * Source zone names arrive shouted (TEYNAMPET, THIRU-VI-KA-NAGAR).
     *
     * Case is normalised for display, but the spelling is left exactly as
     * published — "Sozhinganallur" is not silently corrected to the more common
     * "Sholinganallur", because that would be editing the source rather than
     * formatting it.
     */
    private function zoneName(?string $raw): ?string
    {
        $raw = trim((string) $raw);

        if ($raw === '' || $raw === '-') {
            return null;
        }

        // Already mixed case in the source — leave it alone.
        if ($raw !== Str::upper($raw)) {
            return $raw;
        }

        return implode('-', array_map(
            fn ($part) => Str::title(Str::lower($part)),
            explode('-', $raw)
        ));
    }
}
