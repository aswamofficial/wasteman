<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Real municipal wards, imported from official boundary data — never
     * hand-typed. `lgd_code` is the Government of India Local Government
     * Directory identifier, which is the authoritative key for a ward.
     *
     * Raw SQL rather than Blueprint because the boundary column needs to be
     * `GEOMETRY NOT NULL` with a SPATIAL index, which Laravel's schema builder
     * doesn't express portably on MariaDB.
     */
    public function up(): void
    {
        DB::statement(<<<'SQL'
            CREATE TABLE wards (
                id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
                lgd_code VARCHAR(20) NOT NULL,
                ward_no INT NOT NULL,
                name VARCHAR(120) NOT NULL,
                zone VARCHAR(60) NULL,
                town VARCHAR(120) NOT NULL,
                state VARCHAR(80) NOT NULL,
                centroid_lat DECIMAL(10,7) NOT NULL,
                centroid_lng DECIMAL(10,7) NOT NULL,
                boundary GEOMETRY NOT NULL,
                created_at TIMESTAMP NULL,
                updated_at TIMESTAMP NULL,
                UNIQUE KEY wards_lgd_code_unique (lgd_code),
                KEY wards_ward_no_index (ward_no),
                KEY wards_zone_index (zone),
                SPATIAL KEY wards_boundary_spatial (boundary)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
        SQL);
    }

    public function down(): void
    {
        Schema::dropIfExists('wards');
    }
};
