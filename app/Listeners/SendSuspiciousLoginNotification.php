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

        // Envoie uniquement si ce n'est pas le tout premier login
        if ($user->last_login_at !== null) {
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
}
