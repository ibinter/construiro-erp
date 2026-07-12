<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class AccountExpiredMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public string $userName,
        public string $expiredAt,
        public bool $isTrial = false,
        public string $reactivateUrl = '',
    ) {
        $this->reactivateUrl = $reactivateUrl ?: url('/billing');
    }

    public function envelope(): Envelope
    {
        return new Envelope(subject: 'Votre accès CONSTRUIRO a expiré');
    }

    public function content(): Content
    {
        return new Content(view: 'emails.account_expired');
    }
}
