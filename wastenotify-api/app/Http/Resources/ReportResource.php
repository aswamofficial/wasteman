<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;

class ReportResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'reference' => $this->reference,
            'status' => $this->status,
            'status_label' => $this->statusLabel(),
            'severity' => $this->severity,
            'priority' => $this->priority,

            'photo_url' => $this->publicUrl($this->photo_path),
            'resolution_photo_url' => $this->publicUrl($this->resolution_photo_path),

            'latitude' => $this->latitude,
            'longitude' => $this->longitude,
            'address' => $this->address,
            'ward' => WardResource::make($this->whenLoaded('ward')),
            'ward_id' => $this->ward_id,
            'landmark' => $this->landmark,

            'waste_type' => $this->waste_type,
            'ai_confidence' => $this->ai_confidence,
            'estimated_weight_kg' => $this->estimated_weight_kg,
            /*
             * Volume as both a number and the coarse scale it came from. Null
             * on reports filed before the analysis asked for it — the client
             * must render that as "not assessed", never as zero.
             */
            'estimated_volume_litres' => $this->estimated_volume_litres,
            'volume_bucket' => $this->volume_bucket,
            // Null means never assessed; false means assessed and not compostable.
            'is_compostable' => $this->is_compostable,
            'detected_items' => $this->detected_items,
            /*
             * What produced the analysis above: 'claude' for a real model,
             * 'stub' for the offline stand-in, 'unverified' when the server has
             * no record of analysing this photo, null for never analysed.
             *
             * Exposed so the console can say which it is. A confidence
             * percentage with no provenance invites the reader to trust a
             * number that may have come from a hash of the file's bytes.
             */
            'ai_engine' => $this->ai_engine,
            'ai_trusted' => $this->ai_engine === 'claude',

            /*
             * Which service this report is in. 'recyclable' means a private
             * collector buys it from the resident; 'disposal' means the
             * corporation clears it. The two are shown to different audiences
             * and promise different things, so the client branches on this.
             */
            'stream' => $this->stream,
            'material' => $this->material,
            // Indicative only: rate card × estimated weight. Null when no rate
            // is published, which the UI must render as "price on collection"
            // rather than as zero.
            'offer_amount' => $this->offer_amount,
            'accepted_at' => $this->accepted_at?->toIso8601String(),
            // What was actually weighed and handed over at the door.
            'settled_amount' => $this->settled_amount,
            'settled_weight_kg' => $this->settled_weight_kg,
            'settled_at' => $this->settled_at?->toIso8601String(),
            'citizen_confirmed_at' => $this->citizen_confirmed_at?->toIso8601String(),
            'converted_from' => $this->converted_from,
            'conversion_reason' => $this->conversion_reason,
            'analysed_at' => $this->analysed_at?->toIso8601String(),

            'assigned_team' => $this->assigned_team,
            'assigned_to' => $this->assigned_to,
            'assignee' => $this->whenLoaded('assignee', fn () => ['id' => $this->assignee?->id, 'name' => $this->assignee?->name]),
            'note' => $this->note,
            'present_since' => $this->present_since,
            'blocking' => $this->blocking,

            'resolved_at' => $this->resolved_at?->toIso8601String(),
            'rating' => $this->rating,

            'created_at' => $this->created_at?->toIso8601String(),
            'created_for_humans' => $this->created_at?->diffForHumans(),

            // Only set when the query supplied an origin (map "near me").
            'distance_km' => $this->when(
                isset($this->distance_km),
                fn () => round((float) $this->distance_km, 2)
            ),

            'reporter' => new UserResource($this->whenLoaded('user')),
        ];
    }

    /**
     * Absolute URL for a stored file.
     *
     * Must go through disk('public') explicitly: the default disk is `local`,
     * which has no configured `url`, so a bare Storage::url() returns a
     * root-relative "/storage/..." that resolves against the *frontend* origin
     * (localhost:5299) rather than the API — every photo 404s.
     */
    private function publicUrl(?string $path): ?string
    {
        if (! $path) {
            return null;
        }

        return str_starts_with($path, 'http') ? $path : Storage::disk('public')->url($path);
    }
}
