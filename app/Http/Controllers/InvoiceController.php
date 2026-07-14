<?php

namespace App\Http\Controllers;

use App\Models\Client;
use App\Models\Invoice;
use App\Models\Project;
use App\Models\User;
use App\Services\NotificationService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Gestion des factures (Facturation).
 * Toutes les requêtes sont isolées par entreprise (multi-tenant) et
 * protégées par les permissions « invoicing.* » via le middleware de route.
 */
class InvoiceController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();

        $invoices = Invoice::forUser($user)
            ->with(['client:id,name', 'project:id,name'])
            ->when($request->string('search')->toString(), function ($query, $search) {
                $query->where(fn ($q) => $q
                    ->where('code', 'like', "%{$search}%")
                    ->orWhereHas('client', fn ($c) => $c->where('name', 'like', "%{$search}%")));
            })
            ->when($request->string('status')->toString(), fn ($q, $status) => $q->where('status', $status))
            ->latest()
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('Invoices/Index', [
            'invoices' => $invoices,
            'filters'  => $request->only('search', 'status'),
            'statuses' => Invoice::STATUSES,
            'can'      => [
                'create' => $user->can('invoicing.create'),
                'update' => $user->can('invoicing.update'),
                'delete' => $user->can('invoicing.delete'),
                'export' => $user->can('invoicing.export'),
            ],
        ]);
    }

    public function create(Request $request): Response
    {
        return Inertia::render('Invoices/Create', [
            'clients'  => $this->clients($request->user()),
            'projects' => $this->projects($request->user()),
            'statuses' => Invoice::STATUSES,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $this->validateData($request);
        $companyId = $request->user()->company_id;

        $invoice = DB::transaction(function () use ($data, $companyId) {
            $lines = $data['lines'];
            unset($data['lines']);

            $data['company_id'] = $companyId;

            $invoice = Invoice::create($data);
            $this->syncLines($invoice, $lines);
            $invoice->recalculateTotals();

            return $invoice;
        });

        NotificationService::send(
            companyId: $request->user()->company_id,
            userId:    null,
            type:      'invoice_due',
            title:     'Nouvelle facture créée',
            body:      "La facture {$invoice->code} a été enregistrée.",
            link:      route('invoices.show', $invoice),
        );

        return redirect()->route('invoices.show', $invoice)
            ->with('success', 'Facture créée avec succès.');
    }

    public function show(Request $request, Invoice $invoice): Response
    {
        $this->authorizeCompany($request->user(), $invoice);

        $invoice->load(['lines', 'client:id,name', 'project:id,name']);

        return Inertia::render('Invoices/Show', [
            'invoice' => $invoice,
            'can'     => [
                'update' => $request->user()->can('invoicing.update'),
                'delete' => $request->user()->can('invoicing.delete'),
            ],
        ]);
    }

    public function edit(Request $request, Invoice $invoice): Response
    {
        $this->authorizeCompany($request->user(), $invoice);

        $invoice->load('lines');

        return Inertia::render('Invoices/Edit', [
            'invoice'  => $invoice,
            'clients'  => $this->clients($request->user()),
            'projects' => $this->projects($request->user()),
            'statuses' => Invoice::STATUSES,
        ]);
    }

    public function update(Request $request, Invoice $invoice): RedirectResponse
    {
        $this->authorizeCompany($request->user(), $invoice);

        $data = $this->validateData($request, $invoice);

        DB::transaction(function () use ($invoice, $data) {
            $lines = $data['lines'];
            unset($data['lines']);

            $invoice->update($data);

            // Remplace intégralement les lignes existantes.
            $invoice->lines()->delete();
            $this->syncLines($invoice, $lines);

            $invoice->recalculateTotals();
        });

        return redirect()->route('invoices.show', $invoice)
            ->with('success', 'Facture mise à jour.');
    }

    public function destroy(Request $request, Invoice $invoice): RedirectResponse
    {
        $this->authorizeCompany($request->user(), $invoice);

        $invoice->delete();

        return redirect()->route('invoices.index')
            ->with('success', 'Facture supprimée.');
    }

    /**
     * Enregistre un encaissement sur la facture : incrémente amount_paid puis
     * met à jour le statut (paid si soldée, partial si partiellement payée).
     * Le montant doit être strictement positif et ne pas dépasser le reste à payer.
     */
    public function registerPayment(Request $request, Invoice $invoice): RedirectResponse
    {
        $this->authorizeCompany($request->user(), $invoice);

        $balance = (float) $invoice->total - (float) $invoice->amount_paid;

        $data = $request->validate([
            'amount' => ['required', 'numeric', 'min:0.01', 'max:'.max(0, $balance)],
        ]);

        $invoice->amount_paid = (float) $invoice->amount_paid + (float) $data['amount'];

        // Statut déduit du solde restant.
        $invoice->status = ((float) $invoice->amount_paid >= (float) $invoice->total)
            ? 'paid'
            : 'partial';

        $invoice->save();

        return redirect()->route('invoices.show', $invoice)
            ->with('success', 'Paiement enregistré.');
    }

    /** Crée les lignes de la facture en respectant leur ordre (position). */
    private function syncLines(Invoice $invoice, array $lines): void
    {
        foreach (array_values($lines) as $index => $line) {
            $invoice->lines()->create([
                'position'    => $index,
                'designation' => $line['designation'],
                'unit'        => $line['unit'] ?? null,
                'quantity'    => $line['quantity'] ?? 1,
                'unit_price'  => $line['unit_price'] ?? 0,
            ]);
        }
    }

    /** Validation partagée création/mise à jour (entête + lignes). */
    private function validateData(Request $request, ?Invoice $invoice = null): array
    {
        $companyId = $request->user()->company_id;

        return $request->validate([
            'code'       => ['required', 'string', 'max:50', Rule::unique('invoices')->where('company_id', $companyId)->ignore($invoice?->id)],
            'status'     => ['required', Rule::in(Invoice::STATUSES)],
            'currency'   => ['required', 'string', 'size:3'],
            'tax_rate'   => ['required', 'numeric', 'min:0', 'max:100'],
            'client_id'  => ['nullable', 'integer', Rule::exists('clients', 'id')->where('company_id', $companyId)],
            'project_id' => ['nullable', 'integer', Rule::exists('projects', 'id')->where('company_id', $companyId)],
            'issue_date' => ['nullable', 'date'],
            'due_date'   => ['nullable', 'date', 'after_or_equal:issue_date'],
            'notes'      => ['nullable', 'string'],

            'lines'               => ['required', 'array', 'min:1'],
            'lines.*.designation' => ['required', 'string', 'max:255'],
            'lines.*.unit'        => ['nullable', 'string', 'max:20'],
            'lines.*.quantity'    => ['required', 'numeric', 'min:0'],
            'lines.*.unit_price'  => ['required', 'numeric', 'min:0'],
        ]);
    }

    /** Liste des clients de l'entreprise, candidats au rattachement. */
    private function clients(User $user)
    {
        return Client::where('company_id', $user->company_id)
            ->orderBy('name')
            ->get(['id', 'name']);
    }

    /** Liste des projets de l'entreprise, candidats au rattachement. */
    private function projects(User $user)
    {
        return Project::where('company_id', $user->company_id)
            ->orderBy('name')
            ->get(['id', 'name']);
    }

    /** Empêche l'accès à une facture d'une autre entreprise. */
    private function authorizeCompany(User $user, Invoice $invoice): void
    {
        abort_unless($invoice->company_id === $user->company_id, 403);
    }
}
