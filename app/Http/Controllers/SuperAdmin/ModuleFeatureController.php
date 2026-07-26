<?php

namespace App\Http\Controllers\SuperAdmin;

use App\Events\EvolutionPublished;
use App\Http\Controllers\Controller;
use App\Models\ModuleFeature;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/**
 * §43 — Gestion de la source de vérité modules × plans.
 *
 * Ce controller permet au SuperAdmin de définir quelles fonctionnalités
 * sont disponibles dans quels plans. Chaque modification de available_in_plans
 * dispatch EvolutionPublished → propagation automatique (landing, guides, PWA).
 */
class ModuleFeatureController extends Controller
{
    public function index(): Response
    {
        $features = ModuleFeature::orderBy('module_key')
            ->orderBy('feature_key')
            ->get()
            ->groupBy('module_key');

        $revisionFlags = \DB::table('guide_revision_flags')
            ->where('needs_revision', true)
            ->whereNull('resolved_at')
            ->pluck('module_key')
            ->toArray();

        return Inertia::render('SuperAdmin/ModuleFeatures/Index', [
            'features'      => $features,
            'plans'         => ModuleFeature::PLANS,
            'revisionFlags' => $revisionFlags,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'module_key'         => 'required|string|max:50',
            'feature_key'        => 'required|string|max:100',
            'label_fr'           => 'required|string|max:255',
            'label_en'           => 'nullable|string|max:255',
            'available_in_plans' => 'required|array',
            'available_in_plans.*' => 'in:starter,pro,enterprise',
            'is_active'          => 'boolean',
        ]);

        $feature = ModuleFeature::create(array_merge($validated, [
            'last_changed_by' => auth()->user()->email,
            'last_changed_at' => now(),
        ]));

        EvolutionPublished::dispatch(
            $feature->module_key,
            $feature->feature_key,
            $feature->available_in_plans,
            auth()->user()->email
        );

        return back()->with('success', "Feature « {$feature->feature_key} » créée. Propagation effectuée.");
    }

    public function update(Request $request, ModuleFeature $moduleFeature): RedirectResponse
    {
        $validated = $request->validate([
            'label_fr'           => 'required|string|max:255',
            'label_en'           => 'nullable|string|max:255',
            'available_in_plans' => 'required|array',
            'available_in_plans.*' => 'in:starter,pro,enterprise',
            'is_active'          => 'boolean',
        ]);

        $oldPlans = $moduleFeature->available_in_plans;

        $moduleFeature->update(array_merge($validated, [
            'is_active'       => $request->boolean('is_active'),
            'last_changed_by' => auth()->user()->email,
            'last_changed_at' => now(),
        ]));

        // Propager uniquement si les plans ont réellement changé
        if ($oldPlans !== $moduleFeature->available_in_plans) {
            EvolutionPublished::dispatch(
                $moduleFeature->module_key,
                $moduleFeature->feature_key,
                $moduleFeature->available_in_plans,
                auth()->user()->email
            );
        }

        return back()->with('success', "Feature « {$moduleFeature->feature_key} » mise à jour. Propagation effectuée.");
    }

    public function destroy(ModuleFeature $moduleFeature): RedirectResponse
    {
        $key = $moduleFeature->feature_key;
        $moduleFeature->delete();

        return back()->with('success', "Feature « {$key} » supprimée.");
    }

    /**
     * Résoudre le flag de révision d'un module (guide mis à jour).
     */
    public function resolveFlag(string $moduleKey): RedirectResponse
    {
        \DB::table('guide_revision_flags')
            ->where('module_key', $moduleKey)
            ->update([
                'needs_revision' => false,
                'resolved_at'    => now(),
            ]);

        return back()->with('success', "Flag de révision pour « {$moduleKey} » résolu.");
    }
}
