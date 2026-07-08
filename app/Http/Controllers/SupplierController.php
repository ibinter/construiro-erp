<?php

namespace App\Http\Controllers;

use App\Models\Supplier;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Gestion des fournisseurs.
 * Toutes les requêtes sont isolées par entreprise (multi-tenant) et
 * protégées par les permissions « suppliers.* » via le middleware de route.
 */
class SupplierController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();

        $suppliers = Supplier::forUser($user)
            ->when($request->string('search')->toString(), function ($query, $search) {
                $query->where(fn ($q) => $q
                    ->where('name', 'like', "%{$search}%")
                    ->orWhere('code', 'like', "%{$search}%")
                    ->orWhere('contact_name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('phone', 'like', "%{$search}%"));
            })
            ->when($request->string('category')->toString(), fn ($q, $category) => $q->where('category', $category))
            ->latest()
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('Suppliers/Index', [
            'suppliers'  => $suppliers,
            'filters'    => $request->only('search', 'category'),
            'categories' => Supplier::CATEGORIES,
            'can'        => [
                'create' => $user->can('suppliers.create'),
                'update' => $user->can('suppliers.update'),
                'delete' => $user->can('suppliers.delete'),
            ],
        ]);
    }

    public function create(Request $request): Response
    {
        return Inertia::render('Suppliers/Create', [
            'categories' => Supplier::CATEGORIES,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $this->validateData($request);
        $data['company_id'] = $request->user()->company_id;

        $supplier = Supplier::create($data);

        return redirect()->route('suppliers.show', $supplier)
            ->with('success', 'Fournisseur créé avec succès.');
    }

    public function show(Request $request, Supplier $supplier): Response
    {
        $this->authorizeCompany($request->user(), $supplier);

        return Inertia::render('Suppliers/Show', [
            'supplier' => $supplier,
            'can'      => [
                'update' => $request->user()->can('suppliers.update'),
                'delete' => $request->user()->can('suppliers.delete'),
            ],
        ]);
    }

    public function edit(Request $request, Supplier $supplier): Response
    {
        $this->authorizeCompany($request->user(), $supplier);

        return Inertia::render('Suppliers/Edit', [
            'supplier'   => $supplier,
            'categories' => Supplier::CATEGORIES,
        ]);
    }

    public function update(Request $request, Supplier $supplier): RedirectResponse
    {
        $this->authorizeCompany($request->user(), $supplier);

        $supplier->update($this->validateData($request, $supplier));

        return redirect()->route('suppliers.show', $supplier)
            ->with('success', 'Fournisseur mis à jour.');
    }

    public function destroy(Request $request, Supplier $supplier): RedirectResponse
    {
        $this->authorizeCompany($request->user(), $supplier);

        $supplier->delete();

        return redirect()->route('suppliers.index')
            ->with('success', 'Fournisseur supprimé.');
    }

    /** Validation partagée création/mise à jour. */
    private function validateData(Request $request, ?Supplier $supplier = null): array
    {
        $companyId = $request->user()->company_id;

        return $request->validate([
            'code'          => ['required', 'string', 'max:50', Rule::unique('suppliers')->where('company_id', $companyId)->ignore($supplier?->id)],
            'category'      => ['required', Rule::in(Supplier::CATEGORIES)],
            'name'          => ['required', 'string', 'max:255'],
            'contact_name'  => ['nullable', 'string', 'max:255'],
            'phone'         => ['nullable', 'string', 'max:50'],
            'email'         => ['nullable', 'email', 'max:255'],
            'address'       => ['nullable', 'string', 'max:255'],
            'city'          => ['nullable', 'string', 'max:120'],
            'tax_id'        => ['nullable', 'string', 'max:50'],
            'payment_terms' => ['nullable', 'string', 'max:100'],
            'notes'         => ['nullable', 'string'],
            'is_active'     => ['boolean'],
        ]);
    }

    /** Empêche l'accès à un fournisseur d'une autre entreprise. */
    private function authorizeCompany(User $user, Supplier $supplier): void
    {
        abort_unless($supplier->company_id === $user->company_id, 403);
    }
}
