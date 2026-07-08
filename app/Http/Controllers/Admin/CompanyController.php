<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Company;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Administration des paramètres de l'entreprise courante (multi-tenant).
 * L'utilisateur ne peut consulter/modifier que sa propre entreprise.
 * Protégé par les permissions « administration.* » via le middleware de route.
 */
class CompanyController extends Controller
{
    public function edit(Request $request): Response
    {
        $company = $request->user()->company;

        abort_unless($company, 404);

        return Inertia::render('Admin/Company/Edit', [
            'company'  => $company->only([
                'id', 'name', 'legal_name', 'registration_number', 'tax_id',
                'country', 'city', 'address', 'phone', 'email', 'website',
                'base_currency', 'locale',
            ]),
            'agencies' => $company->agencies()
                ->orderBy('name')
                ->get(['id', 'name', 'city', 'is_headquarters', 'is_active']),
        ]);
    }

    public function update(Request $request): RedirectResponse
    {
        $company = $request->user()->company;

        abort_unless($company, 404);
        // Sécurité : on ne modifie que l'entreprise de l'utilisateur.
        $this->authorizeCompany($request->user()->company_id, $company);

        $data = $request->validate([
            'name'                => ['required', 'string', 'max:255'],
            'legal_name'          => ['nullable', 'string', 'max:255'],
            'registration_number' => ['nullable', 'string', 'max:100'],
            'tax_id'              => ['nullable', 'string', 'max:100'],
            'country'             => ['nullable', 'string', 'max:100'],
            'city'                => ['nullable', 'string', 'max:120'],
            'address'             => ['nullable', 'string', 'max:255'],
            'phone'               => ['nullable', 'string', 'max:40'],
            'email'               => ['nullable', 'string', 'email', 'max:255'],
            'website'             => ['nullable', 'string', 'max:255'],
            'base_currency'       => ['required', 'string', 'size:3'],
            'locale'              => ['required', 'string', 'max:5'],
        ]);

        $company->update($data);

        return redirect()->route('admin.company.edit')
            ->with('success', 'Paramètres de l\'entreprise mis à jour.');
    }

    /** Vérifie que la company ciblée est bien celle de l'utilisateur. */
    private function authorizeCompany(?int $companyId, Company $company): void
    {
        abort_unless($companyId === $company->id, 403);
    }
}
