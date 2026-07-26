<?php

namespace App\Mail;

use App\Models\Changelog;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class NewVersionMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(public Changelog $changelog) {}

    public function envelope(): Envelope
    {
        return new Envelope(subject: '🚀 Nouvelle mise à jour CONSTRUIRO — v' . $this->changelog->version);
    }

    public function content(): Content
    {
        return new Content(view: 'emails.new-version');
    }
}
