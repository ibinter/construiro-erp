<?php

namespace App\Http\Controllers;

use App\Models\OutgoingPayment;
use App\Models\Project;
use App\Models\PurchaseOrder;
use App\Models\Supplier;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Gestion des décaissements (trésorerie sortante).
 * Toutes les requêtes sont isolées par entreprise (multi-tenant) et
 * protégées par les permissions « outgoing_payments.* » via le middleware de route.
 */
class OutgoingPaymentController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();

        $query = OutgoingPayment::forUser($user)
            ->with(['supplier:id,name', 'purchaseOrder:id,code', 'project:id,name'])
            ->when($request->string('search')->toString(), function ($q, $search) {
                $q->where(fn ($sub) => $sub
                    ->where('code', 'like', "%{$search}%")
                    ->orWhere('payee_name', 'like', "%{$search}%")
                    ->orWhere('reference', 'like', "%{$search}%")
                    ->orWhereHas('supplier', fn ($s) => $s->where('name', 'like', "%{$search}%")));
            })
            ->when($request->string('category')->toString(), fn ($q, $category) => $q->where('category', $category))
            ->when($request->string('method')->toString(), fn ($q, $method) => $q->where('method', $method));

        // Total décaissé sur le périmètre filtré (avant pagination).
        $totalPaid = (clone $query)->sum('amount');

        $payments = $query->latest('date')->paginate(10)->withQueryString();

        return Inertia::render('OutgoingPayments/Index', [
            'payments'   => $payments,
            'filters'    => $request->only('search', 'category', 'method'),
            'categories' => OutgoingPayment::CATEGORIES,
            'methods'    => OutgoingPayment::METHODS,
            'totalPaid'  => $totalPaid,
            'can'        => [
                'create' => $user->can('outgoing_payments.create'),
                'update' => $user->can('outgoing_payments.update'),
                'delete' => $user->can('outgoing_payments.delete'),
            ],
        ]);
    }

    public function create(Request $request): Response
    {
        return Inertia::render('OutgoingPayments/Create', [
            'suppliers'      => $this->suppliers($request->user()),
            'purchaseOrders' => $this->purchaseOrders($request->user()),
            'projects'       => $this->projects($request->user()),
            'categories'     => OutgoingPayment::CATEGORIES,
            'methods'        => OutgoingPayment::METHODS,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $this->validateData($request);
        $data['company_id'] = $request->user()->company_id;

        $payment = OutgoingPayment::create($data);

        return redirect()->route('outgoing-payments.show', $payment)
            ->with('success', 'Décaissement enregistré avec succès.');
    }

    public function show(Request $request, OutgoingPayment $outgoingPayment): Response
    {
        $this->authorizeCompany($request->user(), $outgoingPayment);

        $outgoingPayment->load(['supplier:id,name', 'purchaseOrder:id,code', 'project:id,name']);

        return Inertia::render('OutgoingPayments/Show', [
            'payment' => $outgoingPayment,
            'can'     => [
                'update' => $request->user()->can('outgoing_payments.update'),
                'delete' => $request->user()->can('outgoing_payments.delete'),
            ],
        ]);
    }

    public function edit(Request $request, OutgoingPayment $outgoingPayment): Response
    {
        $this->authorizeCompany($request->user(), $outgoingPayment);

        return Inertia::render('OutgoingPayments/Edit', [
            'payment'        => $outgoingPayment,
            'suppliers'      => $this->suppliers($request->user()),
            'purchaseOrders' => $this->purchaseOrders($request->user()),
            'projects'       => $this->projects($request->user()),
            'categories'     => OutgoingPayment::CATEGORIES,
            'methods'        => OutgoingPayment::METHODS,
        ]);
    }

    public function update(Request $request, OutgoingPayment $outgoingPayment): RedirectResponse
    {
        $this->authorizeCompany($request->user(), $outgoingPayment);

        $data = $this->validateData($request, $outgoingPayment);
        $outgoingPayment->update($data);

        return redirect()->route('outgoing-payments.show', $outgoingPayment)
            ->with('success', 'Décaissement mis à jour.');
    }

    public function destroy(Request $request, OutgoingPayment $outgoingPayment): RedirectResponse
    {
        $this->authorizeCompany($request->user(), $outgoingPayment);

        $outgoingPayment->delete();

        return redirect()->route('outgoing-payments.index')
            ->with('success', 'Décaissement supprimé.');
    }

    /** Validation partagée création / mise à jour. */
    private function validateData(Request $request, ?OutgoingPayment $payment = null): array
    {
        $companyId = $request->user()->company_id;

        return $request->validate([
            'code'              => ['required', 'string', 'max:50', Rule::unique('outgoing_payments')->where('company_id', $companyId)->ignore($payment?->id)],
            'supplier_id'       => ['nullable', 'integer', Rule::exists('suppliers', 'id')->where('company_id', $companyId)],
            'purchase_order_id' => ['nullable', 'integer', Rule::exists('purchase_orders', 'id')->where('company_id', $companyId)],
            'project_id'        => ['nullable', 'integer', Rule::exists('projects', 'id')->where('company_id', $companyId)],
            'payee_name'        => ['nullable', 'string', 'max:150'],
            'amount'            => ['required', 'numeric', 'min:0.01'],
            'currency'          => ['required', 'string', 'size:3'],
            'category'          => ['required', Rule::in(OutgoingPayment::CATEGORIES)],
            'method'            => ['required', Rule::in(OutgoingPayment::METHODS)],
            'date'              => ['required', 'date'],
            'reference'         => ['nullable', 'string', 'max:100'],
            'notes'             => ['nullable', 'string'],
        ]);
    }

    /** Liste des fournisseurs de l'entreprise. */
    private function suppliers(User $user)
    {
        return Supplier::where('company_id', $user->company_id)
            ->orderBy('name')
            ->get(['id', 'name']);
    }

    /** Bons de commande de l'entreprise (candidats à un décaissement). */
    private function purchaseOrders(User $user)
    {
        return PurchaseOrder::where('company_id', $user->company_id)
            ->whereNot('status', 'cancelled')
            ->orderByDesc('order_date')
            ->get(['id', 'code', 'supplier_id', 'total', 'currency']);
    }

    /** Liste des projets de l'entreprise, candidats au rattachement. */
    private function projects(User $user)
    {
        return Project::where('company_id', $user->company_id)
            ->orderBy('name')
            ->get(['id', 'name']);
    }

    /** Empêche l'accès à un décaissement d'une autre entreprise. */
    private function authorizeCompany(User $user, OutgoingPayment $payment): void
    {
        abort_unless($payment->company_id === $user->company_id, 403);
    }
}
