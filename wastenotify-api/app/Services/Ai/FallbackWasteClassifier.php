<?php

namespace App\Services\Ai;

use Illuminate\Support\Facades\Log;
use Throwable;

/**
 * Wraps the live classifier so an API outage, a rate limit or a malformed
 * response degrades to the stub instead of failing the citizen's submission.
 *
 * Losing the classification is recoverable — an admin can correct the waste
 * type. Losing the report is not: the citizen is standing in the street and
 * will not photograph it twice.
 */
class FallbackWasteClassifier implements WasteClassifier
{
    public function __construct(
        private readonly WasteClassifier $primary,
        private readonly WasteClassifier $fallback,
    ) {}

    public function classify(string $absolutePath, string $mimeType): Classification
    {
        try {
            return $this->primary->classify($absolutePath, $mimeType);
        } catch (Throwable $e) {
            Log::warning('AI classification failed, falling back to stub.', [
                'exception' => $e::class,
                'message' => $e->getMessage(),
            ]);

            return $this->fallback->classify($absolutePath, $mimeType);
        }
    }
}
