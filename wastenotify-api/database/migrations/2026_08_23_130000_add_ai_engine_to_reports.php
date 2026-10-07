<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Which classifier actually produced the analysis on this report.
     *
     * The Classification DTO has always carried `engine`, but nothing persisted
     * it — so a deterministic stub guess and a real model's answer were stored
     * identically, and the admin console presented both under "AI
     * classification" with a confidence percentage. There was no way, from the
     * data, to tell which reports had ever been looked at by anything.
     *
     * Existing rows are backfilled to NULL rather than 'stub': no key has been
     * configured, so they were almost certainly stubbed, but "almost certainly"
     * is not a thing to write into a provenance column. NULL reads as unknown,
     * which is the truth about them.
     */
    public function up(): void
    {
        DB::statement("ALTER TABLE reports ADD COLUMN ai_engine VARCHAR(20) NULL AFTER detected_items");
        DB::statement('ALTER TABLE reports ADD KEY reports_ai_engine_index (ai_engine)');
    }

    public function down(): void
    {
        DB::statement('ALTER TABLE reports DROP INDEX reports_ai_engine_index');
        DB::statement('ALTER TABLE reports DROP COLUMN ai_engine');
    }
};
