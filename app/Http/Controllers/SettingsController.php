<?php

namespace App\Http\Controllers;

use App\Services\LicenseGuard;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Paramètres de la société — organisés en 7 catégories (section 20 du CDC).
 */
class SettingsController extends Controller
{
    public function index(Request $request): Response
    {
        $user    = $request->user();
        $company = $user->company;

        return Inertia::render('Settings/Index', [
            'company' => [
                'id'            => $company->id,
                'name'          => $company->name,
                'email'         => $company->email ?? '',
                'phone'         => $company->phone ?? '',
                'address'       => $company->address ?? '',
                'city'          => $company->city ?? '',
                'country'       => $company->country ?? '',
                'siret'         => $company->siret ?? '',
                'vat_number'    => $company->vat_number ?? '',
                'logo_path'     => $company->logo_path,
                'base_currency' => $company->base_currency ?? 'XOF',
                'locale'        => $company->locale ?? 'fr',
                'timezone'      => $company->timezone ?? 'Africa/Abidjan',
                'date_format'   => $company->date_format ?? 'd/m/Y',
                'invoice_prefix'=> $company->invoice_prefix ?? 'FAC',
                'quote_prefix'  => $company->quote_prefix ?? 'DEV',
                'invoice_footer'=> $company->invoice_footer ?? '',
                'invoice_notes' => $company->invoice_notes ?? '',
                'enabled_modules'=> $company->enabled_modules,
                'onboarding_completed_at' => $company->onboarding_completed_at,
            ],
            'usage'   => LicenseGuard::usage($user->company_id),
            'can' => [
                'manage' => $user->can('administration.update'),
            ],
        ]);
    }

    public function updateOrganization(Request $request): RedirectResponse
    {
        $this->authorize('administration.update');

        $data = $request->validate([
            'name'          => 'required|string|max:150',
            'email'         => 'nullable|email|max:150',
            'phone'         => 'nullable|string|max:30',
            'address'       => 'nullable|string|max:300',
            'city'          => 'nullable|string|max:100',
            'country'       => 'nullable|string|max:2',
            'siret'         => 'nullable|string|max:50',
            'vat_number'    => 'nullable|string|max:50',
            'base_currency' => 'required|string|size:3',
            'locale'        => 'required|in:fr,en',
            'timezone'      => 'required|string|max:60',
            'date_format'   => 'required|in:d/m/Y,m/d/Y,Y-m-d',
        ]);

        // Logo upload
        if ($request->hasFile('logo')) {
            $request->validate(['logo' => 'image|max:2048|mimes:png,jpg,jpeg,svg,webp']);
            $company = $request->user()->company;
            if ($company->logo_path) {
                Storage::disk('public')->delete($company->logo_path);
            }
            $data['logo_path'] = $request->file('logo')->store('logos', 'public');
        }

        $request->user()->company->update($data);

        return back()->with('success', 'Paramètres d\'organisation mis à jour.');
    }

    public function updateDocuments(Request $request): RedirectResponse
    {
        $this->authorize('administration.update');

        $data = $request->validate([
            'invoice_prefix' => 'required|string|max:10',
            'quote_prefix'   => 'required|string|max:10',
            'invoice_footer' => 'nullable|string|max:500',
            'invoice_notes'  => 'nullable|string|max:500',
        ]);

        $request->user()->company->update($data);

        return back()->with('success', 'Paramètres de documents mis à jour.');
    }

    public function updateNotifications(Request $request): RedirectResponse
    {
        $this->authorize('administration.update');

        $data = $request->validate([
            'notif_invoice_due'   => 'boolean',
            'notif_payment'       => 'boolean',
            'notif_support'       => 'boolean',
            'notif_subscription'  => 'boolean',
        ]);

        $company = $request->user()->company;
        $settings = $company->notification_settings ?? [];
        $company->update(['notification_settings' => array_merge($settings, $data)]);

        return back()->with('success', 'Préférences de notifications mises à jour.');
    }
}
