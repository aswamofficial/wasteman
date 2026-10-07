<?php

namespace App\Services\Ai;

use Anthropic\Lib\Attributes\Constrained;
use Anthropic\Lib\Concerns\StructuredOutputModelTrait;
use Anthropic\Lib\Contracts\StructuredOutputModel;

/**
 * Schema Claude must fill in. Using structured outputs rather than parsing
 * prose means the model can't return a shape the app doesn't understand.
 */
class WasteAssessment implements StructuredOutputModel
{
    use StructuredOutputModelTrait;

    #[Constrained(description: 'True if the photo shows discarded material — either rubbish that needs removing, or recyclable material set aside for collection. False for clean streets, selfies, screenshots or anything unrelated.')]
    public bool $is_waste;

    /*
     * This field decides who the report is sent to, so it is asked as its own
     * constrained choice rather than inferred from waste_type — a free-text
     * category phrased unexpectedly would silently route a household's scrap
     * to a municipal crew, or a pile of rotting rubbish to a contractor
     * expecting something they can sell.
     */
    #[Constrained(description: 'Which stream this belongs to. Answer "recyclable" if the material has scrap value and a collector would pay for it: newspaper, paper, cardboard and carton boxes, metal, plastic bottles and containers, glass, electronics and appliances, textiles. Answer "disposal" if it must be removed by the municipality: kitchen and food waste, mixed rotting rubbish, construction debris and rubble, garden waste, sanitary or hazardous waste. Decisive rule: if otherwise recyclable material is soiled, wet, rotting, or mixed in with food waste, answer "disposal" — nobody will buy it.')]
    public string $stream;

    #[Constrained(description: 'Only when stream is "recyclable": the dominant material, one of "paper", "plastic", "metal", "glass", "electronics", "textile", "mixed". Use "mixed" when several recyclable materials are present in similar amounts. Use an empty string when stream is "disposal".')]
    public string $material;

    #[Constrained(description: 'Short human-readable waste category, e.g. "Mixed household waste", "Construction debris", "Plastic waste", "E-waste", "Garden and organic waste", "Overflowing bin". Title case, at most four words.')]
    public string $waste_type;

    /*
     * Asked separately from waste_type because the two genuinely differ: a
     * "Mixed household waste" pile may be mostly kitchen scraps (compostable)
     * or mostly packaging (not), and the category name alone cannot say which.
     */
    #[Constrained(description: 'True only if the bulk of what is visible would break down in a composting unit: kitchen and food waste, fruit and vegetable matter, leaves, grass cuttings, garden trimmings, soiled paper. False for plastic, metal, glass, electronics, textiles, rubble, sanitary or hazardous waste, and false for mixed piles where the organic part is a minority or is tangled up with plastic that would have to be picked out first.')]
    public bool $is_compostable;

    #[Constrained(description: 'Confidence in the classification, 0 to 100.')]
    public int $confidence;

    #[Constrained(description: 'How urgently this needs clearing: "low", "medium" or "high". High means it blocks a road or drain, is hazardous, or is a large pile.')]
    public string $severity;

    /*
     * Volume is asked before weight, and on purpose. A photo shows how much
     * space something occupies, not what it weighs — committing to the volume
     * first and deriving weight from it is the order a person would reason in,
     * and it stops a bulky-but-light pile of cartons being reported at the
     * weight of the same volume of rubble.
     */
    #[Constrained(description: 'Rough scale of the pile, one of: "handful" (fits in two hands, under about 10 litres), "sack" (one or two bin bags, roughly 10 to 100 litres), "cartload" (needs a handcart or small tempo, roughly 100 to 1000 litres), "truckload" (needs a tipper lorry, over 1000 litres). Use "handful" if this is not waste.')]
    public string $volume_bucket;

    #[Constrained(description: 'Approximate volume in whole litres the material occupies as it sits, including the air gaps in a loose pile. Must be consistent with volume_bucket. Use 0 if this is not waste.')]
    public int $estimated_volume_litres;

    #[Constrained(description: 'Rough total weight in whole kilograms a crew would remove. Derive it from the volume you just gave and what the material is: loose paper and cartons are roughly 50 kg per 1000 litres, mixed household waste roughly 200, wet kitchen waste roughly 500, construction rubble roughly 1400. Use 0 if this is not waste.')]
    public int $estimated_weight_kg;

    /** @var string[] */
    #[Constrained(description: 'Specific items visible in the photo, lowercase, at most six, e.g. ["plastic bags", "food waste", "cardboard"].')]
    public array $detected_items;

    #[Constrained(description: 'One short sentence a municipal worker could read to know what they are being sent to. No preamble.')]
    public string $summary;
}
