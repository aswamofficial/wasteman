<?php

namespace App\Console\Commands;

use App\Models\Report;
use App\Models\ReportEvent;
use App\Models\Setting;
use App\Models\User;
use App\Services\Notifier;
use Illuminate\Console\Command;

class EscalateOverdueReports extends Command
{
    protected $signature = 'reports:escalate {--dry-run : List what would happen without writing anything}';

    protected $description = 'Raise priority and alert owners for reports past the overdue threshold';

    /**
     * "Overdue" was a number computed while somebody happened to be looking at
     * a dashboard. Nothing acted on it, so a report could sit past its
     * threshold indefinitely as long as no one opened the console.
     *
     * This runs daily and does three things, once per report:
     *   - raises priority to urgent
     *   - writes a timeline event, so the escalation is on the record
     *   - notifies the assignee, or every admin in the ward if unassigned
     *
     * Idempotent by design: a report that already carries an escalation event
     * is skipped, so a second run in the same day doesn't spam anyone. The
     * citizen is deliberately *not* notified — "we are late" is an internal
     * signal, and telling them without an actual update is noise.
     */
    public function handle(Notifier $notifier): int
    {
        $days = (int) Setting::value('overdue_days', 5);
        $cutoff = now()->subDays($days);
        $dry = $this->option('dry-run');

        $reports = Report::query()
            ->open()
            ->where('created_at', '<=', $cutoff)
            ->whereDoesntHave('events', fn ($q) => $q->where('type', ReportEvent::ESCALATED))
            ->with(['assignee:id,name', 'ward:id,ward_no,zone,town'])
            ->get();

        if ($reports->isEmpty()) {
            $this->info("Nothing past {$days} days that hasn't already been escalated.");

            return self::SUCCESS;
        }

        $this->info(sprintf(
            '%s %d report(s) past %d days.',
            $dry ? 'Would escalate' : 'Escalating',
            $reports->count(),
            $days
        ));

        foreach ($reports as $report) {
            $age = (int) $report->created_at->diffInDays(now());
            $owner = $report->assignee?->name ?? 'nobody';
            $this->line("  {$report->reference} — {$age}d old, assigned to {$owner}");

            if ($dry) {
                continue;
            }

            // Plain string to match the rest of the codebase, which validates
            // priority as in:low,normal,urgent rather than via constants.
            $report->priority = 'urgent';
            $report->save();

            ReportEvent::create([
                'report_id' => $report->id,
                'actor_id' => null,
                'type' => ReportEvent::ESCALATED,
                'title' => 'Escalated — past the service target',
                'body' => "Open for {$age} days against a {$days}-day threshold. Priority raised to urgent.",
            ]);

            foreach ($this->recipients($report) as $userId) {
                $notifier->send(
                    userId: $userId,
                    type: 'escalation',
                    title: "{$report->reference} is {$age} days old",
                    body: $report->assigned_to
                        ? 'Past the service target and still open. Raised to urgent.'
                        : 'Past the service target and still unassigned. Raised to urgent.',
                    reportId: $report->id,
                );
            }
        }

        return self::SUCCESS;
    }

    /**
     * The assignee if there is one; otherwise the admins responsible for that
     * ward, so an unassigned overdue report escalates to someone rather than
     * to its absent owner.
     *
     * Falls back to every admin when that ward has none. Without the fallback
     * this returned an empty array and the escalation notified nobody at all —
     * the report was silently marked urgent and left exactly where it was,
     * which is worse than not escalating, because the record then claims
     * someone was told.
     *
     * @return array<int, int>
     */
    private function recipients(Report $report): array
    {
        if ($report->assigned_to) {
            return [$report->assigned_to];
        }

        $wardAdmins = User::role('admin')
            ->where(fn ($q) => $q->where('ward_id', $report->ward_id)->orWhereNull('ward_id'))
            ->pluck('id')
            ->all();

        if ($wardAdmins) {
            return $wardAdmins;
        }

        $this->warn("    no admin covers ward {$report->ward_id} — escalating to all admins");

        return User::role('admin')->pluck('id')->all();
    }
}
