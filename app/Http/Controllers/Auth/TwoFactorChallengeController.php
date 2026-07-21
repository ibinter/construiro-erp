<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Services\TotpService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class TwoFactorChallengeController extends Controller
{
    public function __construct(private TotpService $totp) {}

    /**
     * Affiche la page de défi 2FA (saisie du code après connexion).
     */
    public function show(Request $request): Response|RedirectResponse
    {
        $user = $request->user();

        // Si l'utilisateur n'a pas le 2FA activé, pas besoin du challenge
        if (!$user || !$user->hasTwoFactorEnabled()) {
            return redirect()->intended(route('dashboard'));
        }

        return Inertia::render('Auth/TwoFactor/Challenge');
    }

    /**
     * Valide le code OTP ou un code de récupération.
     */
    public function store(Request $request): RedirectResponse
    {
        $user = $request->user();

        if (!$user || !$user->hasTwoFactorEnabled()) {
            return redirect()->route('dashboard');
        }

        // --- Vérification par code de récupération ---
        if ($request->filled('recovery_code')) {
            $recovery = trim($request->recovery_code);
            $codes = $user->two_factor_recovery_codes ?? [];

            $found = false;
            $remaining = [];
            foreach ($codes as $code) {
                if (hash_equals($code, $recovery)) {
                    $found = true;
                } else {
                    $remaining[] = $code;
                }
            }

            if (!$found) {
                return back()->withErrors(['recovery_code' => 'Code de récupération invalide.']);
            }

            // Le code utilisé est consommé (usage unique)
            $user->update(['two_factor_recovery_codes' => $remaining]);
            $request->session()->put('two_factor_authenticated', true);

            return redirect()->intended(route('dashboard'));
        }

        // --- Vérification par code TOTP ---
        $request->validate([
            'code' => ['required', 'string', 'size:6', 'regex:/^[0-9]{6}$/'],
        ], [
            'code.required' => 'Le code est obligatoire.',
            'code.size'     => 'Le code doit contenir 6 chiffres.',
            'code.regex'    => 'Chiffres uniquement.',
        ]);

        if (!$this->totp->verify($user->two_factor_secret, $request->code)) {
            return back()->withErrors(['code' => 'Code invalide ou expiré. Réessayez.']);
        }

        $request->session()->put('two_factor_authenticated', true);

        $intended = $request->session()->pull('two_factor_intended', route('dashboard'));

        return redirect($intended);
    }
}
