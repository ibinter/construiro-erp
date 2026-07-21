<?php

namespace App\Http\Controllers;

use App\Models\Budget;
use App\Models\BudgetLine;
use App\Models\Client;
use App\Models\Contract;
use App\Models\Employee;
use App\Models\Equipment;
use App\Models\Invoice;
use App\Models\Material;
use App\Models\Payslip;
use App\Models\Project;
use App\Models\PurchaseOrder;
use App\Models\Quote;
use App\Models\Subcontractor;
use App\Models\Supplier;
use App\Models\TreasuryTransaction;
use App\Services\Pdf\PdfTableExportService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Schema;
use Symfony\Component\HttpFoundation\StreamedResponse;

/**
 * Exports PDF de liste adaptatifs pour tous les modules CONSTRUIRO.
 * Utilise PdfTableExportService pour la composition documentaire automatique.
 */
class PdfListController extends Controller
{
    public function projects(Request $request): StreamedResponse
    {
        $user = $request->user();
        abort_unless($user->can('projects.view'), 403);

        $rows = Project::forUser($user)
            ->with('manager:id,name')
            ->latest()
            ->get()
            ->map(fn(Project $p) => [
                'code'       => $p->code,
                'name'       => $p->name,
                'client'     => $p->client_name,
                'type'       => $p->type,
                'status'     => $p->status,
                'budget'     => $p->budget_amount ? number_format((float)$p->budget_amount, 0, ',', ' ') . ' ' . $p->currency : '—',
                'progress'   => $p->progress ? $p->progress . '%' : '—',
                'start_date' => $p->start_date ? \Carbon\Carbon::parse($p->start_date)->format('d/m/Y') : '—',
                'end_date'   => $p->end_date   ? \Carbon\Carbon::parse($p->end_date)->format('d/m/Y')   : '—',
            ])->toArray();

        return PdfTableExportService::export(
            title:      'Liste des Projets',
            columnDefs: [
                ['key' => 'code',       'label' => 'Code',        'type' => 'code',       'priority' => 'essential', 'nowrap' => true],
                ['key' => 'name',       'label' => 'Nom',         'type' => 'name',       'priority' => 'essential'],
                ['key' => 'client',     'label' => 'Client',      'type' => 'name',       'priority' => 'essential'],
                ['key' => 'type',       'label' => 'Type',        'type' => 'status',     'priority' => 'important'],
                ['key' => 'status',     'label' => 'Statut',      'type' => 'status',     'priority' => 'essential'],
                ['key' => 'budget',     'label' => 'Budget',      'type' => 'amount',     'priority' => 'important', 'nowrap' => true],
                ['key' => 'progress',   'label' => 'Avanc.',      'type' => 'percentage', 'priority' => 'important', 'nowrap' => true],
                ['key' => 'start_date', 'label' => 'Début',       'type' => 'date',       'priority' => 'secondary', 'nowrap' => true],
                ['key' => 'end_date',   'label' => 'Fin',         'type' => 'date',       'priority' => 'secondary', 'nowrap' => true],
            ],
            rows:    $rows,
            company: $user->company,
            user:    $user,
            options: ['filename' => 'Projets-' . now()->format('Y-m-d') . '.pdf'],
        );
    }

    public function clients(Request $request): StreamedResponse
    {
        $user = $request->user();
        abort_unless($user->can('clients.view'), 403);

        $rows = Client::forUser($user)
            ->orderBy('name')
            ->get()
            ->map(fn(Client $c) => [
                'code'    => $c->code,
                'name'    => $c->name,
                'type'    => $c->type,
                'contact' => $c->contact_name,
                'phone'   => $c->phone,
                'email'   => $c->email,
                'city'    => $c->city,
            ])->toArray();

        return PdfTableExportService::export(
            title:      'Liste des Clients',
            columnDefs: [
                ['key' => 'code',    'label' => 'Code',    'type' => 'code',   'priority' => 'essential', 'nowrap' => true],
                ['key' => 'name',    'label' => 'Nom',     'type' => 'name',   'priority' => 'essential'],
                ['key' => 'type',    'label' => 'Type',    'type' => 'status', 'priority' => 'important'],
                ['key' => 'contact', 'label' => 'Contact', 'type' => 'name',   'priority' => 'important'],
                ['key' => 'phone',   'label' => 'Tél.',    'type' => 'phone',  'priority' => 'important', 'nowrap' => true],
                ['key' => 'email',   'label' => 'Email',   'type' => 'email',  'priority' => 'secondary'],
                ['key' => 'city',    'label' => 'Ville',   'type' => 'short_text', 'priority' => 'secondary'],
            ],
            rows:    $rows,
            company: $user->company,
            user:    $user,
            options: ['filename' => 'Clients-' . now()->format('Y-m-d') . '.pdf'],
        );
    }

    public function quotes(Request $request): StreamedResponse
    {
        $user = $request->user();
        abort_unless($user->can('quotes.view'), 403);

        $rows = Quote::forUser($user)
            ->with('project:id,name')
            ->latest()
            ->get()
            ->map(fn(Quote $q) => [
                'code'    => $q->code,
                'title'   => $q->title,
                'client'  => $q->client_name,
                'status'  => $q->status,
                'total'   => $q->total   ? number_format((float)$q->total, 0, ',', ' ') . ' ' . $q->currency : '—',
                'date'    => $q->date        ? \Carbon\Carbon::parse($q->date)->format('d/m/Y')        : '—',
                'valid'   => $q->valid_until ? \Carbon\Carbon::parse($q->valid_until)->format('d/m/Y') : '—',
                'project' => $q->project?->name ?? '—',
            ])->toArray();

        return PdfTableExportService::export(
            title:      'Liste des Devis',
            columnDefs: [
                ['key' => 'code',   'label' => 'Code',    'type' => 'code',   'priority' => 'essential', 'nowrap' => true],
                ['key' => 'title',  'label' => 'Objet',   'type' => 'name',   'priority' => 'essential'],
                ['key' => 'client', 'label' => 'Client',  'type' => 'name',   'priority' => 'essential'],
                ['key' => 'status', 'label' => 'Statut',  'type' => 'status', 'priority' => 'essential'],
                ['key' => 'total',  'label' => 'Total',   'type' => 'amount', 'priority' => 'important', 'nowrap' => true],
                ['key' => 'date',   'label' => 'Date',    'type' => 'date',   'priority' => 'important', 'nowrap' => true],
                ['key' => 'valid',  'label' => 'Validité','type' => 'date',   'priority' => 'secondary', 'nowrap' => true],
                ['key' => 'project','label' => 'Projet',  'type' => 'short_text', 'priority' => 'secondary'],
            ],
            rows:    $rows,
            company: $user->company,
            user:    $user,
            options: ['filename' => 'Devis-' . now()->format('Y-m-d') . '.pdf'],
        );
    }

    public function invoices(Request $request): StreamedResponse
    {
        $user = $request->user();
        abort_unless($user->can('invoicing.view'), 403);
        abort_unless(class_exists(Invoice::class) && Schema::hasTable('invoices'), 404);

        $rows = Invoice::forUser($user)
            ->with('client:id,name')
            ->latest()
            ->get()
            ->map(fn(Invoice $i) => [
                'code'       => $i->code,
                'client'     => $i->client?->name ?? '—',
                'status'     => $i->status,
                'total'      => $i->total      ? number_format((float)$i->total, 0, ',', ' ')      . ' ' . ($i->currency ?? '') : '—',
                'paid'       => $i->amount_paid ? number_format((float)$i->amount_paid, 0, ',', ' ') . ' ' . ($i->currency ?? '') : '—',
                'balance'    => $i->balance     ? number_format((float)$i->balance, 0, ',', ' ')     . ' ' . ($i->currency ?? '') : '—',
                'issue_date' => $i->issue_date ? \Carbon\Carbon::parse($i->issue_date)->format('d/m/Y') : '—',
                'due_date'   => $i->due_date   ? \Carbon\Carbon::parse($i->due_date)->format('d/m/Y')   : '—',
            ])->toArray();

        return PdfTableExportService::export(
            title:      'Liste des Factures',
            columnDefs: [
                ['key' => 'code',       'label' => 'Code',     'type' => 'code',   'priority' => 'essential', 'nowrap' => true],
                ['key' => 'client',     'label' => 'Client',   'type' => 'name',   'priority' => 'essential'],
                ['key' => 'status',     'label' => 'Statut',   'type' => 'status', 'priority' => 'essential'],
                ['key' => 'total',      'label' => 'Total',    'type' => 'amount', 'priority' => 'essential', 'nowrap' => true],
                ['key' => 'paid',       'label' => 'Payé',     'type' => 'amount', 'priority' => 'important', 'nowrap' => true],
                ['key' => 'balance',    'label' => 'Reste',    'type' => 'amount', 'priority' => 'important', 'nowrap' => true],
                ['key' => 'issue_date', 'label' => 'Émission', 'type' => 'date',   'priority' => 'important', 'nowrap' => true],
                ['key' => 'due_date',   'label' => 'Échéance', 'type' => 'date',   'priority' => 'secondary', 'nowrap' => true],
            ],
            rows:    $rows,
            company: $user->company,
            user:    $user,
            options: ['filename' => 'Factures-' . now()->format('Y-m-d') . '.pdf'],
        );
    }

    public function employees(Request $request): StreamedResponse
    {
        $user = $request->user();
        abort_unless($user->can('hr.view'), 403);
        abort_unless(class_exists(Employee::class) && Schema::hasTable('employees'), 404);

        $rows = Employee::forUser($user)
            ->orderBy('last_name')
            ->get()
            ->map(fn(Employee $e) => [
                'matricule'  => $e->matricule,
                'full_name'  => $e->full_name,
                'job_title'  => $e->job_title,
                'department' => $e->department,
                'contract'   => $e->contract_type,
                'salary'     => $e->base_salary ? number_format((float)$e->base_salary, 0, ',', ' ') : '—',
                'status'     => $e->status,
            ])->toArray();

        return PdfTableExportService::export(
            title:      'Liste des Employés',
            columnDefs: [
                ['key' => 'matricule',  'label' => 'Matricule',   'type' => 'code',       'priority' => 'essential', 'nowrap' => true],
                ['key' => 'full_name',  'label' => 'Nom complet', 'type' => 'name',       'priority' => 'essential'],
                ['key' => 'job_title',  'label' => 'Poste',       'type' => 'short_text', 'priority' => 'essential'],
                ['key' => 'department', 'label' => 'Département', 'type' => 'short_text', 'priority' => 'important'],
                ['key' => 'contract',   'label' => 'Contrat',     'type' => 'status',     'priority' => 'important'],
                ['key' => 'salary',     'label' => 'Salaire',     'type' => 'amount',     'priority' => 'secondary', 'nowrap' => true],
                ['key' => 'status',     'label' => 'Statut',      'type' => 'status',     'priority' => 'essential'],
            ],
            rows:    $rows,
            company: $user->company,
            user:    $user,
            options: ['filename' => 'Employes-' . now()->format('Y-m-d') . '.pdf'],
        );
    }

    public function contracts(Request $request): StreamedResponse
    {
        $user = $request->user();
        abort_unless($user->can('contracts.view'), 403);
        abort_unless(class_exists(Contract::class) && Schema::hasTable('contracts'), 404);

        $rows = Contract::forUser($user)
            ->with('project:id,name')
            ->latest()
            ->get()
            ->map(fn(Contract $c) => [
                'code'       => $c->code,
                'title'      => $c->title,
                'type'       => $c->type,
                'party'      => $c->party_name,
                'status'     => $c->status,
                'amount'     => $c->amount ? number_format((float)$c->amount, 0, ',', ' ') . ' ' . $c->currency : '—',
                'start_date' => $c->start_date ? \Carbon\Carbon::parse($c->start_date)->format('d/m/Y') : '—',
                'end_date'   => $c->end_date   ? \Carbon\Carbon::parse($c->end_date)->format('d/m/Y')   : '—',
                'project'    => $c->project?->name ?? '—',
            ])->toArray();

        return PdfTableExportService::export(
            title:      'Liste des Contrats',
            columnDefs: [
                ['key' => 'code',       'label' => 'Code',          'type' => 'code',       'priority' => 'essential', 'nowrap' => true],
                ['key' => 'title',      'label' => 'Objet',         'type' => 'name',       'priority' => 'essential'],
                ['key' => 'type',       'label' => 'Type',          'type' => 'status',     'priority' => 'important'],
                ['key' => 'party',      'label' => 'Cocontractant', 'type' => 'name',       'priority' => 'essential'],
                ['key' => 'status',     'label' => 'Statut',        'type' => 'status',     'priority' => 'essential'],
                ['key' => 'amount',     'label' => 'Montant',       'type' => 'amount',     'priority' => 'important', 'nowrap' => true],
                ['key' => 'start_date', 'label' => 'Début',         'type' => 'date',       'priority' => 'secondary', 'nowrap' => true],
                ['key' => 'end_date',   'label' => 'Fin',           'type' => 'date',       'priority' => 'secondary', 'nowrap' => true],
                ['key' => 'project',    'label' => 'Projet',        'type' => 'short_text', 'priority' => 'secondary'],
            ],
            rows:    $rows,
            company: $user->company,
            user:    $user,
            options: ['filename' => 'Contrats-' . now()->format('Y-m-d') . '.pdf'],
        );
    }

    public function stocks(Request $request): StreamedResponse
    {
        $user = $request->user();
        abort_unless($user->can('stocks.view'), 403);
        abort_unless(class_exists(Material::class) && Schema::hasTable('materials'), 404);

        $rows = Material::forUser($user)
            ->where('is_active', true)
            ->orderBy('name')
            ->get()
            ->map(fn(Material $m) => [
                'code'      => $m->code,
                'name'      => $m->name,
                'category'  => $m->category,
                'unit'      => $m->unit,
                'unit_price'=> $m->unit_price ? number_format((float)$m->unit_price, 0, ',', ' ') : '—',
                'min_stock' => $m->min_stock ?? '—',
                'stock'     => method_exists($m, 'currentStock') ? $m->currentStock() : '—',
            ])->toArray();

        return PdfTableExportService::export(
            title:      'État des Stocks',
            columnDefs: [
                ['key' => 'code',       'label' => 'Code',      'type' => 'code',       'priority' => 'essential', 'nowrap' => true],
                ['key' => 'name',       'label' => 'Matériau',  'type' => 'name',       'priority' => 'essential'],
                ['key' => 'category',   'label' => 'Catégorie', 'type' => 'short_text', 'priority' => 'important'],
                ['key' => 'unit',       'label' => 'Unité',     'type' => 'status',     'priority' => 'important', 'nowrap' => true],
                ['key' => 'unit_price', 'label' => 'Prix réf.', 'type' => 'amount',     'priority' => 'secondary', 'nowrap' => true],
                ['key' => 'min_stock',  'label' => 'Seuil min', 'type' => 'number',     'priority' => 'secondary', 'nowrap' => true],
                ['key' => 'stock',      'label' => 'Stock act.','type' => 'number',     'priority' => 'essential', 'nowrap' => true],
            ],
            rows:    $rows,
            company: $user->company,
            user:    $user,
            options: ['filename' => 'Stocks-' . now()->format('Y-m-d') . '.pdf'],
        );
    }

    public function suppliers(Request $request): StreamedResponse
    {
        $user = $request->user();
        abort_unless($user->can('suppliers.view'), 403);
        abort_unless(Schema::hasTable('suppliers'), 404);

        $rows = Supplier::forUser($user)
            ->orderBy('name')
            ->get()
            ->map(fn(Supplier $s) => [
                'name'     => $s->name,
                'category' => $s->category ?? '—',
                'contact'  => $s->contact_name ?? '—',
                'email'    => $s->email ?? '—',
                'phone'    => $s->phone ?? '—',
                'city'     => $s->city ?? '—',
                'country'  => $s->country ?? '—',
                'status'   => $s->is_active ? 'Actif' : 'Inactif',
            ])->toArray();

        return PdfTableExportService::export(
            title:      'Liste des Fournisseurs',
            columnDefs: [
                ['key' => 'name',     'label' => 'Nom',        'type' => 'name',       'priority' => 'essential'],
                ['key' => 'category', 'label' => 'Catégorie',  'type' => 'status',     'priority' => 'important'],
                ['key' => 'contact',  'label' => 'Contact',    'type' => 'name',       'priority' => 'important'],
                ['key' => 'email',    'label' => 'Email',      'type' => 'email',      'priority' => 'secondary'],
                ['key' => 'phone',    'label' => 'Téléphone',  'type' => 'phone',      'priority' => 'important', 'nowrap' => true],
                ['key' => 'city',     'label' => 'Ville',      'type' => 'short_text', 'priority' => 'secondary'],
                ['key' => 'country',  'label' => 'Pays',       'type' => 'short_text', 'priority' => 'secondary'],
                ['key' => 'status',   'label' => 'Statut',     'type' => 'status',     'priority' => 'essential'],
            ],
            rows:    $rows,
            company: $user->company,
            user:    $user,
            options: ['filename' => 'Fournisseurs-' . now()->format('Y-m-d') . '.pdf'],
        );
    }

    public function subcontractors(Request $request): StreamedResponse
    {
        $user = $request->user();
        abort_unless($user->can('subcontractors.view'), 403);
        abort_unless(Schema::hasTable('subcontractors'), 404);

        $rows = Subcontractor::forUser($user)
            ->orderBy('name')
            ->get()
            ->map(fn(Subcontractor $s) => [
                'name'      => $s->name,
                'specialty' => $s->specialty ?? '—',
                'contact'   => $s->contact_name ?? '—',
                'email'     => $s->email ?? '—',
                'phone'     => $s->phone ?? '—',
                'status'    => $s->is_active ? 'Actif' : 'Inactif',
            ])->toArray();

        return PdfTableExportService::export(
            title:      'Liste des Sous-traitants',
            columnDefs: [
                ['key' => 'name',      'label' => 'Nom',          'type' => 'name',   'priority' => 'essential'],
                ['key' => 'specialty', 'label' => 'Spécialité',   'type' => 'status', 'priority' => 'important'],
                ['key' => 'contact',   'label' => 'Contact',      'type' => 'name',   'priority' => 'important'],
                ['key' => 'email',     'label' => 'Email',        'type' => 'email',  'priority' => 'secondary'],
                ['key' => 'phone',     'label' => 'Téléphone',    'type' => 'phone',  'priority' => 'important', 'nowrap' => true],
                ['key' => 'status',    'label' => 'Statut',       'type' => 'status', 'priority' => 'essential'],
            ],
            rows:    $rows,
            company: $user->company,
            user:    $user,
            options: ['filename' => 'Sous-traitants-' . now()->format('Y-m-d') . '.pdf'],
        );
    }

    public function equipment(Request $request): StreamedResponse
    {
        $user = $request->user();
        abort_unless($user->can('equipment.view'), 403);
        abort_unless(class_exists(Equipment::class) && Schema::hasTable('equipment'), 404);

        $rows = Equipment::forUser($user)
            ->with('currentSite:id,name')
            ->orderBy('code')
            ->get()
            ->map(fn(Equipment $e) => [
                'code'             => $e->code,
                'name'             => $e->name,
                'category'         => $e->category ?? '—',
                'brand'            => trim(($e->brand ?? '') . ' ' . ($e->model ?? '')) ?: '—',
                'status'           => $e->status,
                'site'             => $e->currentSite?->name ?? '—',
                'acquisition_date' => $e->acquisition_date ? $e->acquisition_date->format('d/m/Y') : '—',
            ])->toArray();

        return PdfTableExportService::export(
            title:      'Liste des Équipements',
            columnDefs: [
                ['key' => 'code',             'label' => 'Code',          'type' => 'code',       'priority' => 'essential', 'nowrap' => true],
                ['key' => 'name',             'label' => 'Désignation',   'type' => 'name',       'priority' => 'essential'],
                ['key' => 'category',         'label' => 'Type',          'type' => 'status',     'priority' => 'important'],
                ['key' => 'brand',            'label' => 'Marque/Modèle', 'type' => 'short_text', 'priority' => 'important'],
                ['key' => 'status',           'label' => 'État',          'type' => 'status',     'priority' => 'essential'],
                ['key' => 'site',             'label' => 'Site assigné',  'type' => 'short_text', 'priority' => 'important'],
                ['key' => 'acquisition_date', 'label' => 'Acquisition',   'type' => 'date',       'priority' => 'secondary', 'nowrap' => true],
            ],
            rows:    $rows,
            company: $user->company,
            user:    $user,
            options: ['filename' => 'Equipements-' . now()->format('Y-m-d') . '.pdf'],
        );
    }

    public function purchases(Request $request): StreamedResponse
    {
        $user = $request->user();
        abort_unless($user->can('purchases.view'), 403);
        abort_unless(class_exists(PurchaseOrder::class) && Schema::hasTable('purchase_orders'), 404);

        $rows = PurchaseOrder::forUser($user)
            ->with(['supplier:id,name', 'project:id,name'])
            ->latest('order_date')
            ->get()
            ->map(fn(PurchaseOrder $p) => [
                'code'       => $p->code,
                'date'       => $p->order_date ? $p->order_date->format('d/m/Y') : '—',
                'supplier'   => $p->supplier?->name ?? '—',
                'project'    => $p->project?->name ?? '—',
                'total'      => $p->total ? number_format((float)$p->total, 0, ',', ' ') . ' ' . $p->currency : '—',
                'currency'   => $p->currency ?? '—',
                'status'     => $p->status,
            ])->toArray();

        return PdfTableExportService::export(
            title:      'Liste des Bons de Commande',
            columnDefs: [
                ['key' => 'code',     'label' => 'Numéro',      'type' => 'code',       'priority' => 'essential', 'nowrap' => true],
                ['key' => 'date',     'label' => 'Date',        'type' => 'date',       'priority' => 'essential', 'nowrap' => true],
                ['key' => 'supplier', 'label' => 'Fournisseur', 'type' => 'name',       'priority' => 'essential'],
                ['key' => 'project',  'label' => 'Projet',      'type' => 'short_text', 'priority' => 'important'],
                ['key' => 'total',    'label' => 'TTC',         'type' => 'amount',     'priority' => 'essential', 'nowrap' => true],
                ['key' => 'currency', 'label' => 'Devise',      'type' => 'status',     'priority' => 'secondary', 'nowrap' => true],
                ['key' => 'status',   'label' => 'Statut',      'type' => 'status',     'priority' => 'essential'],
            ],
            rows:    $rows,
            company: $user->company,
            user:    $user,
            options: ['filename' => 'BonsDeCommande-' . now()->format('Y-m-d') . '.pdf'],
        );
    }

    public function budgets(Request $request): StreamedResponse
    {
        $user = $request->user();
        abort_unless($user->can('budget.view'), 403);
        abort_unless(class_exists(Budget::class) && Schema::hasTable('budgets'), 404);

        $rows = Budget::forUser($user)
            ->with(['project:id,name', 'lines'])
            ->latest()
            ->get()
            ->flatMap(fn(Budget $b) => $b->lines->map(fn(BudgetLine $l) => [
                'projet'    => $b->project?->name ?? $b->title,
                'ligne'     => $l->label,
                'categorie' => $l->category ?? '—',
                'prevu'     => number_format((float)$l->planned_amount, 0, ',', ' '),
                'reel'      => number_format((float)$l->actual_amount, 0, ',', ' '),
                'ecart'     => number_format((float)$l->planned_amount - (float)$l->actual_amount, 0, ',', ' '),
                'pct'       => (float)$l->planned_amount > 0
                    ? number_format(((float)$l->actual_amount / (float)$l->planned_amount) * 100, 1) . '%'
                    : '—',
            ]))->toArray();

        return PdfTableExportService::export(
            title:      'Budget Prévisionnel — Détail des Lignes',
            columnDefs: [
                ['key' => 'projet',    'label' => 'Projet',      'type' => 'name',       'priority' => 'essential'],
                ['key' => 'ligne',     'label' => 'Ligne',       'type' => 'name',       'priority' => 'essential'],
                ['key' => 'categorie', 'label' => 'Catégorie',   'type' => 'short_text', 'priority' => 'important'],
                ['key' => 'prevu',     'label' => 'Prévu',       'type' => 'amount',     'priority' => 'essential', 'nowrap' => true],
                ['key' => 'reel',      'label' => 'Réel',        'type' => 'amount',     'priority' => 'essential', 'nowrap' => true],
                ['key' => 'ecart',     'label' => 'Écart',       'type' => 'amount',     'priority' => 'important', 'nowrap' => true],
                ['key' => 'pct',       'label' => '% consommé',  'type' => 'percentage', 'priority' => 'important', 'nowrap' => true],
            ],
            rows:    $rows,
            company: $user->company,
            user:    $user,
            options: ['filename' => 'Budget-' . now()->format('Y-m-d') . '.pdf'],
        );
    }

    public function treasury(Request $request): StreamedResponse
    {
        $user = $request->user();
        abort_unless($user->can('treasury.view'), 403);
        abort_unless(Schema::hasTable('treasury_transactions'), 404);

        $rows = TreasuryTransaction::forUser($user)
            ->with(['cashAccount:id,name', 'project:id,name'])
            ->latest('date')
            ->latest('id')
            ->get()
            ->map(fn(TreasuryTransaction $tx) => [
                'date'        => $tx->date ? $tx->date->format('d/m/Y') : '—',
                'description' => $tx->description ?? '—',
                'type'        => $tx->type === 'in' ? 'Entrée' : 'Sortie',
                'montant'     => number_format((float)$tx->amount, 0, ',', ' '),
                'compte'      => $tx->cashAccount?->name ?? '—',
                'reference'   => $tx->reference ?? '—',
            ])->toArray();

        return PdfTableExportService::export(
            title:      'Journal de Trésorerie',
            columnDefs: [
                ['key' => 'date',        'label' => 'Date',        'type' => 'date',       'priority' => 'essential', 'nowrap' => true],
                ['key' => 'description', 'label' => 'Description', 'type' => 'name',       'priority' => 'essential'],
                ['key' => 'type',        'label' => 'Type',        'type' => 'status',     'priority' => 'essential'],
                ['key' => 'montant',     'label' => 'Montant',     'type' => 'amount',     'priority' => 'essential', 'nowrap' => true],
                ['key' => 'compte',      'label' => 'Compte',      'type' => 'short_text', 'priority' => 'important'],
                ['key' => 'reference',   'label' => 'Référence',   'type' => 'short_text', 'priority' => 'secondary'],
            ],
            rows:    $rows,
            company: $user->company,
            user:    $user,
            options: ['filename' => 'Tresorerie-' . now()->format('Y-m-d') . '.pdf'],
        );
    }

    public function payslips(Request $request): StreamedResponse
    {
        $user = $request->user();
        abort_unless($user->can('payroll.view'), 403);
        abort_unless(class_exists(Payslip::class) && Schema::hasTable('payslips'), 404);

        $period = $request->string('period')->toString() ?: now()->format('Y-m');

        $rows = Payslip::forUser($user)
            ->with('employee:id,matricule,first_name,last_name')
            ->where('period', $period)
            ->latest('id')
            ->get()
            ->map(fn(Payslip $p) => [
                'employe'   => $p->employee ? trim($p->employee->first_name . ' ' . $p->employee->last_name) : '—',
                'matricule' => $p->employee?->matricule ?? '—',
                'periode'   => $p->period ?? '—',
                'brut'      => number_format((float)$p->gross_salary, 0, ',', ' '),
                'retenues'  => number_format((float)$p->deductions, 0, ',', ' '),
                'net'       => number_format((float)$p->net_salary, 0, ',', ' '),
                'statut'    => $p->status,
            ])->toArray();

        return PdfTableExportService::export(
            title:      'Bulletins de Paie — ' . $period,
            columnDefs: [
                ['key' => 'employe',   'label' => 'Employé',   'type' => 'name',   'priority' => 'essential'],
                ['key' => 'matricule', 'label' => 'Matricule', 'type' => 'code',   'priority' => 'important', 'nowrap' => true],
                ['key' => 'periode',   'label' => 'Période',   'type' => 'date',   'priority' => 'essential', 'nowrap' => true],
                ['key' => 'brut',      'label' => 'Brut',      'type' => 'amount', 'priority' => 'essential', 'nowrap' => true],
                ['key' => 'retenues',  'label' => 'Retenues',  'type' => 'amount', 'priority' => 'important', 'nowrap' => true],
                ['key' => 'net',       'label' => 'Net',       'type' => 'amount', 'priority' => 'essential', 'nowrap' => true],
                ['key' => 'statut',    'label' => 'Statut',    'type' => 'status', 'priority' => 'essential'],
            ],
            rows:    $rows,
            company: $user->company,
            user:    $user,
            options: [
                'filename' => 'Paie-' . $period . '.pdf',
                'subtitle' => 'Période : ' . $period,
            ],
        );
    }
}
