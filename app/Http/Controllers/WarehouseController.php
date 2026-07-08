<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Warehouse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Gestion des magasins / dépôts.
 * Toutes les requêtes sont isolées par entreprise (multi-tenant) et
 * protégées par les permissions « warehouses.* » via le middleware de route.
 */
class WarehouseController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();

        $warehouses = Warehouse::forUser($user)
            ->when($request->string('search')->toString(), function ($query, $search) {
                $query->where(fn ($q) => $q
                    ->where('name', 'like', "%{$search}%")
                    ->orWhere('code', 'like', "%{$search}%")
                    ->orWhere('city', 'like', "%{$search}%"));
            })
            ->orderBy('name')
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('Warehouses/Index', [
            'warehouses' => $warehouses,
            'filters'    => $request->only('search'),
            'can'        => [
                'create' => $user->can('warehouses.create'),
                'update' => $user->can('warehouses.update'),
                'delete' => $user->can('warehouses.delete'),
            ],
        ]);
    }

    public function create(Request $request): Response
    {
        return Inertia::render('Warehouses/Create');
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $this->validateData($request);
        $data['company_id'] = $request->user()->company_id;

        $warehouse = Warehouse::create($data);

        return redirect()->route('warehouses.show', $warehouse)
            ->with('success', 'Magasin créé avec succès.');
    }

    public function show(Request $request, Warehouse $warehouse): Response
    {
        $this->authorizeCompany($request->user(), $warehouse);

        return Inertia::render('Warehouses/Show', [
            'warehouse' => $warehouse,
            'can'       => [
                'update' => $request->user()->can('warehouses.update'),
                'delete' => $request->user()->can('warehouses.delete'),
            ],
        ]);
    }

    public function edit(Request $request, Warehouse $warehouse): Response
    {
        $this->authorizeCompany($request->user(), $warehouse);

        return Inertia::render('Warehouses/Edit', [
            'warehouse' => $warehouse,
        ]);
    }

    public function update(Request $request, Warehouse $warehouse): RedirectResponse
    {
        $this->authorizeCompany($request->user(), $warehouse);

        $warehouse->update($this->validateData($request, $warehouse));

        return redirect()->route('warehouses.show', $warehouse)
            ->with('success', 'Magasin mis à jour.');
    }

    public function destroy(Request $request, Warehouse $warehouse): RedirectResponse
    {
        $this->authorizeCompany($request->user(), $warehouse);

        $warehouse->delete();

        return redirect()->route('warehouses.index')
            ->with('success', 'Magasin supprimé.');
    }

    /** Validation partagée création/mise à jour. */
    private function validateData(Request $request, ?Warehouse $warehouse = null): array
    {
        $companyId = $request->user()->company_id;

        return $request->validate([
            'code'         => ['required', 'string', 'max:50', Rule::unique('warehouses')->where('company_id', $companyId)->ignore($warehouse?->id)],
            'name'         => ['required', 'string', 'max:255'],
            'city'         => ['nullable', 'string', 'max:120'],
            'address'      => ['nullable', 'string', 'max:255'],
            'manager_name' => ['nullable', 'string', 'max:255'],
            'is_active'    => ['boolean'],
        ]);
    }

    /** Empêche l'accès à un magasin d'une autre entreprise. */
    private function authorizeCompany(User $user, Warehouse $warehouse): void
    {
        abort_unless($warehouse->company_id === $user->company_id, 403);
    }
}
