<?php

namespace App\Http\Controllers;

use App\Models\UnitPrice;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

/**
 * BPU — Bibliothèque de prix unitaires.
 * Toutes les requêtes sont isolées par entreprise (multi-tenant) et
 * protégées par les permissions « unit_prices.* » via le middleware de route.
 */
class UnitPriceController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();

        $unitPrices = UnitPrice::forUser($user)
            ->when($request->string('search')->toString(), function ($query, $search) {
                $query->where(fn ($q) => $q
                    ->where('code', 'like', "%{$search}%")
                    ->orWhere('designation', 'like', "%{$search}%"));
            })
            ->when($request->string('category')->toString(), fn ($q, $category) => $q->where('category', $category))
            ->latest()
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('UnitPrices/Index', [
            'unitPrices' => $unitPrices,
            'filters'    => $request->only('search', 'category'),
            'categories' => UnitPrice::CATEGORIES,
            'can'        => [
                'create' => $user->can('unit_prices.create'),
                'update' => $user->can('unit_prices.update'),
                'delete' => $user->can('unit_prices.delete'),
            ],
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('UnitPrices/Create', [
            'units'      => UnitPrice::UNITS,
            'categories' => UnitPrice::CATEGORIES,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $this->validateData($request);
        $data['company_id'] = $request->user()->company_id;

        $unitPrice = UnitPrice::create($data);

        return redirect()->route('unit_prices.show', $unitPrice)
            ->with('success', 'Prix unitaire créé avec succès.');
    }

    public function show(Request $request, UnitPrice $unitPrice): Response
    {
        $this->authorizeCompany($request->user(), $unitPrice);

        return Inertia::render('UnitPrices/Show', [
            'unitPrice' => $unitPrice,
            'can'       => [
                'update' => $request->user()->can('unit_prices.update'),
                'delete' => $request->user()->can('unit_prices.delete'),
            ],
        ]);
    }

    public function edit(Request $request, UnitPrice $unitPrice): Response
    {
        $this->authorizeCompany($request->user(), $unitPrice);

        return Inertia::render('UnitPrices/Edit', [
            'unitPrice'  => $unitPrice,
            'units'      => UnitPrice::UNITS,
            'categories' => UnitPrice::CATEGORIES,
        ]);
    }

    public function update(Request $request, UnitPrice $unitPrice): RedirectResponse
    {
        $this->authorizeCompany($request->user(), $unitPrice);

        $unitPrice->update($this->validateData($request, $unitPrice));

        return redirect()->route('unit_prices.show', $unitPrice)
            ->with('success', 'Prix unitaire mis à jour.');
    }

    public function destroy(Request $request, UnitPrice $unitPrice): RedirectResponse
    {
        $this->authorizeCompany($request->user(), $unitPrice);

        $unitPrice->delete();

        return redirect()->route('unit_prices.index')
            ->with('success', 'Prix unitaire supprimé.');
    }

    /** Validation partagée création/mise à jour. */
    private function validateData(Request $request, ?UnitPrice $unitPrice = null): array
    {
        $companyId = $request->user()->company_id;

        return $request->validate([
            'code'        => ['required', 'string', 'max:50', Rule::unique('unit_prices')->where('company_id', $companyId)->ignore($unitPrice?->id)],
            'designation' => ['required', 'string', 'max:255'],
            'unit'        => ['required', Rule::in(UnitPrice::UNITS)],
            'category'    => ['required', Rule::in(UnitPrice::CATEGORIES)],
            'unit_price'  => ['required', 'numeric', 'min:0'],
            'currency'    => ['required', 'string', 'size:3'],
            'is_active'   => ['boolean'],
        ]);
    }

    /** Empêche l'accès à un prix unitaire d'une autre entreprise. */
    private function authorizeCompany(User $user, UnitPrice $unitPrice): void
    {
        abort_unless($unitPrice->company_id === $user->company_id, 403);
    }
}
