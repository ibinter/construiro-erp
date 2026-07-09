<?php

namespace App\Http\Controllers;

use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

/**
 * Change la langue de l'interface. Persiste le choix sur l'utilisateur connecté
 * (users.locale) et en session (pour les invités), puis revient à la page précédente.
 */
class LocaleController extends Controller
{
    public function update(Request $request, string $locale): RedirectResponse
    {
        $supported = config('construiro.locales', ['fr', 'en']);
        abort_unless(in_array($locale, $supported, true), 404);

        $request->session()->put('locale', $locale);

        if ($user = $request->user()) {
            $user->forceFill(['locale' => $locale])->save();
        }

        return back();
    }
}
