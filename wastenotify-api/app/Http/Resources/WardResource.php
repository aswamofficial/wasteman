<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class WardResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'ward_no' => $this->ward_no,
            'zone' => $this->zone,
            'town' => $this->town,
            'state' => $this->state,
            // Government of India Local Government Directory code — the
            // authoritative identifier for this ward.
            'lgd_code' => $this->lgd_code,
            'label' => $this->label(),
            'centroid' => [
                'lat' => $this->centroid_lat,
                'lng' => $this->centroid_lng,
            ],
        ];
    }
}
