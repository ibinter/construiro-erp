<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

/**
 * Notification interne envoyée à l'adresse d'administration à chaque nouvelle
 * inscription réussie. Envoyée via le système d'e-mail existant (SendMailJob).
 */
class NewRegistrationMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(public array $data) {}

    public function envelope(): Envelope
    {
        return new Envelope(subject: 'Nouvelle inscription sur CONSTRUIRO ERP');
    }

    public function content(): Content
    {
        return new Content(view: 'emails.new_registration', with: ['d' => $this->data]);
    }
}
