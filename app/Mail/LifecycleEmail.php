<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

/**
 * E-mails du cycle de vie de licence (cahier §5.4, §8.6, §8.8).
 * Une seule classe paramétrée par étape :
 *   onboarding | closing | last_day | switched | followup | purge
 */
class LifecycleEmail extends Mailable
{
    use Queueable, SerializesModels;

    public const STAGES = ['onboarding', 'closing', 'last_day', 'switched', 'followup', 'purge'];

    public function __construct(
        public string $stage,
        public string $userName,
        public array $vars = [],
    ) {}

    public function envelope(): Envelope
    {
        $subjects = [
            'onboarding' => 'Vos premiers pas sur CONSTRUIRO',
            'closing'    => 'Il vous reste ' . ($this->vars['daysLeft'] ?? 3) . ' jours sur CONSTRUIRO',
            'last_day'   => 'Dernier jour d\'essai — vos données sont conservées',
            'switched'   => 'Votre espace est passé en Découverte',
            'followup'   => 'Une question sur CONSTRUIRO ?',
            'purge'      => 'Vos données CONSTRUIRO seront supprimées le ' . ($this->vars['purgeDate'] ?? ''),
        ];

        return new Envelope(subject: $subjects[$this->stage] ?? 'CONSTRUIRO ERP');
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.lifecycle',
            with: [
                'stage'    => $this->stage,
                'userName' => $this->userName,
                'vars'     => $this->vars,
            ],
        );
    }
}
