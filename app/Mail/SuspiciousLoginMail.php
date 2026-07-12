<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class SuspiciousLoginMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public string $userName,
        public string $loginAt,
        public string $ipAddress,
        public string $device,
        public string $location,
        public string $securityUrl = '',
    ) {
        $this->securityUrl = $securityUrl ?: url('/profile/security');
    }

    public function envelope(): Envelope
    {
        return new Envelope(subject: '⚠ Alerte sécurité — Nouvelle connexion détectée');
    }

    public function content(): Content
    {
        return new Content(view: 'emails.suspicious_login');
    }
}
