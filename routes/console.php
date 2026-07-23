<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Schedule::command('construiro:trial-reminders')->dailyAt('08:00');
Schedule::command('construiro:subscription-reminders')->dailyAt('08:00');
Schedule::command('construiro:expire-payment-orders')->hourly();
Schedule::command('construiro:backup --type=database')->dailyAt('02:00');
Schedule::command('construiro:backup --type=full')->weeklyOn(0, '03:00'); // dimanche 3h
