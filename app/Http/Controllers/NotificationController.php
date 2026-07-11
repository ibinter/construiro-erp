<?php

namespace App\Http\Controllers;

use App\Models\Notification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Notifications internes ERP (cloche en haut à droite).
 * Toutes les réponses sont en JSON pour les appels fetch() du frontend.
 */
class NotificationController extends Controller
{
    /**
     * Liste les 50 dernières notifications non lues de l'utilisateur connecté.
     * Inclut également les notifications broadcast à toute l'entreprise (user_id = null).
     */
    public function index(Request $request): JsonResponse
    {
        $notifications = Notification::forUser($request->user())
            ->unread()
            ->latest()
            ->limit(50)
            ->get(['id', 'type', 'title', 'body', 'link', 'read_at', 'created_at']);

        return response()->json($notifications);
    }

    /**
     * Marque une notification comme lue (PATCH /notifications/{notification}/read).
     * L'utilisateur ne peut lire que ses propres notifications ou celles broadcast.
     */
    public function markRead(Request $request, Notification $notification): JsonResponse
    {
        // Vérifie que la notification appartient bien à l'entreprise de l'utilisateur.
        abort_if($notification->company_id !== $request->user()->company_id, 403);

        if ($notification->read_at === null) {
            $notification->update(['read_at' => now()]);
        }

        return response()->json(['ok' => true]);
    }

    /**
     * Marque toutes les notifications de l'utilisateur comme lues
     * (POST /notifications/read-all).
     */
    public function markAllRead(Request $request): JsonResponse
    {
        Notification::forUser($request->user())
            ->unread()
            ->update(['read_at' => now()]);

        return response()->json(['ok' => true]);
    }
}
