<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class TrialExpiringMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public string $userName,
        public int $daysRemaining,
        public string $expiresAt,
        public string $renewUrl = '',
    ) {
        $this->renewUrl = $renewUrl ?: url('/billing');
    }

    public function envelope(): Envelope
    {
        return new Envelope(subject: "Votre essai CONSTRUIRO expire dans {$this->daysRemaining} jour(s)");
    }

    public function content(): Content
    {
        return new Content(view: 'emails.trial_expiring');
    }
}
