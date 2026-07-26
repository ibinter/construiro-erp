<?php

namespace App\Listeners;

use App\Jobs\SendMailJob;
use App\Mail\SuspiciousLoginMail;
use Illuminate\Auth\Events\Login;

class SendSuspiciousLoginNotification
{
    public function handle(Login $event): void
    {
        $user = $event->user;

        $previousLogin = $user->last_login_at;
        $user->updateQuietly(['last_login_at' => now()]);

        // Premier login : pas de mail suspicieux, GuidedTour peut s'afficher une seule fois
        if ($previousLogin === null) {
            return;
        }

        $request = request();

        dispatch(new SendMailJob(
            $user->email,
            new SuspiciousLoginMail(
                userName:  $user->name,
                loginAt:   now()->format('d/m/Y à H:i'),
                ipAddress: $request->ip() ?? 'inconnue',
                device:    $request->userAgent() ?? 'inconnu',
                location:  'inconnue',
            ),
        ));
    }
}
