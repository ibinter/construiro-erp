<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class PaymentConfirmedMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public string $userName,
        public string $planName,
        public string $amount,
        public string $reference,
        public string $paidAt,
        public string $accessUntil,
        public string $dashboardUrl = '',
    ) {
        $this->dashboardUrl = $dashboardUrl ?: url('/dashboard');
    }

    public function envelope(): Envelope
    {
        return new Envelope(subject: 'Paiement confirmé — CONSTRUIRO');
    }

    public function content(): Content
    {
        return new Content(view: 'emails.payment_confirmed');
    }
}
