<?php

namespace App\Http\Controllers;

use App\Models\Material;
use App\Models\StockMovement;
use App\Models\User;
use App\Models\Warehouse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Suivi des niveaux de stock et enregistrement des mouvements.
 * Le stock courant se calcule par agrégation SQL sur stock_movements
 * (entrées − sorties + ajustements). Isolation multi-tenant par entreprise.
 * Permissions « stocks.* » via le middleware de route.
 */
class StockController extends Controller
{
    /**
     * Niveaux de stock courants par matériau (optionnellement filtrés par magasin),
     * calculés par agrégation SQL. Met en évidence les matériaux sous le seuil.
     */
    public function index(Request $request): Response
    {
        $user = $request->user();
        $warehouseId = $request->integer('warehouse_id') ?: null;

        // Agrégation groupée des mouvements par matériau (une seule requête).
        $levels = StockMovement::query()
            ->where('company_id', $user->company_id)
            ->when($warehouseId, fn ($q) => $q->where('warehouse_id', $warehouseId))
            ->selectRaw("material_id, SUM(CASE
                WHEN type = 'in' THEN quantity
                WHEN type = 'out' THEN -quantity
                ELSE quantity END) as stock")
            ->groupBy('material_id')
            ->pluck('stock', 'material_id');

        // Tous les matériaux actifs de l'entreprise, avec leur stock calculé.
        $stocks = Material::forUser($user)
            ->orderBy('name')
            ->get(['id', 'code', 'name', 'category', 'unit', 'min_stock'])
            ->map(function ($material) use ($levels) {
                $stock = (float) ($levels[$material->id] ?? 0);

                return [
                    'id'         => $material->id,
                    'code'       => $material->code,
                    'name'       => $material->name,
                    'category'   => $material->category,
                    'unit'       => $material->unit,
                    'min_stock'  => (float) $material->min_stock,
                    'stock'      => $stock,
                    'below_min'  => $stock < (float) $material->min_stock,
                ];
            });

        return Inertia::render('Stocks/Index', [
            'stocks'     => $stocks,
            'warehouses' => Warehouse::forUser($user)->orderBy('name')->get(['id', 'name']),
            'materials'  => Material::forUser($user)->orderBy('name')->get(['id', 'name', 'unit', 'unit_price']),
            'filters'    => ['warehouse_id' => $warehouseId],
            'movements'  => $this->recentMovements($user),
            'types'      => StockMovement::TYPES,
            'can'        => [
                'create' => $user->can('stocks.create'),
            ],
        ]);
    }

    /** Liste paginée des mouvements récents (matériau, magasin, type, quantité, date). */
    public function movements(Request $request): Response
    {
        $user = $request->user();

        $movements = StockMovement::query()
            ->where('company_id', $user->company_id)
            ->with(['material:id,name,code,unit', 'warehouse:id,name', 'user:id,name'])
            ->when($request->integer('warehouse_id') ?: null, fn ($q, $id) => $q->where('warehouse_id', $id))
            ->when($request->string('type')->toString(), fn ($q, $type) => $q->where('type', $type))
            ->latest('moved_at')
            ->latest('id')
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('Stocks/Movements', [
            'movements'  => $movements,
            'warehouses' => Warehouse::forUser($user)->orderBy('name')->get(['id', 'name']),
            'filters'    => $request->only('warehouse_id', 'type'),
            'types'      => StockMovement::TYPES,
        ]);
    }

    /** Enregistre un mouvement de stock (entrée / sortie / ajustement). */
    public function storeMovement(Request $request): RedirectResponse
    {
        $user = $request->user();
        $companyId = $user->company_id;

        $data = $request->validate([
            'warehouse_id' => ['required', 'integer', Rule::exists('warehouses', 'id')->where('company_id', $companyId)],
            'material_id'  => ['required', 'integer', Rule::exists('materials', 'id')->where('company_id', $companyId)],
            'type'         => ['required', Rule::in(StockMovement::TYPES)],
            'quantity'     => ['required', 'numeric', 'min:0'],
            'unit_price'   => ['required', 'numeric', 'min:0'],
            'reference'    => ['nullable', 'string', 'max:255'],
            'notes'        => ['nullable', 'string'],
            'moved_at'     => ['required', 'date'],
        ]);

        $data['company_id'] = $companyId;
        $data['user_id'] = $user->id;

        StockMovement::create($data);

        return back()->with('success', 'Mouvement de stock enregistré.');
    }

    /** Derniers mouvements pour affichage sur l'écran des niveaux de stock. */
    private function recentMovements(User $user)
    {
        return StockMovement::query()
            ->where('company_id', $user->company_id)
            ->with(['material:id,name,code,unit', 'warehouse:id,name'])
            ->latest('moved_at')
            ->latest('id')
            ->limit(10)
            ->get();
    }
}
