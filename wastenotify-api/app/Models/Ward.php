<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Facades\DB;

class Ward extends Model
{
    protected $guarded = ['id'];

    /**
     * `boundary` is a spatial column — selecting it as a blob into Eloquent is
     * both useless and heavy (some wards are hundreds of KB of coordinates),
     * so it's hidden from every query that doesn't ask for it explicitly.
     */
    protected $hidden = ['boundary'];

    protected function casts(): array
    {
        return [
            'ward_no' => 'integer',
            'routable' => 'boolean',
            'centroid_lat' => 'float',
            'centroid_lng' => 'float',
        ];
    }

    /** Wards the service actually operates in, as opposed to merely maps. */
    public function scopeRoutable($query)
    {
        return $query->where('routable', true);
    }

    public function reports(): HasMany
    {
        return $this->hasMany(Report::class);
    }

    public function users(): HasMany
    {
        return $this->hasMany(User::class);
    }

    /**
     * The ward whose boundary contains this point, or null if it falls outside
     * every served ward (outside the corporation limits, or bad GPS).
     *
     * Point-in-polygon runs in the database against the spatial index rather
     * than loading the polygons into PHP.
     *
     * Scoped to routable wards on purpose. Other corporations are mapped for
     * display, and matching a point to one of those would hand the report to a
     * ward that has no officer, no queue and no way to close it — which reads
     * to the citizen as "accepted" and to the council as nothing at all.
     */
    public static function containing(float $lat, float $lng): ?self
    {
        return static::query()
            ->routable()
            ->whereRaw(
                'ST_Contains(boundary, ST_GeomFromText(?))',
                [sprintf('POINT(%.7F %.7F)', $lng, $lat)]
            )
            ->first();
    }

    /**
     * "Ward 23 — East Zone, Coimbatore", the label used throughout the UI.
     *
     * The town is part of the label because ward numbers are only unique
     * within a corporation: Chennai and Coimbatore both have a Ward 23, and a
     * bare "Ward 23" on a screen covering both would name neither.
     */
    public function label(): string
    {
        $ward = $this->zone
            ? "Ward {$this->ward_no} — {$this->zone}"
            : "Ward {$this->ward_no}";

        return $this->town ? "{$ward}, {$this->town}" : $ward;
    }
}
