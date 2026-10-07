<?php

namespace App\Services\Ai;

use Anthropic\Client;
use Illuminate\Support\Facades\Log;

class ClaudeWasteClassifier implements WasteClassifier
{
    private const MODEL = 'claude-opus-5-5';

    /*
     * Thinking is always on with this model and is billed as output, so the
     * ceiling has to cover the reasoning as well as the JSON. The assessment
     * itself is a few hundred tokens; the rest is headroom, and an unused
     * ceiling costs nothing — only tokens actually generated are billed.
     */
    private const MAX_TOKENS = 8000;

    /*
     * One photo, one judgement, and a citizen waiting on the screen for it.
     * Low effort keeps that wait short and the per-report cost down.
     *
     * This is the knob to turn if the numbers come back wrong: raise to
     * 'medium' (the model's own default) or 'high' if volume and weight
     * estimates prove unreliable on real photos. Measure before raising it —
     * higher effort costs more on every report, including the easy ones.
     */
    private const EFFORT = 'low';

    /** Anthropic accepts these; anything else has to be converted first. */
    private const SUPPORTED = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

    private const SYSTEM = <<<'TXT'
        You classify photographs submitted to Wasteman, a civic app where citizens
        report waste. Your classification decides who is sent to collect it:

        - "recyclable" goes to a private scrap contractor, who travels to the
          citizen's home and pays them for the material.
        - "disposal" goes to the municipal corporation's ward crew, who remove it
          at public expense.

        Getting the stream wrong has an asymmetric cost. Sending a contractor to
        collect rotting rubbish wastes a private trip and they will refuse it on
        arrival; sending soiled or food-contaminated material to a contractor is
        the most common version of this mistake. When in doubt, choose "disposal" —
        a municipal officer reviews that queue, so the error is caught by a human.

        A wrong classification wastes a crew's trip, so be conservative: if the photo
        does not clearly show waste needing collection, set is_waste to false and give
        a low confidence. Judge severity by what would actually obstruct people —
        blocked drains and roads, hazardous or medical waste, and large piles are high;
        a single overflowing bin is usually medium. Severity applies to disposal;
        for recyclable material it is normally low.

        Size the pile before you weigh it. Judge the volume it occupies from
        what it is sitting next to — a bin, a doorway, a kerb, a person — then
        derive the weight from that volume and the material. Counting items
        gives a worse answer than reading the volume does.

        Compostability is about the material, not the category. Judge it on what
        would survive a composting unit: food and garden matter would, anything
        the operator would have to pick plastic out of first would not.

        Say what you can see. If the photo is dark, partly obstructed, or shot
        too close to judge scale, give a low confidence rather than a confident
        guess — a stated low confidence is useful to a dispatcher, an invented
        number is not.
        TXT;

    public function __construct(private readonly Client $client) {}

    public function classify(string $absolutePath, string $mimeType): Classification
    {
        if (! in_array($mimeType, self::SUPPORTED, true)) {
            throw new \InvalidArgumentException("Unsupported image type: {$mimeType}");
        }

        $message = $this->client->messages->create(
            model: self::MODEL,
            maxTokens: self::MAX_TOKENS,
            system: self::SYSTEM,
            messages: [[
                'role' => 'user',
                'content' => [
                    [
                        'type' => 'image',
                        'source' => [
                            'type' => 'base64',
                            'mediaType' => $mimeType,
                            'data' => base64_encode(file_get_contents($absolutePath)),
                        ],
                    ],
                    [
                        'type' => 'text',
                        'text' => 'Classify this photo for a waste report.',
                    ],
                ],
            ]],
            outputConfig: ['format' => WasteAssessment::class, 'effort' => self::EFFORT],
        );

        /*
         * Check why the model stopped before reading what it produced.
         *
         * A refusal and a truncation both return HTTP 200 with no usable
         * assessment, so neither raises on its own. Throwing here is what puts
         * the request on the fallback path — the citizen gets a report either
         * way, and the reason lands in the log rather than being silently
         * dressed up as a classification.
         */
        if ($message->stopReason === 'refusal') {
            throw new \RuntimeException(
                'Classification declined: '.($message->stopDetails?->category ?? 'unspecified')
            );
        }

        if ($message->stopReason === 'max_tokens') {
            throw new \RuntimeException('Classification truncated at the token ceiling.');
        }

        /** @var WasteAssessment $out */
        $out = $message->parsedOutput();

        $bucket = Classification::normaliseVolumeBucket($out->volume_bucket);

        return new Classification(
            isWaste: $out->is_waste,
            wasteType: trim($out->waste_type) ?: 'Unidentified waste',
            // Clamp rather than trust: these feed severity badges and admin
            // routing, and an out-of-range value would render as a broken bar.
            confidence: max(0, min(100, $out->confidence)),
            severity: in_array($out->severity, ['low', 'medium', 'high'], true) ? $out->severity : 'medium',
            estimatedWeightKg: max(0, $out->estimated_weight_kg),
            detectedItems: array_slice(array_values(array_filter($out->detected_items)), 0, 6),
            summary: trim($out->summary),
            engine: 'claude',
            // Normalised, not trusted: the stream decides whether a private
            // contractor is sent a citizen's address, so an unexpected value
            // has to fall to the municipal side rather than through.
            stream: $stream = Classification::normaliseStream($out->stream),
            material: Classification::normaliseMaterial($out->material, $stream),
            isCompostable: $out->is_compostable,
            volumeBucket: $bucket,
            estimatedVolumeLitres: Classification::reconcileVolume($out->estimated_volume_litres, $bucket),
        );
    }
}
