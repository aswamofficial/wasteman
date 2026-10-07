<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\LegalDocument;
use App\Models\Setting;
use Illuminate\Http\JsonResponse;

class LegalController extends Controller
{
    /**
     * Public policy text. Unauthenticated on purpose — Google Play requires
     * the privacy policy to be readable by anyone, not just signed-in users.
     *
     * Always 200, even with nothing published: `sections` is null and the app
     * falls back to its bundled copy. The operator block is returned either
     * way, because who the controller is and how to reach them is required
     * whichever version of the text is being shown — and it is the part no
     * bundled default can ever supply truthfully.
     */
    public function show(string $slug): JsonResponse
    {
        abort_unless(in_array($slug, ['privacy', 'terms'], true), 404);

        $doc = LegalDocument::published()->where('slug', $slug)->first();

        $operator = [
            'name' => Setting::value('operator_name') ?: null,
            'email' => Setting::value('support_email') ?: null,
            'address' => Setting::value('operator_address') ?: null,
            'grievance_officer' => Setting::value('grievance_officer') ?: null,
            'helpline' => Setting::value('helpline_number') ?: null,
        ];

        return response()->json([
            'slug' => $slug,
            'published' => (bool) $doc,
            'title' => $doc?->title,
            'sections' => $doc?->sections,
            'effective_at' => $doc?->effective_at?->toDateString(),
            'updated_at' => $doc?->updated_at?->toIso8601String(),
            'operator' => $operator,
            // Which required details are still blank. The app surfaces this
            // instead of printing a convincing-looking placeholder.
            'missing' => array_keys(array_filter(
                $operator,
                fn ($v, $k) => $v === null && $k !== 'helpline',
                ARRAY_FILTER_USE_BOTH
            )),
        ]);
    }
}
