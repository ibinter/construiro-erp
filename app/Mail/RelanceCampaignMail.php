<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class RelanceCampaignMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public string $recipientName,
        public string $campaignSubject,
        public string $bodyHtml,
        public string $trackingToken = '',
        public string $unsubscribeUrl = '',
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(subject: $this->campaignSubject);
    }

    public function content(): Content
    {
        return new Content(view: 'emails.relance_campaign');
    }
}
