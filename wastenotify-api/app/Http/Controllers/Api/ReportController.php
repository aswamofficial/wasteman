<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\ReportResource;
use App\Models\MaterialRate;
use App\Models\Report;
use App\Services\Ai\Classification;
use App\Services\Ai\WasteClassifier;
use App\Services\PickupWorkflow;
use App\Services\ReportWorkflow;
use DomainException;
use Illuminate\Database\QueryException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class ReportController extends Controller
{
    public function __construct(private readonly ReportWorkflow $workflow) {}

    /**
     * Step 2 of the capture flow: store the photo and classify it, without
     * creating a report yet.
     *
     * The citizen still has to confirm the location and add details, and may
     * back out — so this returns a `photo_path` they hand back on submit rather
     * than committing a half-finished report to the database.
     */
    public function analyse(Request $request, WasteClassifier $classifier): JsonResponse
    {
        $request->validate([
            'photo' => ['required', 'image', 'mimes:jpeg,png,gif,webp', 'max:8192'],
        ]);

        $path = $request->file('photo')->store('reports/pending', 'public');
        $absolute = Storage::disk('public')->path($path);

        $result = $classifier->classify($absolute, $request->file('photo')->getMimeType());

        /*
         * Keep the server's own record of what this photo was told.
         *
         * `store()` receives the analysis echoed back by the client, which is
         * fine for display fields but useless as provenance — a client can
         * claim any engine it likes. The engine written to the report is read
         * from here instead, so "this was analysed by Claude" is something the
         * server observed rather than something it was told.
         */
        Cache::put(
            self::analysisKey($path),
            $result->toArray(),
            now()->addHours(6),
        );

        return response()->json([
            'photo_path' => $path,
            'photo_url' => Storage::disk('public')->url($path),
            'analysis' => $result->toArray(),
        ]);
    }

    /** Cache key for a pending photo's server-side analysis record. */
    private static function analysisKey(string $photoPath): string
    {
        return 'analysis:'.sha1($photoPath);
    }

    /**
     * Step 4: create the report from the analysed photo plus location/details.
     */
    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'photo_path' => ['required', 'string', 'max:255'],
            'latitude' => ['required', 'numeric', 'between:-90,90'],
            'longitude' => ['required', 'numeric', 'between:-180,180'],
            'address' => ['required', 'string', 'max:255'],
            'landmark' => ['nullable', 'string', 'max:255'],
            'present_since' => ['nullable', 'in:today,few_days,over_a_week,unknown'],
            'blocking' => ['nullable', 'in:road,footpath,drain,nothing'],
            'note' => ['nullable', 'string', 'max:2000'],

            // Echoed back from /analyse. Re-classifying here would double the
            // API spend and could contradict what the citizen was just shown.
            'waste_type' => ['nullable', 'string', 'max:120'],
            'ai_confidence' => ['nullable', 'integer', 'between:0,100'],
            'severity' => ['nullable', 'in:low,medium,high'],
            'estimated_weight_kg' => ['nullable', 'integer', 'min:0', 'max:100000'],
            'detected_items' => ['nullable', 'array', 'max:12'],
            'detected_items.*' => ['string', 'max:60'],
        ]);

        // Only accept a path this user just uploaded into the pending folder.
        if (! str_starts_with($data['photo_path'], 'reports/pending/')
            || ! Storage::disk('public')->exists($data['photo_path'])) {
            return response()->json(['message' => 'That photo is no longer available. Please retake it.'], 422);
        }

        /*
         * Provenance comes from what the server recorded at /analyse, never
         * from the request. A missing record (cache expired, or a client that
         * skipped the analyse step) is 'unverified' — not an assumption that
         * it must have been the stub.
         */
        $recorded = Cache::pull(self::analysisKey($data['photo_path']));
        $engine = $recorded['engine'] ?? null;

        if (! empty($data['waste_type']) && ! $engine) {
            $engine = 'unverified';
        }

        /*
         * The stream is taken from the server's own record for the same reason
         * the engine is: it decides whether a private contractor is handed this
         * citizen's home address. A client that could name its own stream could
         * put any address into the contractor pool.
         *
         * No record means no claim — it goes to the corporation, where a person
         * reads it.
         */
        $stream = Classification::normaliseStream($recorded['stream'] ?? null);
        $material = Classification::normaliseMaterial($recorded['material'] ?? null, $stream);
        $offer = $stream === Classification::STREAM_RECYCLABLE
            ? MaterialRate::estimate($material, $data['estimated_weight_kg'] ?? null)
            : null;

        /*
         * Volume and compostability are read from the record too, rather than
         * echoed back by the client like the display fields above.
         *
         * They cost nothing to take from here, and they are the kind of figure
         * a ward officer plans a vehicle around — so the honest answer when
         * there is no record is null, "never assessed", rather than a number
         * the server was simply told.
         */
        $isCompostable = array_key_exists('is_compostable', $recorded ?? [])
            ? (bool) $recorded['is_compostable']
            : null;
        $volumeBucket = isset($recorded['volume_bucket'])
            ? Classification::normaliseVolumeBucket($recorded['volume_bucket'])
            : null;
        $volumeLitres = isset($recorded['estimated_volume_litres'])
            ? Classification::reconcileVolume((int) $recorded['estimated_volume_litres'], $volumeBucket ?? 'sack')
            : null;

        $finalPath = 'reports/'.basename($data['photo_path']);
        Storage::disk('public')->move($data['photo_path'], $finalPath);

        try {
            $report = Report::createWithReference([
                'user_id' => $request->user()->id,
                'photo_path' => $finalPath,
                'latitude' => $data['latitude'],
                'longitude' => $data['longitude'],
                'address' => $data['address'],
                'landmark' => $data['landmark'] ?? null,
                'present_since' => $data['present_since'] ?? null,
                'blocking' => $data['blocking'] ?? null,
                'note' => $data['note'] ?? null,
                'waste_type' => $data['waste_type'] ?? null,
                'ai_confidence' => $data['ai_confidence'] ?? null,
                'severity' => $data['severity'] ?? 'medium',
                'estimated_weight_kg' => $data['estimated_weight_kg'] ?? null,
                'detected_items' => $data['detected_items'] ?? null,
                'ai_engine' => $engine,
                'stream' => $stream,
                'material' => $material,
                'is_compostable' => $isCompostable,
                'volume_bucket' => $volumeBucket,
                'estimated_volume_litres' => $volumeLitres,
                'offer_amount' => $offer,
                'analysed_at' => isset($data['waste_type']) ? now() : null,
                'status' => Report::STATUS_PENDING,
            ]);
        } catch (QueryException $e) {
            /*
             * Put the photo back where it was so the citizen can retry without
             * re-taking it, and don't hand them the raw driver message — it
             * carries the full INSERT, the database name, host and port, and
             * their own address, straight onto the screen.
             */
            Storage::disk('public')->move($finalPath, $data['photo_path']);

            Log::error('Report insert failed', [
                'user_id' => $request->user()->id,
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'message' => "We couldn't save your report just now. Please try again.",
            ], 500);
        }

        $this->workflow->submitted($report);

        return response()->json(['report' => new ReportResource($report->fresh())], 201);
    }

    /**
     * The resident confirms the amount a collector recorded paying them.
     *
     * This is the only check on a figure the contractor enters unilaterally.
     * It doesn't move money — it records that the person who received it says
     * the number is right, which is what makes a later dispute answerable.
     */
    public function confirmPayment(Request $request, Report $report, PickupWorkflow $pickups): JsonResponse
    {
        try {
            $pickups->confirmSettlement($report, $request->user());
        } catch (DomainException $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }

        return response()->json([
            'message' => 'Thanks — payment confirmed.',
            'report' => new ReportResource($report->fresh()),
        ]);
    }

    /**
     * The citizen's own reports, with the counts the status tabs display.
     */
    public function index(Request $request): JsonResponse
    {
        $data = $request->validate([
            'status' => ['nullable', 'in:all,pending,in_progress,resolved,rejected'],
        ]);

        $base = Report::where('user_id', $request->user()->id);

        $counts = (clone $base)
            ->selectRaw('status, COUNT(*) as total')
            ->groupBy('status')
            ->pluck('total', 'status');

        $query = clone $base;
        if (! empty($data['status']) && $data['status'] !== 'all') {
            $query->where('status', $data['status']);
        }

        return response()->json([
            'reports' => ReportResource::collection($query->latest()->paginate(20)),
            'counts' => [
                'all' => (int) $counts->sum(),
                'pending' => (int) ($counts[Report::STATUS_PENDING] ?? 0),
                'in_progress' => (int) ($counts[Report::STATUS_IN_PROGRESS] ?? 0),
                'resolved' => (int) ($counts[Report::STATUS_RESOLVED] ?? 0),
                'rejected' => (int) ($counts[Report::STATUS_REJECTED] ?? 0),
            ],
        ]);
    }

    public function show(Request $request, Report $report): JsonResponse
    {
        // A citizen sees their own reports in full; anyone signed in can see
        // another report's public detail from the map, minus the timeline.
        $isOwner = $report->user_id === $request->user()->id;
        $isAdmin = $request->user()->hasRole('admin');

        $report->load('user');

        return response()->json([
            'report' => new ReportResource($report),
            'timeline' => ($isOwner || $isAdmin)
                ? $report->events()->with('actor:id,name')->orderBy('created_at')->get()->map(fn ($e) => [
                    'type' => $e->type,
                    'title' => $e->title,
                    'body' => $e->body,
                    'actor' => $e->actor?->name,
                    'at' => $e->created_at?->toIso8601String(),
                    'at_human' => $e->created_at?->diffForHumans(),
                ])
                : [],
        ]);
    }

    /**
     * Citizen feedback once a report is resolved.
     */
    public function rate(Request $request, Report $report): JsonResponse
    {
        abort_unless($report->user_id === $request->user()->id, 403);

        if ($report->status !== Report::STATUS_RESOLVED) {
            return response()->json(['message' => 'Only resolved reports can be rated.'], 422);
        }

        $data = $request->validate([
            'rating' => ['required', 'integer', 'between:1,5'],
            'feedback' => ['nullable', 'string', 'max:1000'],
        ]);

        $report->update($data);

        return response()->json(['report' => new ReportResource($report->fresh())]);
    }
}
