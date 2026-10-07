<?php

namespace App\Services\Ai;

/**
 * Normalised result of classifying a waste photo, whatever produced it.
 */
class Classification
{
    /** Has scrap value — goes to a contractor, who pays the citizen for it. */
    public const STREAM_RECYCLABLE = 'recyclable';

    /** Must be removed by the corporation — goes to the ward queue. */
    public const STREAM_DISPOSAL = 'disposal';

    /** Materials a contractor buys. Anything outside this list is not routed. */
    public const MATERIALS = ['paper', 'plastic', 'metal', 'glass', 'electronics', 'textile', 'mixed'];

    /**
     * Scale of the pile, smallest first. Ordered because the UI and the
     * dispatch hint both read it as a scale rather than as a set of labels.
     */
    public const VOLUME_BUCKETS = ['handful', 'sack', 'cartload', 'truckload'];

    /** Upper bound in litres for each bucket, used to sanity-check the model. */
    private const BUCKET_CEILING = [
        'handful' => 10,
        'sack' => 100,
        'cartload' => 1000,
        'truckload' => 40000,
    ];

    /**
     * @param  string[]  $detectedItems
     */
    public function __construct(
        public readonly bool $isWaste,
        public readonly string $wasteType,
        public readonly int $confidence,          // 0-100
        public readonly string $severity,         // low | medium | high
        public readonly int $estimatedWeightKg,
        public readonly array $detectedItems,
        public readonly string $summary,
        public readonly string $engine,           // claude | stub
        public readonly string $stream = self::STREAM_DISPOSAL,
        public readonly ?string $material = null,
        public readonly bool $isCompostable = false,
        public readonly string $volumeBucket = 'sack',
        public readonly int $estimatedVolumeLitres = 0,
    ) {}

    public function isRecyclable(): bool
    {
        return $this->stream === self::STREAM_RECYCLABLE;
    }

    /**
     * Coerce whatever the model returned into a stream this app understands.
     *
     * Defaults to disposal, deliberately. An unrecognised value must not send a
     * citizen's address to a contractor — the corporation queue is the safe
     * side of that mistake, because a human reads every item in it.
     */
    public static function normaliseStream(?string $raw): string
    {
        return strtolower(trim((string) $raw)) === self::STREAM_RECYCLABLE
            ? self::STREAM_RECYCLABLE
            : self::STREAM_DISPOSAL;
    }

    /** Falls back to the middle of the scale rather than to "nothing much". */
    public static function normaliseVolumeBucket(?string $raw): string
    {
        $value = strtolower(trim((string) $raw));

        return in_array($value, self::VOLUME_BUCKETS, true) ? $value : 'sack';
    }

    /**
     * Keep the litres and the bucket telling the same story.
     *
     * The model is asked for both, and they can disagree — a pile described as
     * a "cartload" with 20 litres against it is the kind of answer that makes a
     * dispatcher stop trusting the whole screen. The bucket is the coarser,
     * better-grounded judgement, so the litres are pulled into its range rather
     * than the other way round.
     */
    public static function reconcileVolume(int $litres, string $bucket): int
    {
        $litres = max(0, $litres);

        if ($litres === 0) {
            return 0;
        }

        $ceiling = self::BUCKET_CEILING[$bucket] ?? 100;
        $floor = match ($bucket) {
            'sack' => 10,
            'cartload' => 100,
            'truckload' => 1000,
            default => 1,
        };

        return (int) min($ceiling, max($floor, $litres));
    }

    /** Null unless it's a material actually on the list. */
    public static function normaliseMaterial(?string $raw, string $stream): ?string
    {
        if ($stream !== self::STREAM_RECYCLABLE) {
            return null;
        }

        $value = strtolower(trim((string) $raw));

        return in_array($value, self::MATERIALS, true) ? $value : 'mixed';
    }

    public function toArray(): array
    {
        return [
            'is_waste' => $this->isWaste,
            'stream' => $this->stream,
            'material' => $this->material,
            'waste_type' => $this->wasteType,
            'is_compostable' => $this->isCompostable,
            'confidence' => $this->confidence,
            'severity' => $this->severity,
            'volume_bucket' => $this->volumeBucket,
            'estimated_volume_litres' => $this->estimatedVolumeLitres,
            'estimated_weight_kg' => $this->estimatedWeightKg,
            'detected_items' => $this->detectedItems,
            'summary' => $this->summary,
            'engine' => $this->engine,
        ];
    }
}
