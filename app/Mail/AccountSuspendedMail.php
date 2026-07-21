<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class AccountSuspendedMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public string $userName,
        public string $reason,
        public string $suspendedAt,
        public string $contactUrl = '',
    ) {
        $this->contactUrl = $contactUrl ?: url('/contact');
    }

    public function envelope(): Envelope
    {
        return new Envelope(subject: 'Votre compte CONSTRUIRO a été suspendu');
    }

    public function content(): Content
    {
        return new Content(view: 'emails.account_suspended');
    }
}
