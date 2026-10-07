<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\ReportResource;
use App\Http\Resources\WardResource;
use App\Models\Report;
use App\Models\Setting;
use App\Models\User;
use App\Services\Ai\Classification;
use App\Services\ReportWorkflow;
use DomainException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class AdminReportController extends Controller
{
    public function __construct(private readonly ReportWorkflow $workflow) {}

    /**
     * The ward queue. Overdue-first by default — a report nobody has touched
     * for days is the one that needs a human, not the newest one.
     */
    public function index(Request $request): JsonResponse
    {
        $data = $request->validate([
            'status' => ['nullable', 'in:all,pending,in_progress,resolved,rejected'],
            'priority' => ['nullable', 'in:low,normal,urgent'],
            'overdue' => ['nullable', 'boolean'],
            'unassigned' => ['nullable', 'boolean'],
            'mine' => ['nullable', 'boolean'],
            'stream' => ['nullable', 'in:disposal,recyclable,all'],
            'q' => ['nullable', 'string', 'max:120'],
            'sort' => ['nullable', 'in:oldest,newest,severity'],
        ]);

        // Threshold is configurable, so "overdue" here matches what the
        // dashboard and the settings screen say it means.
        $overdueBefore = now()->subDays((int) Setting::value('overdue_days', 5));

        /*
         * Scope every figure on this screen to the admin's ward when they have
         * one. Previously the header displayed a ward while the query returned
         * the whole city — the screen asserted a scope it wasn't applying.
         * A null ward_id means a genuinely city-wide admin, and the UI labels
         * it that way.
         */
        $ward = $request->user()->ward;

        /*
         * The queue is municipal work by default.
         *
         * Recyclable pickups belong to private collectors, not to the ward
         * crew — before this filter existed they appeared here alongside real
         * disposal jobs, so an officer could assign a crew to material a
         * contractor had already bought and taken away. Oversight is still
         * possible via ?stream=recyclable or ?stream=all; it just isn't the
         * default view of "your queue".
         */
        $stream = $data['stream'] ?? Classification::STREAM_DISPOSAL;

        $base = Report::query()
            ->when($ward, fn ($q) => $q->where('ward_id', $ward->id))
            ->when($stream !== 'all', fn ($q) => $q->where('stream', $stream));

        $counts = (clone $base)
            ->selectRaw('status, COUNT(*) as total')
            ->groupBy('status')
            ->pluck('total', 'status');

        $query = (clone $base)->with(['user:id,name,email,phone', 'ward', 'assignee:id,name']);

        if (! empty($data['status']) && $data['status'] !== 'all') {
            $query->where('status', $data['status']);
        }

        if (! empty($data['priority'])) {
            $query->where('priority', $data['priority']);
        }

        if ($request->boolean('overdue')) {
            $query->open()->where('created_at', '<=', $overdueBefore);
        }

        if ($request->boolean('unassigned')) {
            $query->open()->whereNull('assigned_to');
        }

        /*
         * The officer's own work. Without this an assignee had no way to see
         * what was theirs — they got the whole ward and had to read every row
         * for their own name.
         */
        if ($request->boolean('mine')) {
            $query->where('assigned_to', $request->user()->id);
        }

        if (! empty($data['q'])) {
            $term = '%'.$data['q'].'%';
            $query->where(fn ($w) => $w->where('reference', 'like', $term)
                ->orWhere('address', 'like', $term)
                ->orWhere('waste_type', 'like', $term));
        }

        match ($data['sort'] ?? 'oldest') {
            'newest' => $query->latest(),
            'severity' => $query->orderByRaw("FIELD(severity,'high','medium','low')")->oldest(),
            default => $query->oldest(),
        };

        $overdueCount = (clone $base)->open()->where('created_at', '<=', $overdueBefore)->count();

        return response()->json([
            'reports' => ReportResource::collection($query->paginate(25)),
            'counts' => [
                'all' => (int) $counts->sum(),
                'pending' => (int) ($counts[Report::STATUS_PENDING] ?? 0),
                'in_progress' => (int) ($counts[Report::STATUS_IN_PROGRESS] ?? 0),
                'resolved' => (int) ($counts[Report::STATUS_RESOLVED] ?? 0),
                'rejected' => (int) ($counts[Report::STATUS_REJECTED] ?? 0),
            ],
            'stats' => [
                'new_today' => (clone $base)->whereDate('created_at', today())->count(),
                'in_progress' => (int) ($counts[Report::STATUS_IN_PROGRESS] ?? 0),
                'resolved_this_month' => (clone $base)->resolved()
                    ->whereBetween('resolved_at', [now()->startOfMonth(), now()])->count(),
                'overdue' => $overdueCount,
                'unassigned' => (clone $base)->open()->whereNull('assigned_to')->count(),
                'mine' => (clone $base)->open()->where('assigned_to', $request->user()->id)->count(),
                'avg_resolution_days' => $this->averageResolutionDays($ward?->id),
                // So the banner states the configured threshold instead of a
                // hard-coded number that drifts when the setting changes.
                'overdue_threshold_days' => (int) Setting::value('overdue_days', 5),
            ],
            // Which stream this list is showing, and how much sits in the
            // other one — so the recyclable side is visible as a number even
            // when it isn't the ward's work to do.
            'stream' => $stream,
            'stream_counts' => [
                'disposal' => Report::query()
                    ->when($ward, fn ($q) => $q->where('ward_id', $ward->id))
                    ->disposal()->open()->count(),
                'recyclable' => Report::query()
                    ->when($ward, fn ($q) => $q->where('ward_id', $ward->id))
                    ->recyclable()->open()->count(),
            ],
            // What this screen is actually scoped to, so the header can't
            // claim a ward the query didn't filter on.
            'scope' => $ward
                ? ['type' => 'ward', 'ward' => new WardResource($ward)]
                : ['type' => 'city', 'ward' => null],
        ]);
    }

    public function show(Report $report): JsonResponse
    {
        $report->load(['user', 'assignee:id,name', 'resolver:id,name', 'ward']);

        return response()->json([
            'report' => new ReportResource($report),
            'timeline' => $report->events()->with('actor:id,name')->orderBy('created_at')->get()->map(fn ($e) => [
                'type' => $e->type,
                'title' => $e->title,
                'body' => $e->body,
                'actor' => $e->actor?->name,
                'at' => $e->created_at?->toIso8601String(),
                'at_human' => $e->created_at?->diffForHumans(),
            ]),
            'reporter' => [
                'name' => $report->user?->name,
                'email' => $report->user?->email,
                'phone' => $report->user?->phone,
                'reports_count' => $report->user?->reports()->count() ?? 0,
            ],
        ]);
    }

    /**
     * Assign, re-prioritise, schedule, note, and/or change status in one call —
     * the admin sheet submits all of it together.
     */
    public function update(Request $request, Report $report): JsonResponse
    {
        $data = $request->validate([
            'status' => ['nullable', 'in:pending,in_progress,resolved,rejected'],
            // Assign to a real person, not just a free-text crew name. Both are
            // kept: the person is who's accountable, the team is who turns up.
            'assigned_to' => ['nullable', 'integer', 'exists:users,id'],
            'assigned_team' => ['nullable', 'string', 'max:120'],
            'priority' => ['nullable', 'in:low,normal,urgent'],
            'scheduled_for' => ['nullable', 'date'],
            'internal_note' => ['nullable', 'string', 'max:2000'],
            'note' => ['nullable', 'string', 'max:1000'],
            'resolution_photo' => ['nullable', 'image', 'mimes:jpeg,png,gif,webp', 'max:8192'],
        ]);

        $actor = $request->user();

        if (array_key_exists('priority', $data) && $data['priority']) {
            $report->priority = $data['priority'];
        }
        if (array_key_exists('scheduled_for', $data) && $data['scheduled_for']) {
            $report->scheduled_for = $data['scheduled_for'];
        }
        if (array_key_exists('internal_note', $data) && $data['internal_note']) {
            $report->internal_note = $data['internal_note'];
        }

        if (array_key_exists('assigned_to', $data) && $data['assigned_to'] !== $report->assigned_to) {
            $assignee = $data['assigned_to'] ? User::find($data['assigned_to']) : null;
            $report->assigned_to = $assignee?->id;

            if ($assignee) {
                $this->workflow->assignTo($report, $assignee, $actor);
            }
        }

        $report->save();

        if (! empty($data['assigned_team']) && $data['assigned_team'] !== $report->assigned_team) {
            $report = $this->workflow->assign($report, $data['assigned_team'], $actor, $data['note'] ?? null);
        }

        $resolutionPath = null;
        if ($request->hasFile('resolution_photo')) {
            $resolutionPath = $request->file('resolution_photo')->store('reports/resolved', 'public');
        }

        if (! empty($data['status']) && $data['status'] !== $report->status) {
            try {
                $report = $this->workflow->transition(
                    $report,
                    $data['status'],
                    $actor,
                    $data['note'] ?? null,
                    $resolutionPath,
                );
            } catch (DomainException $e) {
                // Don't strand an uploaded photo that was never attached.
                if ($resolutionPath) {
                    Storage::disk('public')->delete($resolutionPath);
                }

                return response()->json(['message' => $e->getMessage()], 422);
            }
        } elseif ($resolutionPath) {
            $report->resolution_photo_path = $resolutionPath;
            $report->save();
        }

        if (! empty($data['note']) && empty($data['status']) && empty($data['assigned_team'])) {
            $this->workflow->note($report, $data['note'], $actor);
        }

        return response()->json(['report' => new ReportResource($report->fresh()->load('user'))]);
    }

    private function averageResolutionDays(?int $wardId): float
    {
        $avgHours = Report::resolved()
            ->when($wardId, fn ($q) => $q->where('ward_id', $wardId))
            ->whereNotNull('resolved_at')
            ->selectRaw('AVG(TIMESTAMPDIFF(HOUR, created_at, resolved_at)) as h')
            ->value('h');

        return round(((float) $avgHours) / 24, 1);
    }
}
