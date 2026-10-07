<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\LegalDocument;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class AdminLegalController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json([
            'documents' => LegalDocument::with('editor:id,name')->orderBy('slug')->get()
                ->map(fn (LegalDocument $d) => [
                    'slug' => $d->slug,
                    'title' => $d->title,
                    'sections' => $d->sections,
                    'published' => $d->published,
                    'effective_at' => $d->effective_at?->toDateString(),
                    'updated_by' => $d->editor?->name,
                    'updated_at' => $d->updated_at?->toIso8601String(),
                ]),
        ]);
    }

    /**
     * Save a policy document.
     *
     * Publishing is a separate, explicit flag: an operator can draft changes
     * without them going live, and the app keeps serving the last published
     * version until they say otherwise. A half-edited privacy policy going
     * live would be worse than a stale one.
     */
    public function update(Request $request, string $slug): JsonResponse
    {
        $data = $request->validate([
            'slug' => ['nullable', Rule::in(['privacy', 'terms'])],
            'title' => ['required', 'string', 'max:160'],
            'sections' => ['required', 'array', 'min:1'],
            'sections.*.heading' => ['required', 'string', 'max:200'],
            'sections.*.body' => ['required', 'array'],
            'sections.*.body.*' => ['string', 'max:4000'],
            'sections.*.bullets' => ['nullable', 'array'],
            'sections.*.bullets.*' => ['string', 'max:1000'],
            'published' => ['required', 'boolean'],
            'effective_at' => ['nullable', 'date'],
        ]);

        abort_unless(in_array($slug, ['privacy', 'terms'], true), 404);

        $doc = LegalDocument::updateOrCreate(
            ['slug' => $slug],
            [
                'title' => $data['title'],
                'sections' => array_values($data['sections']),
                'published' => $data['published'],
                'effective_at' => $data['effective_at'] ?? now(),
                'updated_by' => $request->user()->id,
            ]
        );

        return response()->json([
            'message' => $doc->published ? 'Published.' : 'Saved as draft.',
            'document' => [
                'slug' => $doc->slug,
                'title' => $doc->title,
                'sections' => $doc->sections,
                'published' => $doc->published,
                'effective_at' => $doc->effective_at?->toDateString(),
            ],
        ]);
    }
}
