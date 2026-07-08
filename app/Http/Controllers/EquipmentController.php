<?php

namespace App\Http\Controllers;

use App\Models\Equipment;
use App\Models\Site;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Gestion du parc matériel (équipements) : engins, véhicules, matériel, outillage.
 * Toutes les requêtes sont isolées par entreprise (multi-tenant) et
 * protégées par les permissions « equipment.* » via le middleware de route.
 */
class EquipmentController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();

        $equipment = Equipment::forUser($user)
            ->with('currentSite:id,name')
            ->when($request->string('search')->toString(), function ($query, $search) {
                $query->where(fn ($q) => $q
                    ->where('name', 'like', "%{$search}%")
                    ->orWhere('code', 'like', "%{$search}%")
                    ->orWhere('registration', 'like', "%{$search}%"));
            })
            ->when($request->string('category')->toString(), fn ($q, $category) => $q->where('category', $category))
            ->when($request->string('status')->toString(), fn ($q, $status) => $q->where('status', $status))
            ->orderBy('name')
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('Equipment/Index', [
            'equipment'  => $equipment,
            'filters'    => $request->only('search', 'category', 'status'),
            'categories' => Equipment::CATEGORIES,
            'statuses'   => Equipment::STATUSES,
            'can'        => [
                'create' => $user->can('equipment.create'),
                'update' => $user->can('equipment.update'),
                'delete' => $user->can('equipment.delete'),
            ],
        ]);
    }

    public function create(Request $request): Response
    {
        return Inertia::render('Equipment/Create', [
            'sites'      => $this->sites($request->user()),
            'categories' => Equipment::CATEGORIES,
            'statuses'   => Equipment::STATUSES,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $this->validateData($request);
        $data['company_id'] = $request->user()->company_id;

        $equipment = Equipment::create($data);

        return redirect()->route('equipment.show', $equipment)
            ->with('success', 'Équipement créé avec succès.');
    }

    public function show(Request $request, Equipment $equipment): Response
    {
        $this->authorizeCompany($request->user(), $equipment);

        $equipment->load([
            'currentSite:id,name',
            'maintenanceRecords' => fn ($q) => $q->latest('performed_at')->latest('id')->limit(10),
        ]);

        return Inertia::render('Equipment/Show', [
            'equipment' => $equipment,
            'types'     => \App\Models\MaintenanceRecord::TYPES,
            'can'       => [
                'update' => $request->user()->can('equipment.update'),
                'delete' => $request->user()->can('equipment.delete'),
            ],
        ]);
    }

    public function edit(Request $request, Equipment $equipment): Response
    {
        $this->authorizeCompany($request->user(), $equipment);

        return Inertia::render('Equipment/Edit', [
            'equipment'  => $equipment,
            'sites'      => $this->sites($request->user()),
            'categories' => Equipment::CATEGORIES,
            'statuses'   => Equipment::STATUSES,
        ]);
    }

    public function update(Request $request, Equipment $equipment): RedirectResponse
    {
        $this->authorizeCompany($request->user(), $equipment);

        $equipment->update($this->validateData($request, $equipment));

        return redirect()->route('equipment.show', $equipment)
            ->with('success', 'Équipement mis à jour.');
    }

    public function destroy(Request $request, Equipment $equipment): RedirectResponse
    {
        $this->authorizeCompany($request->user(), $equipment);

        $equipment->delete();

        return redirect()->route('equipment.index')
            ->with('success', 'Équipement supprimé.');
    }

    /**
     * Enregistre un entretien pour un équipement.
     * Route POST /equipment/{equipment}/maintenance (can:equipment.update).
     */
    public function storeMaintenance(Request $request, Equipment $equipment): RedirectResponse
    {
        $this->authorizeCompany($request->user(), $equipment);

        $data = $request->validate([
            'type'         => ['required', Rule::in(\App\Models\MaintenanceRecord::TYPES)],
            'description'  => ['required', 'string', 'max:255'],
            'cost'         => ['required', 'numeric', 'min:0'],
            'performed_at' => ['required', 'date'],
            'notes'        => ['nullable', 'string'],
        ]);

        $data['company_id'] = $request->user()->company_id;

        $equipment->maintenanceRecords()->create($data);

        return redirect()->route('equipment.show', $equipment)
            ->with('success', 'Entretien enregistré.');
    }

    /** Validation partagée création/mise à jour. */
    private function validateData(Request $request, ?Equipment $equipment = null): array
    {
        $companyId = $request->user()->company_id;

        return $request->validate([
            'code'              => ['required', 'string', 'max:50', Rule::unique('equipment')->where('company_id', $companyId)->ignore($equipment?->id)],
            'name'              => ['required', 'string', 'max:255'],
            'category'          => ['required', Rule::in(Equipment::CATEGORIES)],
            'status'            => ['required', Rule::in(Equipment::STATUSES)],
            'brand'             => ['nullable', 'string', 'max:120'],
            'model'             => ['nullable', 'string', 'max:120'],
            'registration'      => ['nullable', 'string', 'max:120'],
            'current_site_id'   => ['nullable', 'integer', Rule::exists('sites', 'id')->where('company_id', $companyId)],
            'acquisition_date'  => ['nullable', 'date'],
            'acquisition_value' => ['required', 'numeric', 'min:0'],
            'currency'          => ['required', 'string', 'size:3'],
            'notes'             => ['nullable', 'string'],
            'is_active'         => ['boolean'],
        ]);
    }

    /** Liste des chantiers de l'entreprise pour l'affectation. */
    private function sites(User $user)
    {
        return Site::where('company_id', $user->company_id)
            ->orderBy('name')
            ->get(['id', 'name', 'code']);
    }

    /** Empêche l'accès à un équipement d'une autre entreprise. */
    private function authorizeCompany(User $user, Equipment $equipment): void
    {
        abort_unless($equipment->company_id === $user->company_id, 403);
    }
}
