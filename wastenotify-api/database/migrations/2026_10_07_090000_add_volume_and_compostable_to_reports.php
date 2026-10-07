<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Records the two things the photo analysis could not say before: how much
     * there is, and whether it would compost.
     *
     * Volume is stored twice on purpose. `estimated_volume_litres` is the
     * number, and `volume_bucket` is the coarse scale a dispatcher actually
     * acts on — whether this needs a handcart or a tipper. Keeping the bucket
     * rather than deriving it from the litres means the model's own judgement
     * about scale survives, instead of being re-inferred from a figure that
     * carries more precision than a photograph can support.
     *
     * Everything is nullable: reports filed before this ran were never asked
     * these questions, and null reads as "not assessed" rather than as zero
     * litres or as non-compostable.
     */
    public function up(): void
    {
        DB::statement('ALTER TABLE reports
            ADD COLUMN is_compostable TINYINT(1) NULL AFTER material,
            ADD COLUMN volume_bucket VARCHAR(20) NULL AFTER is_compostable,
            ADD COLUMN estimated_volume_litres INT UNSIGNED NULL AFTER volume_bucket');
    }

    public function down(): void
    {
        DB::statement('ALTER TABLE reports
            DROP COLUMN is_compostable,
            DROP COLUMN volume_bucket,
            DROP COLUMN estimated_volume_litres');
    }
};
