<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'phone' => $this->phone,
            'ward_id' => $this->ward_id,
            // A real ward record or null — never a free-text label.
            'ward' => WardResource::make($this->whenLoaded('ward')),
            'avatar_url' => $this->avatar_url,
            'email_verified' => (bool) $this->email_verified_at,
            'phone_verified' => (bool) $this->phone_verified_at,
            'roles' => $this->whenLoaded('roles', fn () => $this->roles->pluck('name'), $this->getRoleNames()),
            'is_admin' => $this->hasRole('admin'),
            'reports_count' => $this->whenCounted('reports'),
            // The controller aliases this count to `open_assigned` so it can be
            // filtered to open statuses. whenCounted() only ever looks for the
            // unaliased `assigned_reports_count`, so it silently dropped the
            // key and the users table rendered every officer as carrying 0.
            'open_assigned' => $this->when(
                isset($this->open_assigned),
                fn () => (int) $this->open_assigned,
            ),
            'suspended' => (bool) $this->suspended_at,
            'suspended_reason' => $this->suspended_reason,
            'role' => $this->getRoleNames()->first(),
            'joined_at' => $this->created_at?->toIso8601String(),
        ];
    }
}
