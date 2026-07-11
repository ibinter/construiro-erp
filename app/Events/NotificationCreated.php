<?php

namespace App\Events;

use App\Models\Notification;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

/**
 * Événement diffusé via Laravel Reverb (WebSocket) lorsqu'une notification
 * ERP est créée. Écoute sur le canal privé de l'entreprise afin que seuls les
 * utilisateurs authentifiés de la même entreprise reçoivent l'événement.
 */
class NotificationCreated implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(public Notification $notification) {}

    /**
     * Canal privé isolé par entreprise (multi-tenant).
     * L'autorisation du canal est définie dans routes/channels.php.
     *
     * @return array<int, Channel>
     */
    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('company.' . $this->notification->company_id),
        ];
    }

    /** Nom de l'événement côté JS : window.Echo.private(...).listen('.notification.created', ...) */
    public function broadcastAs(): string
    {
        return 'notification.created';
    }

    /**
     * Données envoyées au client. On expose uniquement ce dont le front a
     * besoin pour afficher la cloche sans appel supplémentaire.
     *
     * @return array<string, mixed>
     */
    public function broadcastWith(): array
    {
        return [
            'id'         => $this->notification->id,
            'type'       => $this->notification->type,
            'title'      => $this->notification->title,
            'body'       => $this->notification->body,
            'link'       => $this->notification->link,
            'created_at' => $this->notification->created_at?->toIso8601String(),
        ];
    }
}
