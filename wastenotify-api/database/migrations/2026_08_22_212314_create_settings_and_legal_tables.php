<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Operational configuration an admin can change without a deploy —
        // service targets, contact details, feature switches.
        Schema::create('settings', function (Blueprint $table) {
            $table->id();
            $table->string('key')->unique();
            $table->text('value')->nullable();
            $table->string('type')->default('string'); // string|int|bool|email|tel
            $table->string('group')->default('general');
            $table->string('label');
            $table->string('help')->nullable();
            $table->timestamps();
        });

        // The privacy policy and terms, editable in the admin console.
        // Google Play holds the operator responsible for these being accurate,
        // so they must be changeable without waiting on an app release.
        Schema::create('legal_documents', function (Blueprint $table) {
            $table->id();
            $table->string('slug')->unique();     // privacy | terms
            $table->string('title');
            $table->json('sections');             // [{heading, body[], bullets[]}]
            $table->boolean('published')->default(false);
            $table->timestamp('effective_at')->nullable();
            $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('legal_documents');
        Schema::dropIfExists('settings');
    }
};
