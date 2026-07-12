<?php

namespace App\Http\Controllers\SuperAdmin;

use App\Http\Controllers\Controller;
use App\Models\Company;
use App\Models\Subscription;
use App\Models\SubscriptionPlan;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class ClientController extends Controller
{
    public function index(Request $request): Response
    {
        $query = Company::with(['subscriptions' => fn($q) => $q->with('plan')->latest()->limit(1)]);

        if ($search = $request->get('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        if ($status = $request->get('status')) {
            $query->whereHas('subscriptions', fn($q) => $q->where('status', $status));
        }

        $companies = $query->latest()->paginate(20)->withQueryString();

        return Inertia::render('SuperAdmin/Clients/Index', [
            'companies' => $companies->through(fn($c) => [
                'id' => $c->id,
                'name' => $c->name,
                'legal_name' => $c->legal_name,
                'country' => $c->country,
                'city' => $c->city,
                'email' => $c->email,
                'is_active' => $c->is_active,
                'subscription_status' => $c->subscriptions->first()?->status ?? 'none',
                'plan_name' => $c->subscriptions->first()?->plan?->name ?? '—',
                'created_at' => $c->created_at->format('d/m/Y'),
            ]),
            'plans' => SubscriptionPlan::where('is_active', true)->get(['id', 'name', 'slug']),
            'filters' => $request->only(['search', 'status']),
        ]);
    }

    public function show(Company $company): Response
    {
        $company->load(['subscriptions.plan', 'users']);

        return Inertia::render('SuperAdmin/Clients/Show', [
            'company' => [
                'id' => $company->id,
                'name' => $company->name,
                'legal_name' => $company->legal_name,
                'country' => $company->country,
                'city' => $company->city,
                'email' => $company->email,
                'phone' => $company->phone,
                'is_active' => $company->is_active,
                'created_at' => $company->created_at->format('d/m/Y'),
                'users_count' => $company->users->count(),
            ],
            'subscriptions' => $company->subscriptions->map(fn($s) => [
                'id' => $s->id,
                'status' => $s->status,
                'plan' => $s->plan?->name,
                'billing_cycle' => $s->billing_cycle,
                'starts_at' => $s->starts_at?->format('d/m/Y'),
                'ends_at' => $s->ends_at?->format('d/m/Y'),
                'trial_ends_at' => $s->trial_ends_at?->format('d/m/Y'),
                'created_at' => $s->created_at->format('d/m/Y'),
            ]),
            'plans' => SubscriptionPlan::where('is_active', true)->get(['id', 'name', 'slug']),
        ]);
    }

    public function grantSubscription(Request $request, Company $company): RedirectResponse
    {
        $validated = $request->validate([
            'plan_id' => 'required|exists:subscription_plans,id',
            'billing_cycle' => 'required|in:monthly,yearly',
            'duration_months' => 'required|integer|min:1|max:24',
            'is_trial' => 'boolean',
        ]);

        $isTrial = $validated['is_trial'] ?? false;
        $months = $validated['duration_months'];

        Subscription::create([
            'company_id' => $company->id,
            'plan_id' => $validated['plan_id'],
            'status' => $isTrial ? 'trial' : 'active',
            'billing_cycle' => $validated['billing_cycle'],
            'starts_at' => $isTrial ? null : now(),
            'ends_at' => $isTrial ? null : now()->addMonths($months),
            'trial_ends_at' => $isTrial ? now()->addDays(14) : null,
            'activation_key' => Str::random(32),
        ]);

        return back()->with('success', "Abonnement accordé à {$company->name}.");
    }

    public function toggleActive(Company $company): RedirectResponse
    {
        $company->update(['is_active' => !$company->is_active]);
        $action = $company->is_active ? 'activée' : 'désactivée';
        return back()->with('success', "Entreprise {$action}.");
    }
}
