<?php

namespace App\Services\Ai;

/**
 * Offline stand-in used when no Anthropic key is configured, and as the
 * fallback when a live call fails.
 *
 * Deliberately deterministic — derived from the file's own bytes — so the same
 * photo always classifies the same way. A random stub makes the report flow
 * look broken on retry and makes tests flaky.
 */
class StubWasteClassifier implements WasteClassifier
{
    /*
     * Both streams are represented so the recyclable route can be exercised
     * end to end without an API key. Mixed household waste stays on the
     * disposal side on purpose — it is the case a real model is most likely to
     * get wrong, and the one the fallback rules exist for.
     */
    private const TYPES = [
        // type, items, severity, kg, litres, bucket, compostable, stream, material
        ['Mixed household waste', ['plastic bags', 'food waste', 'cardboard'], 'medium', 40, 200, 'cartload', false, Classification::STREAM_DISPOSAL, null],
        ['Plastic waste', ['plastic bottles', 'containers', 'packaging'], 'low', 25, 500, 'cartload', false, Classification::STREAM_RECYCLABLE, 'plastic'],
        ['Construction debris', ['broken bricks', 'cement bags', 'tiles'], 'high', 120, 90, 'sack', false, Classification::STREAM_DISPOSAL, null],
        ['Garden and organic waste', ['leaves', 'branches'], 'low', 60, 400, 'cartload', true, Classification::STREAM_DISPOSAL, null],
        ['Cardboard and paper', ['carton boxes', 'newspaper'], 'low', 18, 350, 'cartload', false, Classification::STREAM_RECYCLABLE, 'paper'],
        ['E-waste', ['cables', 'circuit boards'], 'low', 18, 60, 'sack', false, Classification::STREAM_RECYCLABLE, 'electronics'],
        ['Scrap metal', ['steel sheets', 'pipes'], 'low', 35, 45, 'sack', false, Classification::STREAM_RECYCLABLE, 'metal'],
        ['Kitchen waste', ['food waste', 'peelings'], 'medium', 22, 45, 'sack', true, Classification::STREAM_DISPOSAL, null],
    ];

    public function classify(string $absolutePath, string $mimeType): Classification
    {
        $seed = crc32(hash_file('crc32b', $absolutePath) ?: $absolutePath);
        [$type, $items, $severity, $weight, $litres, $bucket, $compostable, $stream, $material]
            = self::TYPES[$seed % count(self::TYPES)];

        return new Classification(
            isWaste: true,
            wasteType: $type,
            confidence: 70 + ($seed % 25),
            severity: $severity,
            estimatedWeightKg: $weight,
            detectedItems: $items,
            summary: $stream === Classification::STREAM_RECYCLABLE
                ? "Looks like {$type} a collector would buy."
                : "Looks like {$type} that needs clearing.",
            engine: 'stub',
            stream: $stream,
            material: $material,
            isCompostable: $compostable,
            volumeBucket: $bucket,
            estimatedVolumeLitres: $litres,
        );
    }
}
