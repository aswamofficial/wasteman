<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Spatie\Permission\Traits\HasRoles;

class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasApiTokens, HasFactory, HasRoles, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'phone',
        'password',
        'avatar_url',
        'ward_id',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'suspended_at' => 'datetime',
            'last_seen_at' => 'datetime',
            'phone_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    public function reports(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(Report::class);
    }

    /** Reports this user is responsible for clearing, not ones they filed. */
    public function assignedReports(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(Report::class, 'assigned_to');
    }

    public function isSuspended(): bool
    {
        return $this->suspended_at !== null;
    }

    /**
     * For a citizen this is their home ward; for an admin it's the ward they
     * operate. Null on an admin means city-wide, and the UI says so rather
     * than naming a ward it isn't actually scoped to.
     */
    public function ward(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(Ward::class);
    }

    /** Present only for users with the contractor role. */
    public function contractorProfile(): \Illuminate\Database\Eloquent\Relations\HasOne
    {
        return $this->hasOne(ContractorProfile::class);
    }

    /**
     * A contractor who has been approved by an administrator.
     *
     * Checked as one thing rather than as "has the role" plus "profile says
     * verified" at each call site — those two drifting apart is exactly how an
     * unapproved contractor would end up seeing addresses.
     */
    public function isVerifiedContractor(): bool
    {
        return $this->hasRole('contractor')
            && (bool) $this->contractorProfile?->isVerified();
    }
}
