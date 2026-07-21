<?php

namespace App\Listeners;

use App\Mail\SuspiciousLoginMail;
use Illuminate\Auth\Events\Login;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class SendSuspiciousLoginNotification
{
    public function handle(Login $event): void
    {
        try {
            $user = $event->user;

            // Envoie uniquement si ce n'est pas le tout premier login
            if ($user->last_login_at !== null) {
                $request = request();

                Mail::to($user->email)->send(new SuspiciousLoginMail(
                    userName: $user->name,
                    loginAt: now()->format('d/m/Y à H:i'),
                    ipAddress: $request->ip() ?? 'inconnue',
                    device: $request->userAgent() ?? 'inconnu',
                    location: 'inconnue',
                ));
            }
        } catch (\Exception $e) {
            Log::warning('SuspiciousLoginMail failed: ' . $e->getMessage());
        }
    }
}
