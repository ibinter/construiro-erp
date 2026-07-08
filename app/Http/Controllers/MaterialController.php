<?php

namespace App\Http\Controllers;

use App\Models\Material;
use App\Models\StockMovement;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Gestion du catalogue des matériaux.
 * Toutes les requêtes sont isolées par entreprise (multi-tenant) et
 * protégées par les permissions « materials.* » via le middleware de route.
 */
class MaterialController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();

        $materials = Material::forUser($user)
            ->when($request->string('search')->toString(), function ($query, $search) {
                $query->where(fn ($q) => $q
                    ->where('name', 'like', "%{$search}%")
                    ->orWhere('code', 'like', "%{$search}%"));
            })
            ->when($request->string('category')->toString(), fn ($q, $category) => $q->where('category', $category))
            ->orderBy('name')
            ->paginate(10)
            ->withQueryString();

        // Stock courant par matériau via UNE requête agrégée (évite les N+1).
        $stockLevels = $this->stockLevels($user, $materials->pluck('id')->all());

        $materials->getCollection()->transform(function ($material) use ($stockLevels) {
            $material->current_stock = (float) ($stockLevels[$material->id] ?? 0);
            return $material;
        });

        return Inertia::render('Materials/Index', [
            'materials'  => $materials,
            'filters'    => $request->only('search', 'category'),
            'categories' => Material::CATEGORIES,
            'can'        => [
                'create' => $user->can('materials.create'),
                'update' => $user->can('materials.update'),
                'delete' => $user->can('materials.delete'),
            ],
        ]);
    }

    public function create(Request $request): Response
    {
        return Inertia::render('Materials/Create', [
            'categories' => Material::CATEGORIES,
            'units'      => Material::UNITS,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $this->validateData($request);
        $data['company_id'] = $request->user()->company_id;

        $material = Material::create($data);

        return redirect()->route('materials.show', $material)
            ->with('success', 'Matériau créé avec succès.');
    }

    public function show(Request $request, Material $material): Response
    {
        $this->authorizeCompany($request->user(), $material);

        $material->load(['movements' => fn ($q) => $q->with('warehouse:id,name')->latest('moved_at')->latest('id')->limit(10)]);
        $material->current_stock = $material->currentStock();

        return Inertia::render('Materials/Show', [
            'material' => $material,
            'can'      => [
                'update' => $request->user()->can('materials.update'),
                'delete' => $request->user()->can('materials.delete'),
            ],
        ]);
    }

    public function edit(Request $request, Material $material): Response
    {
        $this->authorizeCompany($request->user(), $material);

        return Inertia::render('Materials/Edit', [
            'material'   => $material,
            'categories' => Material::CATEGORIES,
            'units'      => Material::UNITS,
        ]);
    }

    public function update(Request $request, Material $material): RedirectResponse
    {
        $this->authorizeCompany($request->user(), $material);

        $material->update($this->validateData($request, $material));

        return redirect()->route('materials.show', $material)
            ->with('success', 'Matériau mis à jour.');
    }

    public function destroy(Request $request, Material $material): RedirectResponse
    {
        $this->authorizeCompany($request->user(), $material);

        $material->delete();

        return redirect()->route('materials.index')
            ->with('success', 'Matériau supprimé.');
    }

    /**
     * Calcule le stock courant (entrées − sorties + ajustements) pour un lot
     * de matériaux via une seule requête agrégée groupée sur stock_movements.
     * Retourne un tableau [material_id => stock].
     */
    private function stockLevels(User $user, array $materialIds): array
    {
        if (empty($materialIds)) {
            return [];
        }

        return StockMovement::query()
            ->where('company_id', $user->company_id)
            ->whereIn('material_id', $materialIds)
            ->selectRaw("material_id, SUM(CASE
                WHEN type = 'in' THEN quantity
                WHEN type = 'out' THEN -quantity
                ELSE quantity END) as stock")
            ->groupBy('material_id')
            ->pluck('stock', 'material_id')
            ->all();
    }

    /** Validation partagée création/mise à jour. */
    private function validateData(Request $request, ?Material $material = null): array
    {
        $companyId = $request->user()->company_id;

        return $request->validate([
            'code'        => ['required', 'string', 'max:50', Rule::unique('materials')->where('company_id', $companyId)->ignore($material?->id)],
            'name'        => ['required', 'string', 'max:255'],
            'category'    => ['required', Rule::in(Material::CATEGORIES)],
            'unit'        => ['required', Rule::in(Material::UNITS)],
            'unit_price'  => ['required', 'numeric', 'min:0'],
            'min_stock'   => ['required', 'numeric', 'min:0'],
            'description' => ['nullable', 'string'],
            'is_active'   => ['boolean'],
        ]);
    }

    /** Empêche l'accès à un matériau d'une autre entreprise. */
    private function authorizeCompany(User $user, Material $material): void
    {
        abort_unless($material->company_id === $user->company_id, 403);
    }
}
