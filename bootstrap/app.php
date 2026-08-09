<?php

use App\Console\Commands\SendSubscriptionExpirationReminders;
use App\Console\Commands\CleanExpiredSupportSessions;
use App\Console\Commands\BackupDatabase;
use App\Console\Commands\RecalculateLicenseStates;
use App\Console\Commands\PurgeExpiredData;
use App\Console\Commands\SendLifecycleEmails;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Console\Scheduling\Schedule;

return Application::configure(basePath: dirname(__DIR__))
    ->withSchedule(function (Schedule $schedule): void {
        // Séquence cycle de vie essai → Découverte → purge (cahier §5.4, §9.6). Remplace
        // construiro:trial-reminders (l'essai ne « expire » plus, il bascule en Découverte).
        $schedule->command(SendLifecycleEmails::class)->dailyAt('03:30');
        // Rappels de renouvellement des abonnements PAYANTS (avant échéance + grâce).
        $schedule->command(SendSubscriptionExpirationReminders::class)->dailyAt('08:05');
        $schedule->command(CleanExpiredSupportSessions::class)->hourly();
        $schedule->command(BackupDatabase::class)->dailyAt('02:00');
        // Cahier IBIG §9.6 — transitions d'état hors trafic HTTP (TRIAL→Découverte, ACTIVE→grâce→expiré)
        $schedule->command(RecalculateLicenseStates::class)->dailyAt('03:00');
        // Rapport des espaces à purger (J+90). Sans --force : rapport seul (purge réelle = décision ops/RGPD).
        $schedule->command(PurgeExpiredData::class)->dailyAt('04:00');
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
            \App\Http\Middleware\SetCacheHeaders::class,
        ]);

        $middleware->alias([
            'subscription' => \App\Http\Middleware\CheckSubscription::class,
            'superadmin'   => \App\Http\Middleware\SuperAdminOnly::class,
            'module'       => \App\Http\Middleware\CheckModuleAccess::class,
            'two-factor'   => \App\Http\Middleware\RequiresTwoFactorAuthentication::class,
        ]);

        // Exclure tous les webhooks du CSRF (appelés par des services tiers)
        $middleware->validateCsrfTokens(except: [
            'webhooks/*',
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        //
    })->create();
