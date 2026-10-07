<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * A revenue district, drawn as a state-wide context layer.
 *
 * Nothing routes on districts — reports are matched to wards by
 * point-in-polygon, and a district has no officer to action anything. This
 * exists so the map can show the whole state honestly instead of implying the
 * service covers only the one city that has ward data.
 */
class District extends Model
{
    protected $guarded = ['id'];

    protected $hidden = ['boundary_geojson'];

    protected function casts(): array
    {
        return [
            'centroid_lat' => 'float',
            'centroid_lng' => 'float',
        ];
    }
}
