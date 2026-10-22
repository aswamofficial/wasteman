<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * A photo the moderation check refused, recorded by hash.
 */
class BlockedImage extends Model
{
    protected $guarded = ['id'];

    protected function casts(): array
    {
        return [
            'attempts' => 'integer',
            'last_attempt_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /** SHA-256 of the file's bytes — what the blacklist is keyed on. */
    public static function hashFile(string $absolutePath): string
    {
        return hash_file('sha256', $absolutePath);
    }

    /**
     * Record a rejection, or count another attempt at one already known.
     *
     * `updateOrCreate` rather than insert-then-catch: two devices retrying the
     * same image at once would otherwise race on the unique index and surface
     * a driver error to a citizen who has done nothing except press the button
     * twice.
     */
    public static function record(string $hash, ?int $userId, string $category, string $engine): self
    {
        $row = static::firstOrNew(['image_hash' => $hash]);

        $row->fill([
            'category' => $category,
            'engine' => $engine,
            'last_attempt_at' => now(),
            // Keep the first uploader, so the record says who introduced it.
            'user_id' => $row->exists ? $row->user_id : $userId,
        ]);
        $row->attempts = $row->exists ? $row->attempts + 1 : 1;
        $row->save();

        return $row;
    }
}
