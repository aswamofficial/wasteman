<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Photos refused by the moderation check.
     *
     * The row IS the blacklist: the SHA-256 of the file bytes is looked up on
     * every upload before the image goes anywhere near the classifier, so a
     * refused photo retried — by the same person or a different one — is
     * rejected immediately and costs nothing.
     *
     * Only the hash is kept, never the image. There is no defensible reason
     * for this system to hold a copy of content it has just judged unfit to
     * show a ward officer, and the hash answers the only question that is
     * actually asked of it: "have we seen these exact bytes before?"
     *
     * The trade that comes with hashing is worth stating: re-encoding or
     * cropping by a single pixel produces different bytes and a different
     * hash. This stops the lazy retry, which is the common case; it is not a
     * perceptual match and does not pretend to be.
     */
    public function up(): void
    {
        Schema::create('blocked_images', function (Blueprint $table) {
            $table->id();

            // 64 hex characters. Unique: the same bytes are one entry, however
            // many times they are offered.
            $table->char('image_hash', 64)->unique();

            // Who uploaded it. Nullable so the row outlives the account —
            // deleting a user must not quietly empty the blacklist.
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();

            // nudity | violence | abuse | person_targeted | other
            $table->string('category', 32);

            // 'claude' (the moderation field we asked for) or 'claude-safety'
            // (the API declined the request outright). Worth distinguishing:
            // they are different mechanisms and a shift between them is a
            // signal about the check itself, not about the citizen.
            $table->string('engine', 32);

            // Counts repeat attempts at the same bytes without a second row.
            $table->unsignedInteger('attempts')->default(1);

            $table->timestamp('last_attempt_at')->nullable();
            $table->timestamps();

            // "What has this person been uploading" — the question an officer
            // asks when deciding whether an account is a problem.
            $table->index(['user_id', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('blocked_images');
    }
};
