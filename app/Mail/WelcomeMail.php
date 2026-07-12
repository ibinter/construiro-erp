<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class WelcomeMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public string $userName,
        public string $companyName,
        public bool $isTrial = true,
        public ?string $trialEndsAt = null,
        public string $loginUrl = '',
    ) {
        $this->loginUrl = $loginUrl ?: url('/login');
    }

    public function envelope(): Envelope
    {
        return new Envelope(subject: 'Bienvenue sur CONSTRUIRO !');
    }

    public function content(): Content
    {
        return new Content(view: 'emails.welcome');
    }
}
