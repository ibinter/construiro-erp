<?php

namespace App\Notifications;

use Illuminate\Auth\Notifications\ResetPassword as BaseResetPassword;
use Illuminate\Notifications\Messages\MailMessage;

class ResetPasswordNotification extends BaseResetPassword
{
    public function toMail($notifiable): MailMessage
    {
        $url = url(route('password.reset', [
            'token' => $this->token,
            'email' => $notifiable->getEmailForPasswordReset(),
        ], false));

        return (new MailMessage)
            ->subject('Réinitialisation de votre mot de passe — CONSTRUIRO')
            ->view('emails.password_reset', [
                'userName' => $notifiable->name,
                'resetUrl' => $url,
                'expiresIn' => config('auth.passwords.'.config('auth.defaults.passwords').'.expire', 60),
            ]);
    }
}
