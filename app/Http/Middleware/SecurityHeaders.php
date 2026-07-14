<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Ajoute les en-têtes de sécurité recommandés OWASP sur toutes les réponses.
 * Configuré pour une application Inertia/React SPA + PWA.
 */
class SecurityHeaders
{
    public function handle(Request $request, Closure $next): Response
    {
        // Générer le nonce AVANT le rendu Blade pour qu'il soit disponible dans les vues.
        $nonce = base64_encode(random_bytes(16));
        app()->instance('csp-nonce', $nonce);

        /** @var Response $response */
        $response = $next($request);

        // Content Security Policy — ajustée pour Inertia + Vite HMR en dev
        $cspDirectives = app()->isProduction()
            ? implode('; ', [
                "default-src 'self'",
                "script-src 'self' 'nonce-{$nonce}'",
                "style-src 'self' 'unsafe-inline'",  // Tailwind injecte du CSS inline
                "img-src 'self' data: blob: https:",
                "font-src 'self' data:",
                "connect-src 'self' https://api.groq.com wss:",
                "media-src 'none'",
                "object-src 'none'",
                "frame-ancestors 'none'",
                "base-uri 'self'",
                "form-action 'self'",
                "upgrade-insecure-requests",
            ])
            : "default-src * 'unsafe-inline' 'unsafe-eval' data: blob:"; // dev permissif

        $response->headers->set('Content-Security-Policy', $cspDirectives);
        $response->headers->set('X-Content-Type-Options', 'nosniff');
        $response->headers->set('X-Frame-Options', 'DENY');
        $response->headers->set('X-XSS-Protection', '1; mode=block');
        $response->headers->set('Referrer-Policy', 'strict-origin-when-cross-origin');
        $response->headers->set('Permissions-Policy', 'camera=(), microphone=(), geolocation=(self), payment=()');

        if (app()->isProduction()) {
            $response->headers->set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
        }

        // Supprimer l'en-tête X-Powered-By si présent
        $response->headers->remove('X-Powered-By');
        $response->headers->remove('Server');

        return $response;
    }
}
