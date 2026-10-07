<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        // Global API rate limit.
        $middleware->throttleApi();

        $middleware->alias([
            'role' => \Spatie\Permission\Middleware\RoleMiddleware::class,
            'permission' => \Spatie\Permission\Middleware\PermissionMiddleware::class,
            // Role alone isn't enough for collectors: the account also has to
            // have been approved. See EnsureVerifiedContractor.
            'contractor.verified' => \App\Http\Middleware\EnsureVerifiedContractor::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        // Anything under /api must answer with JSON even when the caller
        // forgot an Accept header — otherwise a validation error or a 401
        // comes back as Laravel's HTML error page and the client can't read it.
        $exceptions->shouldRenderJsonWhen(
            fn ($request) => $request->is('api/*') || $request->expectsJson()
        );
    })->create();
