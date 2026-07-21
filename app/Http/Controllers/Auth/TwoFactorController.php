<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Services\TotpService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class TwoFactorController extends Controller
{
    public function __construct(private TotpService $totp) {}

    /**
     * Affiche la page de configuration 2FA (dans les paramètres du profil).
     */
    public function show(Request $request): Response
    {
        $user = $request->user();

        return Inertia::render('Auth/TwoFactor/Setup', [
            'enabled'         => !is_null($user->two_factor_secret),
            'confirmed'       => $user->hasTwoFactorEnabled(),
            'qr_code_url'     => $user->two_factor_secret
                ? $this->totp->getQrCodeUrl($user->two_factor_secret, $user->email)
                : null,
            'recovery_codes'  => $user->hasTwoFactorEnabled()
                ? ($user->two_factor_recovery_codes ?? [])
                : [],
        ]);
    }

    /**
     * Génère un nouveau secret et affiche le QR code (étape 1 de l'activation).
     */
    public function enable(Request $request): RedirectResponse
    {
        $user = $request->user();

        $user->update([
            'two_factor_secret'         => $this->totp->generateSecret(),
            'two_factor_confirmed_at'   => null,
            'two_factor_recovery_codes' => $user->generateRecoveryCodes(),
        ]);

        return back()->with('status', 'qr-generated');
    }

    /**
     * Confirme l'activation en vérifiant un code OTP valide depuis l'appli d'auth.
     */
    public function confirm(Request $request): RedirectResponse
    {
        $request->validate([
            'code' => ['required', 'string', 'size:6', 'regex:/^[0-9]{6}$/'],
        ], [
            'code.required' => 'Le code est obligatoire.',
            'code.size'     => 'Le code doit contenir exactement 6 chiffres.',
            'code.regex'    => 'Le code ne doit contenir que des chiffres.',
        ]);

        $user = $request->user();

        if (!$user->two_factor_secret) {
            return back()->withErrors(['code' => '2FA non initialisé. Recommencez l\'activation.']);
        }

        if (!$this->totp->verify($user->two_factor_secret, $request->code)) {
            return back()->withErrors(['code' => 'Code invalide. Vérifiez l\'heure de votre téléphone.']);
        }

        $user->update(['two_factor_confirmed_at' => now()]);

        // Marquer la session courante comme déjà authentifiée via 2FA
        $request->session()->put('two_factor_authenticated', true);

        return back()->with('status', 'two-factor-enabled');
    }

    /**
     * Désactive le 2FA (nécessite de confirmer le mot de passe courant).
     */
    public function disable(Request $request): RedirectResponse
    {
        $request->validate([
            'password' => ['required', 'current_password'],
        ], [
            'password.required'         => 'Le mot de passe est requis.',
            'password.current_password' => 'Mot de passe incorrect.',
        ]);

        $request->user()->update([
            'two_factor_secret'         => null,
            'two_factor_recovery_codes' => null,
            'two_factor_confirmed_at'   => null,
        ]);

        $request->session()->forget('two_factor_authenticated');

        return back()->with('status', 'two-factor-disabled');
    }

    /**
     * Régénère les codes de secours (nécessite de confirmer le mot de passe).
     */
    public function regenerateCodes(Request $request): RedirectResponse
    {
        $request->validate([
            'password' => ['required', 'current_password'],
        ], [
            'password.required'         => 'Le mot de passe est requis.',
            'password.current_password' => 'Mot de passe incorrect.',
        ]);

        $user = $request->user();
        $codes = $user->generateRecoveryCodes();
        $user->update(['two_factor_recovery_codes' => $codes]);

        return back()->with('status', 'recovery-codes-regenerated');
    }
}
