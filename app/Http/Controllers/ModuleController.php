<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Point d'entrée générique des modules ERP.
 *
 * Tant que chaque module n'a pas son propre contrôleur dédié, cette route
 * unique affiche un écran d'espace réservé cohérent, en contrôlant que
 * l'utilisateur possède la permission « module.view ».
 */
class ModuleController extends Controller
{
    public function show(Request $request, string $module): Response
    {
        $modules = config('construiro.modules', []);

        abort_unless(isset($modules[$module]), 404);
        abort_unless($request->user()->can("{$module}.view"), 403);

        $def = $modules[$module];
        $locale = $request->user()->locale ?? 'fr';

        return Inertia::render('Module', [
            'module' => [
                'key'   => $module,
                'label' => $def['name'][$locale] ?? $def['name']['fr'] ?? $module,
                'icon'  => $def['icon'] ?? 'circle',
                'group' => $def['group'] ?? null,
            ],
            // Actions autorisées pour cet utilisateur sur ce module.
            'abilities' => collect($def['actions'] ?? config('construiro.default_actions'))
                ->filter(fn ($action) => $request->user()->can("{$module}.{$action}"))
                ->values(),
        ]);
    }
}
