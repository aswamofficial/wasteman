<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Not every corporation publishes LGD codes with its ward boundaries.
     *
     * Coimbatore's CCMC layer carries `ward_lgd_code`; Chennai's published
     * ward geometry does not. Minting a plausible-looking code for those wards
     * would be inventing a government identifier, so `lgd_code` becomes
     * nullable and (town, ward_no) takes over as the natural key — which is
     * what an upsert actually needs now that more than one town is mapped.
     *
     * `ward_no` alone was never unique across towns; it only looked that way
     * while Coimbatore was the only town in the table.
     */
    public function up(): void
    {
        DB::statement('ALTER TABLE wards MODIFY lgd_code VARCHAR(20) NULL');
        DB::statement('ALTER TABLE wards DROP INDEX wards_lgd_code_unique');
        DB::statement('ALTER TABLE wards ADD UNIQUE KEY wards_town_ward_no_unique (town, ward_no)');
        DB::statement('ALTER TABLE wards ADD KEY wards_lgd_code_index (lgd_code)');
    }

    public function down(): void
    {
        DB::statement('ALTER TABLE wards DROP INDEX wards_town_ward_no_unique');
        DB::statement('ALTER TABLE wards DROP INDEX wards_lgd_code_index');
        DB::statement('ALTER TABLE wards ADD UNIQUE KEY wards_lgd_code_unique (lgd_code)');
        DB::statement('ALTER TABLE wards MODIFY lgd_code VARCHAR(20) NOT NULL');
    }
};
