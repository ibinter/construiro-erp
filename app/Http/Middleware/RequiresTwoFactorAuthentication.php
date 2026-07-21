<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class RequiresTwoFactorAuthentication
{
    /**
     * Redirige vers le challenge 2FA si l'utilisateur a le 2FA activé
     * et n'a pas encore validé son code dans cette session.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        // Pas d'utilisateur connecté ou 2FA non activé/confirmé → on passe
        if (!$user || !$user->hasTwoFactorEnabled()) {
            return $next($request);
        }

        // 2FA déjà validé dans cette session → on passe
        if ($request->session()->get('two_factor_authenticated')) {
            return $next($request);
        }

        // Sauvegarde l'URL demandée pour y revenir après validation
        $request->session()->put('two_factor_intended', $request->fullUrl());

        return redirect()->route('two-factor.challenge');
    }
}
