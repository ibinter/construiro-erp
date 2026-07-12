<?php

namespace App\Http\Controllers;

use App\Models\Subscription;
use App\Models\SubscriptionInvoice;
use App\Models\SubscriptionPlan;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class BillingController extends Controller
{
    public function index(Request $request): Response
    {
        $company = $request->user()->company;

        $subscription = Subscription::where('company_id', $company->id)
            ->with('plan')
            ->latest()
            ->first();

        $plans = SubscriptionPlan::where('is_active', true)
            ->orderBy('sort_order')
            ->get();

        $invoices = SubscriptionInvoice::where('company_id', $company->id)
            ->latest()
            ->limit(10)
            ->get();

        return Inertia::render('Billing/Index', [
            'subscription' => $subscription ? [
                'id' => $subscription->id,
                'status' => $subscription->status,
                'plan' => $subscription->plan ? [
                    'name' => $subscription->plan->name,
                    'slug' => $subscription->plan->slug,
                ] : null,
                'billing_cycle' => $subscription->billing_cycle,
                'trial_ends_at' => $subscription->trial_ends_at?->format('d/m/Y'),
                'ends_at' => $subscription->ends_at?->format('d/m/Y'),
                'grace_ends_at' => $subscription->grace_ends_at?->format('d/m/Y'),
                'days_remaining' => $subscription->daysRemaining(),
            ] : null,
            'plans' => $plans->map(fn($p) => [
                'id' => $p->id,
                'name' => $p->name,
                'slug' => $p->slug,
                'description' => $p->description,
                'price_monthly' => $p->price_monthly,
                'price_yearly' => $p->price_yearly,
                'currency' => $p->currency,
                'max_users' => $p->max_users,
                'trial_days' => $p->trial_days,
            ]),
            'invoices' => $invoices->map(fn($i) => [
                'id' => $i->id,
                'reference' => $i->reference,
                'amount' => $i->amount,
                'currency' => $i->currency,
                'status' => $i->status,
                'paid_at' => $i->paid_at?->format('d/m/Y'),
                'created_at' => $i->created_at->format('d/m/Y'),
            ]),
        ]);
    }

    public function activate(Request $request): \Illuminate\Http\RedirectResponse
    {
        $validated = $request->validate([
            'activation_key' => 'required|string|size:32',
        ]);

        $subscription = Subscription::where('activation_key', $validated['activation_key'])
            ->where('company_id', $request->user()->company_id)
            ->first();

        if (!$subscription) {
            return back()->withErrors(['activation_key' => 'Clé d\'activation invalide ou déjà utilisée.']);
        }

        $subscription->update([
            'status' => 'active',
            'starts_at' => now(),
            'ends_at' => now()->addMonth(),
            'activation_key' => null,
        ]);

        return back()->with('success', 'Abonnement activé avec succès.');
    }
}
