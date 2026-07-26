<?php

namespace App\Notifications;

use App\Models\Changelog;
use Illuminate\Notifications\Notification;

class NewVersionNotification extends Notification
{
    public function __construct(public Changelog $changelog) {}

    public function via($notifiable): array
    {
        return ['database'];
    }

    public function toDatabase($notifiable): array
    {
        return [
            'type'     => 'new_version',
            'title'    => 'Mise à jour CONSTRUIRO v' . $this->changelog->version,
            'message'  => $this->changelog->title ?? 'Nouvelles fonctionnalités disponibles',
            'url'      => '/changelog',
            'is_major' => $this->changelog->is_major ?? false,
        ];
    }
}
