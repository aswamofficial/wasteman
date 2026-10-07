<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Splits reports into the two streams the app now routes on.
     *
     * `stream` decides the audience: 'recyclable' is offered to private
     * contractors who pay the citizen for the material, 'disposal' goes to the
     * ward crew as before. Existing rows are backfilled to 'disposal' — that is
     * genuinely what they are, since every one of them was filed under a
     * municipal-only model.
     *
     * The settlement columns record a payment made in cash or UPI at the
     * doorstep; no money moves through this system. `settled_amount` is what
     * the two parties agreed on the day, which is deliberately separate from
     * `offer_amount`, the rate-card estimate shown when the job was posted —
     * keeping both is what makes a dispute answerable.
     */
    public function up(): void
    {
        DB::statement("ALTER TABLE reports
            ADD COLUMN stream VARCHAR(20) NOT NULL DEFAULT 'disposal' AFTER waste_type,
            ADD COLUMN material VARCHAR(20) NULL AFTER stream,
            ADD COLUMN offer_amount DECIMAL(10,2) NULL AFTER material,
            ADD COLUMN accepted_at TIMESTAMP NULL AFTER offer_amount,
            ADD COLUMN settled_amount DECIMAL(10,2) NULL AFTER accepted_at,
            ADD COLUMN settled_weight_kg DECIMAL(8,2) NULL AFTER settled_amount,
            ADD COLUMN settled_at TIMESTAMP NULL AFTER settled_weight_kg,
            ADD COLUMN citizen_confirmed_at TIMESTAMP NULL AFTER settled_at,
            ADD COLUMN converted_from VARCHAR(20) NULL AFTER citizen_confirmed_at,
            ADD COLUMN conversion_reason VARCHAR(255) NULL AFTER converted_from");

        // The contractor pool query is "recyclable, open, unclaimed, in my
        // wards" — this is the index that serves it.
        DB::statement('ALTER TABLE reports ADD KEY reports_stream_status_index (stream, status, ward_id)');
    }

    public function down(): void
    {
        DB::statement('ALTER TABLE reports DROP INDEX reports_stream_status_index');
        DB::statement('ALTER TABLE reports
            DROP COLUMN stream, DROP COLUMN material, DROP COLUMN offer_amount,
            DROP COLUMN accepted_at, DROP COLUMN settled_amount, DROP COLUMN settled_weight_kg,
            DROP COLUMN settled_at, DROP COLUMN citizen_confirmed_at,
            DROP COLUMN converted_from, DROP COLUMN conversion_reason');
    }
};
