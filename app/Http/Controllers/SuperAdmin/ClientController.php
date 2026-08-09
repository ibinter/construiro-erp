<?php

namespace App\Http\Controllers\SuperAdmin;

use App\Http\Controllers\Controller;
use App\Jobs\SendMailJob;
use App\Mail\AccountSuspendedMail;
use App\Models\Company;
use App\Models\Subscription;
use App\Models\SubscriptionPlan;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class ClientController extends Controller
{
    public function index(Request $request): Response
    {
        $query = Company::with(['subscriptions' => fn($q) => $q->with('plan')->latest()->limit(1)])
            ->withCount('sites');

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
                'subscription_libelle' => ($s = $c->subscriptions->first())
                    ? \App\Services\LicenseConfig::libelleEtat($s->status)
                    : '—',
                'plan_name' => $c->subscriptions->first()?->plan?->name ?? '—',
                'chantiers' => [
                    'used' => $c->sites_count,
                    'cap'  => $c->subscriptions->first()?->chantierCap(),
                ],
                'created_at' => $c->created_at->format('d/m/Y'),
            ]),
            'plans' => SubscriptionPlan::where('is_active', true)->get(['id', 'name', 'slug']),
            // Les 6 états officiels pour le filtre (cahier §12.6).
            'etats' => collect(\App\Services\LicenseConfig::etats())
                ->map(fn ($e) => ['value' => $e, 'label' => \App\Services\LicenseConfig::libelleEtat($e)]),
            'filters' => $request->only(['search', 'status']),
        ]);
    }

    public function show(Company $company): Response
    {
        $company->load(['subscriptions.plan', 'users']);

        return Inertia::render('SuperAdmin/Clients/Show', [
            'company' => [
                'id'                => $company->id,
                'name'              => $company->name,
                'legal_name'        => $company->legal_name,
                'country'           => $company->country,
                'city'              => $company->city,
                'email'             => $company->email,
                'phone'             => $company->phone,
                'is_active'         => $company->is_active,
                'status'            => $company->status ?? 'active',
                'suspended_at'      => $company->suspended_at?->format('d/m/Y H:i'),
                'suspension_reason' => $company->suspension_reason,
                'created_at'        => $company->created_at->format('d/m/Y'),
                'users_count'       => $company->users->count(),
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
            // Journal des transitions (append-only) — cahier §12.6.
            'transitions' => \App\Models\LicenseTransition::where('company_id', $company->id)
                ->orderByDesc('created_at')
                ->limit(50)
                ->get()
                ->map(fn ($t) => [
                    'from'   => $t->from_state ? \App\Services\LicenseConfig::libelleEtat($t->from_state) : '—',
                    'to'     => \App\Services\LicenseConfig::libelleEtat($t->to_state),
                    'cause'  => $t->cause,
                    'actor'  => $t->actor,
                    'reason' => $t->reason,
                    'at'     => $t->created_at?->format('d/m/Y H:i'),
                ]),
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

        $sub = Subscription::create([
            'company_id' => $company->id,
            'plan_id' => $validated['plan_id'],
            'status' => $isTrial ? Subscription::TRIAL : Subscription::ACTIVE,
            'billing_cycle' => $validated['billing_cycle'],
            'starts_at' => now(),
            'ends_at' => $isTrial ? null : now()->addMonths($months),
            // Durée d'essai imposée par la source unique (jamais modifiable — cahier §12.6).
            'trial_ends_at' => $isTrial ? now()->addDays(\App\Services\LicenseConfig::essaiJours()) : null,
            'activation_key' => Str::random(32),
        ]);

        \App\Models\LicenseTransition::log(
            $sub, null, $sub->status,
            \App\Models\LicenseTransition::CAUSE_SUPERADMIN,
            $request->user()->email
        );

        return back()->with('success', "Abonnement accordé à {$company->name}.");
    }

    /**
     * Prolonge la période de grâce de 15 jours — UNE SEULE FOIS, motif obligatoire
     * (cahier §12.6 : vaut prise de contact commerciale).
     */
    public function extendGrace(Request $request, Company $company): RedirectResponse
    {
        $validated = $request->validate([
            'reason' => 'required|string|max:500',
        ]);

        $sub = Subscription::where('company_id', $company->id)->latest()->first();
        if (!$sub) {
            return back()->with('error', 'Aucun abonnement pour cette entreprise.');
        }
        if ($sub->trial_extended_at) {
            return back()->with('error', 'La prolongation a déjà été accordée (une seule fois autorisée).');
        }

        $days = \App\Services\LicenseConfig::prolongationJours();
        $base = $sub->grace_ends_at && $sub->grace_ends_at->isFuture() ? $sub->grace_ends_at : now();
        $from = $sub->status;

        $sub->update([
            'status'            => Subscription::GRACE,
            'grace_ends_at'     => $base->copy()->addDays($days),
            'trial_extended_at' => now(),
            'extension_reason'  => $validated['reason'],
        ]);

        \App\Models\LicenseTransition::log(
            $sub, $from, Subscription::GRACE,
            \App\Models\LicenseTransition::CAUSE_SUPERADMIN,
            $request->user()->email,
            "Prolongation {$days} j : " . $validated['reason']
        );

        return back()->with('success', "Grâce prolongée de {$days} jours pour {$company->name}.");
    }

    /** Démarre un essai (durée imposée par la config, non modifiable — cahier §12.6). */
    public function startTrial(Request $request, Company $company): RedirectResponse
    {
        $validated = $request->validate([
            'plan_id' => 'required|exists:subscription_plans,id',
        ]);

        $sub = Subscription::create([
            'company_id'    => $company->id,
            'plan_id'       => $validated['plan_id'],
            'status'        => Subscription::TRIAL,
            'billing_cycle' => 'monthly',
            'starts_at'     => now(),
            'trial_ends_at' => now()->addDays(\App\Services\LicenseConfig::essaiJours()),
        ]);

        \App\Models\LicenseTransition::log(
            $sub, null, Subscription::TRIAL,
            \App\Models\LicenseTransition::CAUSE_SUPERADMIN,
            $request->user()->email
        );

        return back()->with('success', "Essai démarré pour {$company->name}.");
    }

    public function toggleActive(Company $company): RedirectResponse
    {
        $company->update(['is_active' => !$company->is_active]);
        $action = $company->is_active ? 'activée' : 'désactivée';
        return back()->with('success', "Entreprise {$action}.");
    }

    /** Suspendre un compte entreprise et notifier tous ses utilisateurs. */
    public function suspend(Request $request, Company $company): RedirectResponse
    {
        $validated = $request->validate([
            'reason' => 'required|string|max:500',
        ]);

        $suspendedAt = now();

        $company->update([
            'status'            => 'suspended',
            'is_active'         => false,
            'suspended_at'      => $suspendedAt,
            'suspension_reason' => $validated['reason'],
        ]);

        // Notifier tous les utilisateurs de l'entreprise
        foreach ($company->users()->get() as $user) {
            try {
                dispatch(new SendMailJob(
                    $user->email,
                    new AccountSuspendedMail(
                        userName:    $user->name,
                        reason:      $validated['reason'],
                        suspendedAt: $suspendedAt->format('d/m/Y H:i'),
                        contactUrl:  url('/contact'),
                    )
                ));
            } catch (\Exception $e) {
                Log::warning("AccountSuspendedMail failed for {$user->email}: " . $e->getMessage());
            }
        }

        // Audit log
        if (Schema::hasTable('audit_logs')) {
            DB::table('audit_logs')->insert([
                'user_id'    => $request->user()->id,
                'action'     => 'company.suspended',
                'model_type' => 'Company',
                'model_id'   => $company->id,
                'metadata'   => json_encode(['reason' => $validated['reason']]),
                'ip_address' => $request->ip(),
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        return back()->with('success', "Compte {$company->name} suspendu.");
    }

    /** Réactiver un compte précédemment suspendu. */
    public function reactivate(Company $company): RedirectResponse
    {
        $company->update([
            'status'            => 'active',
            'is_active'         => true,
            'suspended_at'      => null,
            'suspension_reason' => null,
        ]);

        return back()->with('success', "Compte {$company->name} réactivé.");
    }
}
