<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // Suspension rather than deletion: a suspended reporter's existing
            // reports stay valid and their history stays intact, they just
            // can't sign in. Deleting would erase civic records.
            $table->timestamp('suspended_at')->nullable()->after('ward_id');
            $table->string('suspended_reason')->nullable()->after('suspended_at');
            $table->timestamp('last_seen_at')->nullable()->after('suspended_reason');

            $table->index('suspended_at');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropIndex(['suspended_at']);
            $table->dropColumn(['suspended_at', 'suspended_reason', 'last_seen_at']);
        });
    }
};
