<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ReportEvent extends Model
{
    public const SUBMITTED = 'submitted';
    public const ANALYSED = 'analysed';
    public const ASSIGNED = 'assigned';
    public const IN_PROGRESS = 'in_progress';
    public const RESOLVED = 'resolved';
    public const REJECTED = 'rejected';
    public const NOTE = 'note';

    /** Written by reports:escalate when a report passes the service target. */
    public const ESCALATED = 'escalated';

    protected $guarded = ['id'];

    protected function casts(): array
    {
        return ['meta' => 'array'];
    }

    public function report(): BelongsTo
    {
        return $this->belongsTo(Report::class);
    }

    public function actor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'actor_id');
    }
}
