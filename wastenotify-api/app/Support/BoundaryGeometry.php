<?php

namespace App\Support;

/**
 * Ring maths shared by the boundary importers.
 *
 * Rings are arrays of [lng, lat] pairs — GeoJSON order throughout, so nothing
 * has to remember which importer swapped them.
 */
trait BoundaryGeometry
{
    /**
     * ~0.00012° ≈ 13 m at this latitude. Small enough that outlines stay
     * faithful at city zoom, large enough to drop the survey-grade vertex
     * density that makes the raw data unshippable.
     */
    protected float $simplifyTolerance = 0.00012;

    /**
     * Douglas–Peucker. MariaDB 10.4 has no ST_Simplify, so this runs at import
     * time and the result is stored — the cost is paid once, not per request.
     *
     * @param  array<int, array{0: float, 1: float}>  $points
     * @return array<int, array{0: float, 1: float}>
     */
    protected function simplify(array $points, float $tolerance): array
    {
        if (count($points) < 3) {
            return $points;
        }

        $first = 0;
        $last = count($points) - 1;
        $keep = [$first => true, $last => true];
        $stack = [[$first, $last]];

        while ($stack) {
            [$start, $end] = array_pop($stack);
            $maxDist = 0.0;
            $index = $start;

            for ($i = $start + 1; $i < $end; $i++) {
                $dist = $this->perpendicularDistance($points[$i], $points[$start], $points[$end]);
                if ($dist > $maxDist) {
                    $maxDist = $dist;
                    $index = $i;
                }
            }

            if ($maxDist > $tolerance) {
                $keep[$index] = true;
                $stack[] = [$start, $index];
                $stack[] = [$index, $end];
            }
        }

        ksort($keep);
        $out = array_map(fn ($i) => $points[$i], array_keys($keep));

        // A polygon ring needs at least 4 points; if simplification collapsed
        // it, keep the original rather than emit an invalid ring.
        return count($out) >= 4 ? $out : $points;
    }

    protected function perpendicularDistance(array $p, array $a, array $b): float
    {
        [$px, $py] = $p;
        [$ax, $ay] = $a;
        [$bx, $by] = $b;

        $dx = $bx - $ax;
        $dy = $by - $ay;

        if ($dx == 0.0 && $dy == 0.0) {
            return sqrt(($px - $ax) ** 2 + ($py - $ay) ** 2);
        }

        $t = (($px - $ax) * $dx + ($py - $ay) * $dy) / ($dx * $dx + $dy * $dy);
        $t = max(0.0, min(1.0, $t));

        return sqrt(($px - ($ax + $t * $dx)) ** 2 + ($py - ($ay + $t * $dy)) ** 2);
    }

    protected function toWkt(array $rings): string
    {
        $polys = array_map(function (array $ring) {
            $ring = $this->closeRing($ring);
            $pairs = array_map(fn ($p) => sprintf('%.7F %.7F', $p[0], $p[1]), $ring);

            return '(('.implode(',', $pairs).'))';
        }, $rings);

        return count($polys) === 1
            ? 'POLYGON'.$polys[0]
            : 'MULTIPOLYGON('.implode(',', $polys).')';
    }

    /** GeoJSON geometry (Polygon or MultiPolygon), coordinates as [lng, lat]. */
    protected function toGeoJson(array $rings): string
    {
        $round = fn (array $ring) => array_map(
            fn ($p) => [round($p[0], 6), round($p[1], 6)],
            $this->closeRing($ring)
        );

        if (count($rings) === 1) {
            return json_encode(['type' => 'Polygon', 'coordinates' => [$round($rings[0])]]);
        }

        return json_encode([
            'type' => 'MultiPolygon',
            'coordinates' => array_map(fn ($r) => [$round($r)], $rings),
        ]);
    }

    protected function closeRing(array $ring): array
    {
        if ($ring && $ring[0] !== $ring[count($ring) - 1]) {
            $ring[] = $ring[0];
        }

        return $ring;
    }

    /** Simple average of ring vertices — good enough to centre a map on. */
    protected function centroid(array $rings): array
    {
        $lat = $lng = 0.0;
        $n = 0;

        foreach ($rings as $ring) {
            foreach ($ring as [$x, $y]) {
                $lng += $x;
                $lat += $y;
                $n++;
            }
        }

        return $n ? [round($lat / $n, 7), round($lng / $n, 7)] : [0.0, 0.0];
    }

    /**
     * Outer rings of a GeoJSON geometry, as arrays of [lng, lat].
     *
     * Inner rings (holes) are dropped: nothing here needs them, and keeping
     * them would require the storage format to distinguish outer from inner,
     * which the WKT builder above doesn't.
     *
     * @return array<int, array<int, array{0: float, 1: float}>>
     */
    protected function outerRings(array $geometry): array
    {
        $rings = [];

        $take = function (array $polygon) use (&$rings) {
            $outer = $polygon[0] ?? null;
            if (is_array($outer) && count($outer) >= 4) {
                $rings[] = array_map(fn ($p) => [(float) $p[0], (float) $p[1]], $outer);
            }
        };

        match ($geometry['type'] ?? null) {
            'Polygon' => $take($geometry['coordinates'] ?? []),
            'MultiPolygon' => array_map($take, $geometry['coordinates'] ?? []),
            default => null,
        };

        return $rings;
    }
}
