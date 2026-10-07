<?php

namespace App\Console\Commands;

use App\Models\District;
use App\Support\BoundaryGeometry;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class ImportDistricts extends Command
{
    use BoundaryGeometry;

    protected $signature = 'districts:import
                            {file : Path to a district-boundary GeoJSON FeatureCollection}
                            {--state=Tamil Nadu : State name to record}
                            {--name-field=district : Property holding the district name}
                            {--code-field=dt_code : Property holding the district code}
                            {--source= : Human-readable provenance, shown on the map}
                            {--source-year= : Vintage of the boundaries, shown on the map}';

    protected $description = 'Import revenue district boundaries from a GeoJSON FeatureCollection';

    /**
     * District outlines are a display layer, so they are simplified harder than
     * wards: they are drawn at state zoom, where 13 m fidelity is invisible and
     * only costs bytes over the wire.
     */
    private const DISTRICT_TOLERANCE = 0.002;

    public function handle(): int
    {
        $file = $this->argument('file');

        if (! is_readable($file)) {
            $this->error("Cannot read {$file}");

            return self::FAILURE;
        }

        $json = json_decode(file_get_contents($file), true);

        if (! is_array($json) || ($json['type'] ?? null) !== 'FeatureCollection') {
            $this->error('Not a GeoJSON FeatureCollection.');

            return self::FAILURE;
        }

        $features = $json['features'] ?? [];
        $nameField = $this->option('name-field');
        $codeField = $this->option('code-field');
        $state = $this->option('state');

        $this->info(sprintf('Found %d features in %s', count($features), basename($file)));

        $imported = 0;
        $skipped = [];

        foreach ($features as $feature) {
            $props = $feature['properties'] ?? [];
            $name = trim((string) ($props[$nameField] ?? ''));

            if ($name === '') {
                $skipped[] = 'feature with no district name';

                continue;
            }

            $rings = $this->outerRings($feature['geometry'] ?? []);
            if (! $rings) {
                $skipped[] = "{$name}: no polygon geometry";

                continue;
            }

            [$lat, $lng] = $this->centroid($rings);

            $geojson = $this->toGeoJson(
                array_map(fn ($ring) => $this->simplify($ring, self::DISTRICT_TOLERANCE), $rings)
            );

            DB::statement(
                'INSERT INTO districts (name, state, dt_code, source, source_year, centroid_lat, centroid_lng, boundary_geojson, created_at, updated_at)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
                 ON DUPLICATE KEY UPDATE
                    dt_code = VALUES(dt_code), source = VALUES(source), source_year = VALUES(source_year),
                    centroid_lat = VALUES(centroid_lat), centroid_lng = VALUES(centroid_lng),
                    boundary_geojson = VALUES(boundary_geojson), updated_at = NOW()',
                [
                    $name,
                    $state,
                    $props[$codeField] ?? null,
                    $this->option('source'),
                    $this->option('source-year'),
                    $lat,
                    $lng,
                    $geojson,
                ]
            );

            $imported++;
        }

        $this->info("Imported/updated {$imported} districts in {$state}.");

        foreach ($skipped as $s) {
            $this->warn("skipped: {$s}");
        }

        $this->info(sprintf(
            'Stored geometry: %s KB total.',
            number_format(District::where('state', $state)->sum(DB::raw('LENGTH(boundary_geojson)')) / 1024, 1)
        ));

        return self::SUCCESS;
    }
}
