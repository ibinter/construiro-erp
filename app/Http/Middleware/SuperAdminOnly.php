<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class SuperAdminOnly
{
    public function handle(Request $request, Closure $next): Response
    {
        if (!$request->user()?->hasRole('ibig_superadmin')) {
            abort(403, 'Accès réservé à IBIG Soft.');
        }

        return $next($request);
    }
}
