<?php

use App\Console\Commands\SendTrialExpirationReminders;
use App\Console\Commands\SendSubscriptionExpirationReminders;
use App\Console\Commands\CleanExpiredSupportSessions;
use App\Console\Commands\BackupDatabase;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Console\Scheduling\Schedule;

return Application::configure(basePath: dirname(__DIR__))
    ->withSchedule(function (Schedule $schedule): void {
        $schedule->command(SendTrialExpirationReminders::class)->dailyAt('08:00');
        $schedule->command(SendSubscriptionExpirationReminders::class)->dailyAt('08:05');
        $schedule->command(CleanExpiredSupportSessions::class)->hourly();
        $schedule->command(BackupDatabase::class)->dailyAt('02:00');
    })
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        channels: __DIR__.'/../routes/channels.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->web(append: [
            \App\Http\Middleware\SecurityHeaders::class,
            \App\Http\Middleware\SetLocale::class,
            \App\Http\Middleware\HandleInertiaRequests::class,
            \Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets::class,
        ]);

        $middleware->alias([
            'subscription' => \App\Http\Middleware\CheckSubscription::class,
            'superadmin'   => \App\Http\Middleware\SuperAdminOnly::class,
            'module'       => \App\Http\Middleware\CheckModuleAccess::class,
        ]);

        // Exclure les webhooks Mobile Money du CSRF (appelés par les opérateurs)
        $middleware->validateCsrfTokens(except: [
            'webhooks/mobile-money/*',
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        //
    })->create();
