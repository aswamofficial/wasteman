<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Scrap contractors: who they are, where they work, and what they pay.
     *
     * A contractor is a User with the 'contractor' role plus this profile. The
     * profile is separate rather than more columns on users because it carries
     * the verification decision, and that decision is the thing standing
     * between a stranger and a citizen's home address — it deserves its own
     * row with its own audit trail, not a nullable flag among contact details.
     */
    public function up(): void
    {
        Schema::create('contractor_profiles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->unique()->constrained()->cascadeOnDelete();
            $table->string('business_name', 160);
            // Whatever the operator asks for locally — GST, trade licence, or a
            // municipal scrap-dealer registration. Free text on purpose: the
            // required document differs by corporation and inventing a format
            // would just make people type around it.
            $table->string('licence_no', 80)->nullable();
            $table->string('contact_phone', 20)->nullable();

            // pending → verified → suspended. Never verified by default.
            $table->string('status', 20)->default('pending');
            $table->timestamp('verified_at')->nullable();
            $table->foreignId('verified_by')->nullable()->constrained('users')->nullOnDelete();
            $table->string('status_reason', 255)->nullable();

            $table->timestamps();
            $table->index('status');
        });

        /*
         * Which wards a contractor covers. Many-to-many because a scrap dealer
         * typically works a handful of adjacent wards, and the pickup pool is
         * filtered by exactly this.
         */
        Schema::create('contractor_wards', function (Blueprint $table) {
            $table->id();
            $table->foreignId('contractor_profile_id')->constrained()->cascadeOnDelete();
            $table->foreignId('ward_id')->constrained()->cascadeOnDelete();
            $table->unique(['contractor_profile_id', 'ward_id']);
            $table->index('ward_id');
        });

        /*
         * The rate card. One active rate per material, set by the corporation,
         * used to show the citizen an indicative offer before anyone turns up.
         *
         * It is an estimate, not a price: the amount actually paid is recorded
         * separately on the report after the material is weighed. Presenting
         * the estimate as a promise would be the app making a commitment on a
         * private contractor's behalf.
         */
        Schema::create('material_rates', function (Blueprint $table) {
            $table->id();
            $table->string('material', 20)->unique();
            $table->decimal('rate_per_kg', 8, 2);
            $table->boolean('active')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('material_rates');
        Schema::dropIfExists('contractor_wards');
        Schema::dropIfExists('contractor_profiles');
    }
};
