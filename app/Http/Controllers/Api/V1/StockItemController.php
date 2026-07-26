<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Material;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * API V1 — Stock Items (Materials catalogue, read-only)
 * Exposes the materials/articles catalogue. Current stock levels are computed
 * on demand from stock movements. Scoped to the authenticated user's company.
 */
class StockItemController extends Controller
{
    /**
     * GET /api/v1/stock-items
     * List materials for the authenticated user's company (paginated, 20/page).
     * Supports optional ?category= and ?is_active= filters.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Material::where('company_id', $request->user()->company_id)
            ->orderBy('name');

        if ($request->filled('category')) {
            $query->where('category', $request->category);
        }

        if ($request->has('is_active')) {
            $query->where('is_active', filter_var($request->is_active, FILTER_VALIDATE_BOOLEAN));
        }

        $items = $query->paginate(20);

        // Append current_stock to each item without loading all movements in memory.
        $items->through(function (Material $material) {
            $material->append([]);
            $material->current_stock = $material->currentStock();
            return $material;
        });

        return response()->json($items);
    }

    /**
     * GET /api/v1/stock-items/{id}
     * Show a single material with its current stock level.
     * Optionally pass ?warehouse_id= to scope the stock calculation.
     */
    public function show(Request $request, int $id): JsonResponse
    {
        $material = Material::where('company_id', $request->user()->company_id)
            ->findOrFail($id);

        $warehouseId = $request->filled('warehouse_id') ? (int) $request->warehouse_id : null;

        $data = $material->toArray();
        $data['current_stock'] = $material->currentStock($warehouseId);

        return response()->json($data);
    }
}
