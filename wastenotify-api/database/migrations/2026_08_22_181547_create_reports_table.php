<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('reports', function (Blueprint $table) {
            $table->id();
            // Human-facing id shown throughout the UI (e.g. WN-24817).
            $table->string('reference', 16)->unique();

            $table->foreignId('user_id')->constrained()->cascadeOnDelete();

            // What the citizen submitted
            $table->string('photo_path');
            $table->json('extra_photos')->nullable();
            $table->decimal('latitude', 10, 7);
            $table->decimal('longitude', 10, 7);
            $table->string('address');
            $table->string('landmark')->nullable();
            $table->string('present_since')->nullable();   // today | few_days | over_a_week | unknown
            $table->string('blocking')->nullable();        // road | footpath | drain | nothing
            $table->text('note')->nullable();

            // What the AI decided
            $table->string('waste_type')->nullable();
            $table->unsignedTinyInteger('ai_confidence')->nullable();
            $table->string('severity')->default('medium'); // low | medium | high
            $table->unsignedInteger('estimated_weight_kg')->nullable();
            $table->json('detected_items')->nullable();
            $table->timestamp('analysed_at')->nullable();

            // Municipal handling
            $table->string('status')->default('pending');  // pending | in_progress | resolved | rejected
            $table->string('priority')->default('normal'); // low | normal | urgent
            $table->string('assigned_team')->nullable();
            $table->foreignId('assigned_to')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('scheduled_for')->nullable();
            $table->text('internal_note')->nullable();

            // Resolution — the after-photo is what the citizen gets notified with
            $table->string('resolution_photo_path')->nullable();
            $table->timestamp('resolved_at')->nullable();
            $table->foreignId('resolved_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('rejected_at')->nullable();
            $table->unsignedTinyInteger('rating')->nullable();
            $table->text('feedback')->nullable();

            $table->timestamps();

            // The map and the "my reports" tabs both filter on status; the
            // dashboard counts per user.
            $table->index(['status', 'created_at']);
            $table->index(['user_id', 'status']);
            $table->index(['latitude', 'longitude']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('reports');
    }
};
