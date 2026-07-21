<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class CustomOfferSentMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public string $userName,
        public string $companyName,
        public string $offerDescription,
        public string $validUntil,
        public string $contactUrl = '',
    ) {
        $this->contactUrl = $contactUrl ?: url('/contact');
    }

    public function envelope(): Envelope
    {
        return new Envelope(subject: 'Votre offre personnalisée CONSTRUIRO');
    }

    public function content(): Content
    {
        return new Content(view: 'emails.custom_offer_sent');
    }
}
