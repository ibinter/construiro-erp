<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class TicketCreatedMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public string $userName,
        public string $ticketNumber,
        public string $subject,
        public string $priority,
        public string $ticketUrl = '',
    ) {
        $this->ticketUrl = $ticketUrl ?: url('/support');
    }

    public function envelope(): Envelope
    {
        return new Envelope(subject: "Ticket #{$this->ticketNumber} créé — CONSTRUIRO Support");
    }

    public function content(): Content
    {
        return new Content(view: 'emails.ticket_created');
    }
}
