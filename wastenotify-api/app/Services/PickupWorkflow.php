<?php

namespace App\Services;

use App\Models\Report;
use App\Models\ReportEvent;
use App\Models\User;
use App\Services\Ai\Classification;
use DomainException;
use Illuminate\Support\Facades\DB;

/**
 * Single owner of a recyclable pickup's lifecycle, mirroring ReportWorkflow's
 * role on the municipal side.
 *
 * The two streams are deliberately not merged into one state machine. A
 * disposal report is work the corporation owes the public; a pickup is a
 * private transaction where money changes hands at a doorstep. They share a
 * table and a timeline, but the rules about who may act, and what must be
 * recorded, are different enough that one combined method would be a thicket
 * of conditionals nobody could audit.
 */
class PickupWorkflow
{
    public function __construct(private readonly Notifier $notifier) {}

    /**
     * A contractor claims a pickup.
     *
     * Guarded by a conditional UPDATE rather than a read-then-write: two
     * contractors tapping Accept at the same moment would both pass a
     * `whereNull` check made in PHP and both be told they had it, and one of
     * them would drive to an address that was no longer theirs. The database
     * decides the winner.
     */
    public function accept(Report $report, User $contractor): Report
    {
        if (! $report->isRecyclable()) {
            throw new DomainException('This is a municipal disposal report, not a pickup.');
        }

        if (! $contractor->isVerifiedContractor()) {
            throw new DomainException('Your contractor account is not verified yet.');
        }

        $claimed = Report::whereKey($report->id)
            ->whereNull('assigned_to')
            ->where('status', Report::STATUS_PENDING)
            ->update([
                'assigned_to' => $contractor->id,
                'status' => Report::STATUS_IN_PROGRESS,
                'accepted_at' => now(),
            ]);

        if (! $claimed) {
            throw new DomainException('Another collector has already taken this pickup.');
        }

        $report->refresh();

        $this->event(
            $report,
            ReportEvent::ASSIGNED,
            'Collector on the way',
            $contractor->contractorProfile?->business_name ?? $contractor->name,
            $contractor->id,
        );

        $this->notifier->send(
            userId: $report->user_id,
            type: 'pickup_accepted',
            title: 'A collector is coming for your recyclables',
            body: sprintf(
                '%s has accepted %s. They will pay you for the material on collection.',
                $contractor->contractorProfile?->business_name ?? $contractor->name,
                $report->reference,
            ),
            reportId: $report->id,
        );

        return $report;
    }

    /**
     * The contractor records what was actually collected and paid.
     *
     * Both figures come from the doorstep, not from the rate card — the
     * estimate was only ever indicative, and pretending otherwise would make
     * the app a party to a price it has no way to enforce.
     */
    public function settle(Report $report, User $contractor, float $amount, float $weightKg, ?string $note = null): Report
    {
        $this->assertOwner($report, $contractor);

        if ($report->status !== Report::STATUS_IN_PROGRESS) {
            throw new DomainException('This pickup is not open.');
        }

        DB::transaction(function () use ($report, $contractor, $amount, $weightKg, $note) {
            $report->forceFill([
                'settled_amount' => $amount,
                'settled_weight_kg' => $weightKg,
                'settled_at' => now(),
                'status' => Report::STATUS_RESOLVED,
                'resolved_at' => now(),
                'resolved_by' => $contractor->id,
            ])->save();

            $this->event(
                $report,
                ReportEvent::RESOLVED,
                'Collected and paid',
                trim(sprintf('%.2f kg for ₹%.2f. %s', $weightKg, $amount, $note ?? '')),
                $contractor->id,
            );
        });

        $this->notifier->send(
            userId: $report->user_id,
            type: 'pickup_settled',
            title: sprintf('₹%.2f for %s', $amount, $report->reference),
            body: sprintf(
                '%.2f kg collected. Confirm in the app if this matches what you were paid.',
                $weightKg,
            ),
            reportId: $report->id,
        );

        return $report->refresh();
    }

    /** The citizen agrees the recorded amount is what they actually received. */
    public function confirmSettlement(Report $report, User $citizen): Report
    {
        if ($report->user_id !== $citizen->id) {
            throw new DomainException('This is not your report.');
        }

        if (! $report->settled_at) {
            throw new DomainException('Nothing has been recorded for this pickup yet.');
        }

        $report->forceFill(['citizen_confirmed_at' => now()])->save();

        $this->event($report, ReportEvent::NOTE, 'Payment confirmed by the resident', null, $citizen->id);

        return $report;
    }

    /**
     * The contractor declines it, and it becomes the corporation's problem.
     *
     * This is the safety valve for a misclassification: material that turns out
     * to be soiled or mixed with food waste has no scrap value, but it is still
     * sitting in the street. Converting rather than closing is what stops it
     * falling through the gap between the two streams.
     */
    public function rejectToWard(Report $report, User $contractor, string $reason): Report
    {
        // A contractor may decline one they've accepted, or one still in the
        // open pool that they can see is wrongly classified.
        if ($report->assigned_to && $report->assigned_to !== $contractor->id) {
            throw new DomainException('This pickup belongs to another collector.');
        }

        DB::transaction(function () use ($report, $contractor, $reason) {
            $report->forceFill([
                'stream' => Classification::STREAM_DISPOSAL,
                'material' => null,
                'offer_amount' => null,
                'assigned_to' => null,
                'accepted_at' => null,
                'status' => Report::STATUS_PENDING,
                'converted_from' => Classification::STREAM_RECYCLABLE,
                'conversion_reason' => $reason,
            ])->save();

            $this->event(
                $report,
                ReportEvent::NOTE,
                'Not recyclable — sent to the corporation',
                $reason,
                $contractor->id,
            );
        });

        $this->notifier->send(
            userId: $report->user_id,
            type: 'pickup_converted',
            title: 'Your report went to the corporation instead',
            body: "A collector couldn't take this as recyclable material, so the ward team will clear it. Reason: {$reason}",
            reportId: $report->id,
        );

        return $report->refresh();
    }

    /** The contractor drops a job they accepted; it returns to the open pool. */
    public function release(Report $report, User $contractor, ?string $reason = null): Report
    {
        $this->assertOwner($report, $contractor);

        $report->forceFill([
            'assigned_to' => null,
            'accepted_at' => null,
            'status' => Report::STATUS_PENDING,
        ])->save();

        $this->event($report, ReportEvent::NOTE, 'Collector released this pickup', $reason, $contractor->id);

        return $report;
    }

    private function assertOwner(Report $report, User $contractor): void
    {
        if ($report->assigned_to !== $contractor->id) {
            throw new DomainException('This pickup is not assigned to you.');
        }
    }

    private function event(Report $report, string $type, string $title, ?string $body, ?int $actorId): void
    {
        ReportEvent::create([
            'report_id' => $report->id,
            'actor_id' => $actorId,
            'type' => $type,
            'title' => $title,
            'body' => $body,
        ]);
    }
}
