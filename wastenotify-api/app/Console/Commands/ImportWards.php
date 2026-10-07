<?php

namespace App\Console\Commands;

use App\Models\Ward;
use App\Support\BoundaryGeometry;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use SimpleXMLElement;

class ImportWards extends Command
{
    use BoundaryGeometry;

    protected $signature = 'wards:import
                            {file : Path to the ward-boundary KML}
                            {--town= : Only import wards whose townname matches}';

    protected $description = 'Import real municipal ward boundaries from an official KML export';

    /**
     * Source used for Coimbatore: the CCMC 2024 ward boundary layer published
     * as public-domain open data (Esri Living Atlas India, via data.opencity.in)
     * — 100 wards, each carrying its Government of India LGD code.
     *
     * Nothing here invents a ward: every row comes from the file, and a
     * placemark missing a ward number or geometry is skipped and reported
     * rather than filled in with a guess.
     */
    public function handle(): int
    {
        $file = $this->argument('file');

        if (! is_readable($file)) {
            $this->error("Cannot read {$file}");

            return self::FAILURE;
        }

        $xml = new SimpleXMLElement(file_get_contents($file));
        $xml->registerXPathNamespace('k', 'http://www.opengis.net/kml/2.2');

        $placemarks = $xml->xpath('//k:Placemark') ?: [];
        $this->info(sprintf('Found %d placemarks in %s', count($placemarks), basename($file)));

        $imported = 0;
        $skipped = [];

        foreach ($placemarks as $pm) {
            $attrs = $this->attributes($pm);

            if ($this->option('town') && ($attrs['townname'] ?? null) !== $this->option('town')) {
                continue;
            }

            $wardNo = $attrs['sourcewardname'] ?? $attrs['ward_lgd_name'] ?? null;
            $lgd = $attrs['ward_lgd_code'] ?? null;

            if (! is_numeric($wardNo) || ! $lgd) {
                $skipped[] = 'missing ward number or LGD code';
                continue;
            }

            $rings = $this->polygons($pm);
            if (! $rings) {
                $skipped[] = "ward {$wardNo}: no polygon geometry";
                continue;
            }

            $wkt = $this->toWkt($rings);
            [$lat, $lng] = $this->centroid($rings);

            // Display copy: full precision is kept in `boundary` for
            // point-in-polygon; this is what actually gets drawn on a phone.
            $geojson = $this->toGeoJson(
                array_map(fn ($ring) => $this->simplify($ring, $this->simplifyTolerance), $rings)
            );

            DB::statement(
                'INSERT INTO wards (lgd_code, ward_no, name, zone, town, state, centroid_lat, centroid_lng, boundary, boundary_geojson, created_at, updated_at)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ST_GeomFromText(?), ?, NOW(), NOW())
                 ON DUPLICATE KEY UPDATE
                    ward_no = VALUES(ward_no), name = VALUES(name), zone = VALUES(zone),
                    town = VALUES(town), state = VALUES(state),
                    centroid_lat = VALUES(centroid_lat), centroid_lng = VALUES(centroid_lng),
                    boundary = VALUES(boundary), boundary_geojson = VALUES(boundary_geojson),
                    updated_at = NOW()',
                [
                    (string) (int) $lgd,
                    (int) $wardNo,
                    'Ward '.(int) $wardNo,
                    $attrs['zone'] ?? null,
                    $attrs['townname'] ?? 'Unknown',
                    $attrs['state'] ?? 'Unknown',
                    $lat,
                    $lng,
                    $wkt,
                    $geojson,
                ]
            );

            $imported++;
        }

        $this->info("Imported/updated {$imported} wards.");

        foreach (array_slice($skipped, 0, 10) as $s) {
            $this->warn("skipped: {$s}");
        }
        if (count($skipped) > 10) {
            $this->warn(sprintf('...and %d more skipped', count($skipped) - 10));
        }

        $this->table(
            ['Town', 'Zone', 'Wards'],
            Ward::selectRaw('town, zone, COUNT(*) as total')->groupBy('town', 'zone')->orderBy('zone')->get()
                ->map(fn ($r) => [$r->town, $r->zone ?? '—', $r->total])->all()
        );

        return self::SUCCESS;
    }

    /** Flatten a placemark's ExtendedData/SchemaData into name => value. */
    private function attributes(SimpleXMLElement $pm): array
    {
        $out = [];
        $pm->registerXPathNamespace('k', 'http://www.opengis.net/kml/2.2');

        foreach ($pm->xpath('.//k:SimpleData') ?: [] as $field) {
            $out[(string) $field['name']] = trim((string) $field);
        }

        return $out;
    }

    /**
     * Every outer ring in the placemark, as arrays of [lng, lat].
     * A ward may be a MultiGeometry of several disjoint polygons.
     */
    private function polygons(SimpleXMLElement $pm): array
    {
        $pm->registerXPathNamespace('k', 'http://www.opengis.net/kml/2.2');
        $rings = [];

        foreach ($pm->xpath('.//k:Polygon/k:outerBoundaryIs/k:LinearRing/k:coordinates') ?: [] as $node) {
            $points = [];
            foreach (preg_split('/\s+/', trim((string) $node)) as $triple) {
                if ($triple === '') {
                    continue;
                }
                [$lng, $lat] = array_map('floatval', array_pad(explode(',', $triple), 2, 0));
                $points[] = [$lng, $lat];
            }

            // A ring needs at least 4 points (first == last) to be a polygon.
            if (count($points) >= 4) {
                $rings[] = $points;
            }
        }

        return $rings;
    }
}
