<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Verrouille les actions à coût réel ou irréversibles dans la démo publique
 * (cahier §4.5) : envoi d'e-mails / WhatsApp / SMS, paiement, export,
 * suppression du tenant, accès superadmin. Sans effet pour les comptes réels.
 */
class DemoGuard
{
    /** Préfixes de chemin bloqués en démo. */
    private const BLOCKED_PREFIXES = [
        'superadmin',
        'billing/payment',
        'mobile-money',
        'pdf',
        'import',
        'backup',
    ];

    /** Fragments de chemin bloqués (n'importe où). */
    private const BLOCKED_CONTAINS = [
        'export', 'send-email', '/pdf', 'mobile-money', 'payment',
    ];

    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if ($user && $user->company && $user->company->is_demo && !$request->isMethod('GET')) {
            if ($this->isBlocked(ltrim($request->path(), '/'), $request)) {
                $message = 'Cette action est désactivée dans la démonstration.';

                if ($request->inertia() || $request->header('X-Inertia')) {
                    return back()->with('error', $message);
                }

                return response()->json(['error' => 'demo_disabled', 'message' => $message], 403);
            }
        }

        return $next($request);
    }

    private function isBlocked(string $path, Request $request): bool
    {
        foreach (self::BLOCKED_PREFIXES as $p) {
            if (str_starts_with($path, $p)) {
                return true;
            }
        }
        foreach (self::BLOCKED_CONTAINS as $c) {
            if (str_contains($path, $c)) {
                return true;
            }
        }

        // Empêcher la modification du compte démo partagé (mot de passe, profil, suppression).
        if (in_array($request->method(), ['PUT', 'PATCH', 'DELETE'], true)
            && (str_starts_with($path, 'profile') || str_starts_with($path, 'password'))) {
            return true;
        }

        return false;
    }
}
