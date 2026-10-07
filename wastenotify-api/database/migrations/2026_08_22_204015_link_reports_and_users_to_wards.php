<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('reports', function (Blueprint $table) {
            // Derived from the report's own coordinates, not from whoever filed
            // it — waste dumped in one ward reported by a resident of another
            // belongs to the location's crew. Nullable because a point can fall
            // outside every mapped ward, and pretending otherwise would be a
            // guess.
            $table->foreignId('ward_id')->nullable()->after('address')
                ->constrained('wards')->nullOnDelete();
            $table->index(['ward_id', 'status']);
        });

        Schema::table('users', function (Blueprint $table) {
            $table->foreignId('ward_id')->nullable()->after('avatar_url')
                ->constrained('wards')->nullOnDelete();
        });

        // The old free-text `ward` column held invented strings with no
        // authority behind them. Drop it rather than migrate the values.
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('ward');
        });
    }

    public function down(): void
    {
        Schema::table('reports', function (Blueprint $table) {
            $table->dropForeign(['ward_id']);
            $table->dropIndex(['ward_id', 'status']);
            $table->dropColumn('ward_id');
        });

        Schema::table('users', function (Blueprint $table) {
            $table->dropForeign(['ward_id']);
            $table->dropColumn('ward_id');
            $table->string('ward')->nullable();
        });
    }
};
