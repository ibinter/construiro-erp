<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Jobs\SendMailJob;
use App\Mail\WelcomeMail;
use App\Models\Subscription;
use App\Models\SubscriptionPlan;
use App\Models\User;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
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
            'selectedPlan' => $request->query('plan'), // slug passé depuis le landing
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
            'plan_id'  => 'required|exists:subscription_plans,id',
        ]);

        $user = User::create([
            'name'     => $request->name,
            'email'    => $request->email,
            'password' => Hash::make($request->password),
        ]);

        event(new Registered($user));

        dispatch(new SendMailJob(
            $user->email,
            new WelcomeMail(
                userName: $user->name,
                companyName: $user->company?->name ?? '',
            ),
        ));

        // Créer la subscription d'essai pour le plan choisi
        $plan = SubscriptionPlan::find($request->plan_id);
        if ($plan && $user->company_id) {
            $trialDays = $plan->trial_days ?: 14;
            Subscription::create([
                'company_id'    => $user->company_id,
                'plan_id'       => $plan->id,
                'status'        => 'trial',
                'billing_cycle' => 'monthly',
                'trial_ends_at' => now()->addDays($trialDays),
                'starts_at'     => now(),
            ]);
        }

        // Ne pas appeler Auth::login — l'utilisateur se connecte explicitement
        // depuis la page de succès via le formulaire de connexion.
        $request->session()->put('registered_email', $user->email);

        return redirect(route('register.success'));
    }
}
