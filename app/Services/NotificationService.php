<?php

namespace App\Services;

use App\Events\NotificationCreated;
use App\Models\Notification;

/**
 * Service centralisé pour créer et diffuser des notifications ERP.
 * Utilisation depuis n'importe quel contrôleur ou job :
 *
 *   NotificationService::send(
 *       companyId: $user->company_id,
 *       userId:    null,            // null = tous les utilisateurs de l'entreprise
 *       type:      'invoice_due',
 *       title:     'Nouvelle facture créée',
 *       body:      "Facture #{$invoice->code} enregistrée.",
 *       link:      route('invoices.show', $invoice),
 *   );
 */
class NotificationService
{
    /**
     * Crée la notification en base et la diffuse via Reverb.
     *
     * @param int         $companyId  Entreprise destinataire (multi-tenant)
     * @param int|null    $userId     Utilisateur ciblé, ou null pour broadcast interne
     * @param string      $type       Type métier (invoice_due, quote_accepted, …)
     * @param string      $title      Titre court affiché dans la cloche
     * @param string      $body       Corps de la notification
     * @param string      $link       URL optionnelle de l'entité liée
     */
    public static function send(
        int    $companyId,
        ?int   $userId,
        string $type,
        string $title,
        string $body  = '',
        string $link  = '',
    ): Notification {
        $notification = Notification::create([
            'company_id' => $companyId,
            'user_id'    => $userId,
            'type'       => $type,
            'title'      => $title,
            'body'       => $body,
            'link'       => $link,
        ]);

        // Diffusion WebSocket (Reverb). Si Reverb n'est pas démarré, l'événement
        // est simplement ignoré (driver log/null) — pas d'exception.
        broadcast(new NotificationCreated($notification))->toOthers();

        return $notification;
    }
}
