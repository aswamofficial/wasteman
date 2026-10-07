<?php

namespace App\Services;

use App\Models\Report;
use App\Models\ReportEvent;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

/**
 * Single owner of a report's lifecycle.
 *
 * Every status change writes a timeline event and (where the citizen would
 * care) a notification. Keeping that in one place is what stops the app
 * drifting into states where a report is resolved but the reporter was never
 * told — the failure mode that would make the product pointless.
 */
class ReportWorkflow
{
    /** Which statuses may follow which. */
    private const TRANSITIONS = [
        Report::STATUS_PENDING => [Report::STATUS_IN_PROGRESS, Report::STATUS_RESOLVED, Report::STATUS_REJECTED],
        Report::STATUS_IN_PROGRESS => [Report::STATUS_RESOLVED, Report::STATUS_REJECTED, Report::STATUS_PENDING],
        Report::STATUS_RESOLVED => [Report::STATUS_IN_PROGRESS],
        Report::STATUS_REJECTED => [Report::STATUS_PENDING],
    ];

    public function canTransition(string $from, string $to): bool
    {
        return $from === $to || in_array($to, self::TRANSITIONS[$from] ?? [], true);
    }

    /**
     * Record a freshly submitted report plus its AI verdict.
     */
    public function submitted(Report $report): void
    {
        DB::transaction(function () use ($report) {
            $this->event($report, ReportEvent::SUBMITTED, 'Report submitted', $report->address, $report->user_id);

            if ($report->waste_type) {
                $recyclable = $report->isRecyclable();

                $this->event(
                    $report,
                    ReportEvent::ANALYSED,
                    'AI verified & routed',
                    sprintf(
                        'Classified as %s (%d%% confidence) — %s.',
                        $report->waste_type,
                        $report->ai_confidence,
                        $recyclable ? 'recyclable, offered to collectors' : 'sent to the ward team',
                    ),
                );

                /*
                 * The two streams promise the citizen different things, so they
                 * are told different things. A recyclable pickup is somebody
                 * coming to buy their scrap; a disposal report is the council
                 * coming to clear a nuisance. Using one message for both would
                 * mislead half of them.
                 */
                $this->notify(
                    $report,
                    'verified',
                    $recyclable ? 'Offered to collectors' : 'Report verified',
                    $recyclable
                        ? $this->pickupOfferLine($report)
                        : "AI classified your report as {$report->waste_type} and routed it to the ward team.",
                );
            }
        });
    }

    /**
     * The line a citizen sees when their scrap is put on offer.
     *
     * States the estimate as an estimate. The figure comes from the
     * corporation's published rate card multiplied by an AI weight guess, and
     * the actual amount is agreed on the doorstep — presenting it as a price
     * would have the app committing a private contractor to a number.
     */
    private function pickupOfferLine(Report $report): string
    {
        $line = "{$report->waste_type} can be collected and paid for.";

        return $report->offer_amount
            ? $line.sprintf(' Indicative value ₹%.0f at the published rate — the collector weighs it and agrees the final amount with you.', $report->offer_amount)
            : $line.' The collector will weigh it and agree a price with you.';
    }

    public function assign(Report $report, string $team, ?User $actor = null, ?string $note = null): Report
    {
        return DB::transaction(function () use ($report, $team, $actor, $note) {
            $report->assigned_team = $team;
            $report->save();

            $this->event($report, ReportEvent::ASSIGNED, 'Team assigned', $note ?? $team, $actor?->id);

            $this->notify(
                $report,
                'assigned',
                'Team assigned',
                "{$team} has been assigned to {$report->reference}.",
            );

            return $report->refresh();
        });
    }

    /**
     * Move a report to a new status, writing the timeline entry and telling the
     * reporter. Resolution requires an after-photo — that photo is the whole
     * payoff of the product, so a resolve without one is refused.
     */
    /**
     * Put a named person on the report.
     *
     * Recorded on the timeline but deliberately NOT notified to the citizen —
     * which municipal officer owns the ticket is internal, and a notification
     * per staffing change would be noise they can't act on.
     */
    public function assignTo(Report $report, User $assignee, ?User $actor = null): void
    {
        $this->event(
            $report,
            ReportEvent::ASSIGNED,
            'Assigned to '.$assignee->name,
            null,
            $actor?->id,
        );
    }

    public function transition(
        Report $report,
        string $to,
        ?User $actor = null,
        ?string $note = null,
        ?string $resolutionPhotoPath = null,
    ): Report {
        if (! $this->canTransition($report->status, $to)) {
            throw new \DomainException("Cannot move a {$report->status} report to {$to}.");
        }

        if ($to === Report::STATUS_RESOLVED && ! $resolutionPhotoPath && ! $report->resolution_photo_path) {
            throw new \DomainException('A resolution photo is required to mark a report resolved.');
        }

        return DB::transaction(function () use ($report, $to, $actor, $note, $resolutionPhotoPath) {
            $report->status = $to;

            if ($resolutionPhotoPath) {
                $report->resolution_photo_path = $resolutionPhotoPath;
            }

            match ($to) {
                Report::STATUS_RESOLVED => tap($report, function (Report $r) use ($actor) {
                    $r->resolved_at = now();
                    $r->resolved_by = $actor?->id;
                    $r->rejected_at = null;
                }),
                Report::STATUS_REJECTED => tap($report, fn (Report $r) => $r->rejected_at = now()),
                default => tap($report, function (Report $r) {
                    $r->resolved_at = null;
                    $r->rejected_at = null;
                }),
            };

            $report->save();

            [$title, $body, $notifyType] = match ($to) {
                Report::STATUS_IN_PROGRESS => [
                    'Clean-up in progress',
                    $note ?? 'A crew has been dispatched.',
                    'in_progress',
                ],
                Report::STATUS_RESOLVED => [
                    'Resolved',
                    $note ?? 'The waste has been cleared.',
                    'resolved',
                ],
                Report::STATUS_REJECTED => [
                    'Report rejected',
                    $note ?? 'This report was not actionable.',
                    'rejected',
                ],
                default => ['Reopened', $note ?? 'This report was reopened.', 'verified'],
            };

            $this->event($report, $to, $title, $body, $actor?->id);

            $this->notify(
                $report,
                $notifyType,
                match ($to) {
                    Report::STATUS_IN_PROGRESS => 'Clean-up started',
                    Report::STATUS_RESOLVED => 'Your report was resolved',
                    Report::STATUS_REJECTED => 'Report closed',
                    default => 'Report reopened',
                },
                match ($to) {
                    Report::STATUS_RESOLVED => "The waste at {$report->address} has been cleared. Tap to see the after photo.",
                    default => $body,
                },
                // The after-photo rides along on the resolved notification so
                // the list can show it as a thumbnail. Store the *path*, not a
                // rendered URL — a baked URL goes stale the moment APP_URL
                // changes (dev → prod), and old rows can't be corrected.
                $to === Report::STATUS_RESOLVED ? $report->resolution_photo_path : null,
            );

            return $report->refresh();
        });
    }

    public function note(Report $report, string $body, ?User $actor = null): void
    {
        $this->event($report, ReportEvent::NOTE, 'Update added', $body, $actor?->id);
    }

    private function event(Report $report, string $type, string $title, ?string $body = null, ?int $actorId = null): void
    {
        ReportEvent::create([
            'report_id' => $report->id,
            'actor_id' => $actorId,
            'type' => $type,
            'title' => $title,
            'body' => $body,
        ]);
    }

    private function notify(Report $report, string $type, string $title, string $body, ?string $imageUrl = null): void
    {
        // Delegated so the citizen's phone gets this too, not just the
        // in-app list. See Notifier.
        app(Notifier::class)->send(
            userId: $report->user_id,
            type: $type,
            title: $title,
            body: $body,
            reportId: $report->id,
            imageUrl: $imageUrl,
        );
    }

    private function publicUrl(?string $path): ?string
    {
        if (! $path) {
            return null;
        }

        // disk('public') explicitly — the default disk is `local` and has no
        // configured url, which yields an origin-relative path the app can't use.
        return str_starts_with($path, 'http') ? $path : Storage::disk('public')->url($path);
    }
}
