<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AppNotification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class NotificationController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $notifications = AppNotification::where('user_id', $request->user()->id)
            ->latest()
            ->limit(100)
            ->get()
            ->map(fn (AppNotification $n) => [
                'id' => $n->id,
                'report_id' => $n->report_id,
                'type' => $n->type,
                'title' => $n->title,
                'body' => $n->body,
                // Stored as a path; resolved here so it always matches the
                // current APP_URL rather than whatever was live when the
                // notification was written.
                'image_url' => $this->publicUrl($n->image_url),
                'read' => (bool) $n->read_at,
                'at' => $n->created_at?->toIso8601String(),
                'at_human' => $n->created_at?->diffForHumans(),
            ]);

        return response()->json([
            'notifications' => $notifications,
            'unread' => AppNotification::where('user_id', $request->user()->id)->unread()->count(),
        ]);
    }

    public function read(Request $request, AppNotification $notification): JsonResponse
    {
        abort_unless($notification->user_id === $request->user()->id, 403);

        $notification->update(['read_at' => now()]);

        return response()->json(['message' => 'Marked as read.']);
    }

    public function readAll(Request $request): JsonResponse
    {
        AppNotification::where('user_id', $request->user()->id)
            ->unread()
            ->update(['read_at' => now()]);

        return response()->json(['message' => 'All marked as read.']);
    }

    /**
     * Rows written before URLs were stored as paths may hold a full URL or a
     * root-relative "/storage/..." — normalise all three shapes.
     */
    private function publicUrl(?string $value): ?string
    {
        if (! $value) {
            return null;
        }

        if (str_starts_with($value, 'http')) {
            return $value;
        }

        return Storage::disk('public')->url(ltrim(Str::after($value, '/storage/'), '/'));
    }
}
