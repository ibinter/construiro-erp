<?php
namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Symfony\Component\HttpFoundation\Response;

class CachePublicResponse
{
    public function handle(Request $request, Closure $next, int $minutes = 5): Response
    {
        // Seulement GET, seulement visiteurs non authentifiés, seulement landing
        if ($request->method() !== 'GET' || auth()->check()) {
            return $next($request);
        }

        $cacheKey = 'page_' . sha1($request->url() . $request->getQueryString());

        // Si Inertia SSR ou Accept: application/json — pas de cache HTML
        if ($request->header('X-Inertia')) {
            return $next($request);
        }

        return Cache::remember($cacheKey, $minutes * 60, fn() => $next($request));
    }
}
