<?php

namespace App\Http\Middleware;

use App\Models\AnalyticsEvent;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class TrackPageView
{
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        // Seulement les requêtes GET non-AJAX sur routes publiques
        if ($request->method() !== 'GET' || $request->ajax() || $request->wantsJson()) {
            return $response;
        }

        try {
            $ua = strtolower($request->userAgent() ?? '');
            $device = 'desktop';
            if (str_contains($ua, 'mobile') || str_contains($ua, 'android') || str_contains($ua, 'iphone')) {
                $device = 'mobile';
            } elseif (str_contains($ua, 'tablet') || str_contains($ua, 'ipad')) {
                $device = 'tablet';
            }

            AnalyticsEvent::create([
                'event_type' => 'page_view',
                'page'       => $request->path(),
                'source'     => $request->query('utm_source'),
                'medium'     => $request->query('utm_medium'),
                'campaign'   => $request->query('utm_campaign'),
                'referrer'   => $request->headers->get('referer'),
                'device'     => $device,
                'session_id' => $request->hasSession() ? substr($request->session()->getId(), 0, 40) : null,
                'company_id' => null,
            ]);
        } catch (\Throwable) {
            // Fire-and-forget — ne jamais bloquer la requête
        }

        return $response;
    }
}
