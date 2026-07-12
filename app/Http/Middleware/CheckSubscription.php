<?php

namespace App\Http\Middleware;

use App\Models\Subscription;
use Closure;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Symfony\Component\HttpFoundation\Response;

class CheckSubscription
{
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

        // Expired and grace period also over
        if ($subscription->status === 'expired' || $subscription->isExpired()) {
            if ($request->inertia()) {
                return Inertia::render('Subscription/Expired', [
                    'subscription' => [
                        'status' => $subscription->status,
                        'ends_at' => $subscription->ends_at?->format('d/m/Y'),
                        'plan' => $subscription->plan?->name,
                    ],
                ])->toResponse($request)->setStatusCode(402);
            }
            return response()->json(['error' => 'subscription_expired'], 402);
        }

        // Transition grace → expired
        if ($subscription->status === 'grace' && $subscription->grace_ends_at?->isPast()) {
            $subscription->update(['status' => 'expired']);
        }

        // Transition trial → expired
        if ($subscription->status === 'trial' && $subscription->trial_ends_at?->isPast()) {
            $subscription->update([
                'status' => 'grace',
                'grace_ends_at' => now()->addDays(7),
            ]);
        }

        // Transition active → grace
        if ($subscription->status === 'active' && $subscription->ends_at?->isPast()) {
            $subscription->update([
                'status' => 'grace',
                'grace_ends_at' => now()->addDays(7),
            ]);
        }

        // Share subscription state with Inertia for banners
        Inertia::share('subscription', [
            'status' => $subscription->status,
            'days_remaining' => $subscription->daysRemaining(),
            'is_grace' => $subscription->isInGrace(),
        ]);

        return $next($request);
    }
}
