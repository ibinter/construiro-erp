<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Services\LicenseConfig;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

/**
 * Accès à la démo publique (cahier §4) : le vrai logiciel, données fictives,
 * SANS inscription. Connecte automatiquement le visiteur au compte démo.
 *
 * Entièrement inerte tant que licence.config.json → demo.actif = false
 * (ne jamais publier le lien avant que l'instance ne soit en ligne — §4.7).
 */
class DemoAccessController extends Controller
{
    public function enter(Request $request): RedirectResponse
    {
        abort_unless(LicenseConfig::demoActive(), 404);

        $user = User::whereHas('company', fn ($q) => $q->where('is_demo', true))->first();
        abort_unless($user, 503, 'Démonstration momentanément indisponible.');

        Auth::login($user);
        $request->session()->regenerate();

        return redirect('/dashboard')->with('success', 'Bienvenue dans la démonstration CONSTRUIRO.');
    }
}
