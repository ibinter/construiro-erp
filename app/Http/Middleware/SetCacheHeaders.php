<?php
namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class SetCacheHeaders
{
    public function handle(Request $request, Closure $next): mixed
    {
        $response = $next($request);

        // Assets statiques — cache long terme
        if ($request->is('build/*', 'js/*', 'css/*', 'images/*')) {
            $response->headers->set('Cache-Control', 'public, max-age=31536000, immutable');
        }

        // Pages publiques — cache court terme
        if (!auth()->check() && $request->method() === 'GET') {
            $response->headers->set('Cache-Control', 'public, max-age=300, stale-while-revalidate=60');
        }

        // Pages authentifiées — pas de cache navigateur
        if (auth()->check()) {
            $response->headers->set('Cache-Control', 'private, no-store, no-cache, must-revalidate');
        }

        return $response;
    }
}
