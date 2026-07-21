<?php

namespace App\Http\Middleware;

use App\Models\Subscription;
use Closure;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Symfony\Component\HttpFoundation\Response;

class CheckModuleAccess
{
    public function handle(Request $request, Closure $next, string $module): Response
    {
        $user = $request->user();

        if (!$user || !$user->company_id) {
            return $next($request);
        }

        $subscription = Subscription::where('company_id', $user->company_id)
            ->whereIn('status', ['active', 'trial'])
            ->latest()
            ->first();

        // Pas d'abonnement actif — on laisse CheckSubscription gérer le refus
        if (!$subscription || !$subscription->plan) {
            return $next($request);
        }

        $plan = $subscription->plan;

        // hasModule() retourne true si modules === null (plan enterprise sans restriction)
        if (!$plan->hasModule($module)) {
            if ($request->inertia()) {
                return Inertia::render('Errors/ModuleNotIncluded', [
                    'module'   => $module,
                    'planName' => $plan->name,
                ])->toResponse($request)->setStatusCode(403);
            }

            return redirect()->back()->with(
                'error',
                "Votre plan \"{$plan->name}\" ne comprend pas le module \"{$module}\". Passez à un plan supérieur."
            );
        }

        return $next($request);
    }
}
