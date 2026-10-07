<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Whether reports are actually routed to this ward.
     *
     * Mapping a corporation and serving it are different decisions. Chennai's
     * wards are drawn so the map covers more than one city, but the service
     * only operates in Coimbatore — and because every ward shares one spatial
     * index, importing Chennai silently made ST_Contains match Chennai points
     * and hand those reports to a ward with no officer behind it.
     *
     * This makes the service area explicit rather than an accident of which
     * files happen to have been imported. Flip the flag to switch a city on.
     */
    public function up(): void
    {
        DB::statement('ALTER TABLE wards ADD COLUMN routable TINYINT(1) NOT NULL DEFAULT 1 AFTER state');
        DB::statement('ALTER TABLE wards ADD KEY wards_routable_index (routable)');

        // Everything mapped so far that isn't the served corporation is
        // display-only until someone decides otherwise.
        DB::table('wards')->where('town', '!=', 'Coimbatore')->update(['routable' => 0]);
    }

    public function down(): void
    {
        DB::statement('ALTER TABLE wards DROP INDEX wards_routable_index');
        DB::statement('ALTER TABLE wards DROP COLUMN routable');
    }
};
