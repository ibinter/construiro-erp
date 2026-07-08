<?php

namespace App\Http\Controllers;

use App\Models\Subcontractor;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Gestion des sous-traitants.
 * Toutes les requêtes sont isolées par entreprise (multi-tenant) et
 * protégées par les permissions « subcontractors.* » via le middleware de route.
 */
class SubcontractorController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();

        $subcontractors = Subcontractor::forUser($user)
            ->when($request->string('search')->toString(), function ($query, $search) {
                $query->where(fn ($q) => $q
                    ->where('name', 'like', "%{$search}%")
                    ->orWhere('code', 'like', "%{$search}%")
                    ->orWhere('contact_name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('phone', 'like', "%{$search}%"));
            })
            ->when($request->string('specialty')->toString(), fn ($q, $specialty) => $q->where('specialty', $specialty))
            ->latest()
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('Subcontractors/Index', [
            'subcontractors' => $subcontractors,
            'filters'        => $request->only('search', 'specialty'),
            'specialties'    => Subcontractor::SPECIALTIES,
            'can'            => [
                'create' => $user->can('subcontractors.create'),
                'update' => $user->can('subcontractors.update'),
                'delete' => $user->can('subcontractors.delete'),
            ],
        ]);
    }

    public function create(Request $request): Response
    {
        return Inertia::render('Subcontractors/Create', [
            'specialties' => Subcontractor::SPECIALTIES,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $this->validateData($request);
        $data['company_id'] = $request->user()->company_id;

        $subcontractor = Subcontractor::create($data);

        return redirect()->route('subcontractors.show', $subcontractor)
            ->with('success', 'Sous-traitant créé avec succès.');
    }

    public function show(Request $request, Subcontractor $subcontractor): Response
    {
        $this->authorizeCompany($request->user(), $subcontractor);

        return Inertia::render('Subcontractors/Show', [
            'subcontractor' => $subcontractor,
            'can'           => [
                'update' => $request->user()->can('subcontractors.update'),
                'delete' => $request->user()->can('subcontractors.delete'),
            ],
        ]);
    }

    public function edit(Request $request, Subcontractor $subcontractor): Response
    {
        $this->authorizeCompany($request->user(), $subcontractor);

        return Inertia::render('Subcontractors/Edit', [
            'subcontractor' => $subcontractor,
            'specialties'   => Subcontractor::SPECIALTIES,
        ]);
    }

    public function update(Request $request, Subcontractor $subcontractor): RedirectResponse
    {
        $this->authorizeCompany($request->user(), $subcontractor);

        $subcontractor->update($this->validateData($request, $subcontractor));

        return redirect()->route('subcontractors.show', $subcontractor)
            ->with('success', 'Sous-traitant mis à jour.');
    }

    public function destroy(Request $request, Subcontractor $subcontractor): RedirectResponse
    {
        $this->authorizeCompany($request->user(), $subcontractor);

        $subcontractor->delete();

        return redirect()->route('subcontractors.index')
            ->with('success', 'Sous-traitant supprimé.');
    }

    /** Validation partagée création/mise à jour. */
    private function validateData(Request $request, ?Subcontractor $subcontractor = null): array
    {
        $companyId = $request->user()->company_id;

        return $request->validate([
            'code'         => ['required', 'string', 'max:50', Rule::unique('subcontractors')->where('company_id', $companyId)->ignore($subcontractor?->id)],
            'name'         => ['required', 'string', 'max:255'],
            'specialty'    => ['required', Rule::in(Subcontractor::SPECIALTIES)],
            'contact_name' => ['nullable', 'string', 'max:255'],
            'phone'        => ['nullable', 'string', 'max:50'],
            'email'        => ['nullable', 'email', 'max:255'],
            'address'      => ['nullable', 'string', 'max:255'],
            'city'         => ['nullable', 'string', 'max:120'],
            'tax_id'       => ['nullable', 'string', 'max:50'],
            'rating'       => ['nullable', 'integer', 'min:1', 'max:5'],
            'notes'        => ['nullable', 'string'],
            'is_active'    => ['boolean'],
        ]);
    }

    /** Empêche l'accès à un sous-traitant d'une autre entreprise. */
    private function authorizeCompany(User $user, Subcontractor $subcontractor): void
    {
        abort_unless($subcontractor->company_id === $user->company_id, 403);
    }
}
