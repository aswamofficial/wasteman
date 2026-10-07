<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Deliberately not Laravel's polymorphic `notifications` table — every
     * notification here belongs to a user and (almost always) a report, and a
     * concrete schema keeps the unread count a plain indexed query.
     */
    public function up(): void
    {
        Schema::create('app_notifications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('report_id')->nullable()->constrained()->cascadeOnDelete();
            $table->string('type');            // verified | assigned | in_progress | resolved | rejected | community
            $table->string('title');
            $table->text('body');
            $table->string('image_url')->nullable();
            $table->timestamp('read_at')->nullable();
            $table->timestamps();

            // Drives both the list (newest first) and the unread badge.
            $table->index(['user_id', 'read_at']);
            $table->index(['user_id', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('app_notifications');
    }
};
