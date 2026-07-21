<?php

namespace App\Http\Controllers;

use App\Models\Material;
use App\Models\Project;
use App\Models\PurchaseOrder;
use App\Models\Supplier;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Gestion des bons de commande (Achats).
 * Toutes les requêtes sont isolées par entreprise (multi-tenant) et
 * protégées par les permissions « purchases.* » via le middleware de route.
 */
class PurchaseController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();

        $orders = PurchaseOrder::forUser($user)
            ->with(['supplier:id,name', 'project:id,name'])
            ->when($request->string('search')->toString(), function ($query, $search) {
                $query->where('code', 'like', "%{$search}%");
            })
            ->when($request->string('status')->toString(), fn ($q, $status) => $q->where('status', $status))
            ->latest()
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('Purchases/Index', [
            'orders'   => $orders,
            'filters'  => $request->only('search', 'status'),
            'statuses' => PurchaseOrder::STATUSES,
            'can'      => [
                'create' => $user->can('purchases.create'),
                'update' => $user->can('purchases.update'),
                'delete' => $user->can('purchases.delete'),
            ],
        ]);
    }

    public function create(Request $request): Response
    {
        return Inertia::render('Purchases/Create', [
            'suppliers' => $this->suppliers($request->user()),
            'materials' => $this->materials($request->user()),
            'projects'  => $this->projects($request->user()),
            'statuses'  => PurchaseOrder::STATUSES,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $this->validateData($request);
        $companyId = $request->user()->company_id;

        $order = DB::transaction(function () use ($data, $companyId) {
            $lines = $data['lines'];
            unset($data['lines']);

            $data['company_id'] = $companyId;

            $order = PurchaseOrder::create($data);
            $this->syncLines($order, $lines);
            $order->recalculateTotals();

            return $order;
        });

        return redirect()->route('purchases.show', $order)
            ->with('success', 'Bon de commande créé avec succès.');
    }

    public function show(Request $request, PurchaseOrder $purchase): Response
    {
        $this->authorizeCompany($request->user(), $purchase);

        $purchase->load(['lines', 'supplier:id,name', 'project:id,name']);

        $totals = [
            'subtotal'   => (float) $purchase->subtotal,
            'tax_rate'   => (float) $purchase->tax_rate,
            'tax_amount' => (float) $purchase->tax_amount,
            'total'      => (float) $purchase->total,
        ];

        return Inertia::render('Purchases/Show', [
            'order'  => $purchase,
            'totals' => $totals,
            'can'    => [
                'update' => $request->user()->can('purchases.update'),
                'delete' => $request->user()->can('purchases.delete'),
            ],
        ]);
    }

    /**
     * Confirme le bon de commande (statut draft|sent → confirmed).
     */
    public function confirm(Request $request, PurchaseOrder $purchase): RedirectResponse
    {
        $this->authorizeCompany($request->user(), $purchase);

        abort_unless(
            in_array($purchase->status, ['draft', 'sent'], true),
            422,
            'Seul un bon de commande brouillon ou envoyé peut être confirmé.'
        );

        $purchase->status = 'confirmed';
        $purchase->save();

        return redirect()->route('purchases.show', $purchase)
            ->with('success', 'Bon de commande confirmé.');
    }

    /**
     * Marque le bon de commande comme reçu (statut confirmed → received).
     */
    public function markReceived(Request $request, PurchaseOrder $purchase): RedirectResponse
    {
        $this->authorizeCompany($request->user(), $purchase);

        abort_unless(
            $purchase->status === 'confirmed',
            422,
            'Seul un bon de commande confirmé peut être marqué comme reçu.'
        );

        $purchase->status = 'received';
        $purchase->save();

        return redirect()->route('purchases.show', $purchase)
            ->with('success', 'Livraison enregistrée. Bon de commande marqué comme reçu.');
    }

    public function edit(Request $request, PurchaseOrder $purchase): Response
    {
        $this->authorizeCompany($request->user(), $purchase);

        $purchase->load('lines');

        return Inertia::render('Purchases/Edit', [
            'order'     => $purchase,
            'suppliers' => $this->suppliers($request->user()),
            'materials' => $this->materials($request->user()),
            'projects'  => $this->projects($request->user()),
            'statuses'  => PurchaseOrder::STATUSES,
        ]);
    }

    public function update(Request $request, PurchaseOrder $purchase): RedirectResponse
    {
        $this->authorizeCompany($request->user(), $purchase);

        $data = $this->validateData($request, $purchase);

        DB::transaction(function () use ($purchase, $data) {
            $lines = $data['lines'];
            unset($data['lines']);

            $purchase->update($data);

            // Remplace intégralement les lignes existantes.
            $purchase->lines()->delete();
            $this->syncLines($purchase, $lines);

            $purchase->recalculateTotals();
        });

        return redirect()->route('purchases.show', $purchase)
            ->with('success', 'Bon de commande mis à jour.');
    }

    public function destroy(Request $request, PurchaseOrder $purchase): RedirectResponse
    {
        $this->authorizeCompany($request->user(), $purchase);

        $purchase->delete();

        return redirect()->route('purchases.index')
            ->with('success', 'Bon de commande supprimé.');
    }

    /** Crée les lignes du bon de commande en respectant leur ordre (position). */
    private function syncLines(PurchaseOrder $order, array $lines): void
    {
        foreach (array_values($lines) as $index => $line) {
            $order->lines()->create([
                'position'    => $index,
                'material_id' => $line['material_id'] ?? null,
                'designation' => $line['designation'],
                'unit'        => $line['unit'] ?? null,
                'quantity'    => $line['quantity'] ?? 1,
                'unit_price'  => $line['unit_price'] ?? 0,
            ]);
        }
    }

    /** Validation partagée création/mise à jour (entête + lignes). */
    private function validateData(Request $request, ?PurchaseOrder $order = null): array
    {
        $companyId = $request->user()->company_id;

        return $request->validate([
            'code'          => ['required', 'string', 'max:50', Rule::unique('purchase_orders')->where('company_id', $companyId)->ignore($order?->id)],
            'supplier_id'   => ['required', 'integer', Rule::exists('suppliers', 'id')->where('company_id', $companyId)],
            'project_id'    => ['nullable', 'integer', Rule::exists('projects', 'id')->where('company_id', $companyId)],
            'status'        => ['required', Rule::in(PurchaseOrder::STATUSES)],
            'currency'      => ['required', 'string', 'size:3'],
            'tax_rate'      => ['required', 'numeric', 'min:0', 'max:100'],
            'order_date'    => ['nullable', 'date'],
            'expected_date' => ['nullable', 'date', 'after_or_equal:order_date'],
            'notes'         => ['nullable', 'string'],

            'lines'                => ['required', 'array', 'min:1'],
            'lines.*.material_id'  => ['nullable', 'integer', Rule::exists('materials', 'id')->where('company_id', $companyId)],
            'lines.*.designation'  => ['required', 'string', 'max:255'],
            'lines.*.unit'         => ['nullable', 'string', 'max:20'],
            'lines.*.quantity'     => ['required', 'numeric', 'min:0'],
            'lines.*.unit_price'   => ['required', 'numeric', 'min:0'],
        ]);
    }

    /** Liste des fournisseurs de l'entreprise. */
    private function suppliers(User $user)
    {
        return Supplier::where('company_id', $user->company_id)
            ->orderBy('name')
            ->get(['id', 'name']);
    }

    /** Liste des matériaux de l'entreprise (pré-remplissage des lignes). */
    private function materials(User $user)
    {
        return Material::where('company_id', $user->company_id)
            ->orderBy('name')
            ->get(['id', 'name', 'unit', 'unit_price']);
    }

    /** Liste des projets de l'entreprise, candidats au rattachement. */
    private function projects(User $user)
    {
        return Project::where('company_id', $user->company_id)
            ->orderBy('name')
            ->get(['id', 'name']);
    }

    /** Empêche l'accès à un bon de commande d'une autre entreprise. */
    private function authorizeCompany(User $user, PurchaseOrder $order): void
    {
        abort_unless($order->company_id === $user->company_id, 403);
    }
}
