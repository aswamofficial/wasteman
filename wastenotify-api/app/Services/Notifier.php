<?php

namespace App\Services;

use App\Models\AppNotification;
use App\Services\Push\FcmSender;
use Illuminate\Support\Facades\Log;
use Throwable;

/**
 * One place where a person gets told something.
 *
 * The in-app row is the source of truth and is always written; the push is a
 * delivery attempt on top of it. Keeping both here means a new notification
 * can't be added that reaches the notifications screen but never the phone —
 * which is the failure this product can least afford, since the whole promise
 * is "you'll hear when it's fixed".
 */
class Notifier
{
    public function __construct(private readonly FcmSender $fcm) {}

    public function send(
        int $userId,
        string $type,
        string $title,
        string $body,
        ?int $reportId = null,
        ?string $imageUrl = null,
    ): void {
        AppNotification::create([
            'user_id' => $userId,
            'report_id' => $reportId,
            'type' => $type,
            'title' => $title,
            'body' => $body,
            'image_url' => $imageUrl,
        ]);

        /*
         * A push failure must never roll back the notification or break the
         * status change that triggered it. FCM being down is not a reason to
         * refuse to resolve a report.
         */
        try {
            $this->fcm->toUser($userId, $title, $body, [
                'type' => $type,
                'report_id' => $reportId ?? '',
            ]);
        } catch (Throwable $e) {
            Log::warning('Push delivery failed', [
                'user_id' => $userId,
                'error' => $e->getMessage(),
            ]);
        }
    }
}
