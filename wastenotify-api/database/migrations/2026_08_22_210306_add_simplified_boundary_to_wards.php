<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Display-resolution copy of the boundary, as a GeoJSON geometry string.
     *
     * The full-precision `boundary` column stays authoritative for
     * point-in-polygon; it's just far too heavy to ship to a phone (593 KB
     * across 100 wards). MariaDB 10.4 has no ST_Simplify, so the reduction is
     * done in PHP at import time and stored here.
     */
    public function up(): void
    {
        Schema::table('wards', function (Blueprint $table) {
            $table->longText('boundary_geojson')->nullable()->after('boundary');
        });
    }

    public function down(): void
    {
        Schema::table('wards', function (Blueprint $table) {
            $table->dropColumn('boundary_geojson');
        });
    }
};
