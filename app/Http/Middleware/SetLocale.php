<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Détermine la langue de l'application pour la requête :
 * 1. langue de l'utilisateur connecté (colonne users.locale) ;
 * 2. sinon langue stockée en session (choix d'un invité) ;
 * 3. sinon langue par défaut de la configuration.
 * La langue doit être fixée AVANT le partage Inertia (traductions).
 */
class SetLocale
{
    public function handle(Request $request, Closure $next): Response
    {
        $supported = config('construiro.locales', ['fr', 'en']);

        $locale = $request->user()?->locale
            ?? $request->session()->get('locale')
            ?? config('construiro.default_locale', 'fr');

        if (! in_array($locale, $supported, true)) {
            $locale = config('construiro.default_locale', 'fr');
        }

        app()->setLocale($locale);

        return $next($request);
    }
}
