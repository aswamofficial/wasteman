<?php

namespace App\Exceptions;

use RuntimeException;

/**
 * The uploaded photo was refused on moderation grounds.
 *
 * Deliberately its own type rather than a generic failure, because the two
 * must be handled in opposite ways. A generic failure — rate limit, timeout,
 * malformed response — should degrade to the offline classifier so the
 * citizen's report still gets filed. A moderation rejection must NOT: falling
 * back there would hand the image a plausible waste classification and file it
 * as an ordinary report, which is precisely the outcome the check exists to
 * prevent.
 *
 * So `FallbackWasteClassifier` lets this one through untouched.
 */
class ImageRejected extends RuntimeException
{
    /** Categories the moderation check can return. */
    public const CATEGORIES = ['nudity', 'violence', 'abuse', 'person_targeted', 'other'];

    public function __construct(
        public readonly string $category,
        public readonly string $engine,
        string $message = 'This photo cannot be used for a waste report.',
    ) {
        parent::__construct($message);
    }

    public static function normaliseCategory(?string $raw): string
    {
        $value = strtolower(trim((string) $raw));

        return in_array($value, self::CATEGORIES, true) ? $value : 'other';
    }

    /**
     * What the citizen is told.
     *
     * Deliberately the same sentence for every category. Naming what was
     * detected tells someone probing the check exactly which rule they tripped,
     * and an incorrect guess ("we think this is nudity") about an innocent
     * photo is worse than saying nothing.
     */
    public function citizenMessage(): string
    {
        return 'This photo cannot be used for a waste report. '
            .'Please take a clear photo of the waste itself and try again.';
    }
}
