<?php

namespace App\Http\Controllers;

use App\Models\Client;
use App\Models\IncomingPayment;
use App\Models\Invoice;
use App\Models\Project;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Gestion des encaissements (trésorerie entrante).
 * Toutes les requêtes sont isolées par entreprise (multi-tenant) et
 * protégées par les permissions « incoming_payments.* » via le middleware de route.
 */
class IncomingPaymentController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();

        $query = IncomingPayment::forUser($user)
            ->with(['client:id,name', 'invoice:id,code', 'project:id,name'])
            ->when($request->string('search')->toString(), function ($q, $search) {
                $q->where(fn ($sub) => $sub
                    ->where('code', 'like', "%{$search}%")
                    ->orWhere('payer_name', 'like', "%{$search}%")
                    ->orWhere('reference', 'like', "%{$search}%")
                    ->orWhereHas('client', fn ($c) => $c->where('name', 'like', "%{$search}%")));
            })
            ->when($request->string('method')->toString(), fn ($q, $method) => $q->where('method', $method));

        // Total encaissé sur le périmètre filtré (avant pagination).
        $totalReceived = (clone $query)->sum('amount');

        $payments = $query->latest('date')->paginate(10)->withQueryString();

        return Inertia::render('IncomingPayments/Index', [
            'payments'      => $payments,
            'filters'       => $request->only('search', 'method'),
            'methods'       => IncomingPayment::METHODS,
            'totalReceived' => $totalReceived,
            'can'           => [
                'create' => $user->can('incoming_payments.create'),
                'update' => $user->can('incoming_payments.update'),
                'delete' => $user->can('incoming_payments.delete'),
            ],
        ]);
    }

    public function create(Request $request): Response
    {
        return Inertia::render('IncomingPayments/Create', [
            'clients'  => $this->clients($request->user()),
            'invoices' => $this->openInvoices($request->user()),
            'projects' => $this->projects($request->user()),
            'methods'  => IncomingPayment::METHODS,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $this->validateData($request);
        $data['company_id'] = $request->user()->company_id;

        $payment = IncomingPayment::create($data);

        return redirect()->route('incoming-payments.show', $payment)
            ->with('success', 'Encaissement enregistré avec succès.');
    }

    public function show(Request $request, IncomingPayment $incomingPayment): Response
    {
        $this->authorizeCompany($request->user(), $incomingPayment);

        $incomingPayment->load(['client:id,name', 'invoice:id,code', 'project:id,name']);

        return Inertia::render('IncomingPayments/Show', [
            'payment' => $incomingPayment,
            'can'     => [
                'update' => $request->user()->can('incoming_payments.update'),
                'delete' => $request->user()->can('incoming_payments.delete'),
            ],
        ]);
    }

    public function edit(Request $request, IncomingPayment $incomingPayment): Response
    {
        $this->authorizeCompany($request->user(), $incomingPayment);

        return Inertia::render('IncomingPayments/Edit', [
            'payment'  => $incomingPayment,
            'clients'  => $this->clients($request->user()),
            'invoices' => $this->openInvoices($request->user()),
            'projects' => $this->projects($request->user()),
            'methods'  => IncomingPayment::METHODS,
        ]);
    }

    public function update(Request $request, IncomingPayment $incomingPayment): RedirectResponse
    {
        $this->authorizeCompany($request->user(), $incomingPayment);

        $data = $this->validateData($request, $incomingPayment);
        $incomingPayment->update($data);

        return redirect()->route('incoming-payments.show', $incomingPayment)
            ->with('success', 'Encaissement mis à jour.');
    }

    public function destroy(Request $request, IncomingPayment $incomingPayment): RedirectResponse
    {
        $this->authorizeCompany($request->user(), $incomingPayment);

        $incomingPayment->delete();

        return redirect()->route('incoming-payments.index')
            ->with('success', 'Encaissement supprimé.');
    }

    /** Validation partagée création / mise à jour. */
    private function validateData(Request $request, ?IncomingPayment $payment = null): array
    {
        $companyId = $request->user()->company_id;

        return $request->validate([
            'code'       => ['required', 'string', 'max:50', Rule::unique('incoming_payments')->where('company_id', $companyId)->ignore($payment?->id)],
            'client_id'  => ['nullable', 'integer', Rule::exists('clients', 'id')->where('company_id', $companyId)],
            'invoice_id' => ['nullable', 'integer', Rule::exists('invoices', 'id')->where('company_id', $companyId)],
            'project_id' => ['nullable', 'integer', Rule::exists('projects', 'id')->where('company_id', $companyId)],
            'payer_name' => ['nullable', 'string', 'max:150'],
            'amount'     => ['required', 'numeric', 'min:0.01'],
            'currency'   => ['required', 'string', 'size:3'],
            'method'     => ['required', Rule::in(IncomingPayment::METHODS)],
            'date'       => ['required', 'date'],
            'reference'  => ['nullable', 'string', 'max:100'],
            'notes'      => ['nullable', 'string'],
        ]);
    }

    /** Liste des clients de l'entreprise, candidats au rattachement. */
    private function clients(User $user)
    {
        return Client::where('company_id', $user->company_id)
            ->orderBy('name')
            ->get(['id', 'name']);
    }

    /** Factures non soldées de l'entreprise (candidates à un encaissement). */
    private function openInvoices(User $user)
    {
        return Invoice::where('company_id', $user->company_id)
            ->whereNotIn('status', ['paid', 'cancelled'])
            ->orderByDesc('issue_date')
            ->get(['id', 'code', 'client_id', 'total', 'amount_paid', 'currency']);
    }

    /** Liste des projets de l'entreprise, candidats au rattachement. */
    private function projects(User $user)
    {
        return Project::where('company_id', $user->company_id)
            ->orderBy('name')
            ->get(['id', 'name']);
    }

    /** Empêche l'accès à un encaissement d'une autre entreprise. */
    private function authorizeCompany(User $user, IncomingPayment $payment): void
    {
        abort_unless($payment->company_id === $user->company_id, 403);
    }
}
