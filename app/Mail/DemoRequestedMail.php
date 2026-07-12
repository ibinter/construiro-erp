<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class DemoRequestedMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public string $userName,
        public string $company,
        public string $sector,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(subject: 'Votre demande de démonstration CONSTRUIRO');
    }

    public function content(): Content
    {
        return new Content(view: 'emails.demo_requested');
    }
}
