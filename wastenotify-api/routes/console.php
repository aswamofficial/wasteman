<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

/*
 * Overdue reports escalate on their own.
 *
 * Runs early, before the working day, so an officer opening the console finds
 * anything that slipped already raised and flagged rather than discovering it
 * by reading dates. withoutOverlapping guards against a slow run colliding with
 * the next one on a small server.
 *
 * Needs a scheduler to actually fire — on this Windows box that's a Task
 * Scheduler entry running `php artisan schedule:run` every minute.
 */
Schedule::command('reports:escalate')
    ->dailyAt('06:00')
    ->withoutOverlapping()
    ->onOneServer();
