<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Revenue districts, as a display layer for state-wide coverage.
     *
     * Deliberately a separate table from `wards` rather than another row type
     * in it: a district is not a ward, and Ward::containing() does a
     * point-in-polygon over every row — mixing the two would make a single
     * point match both its ward and its district, and the first match would
     * win at random.
     *
     * There is no `boundary GEOMETRY` column and no spatial index here because
     * nothing routes on districts. They are drawn, not queried. Add the column
     * if and when district-level fallback routing is actually wanted.
     *
     * `source` and `source_year` are stored per row so the map can state the
     * vintage of what it is drawing instead of implying it is current.
     */
    public function up(): void
    {
        DB::statement(<<<'SQL'
            CREATE TABLE districts (
                id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(120) NOT NULL,
                state VARCHAR(80) NOT NULL,
                dt_code VARCHAR(20) NULL,
                source VARCHAR(200) NULL,
                source_year VARCHAR(20) NULL,
                centroid_lat DECIMAL(10,7) NOT NULL,
                centroid_lng DECIMAL(10,7) NOT NULL,
                boundary_geojson LONGTEXT NULL,
                created_at TIMESTAMP NULL,
                updated_at TIMESTAMP NULL,
                UNIQUE KEY districts_state_name_unique (state, name),
                KEY districts_state_index (state)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
        SQL);
    }

    public function down(): void
    {
        Schema::dropIfExists('districts');
    }
};
