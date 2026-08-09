<?php

namespace App\Http\Middleware;

use App\Models\Subscription;
use App\Services\LicenseStateResolver;
use Closure;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Symfony\Component\HttpFoundation\Response;

class CheckSubscription
{
    // Routes always accessible regardless of subscription status
    // (billing to renew, dashboard to see alerts, support to ask for help…)
    private const EXEMPT_PREFIXES = [
        'billing',
        'dashboard',
        'notifications',
        'profile',
        'support',
        'aide',
        'onboarding',
        'locale',
        'superadmin',
    ];

    public function __construct(private LicenseStateResolver $resolver) {}

    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (!$user || !$user->company_id) {
            return $next($request);
        }

        $subscription = Subscription::where('company_id', $user->company_id)
            ->latest()
            ->first();

        // No subscription at all — allow (will be caught by onboarding)
        if (!$subscription) {
            return $next($request);
        }

        // État EFFECTIF calculé côté serveur (pur). Matérialisé ici de façon idempotente
        // pour que l'état reste correct même sans passage du scheduler.
        $effective = $this->resolver->resolve($subscription);
        if ($effective !== $subscription->status) {
            $from = $subscription->status;
            $subscription->update($this->resolver->transitionAttributes($subscription));
            \App\Models\LicenseTransition::log(
                $subscription, $from, $subscription->status, \App\Models\LicenseTransition::CAUSE_SYSTEME
            );
        }

        // Partage l'état pour les bannières (toutes routes)
        Inertia::share('subscription', [
            'status'         => $subscription->status,
            'days_remaining' => $subscription->daysRemaining(),
            'is_grace'       => $subscription->isInGrace(),
            'is_decouverte'  => $subscription->isDecouverte(),
            'can_export'     => $subscription->canExport(),
            'chantier_cap'   => $subscription->chantierCap(),
            'plan'           => $subscription->plan?->name,
            'grace_days'     => $subscription->isInGrace()
                ? (int) ceil(now()->floatDiffInDays($subscription->grace_ends_at))
                : null,
            'until'          => ($subscription->purge_at ?? $subscription->ends_at)?->format('d/m/Y'),
        ]);

        // Routes exemptées : toujours accessibles (facturation, tableau de bord, support…)
        $path = ltrim($request->path(), '/');
        foreach (self::EXEMPT_PREFIXES as $prefix) {
            if ($path === $prefix || str_starts_with($path, $prefix . '/')) {
                return $next($request);
            }
        }

        // EXPIRED uniquement = lecture seule (402). DEMO, FREE (Découverte), TRIAL,
        // ACTIVE et GRACE gardent l'accès — les plafonds sont appliqués à l'écriture
        // par LicenseGuard, jamais par une coupure sèche (cahier §2, §D6).
        if ($subscription->status === Subscription::EXPIRED) {
            if ($request->inertia()) {
                return Inertia::render('Subscription/Expired', [
                    'subscription' => [
                        'status'   => $subscription->status,
                        'ends_at'  => $subscription->ends_at?->format('d/m/Y'),
                        'purge_at' => $subscription->purge_at?->format('d/m/Y'),
                        'plan'     => $subscription->plan?->name,
                    ],
                ])->toResponse($request)->setStatusCode(402);
            }

            return response()->json(['error' => 'subscription_expired'], 402);
        }

        return $next($request);
    }
}
