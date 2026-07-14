<?php

namespace App\Http\Controllers;

use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

/**
 * Préférences personnelles de l'utilisateur connecté.
 * Sauvegardées dans users.preferences (JSON).
 */
class PreferencesController extends Controller
{
    public function update(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'sidebar_compact' => 'boolean',
            'theme'           => 'in:light,dark,system',
            'date_format'     => 'in:d/m/Y,m/d/Y,Y-m-d',
            'timezone'        => 'nullable|string|max:60',
            'home_page'       => 'nullable|string|max:100',
            'density'         => 'in:compact,normal,comfortable',
        ]);

        $user = $request->user();
        $current = $user->preferences ?? [];
        $user->update(['preferences' => array_merge($current, $data)]);

        return back()->with('success', 'Préférences sauvegardées.');
    }
}
