<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Jobs\SendMailJob;
use App\Mail\WelcomeMail;
use App\Models\Company;
use App\Models\Subscription;
use App\Models\SubscriptionPlan;
use App\Models\User;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Validation\Rules;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class RegisteredUserController extends Controller
{
    public function create(Request $request): Response
    {
        $plans = SubscriptionPlan::where('is_active', true)
            ->orderBy('sort_order')
            ->get(['id', 'name', 'slug', 'description', 'price_monthly', 'price_yearly', 'currency', 'trial_days', 'max_users']);

        return Inertia::render('Auth/Register', [
            'plans'        => $plans,
            'selectedPlan' => $request->query('plan'),
        ]);
    }

    /** Page publique de succès après inscription (pas d'auth requise). */
    public function success(Request $request): Response
    {
        return Inertia::render('Auth/RegisterSuccess', [
            'email' => $request->session()->get('registered_email', ''),
        ]);
    }

    /**
     * @throws ValidationException
     */
    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'name'     => 'required|string|max:255',
            'email'    => 'required|string|lowercase|email|max:255|unique:' . User::class,
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
            // Optionnel : sans formule (ou formule « Découverte ») ⇒ palier gratuit.
            'plan_id'  => 'nullable|exists:subscription_plans,id',
        ]);

        // 1. Créer une company provisoire (complétée lors de l'onboarding)
        $companyName = $request->name . ' — Entreprise';
        $slug = Str::slug($companyName) . '-' . Str::random(6);

        $company = Company::create([
            'name'          => $companyName,
            'slug'          => $slug,
            'base_currency' => 'XOF',
            'locale'        => 'fr',
            'country'       => 'CI',
            'is_active'     => true,
        ]);

        // 2. Créer l'utilisateur lié à cette company
        $user = User::create([
            'name'       => $request->name,
            'email'      => $request->email,
            'password'   => Hash::make($request->password),
            'company_id' => $company->id,
        ]);

        // 3. Attribuer le rôle admin de l'entreprise
        if (class_exists(\Spatie\Permission\Models\Role::class)) {
            $role = \Spatie\Permission\Models\Role::firstOrCreate(['name' => 'admin', 'guard_name' => 'web']);
            $user->assignRole($role);
        }

        event(new Registered($user));

        // 4. Abonnement initial (cahier §2) :
        //    - formule payante choisie  ⇒ ESSAI de N jours (N depuis licence.config.json)
        //    - aucune formule / Découverte ⇒ palier gratuit « Découverte » à vie
        $plan = $request->plan_id ? SubscriptionPlan::find($request->plan_id) : null;
        $estDecouverte = !$plan || $plan->slug === 'decouverte';

        if ($estDecouverte) {
            $decouverte = ($plan && $plan->slug === 'decouverte')
                ? $plan
                : SubscriptionPlan::where('slug', 'decouverte')->first();

            Subscription::create([
                'company_id'    => $company->id,
                'plan_id'       => $decouverte?->id,   // peut être null (FREE n'exige pas de formule)
                'status'        => Subscription::FREE,
                'billing_cycle' => 'monthly',
                'starts_at'     => now(),
                // Pas de date de fin : gratuit à vie (cahier §2, §3).
            ]);
        } else {
            Subscription::create([
                'company_id'    => $company->id,
                'plan_id'       => $plan->id,
                'status'        => Subscription::TRIAL,
                'billing_cycle' => 'monthly',
                'trial_ends_at' => now()->addDays(\App\Services\LicenseConfig::essaiJours()),
                'starts_at'     => now(),
            ]);
        }

        // 5. Email de bienvenue
        dispatch(new SendMailJob(
            $user->email,
            new WelcomeMail(
                userName: $user->name,
                companyName: $company->name,
            ),
        ));

        // 5b. Notification interne d'inscription (une inscription = une notification).
        //     Réutilise le système d'e-mail existant. L'inscription reste valide
        //     même si l'envoi échoue (dispatch en file + try/catch).
        try {
            $adminEmail = config('construiro.admin_notification_email');
            if ($adminEmail) {
                $sub = Subscription::where('company_id', $company->id)->latest()->first();
                dispatch(new SendMailJob(
                    $adminEmail,
                    new \App\Mail\NewRegistrationMail([
                        'nom'        => $user->name,
                        'email'      => $user->email,
                        'whatsapp'   => $user->phone ?? $company->phone,
                        'phone'      => $user->phone ?? $company->phone,
                        'statut'     => $sub ? \App\Services\LicenseConfig::libelleEtat($sub->status) : '—',
                        'offre'      => $sub?->plan?->name
                            ?? ($sub && $sub->status === Subscription::FREE ? 'Découverte' : '—'),
                        'date'       => now()->format('d/m/Y H:i'),
                        'company_id' => $company->id,
                        'user_id'    => $user->id,
                    ]),
                ));
            }
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::warning('Notification d\'inscription non envoyée : ' . $e->getMessage());
        }

        // 6. L'utilisateur se connecte explicitement depuis la page de succès
        $request->session()->put('registered_email', $user->email);

        return redirect(route('register.success'));
    }
}
