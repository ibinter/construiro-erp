<?php

namespace App\Http\Controllers;

use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class OnboardingController extends Controller
{
    public function index(Request $request): Response|RedirectResponse
    {
        $user = $request->user();
        $company = $user->company;

        if (!$company) {
            return redirect()->route('dashboard');
        }

        // Determine completed steps
        $steps = [
            'company'  => (bool) ($company->name && $company->country),
            'logo'     => (bool) $company->logo_path,
            'currency' => (bool) $company->base_currency,
            'modules'  => $company->onboarding_completed_at !== null || $company->enabled_modules !== null,
        ];

        $allDone = array_reduce($steps, fn($c, $v) => $c && $v, true);

        if ($allDone && $company->onboarding_completed_at) {
            return redirect()->route('dashboard');
        }

        return Inertia::render('Onboarding/Index', [
            'company' => [
                'id' => $company->id,
                'name' => $company->name,
                'country' => $company->country,
                'city' => $company->city,
                'phone' => $company->phone,
                'base_currency' => $company->base_currency,
                'locale' => $company->locale,
                'logo_path' => $company->logo_path,
            ],
            'steps' => $steps,
        ]);
    }

    public function saveCompany(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name'    => 'required|string|max:150',
            'country' => 'required|string|max:2',
            'city'    => 'nullable|string|max:100',
            'phone'   => 'nullable|string|max:30',
        ]);

        $request->user()->company->update($validated);

        return back()->with('success', 'Informations enregistrées.');
    }

    public function saveLogo(Request $request): RedirectResponse
    {
        $request->validate(['logo' => 'required|image|max:2048|mimes:png,jpg,jpeg,svg,webp']);

        $path = $request->file('logo')->store('logos', 'public');

        $company = $request->user()->company;

        if ($company->logo_path) {
            Storage::disk('public')->delete($company->logo_path);
        }

        $company->update(['logo_path' => $path]);

        return back()->with('success', 'Logo enregistré.');
    }

    public function saveSettings(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'base_currency' => 'required|string|size:3',
            'locale'        => 'required|in:fr,en',
        ]);

        $request->user()->company->update($validated);

        return back()->with('success', 'Paramètres enregistrés.');
    }

    public function complete(Request $request): RedirectResponse
    {
        $request->user()->company->update([
            'onboarding_completed_at' => now(),
        ]);

        return redirect()->route('dashboard')->with('success', 'Configuration terminée. Bienvenue sur CONSTRUIRO !');
    }
}
