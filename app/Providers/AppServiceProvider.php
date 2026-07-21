<?php

namespace App\Providers;

use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Vite;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Vite::prefetch(concurrency: 3);

        // Le super-administrateur possède implicitement toutes les permissions.
        Gate::before(function ($user, string $ability) {
            return $user->hasRole('super_admin') ? true : null;
        });

        \Illuminate\Support\Facades\Event::listen(
            \Illuminate\Auth\Events\Login::class,
            \App\Listeners\SendSuspiciousLoginNotification::class,
        );

        // Charger la config SMTP depuis la base de données si disponible
        try {
            if (\Illuminate\Support\Facades\Schema::hasTable('smtp_settings')) {
                $smtp = \App\Models\SmtpSetting::active();
                if ($smtp) {
                    config([
                        'mail.mailers.smtp.host'       => $smtp->host,
                        'mail.mailers.smtp.port'       => $smtp->port,
                        'mail.mailers.smtp.username'   => $smtp->username,
                        'mail.mailers.smtp.password'   => $smtp->password,
                        'mail.mailers.smtp.encryption' => $smtp->encryption === 'null' ? null : $smtp->encryption,
                        'mail.from.address'            => $smtp->from_address,
                        'mail.from.name'               => $smtp->from_name,
                    ]);
                }
            }
        } catch (\Exception) {
            // Table non encore migrée — ignorer silencieusement
        }
    }
}
