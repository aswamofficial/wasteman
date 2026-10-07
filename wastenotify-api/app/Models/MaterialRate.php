<?php

namespace App\Models;

use App\Services\Ai\Classification;
use Illuminate\Database\Eloquent\Model;

/**
 * What the corporation publishes as the going rate for each recyclable
 * material, in rupees per kilogram.
 *
 * Used only to show an indicative figure before collection. The amount a
 * citizen is actually paid is agreed at the doorstep and recorded on the
 * report, because this app does not move money and must not imply a price it
 * cannot honour.
 */
class MaterialRate extends Model
{
    protected $guarded = ['id'];

    protected function casts(): array
    {
        return [
            'rate_per_kg' => 'float',
            'active' => 'boolean',
        ];
    }

    /**
     * Indicative offer for a weight of a material, or null when no active rate
     * is published. Null renders as "price on collection" rather than ₹0 —
     * a zero would read as "this is worth nothing".
     */
    public static function estimate(?string $material, ?int $weightKg): ?float
    {
        if (! $material || ! $weightKg) {
            return null;
        }

        $rate = static::where('material', $material)->where('active', true)->value('rate_per_kg');

        return $rate ? round($rate * $weightKg, 2) : null;
    }

    /** @return \Illuminate\Support\Collection<int, string> */
    public static function materials(): \Illuminate\Support\Collection
    {
        return collect(Classification::MATERIALS);
    }
}
