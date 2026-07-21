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
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Schema;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use Symfony\Component\HttpFoundation\StreamedResponse;

/**
 * Export Excel (.xlsx) des listes clés de l'ERP.
 *
 * Chaque méthode :
 *   - vérifie la permission « MODULE.export » de l'utilisateur ;
 *   - isole strictement les données par entreprise (multi-tenant) ;
 *   - protège l'accès aux modèles optionnels par class_exists + Schema::hasTable ;
 *   - renvoie un StreamedResponse au format XLSX (téléchargement).
 *
 * La génération du classeur est factorisée dans buildXlsx().
 */
class ExportController extends Controller
{
    /** Export des projets. */
    public function projects(Request $request): StreamedResponse
    {
        $user = $request->user();
        abort_unless($user->can('projects.export'), 403);

        $rows = Project::forUser($user)
            ->with('manager:id,name')
            ->latest()
            ->get()
            ->map(fn (Project $p) => [
                $p->code,
                $p->name,
                $p->client_name,
                $p->type,
                $p->status,
                $p->budget_amount,
                $p->currency,
                $p->progress,
                optional($p->start_date)->format('Y-m-d'),
                optional($p->end_date)->format('Y-m-d'),
            ]);

        return $this->buildXlsx(
            $this->filename('Projets'),
            ['Code', 'Nom', 'Client', 'Type', 'Statut', 'Budget', 'Devise', 'Avancement %', 'Début', 'Fin'],
            $rows,
        );
    }

    /** Export des factures. */
    public function invoices(Request $request): StreamedResponse
    {
        $user = $request->user();
        abort_unless($user->can('invoicing.export'), 403);

        $this->ensureModelAvailable(Invoice::class, 'invoices');

        $rows = Invoice::forUser($user)
            ->with('client:id,name')
            ->latest()
            ->get()
            ->map(fn (Invoice $i) => [
                $i->code,
                optional($i->client)->name,
                $i->status,
                $i->total,
                $i->amount_paid,
                $i->balance,
                optional($i->issue_date)->format('Y-m-d'),
                optional($i->due_date)->format('Y-m-d'),
            ]);

        return $this->buildXlsx(
            $this->filename('Factures'),
            ['Code', 'Client', 'Statut', 'Total', 'Payé', 'Reste', 'Émission', 'Échéance'],
            $rows,
        );
    }

    /** Export des clients. */
    public function clients(Request $request): StreamedResponse
    {
        $user = $request->user();
        abort_unless($user->can('clients.export'), 403);

        $rows = Client::forUser($user)
            ->orderBy('name')
            ->get()
            ->map(fn (Client $c) => [
                $c->code,
                $c->name,
                $c->type,
                $c->contact_name,
                $c->phone,
                $c->email,
                $c->city,
            ]);

        return $this->buildXlsx(
            $this->filename('Clients'),
            ['Code', 'Nom', 'Type', 'Contact', 'Téléphone', 'Email', 'Ville'],
            $rows,
        );
    }

    /** Export des employés. */
    public function employees(Request $request): StreamedResponse
    {
        $user = $request->user();
        abort_unless($user->can('hr.export'), 403);

        $this->ensureModelAvailable(Employee::class, 'employees');

        $rows = Employee::forUser($user)
            ->orderBy('last_name')
            ->orderBy('first_name')
            ->get()
            ->map(fn (Employee $e) => [
                $e->matricule,
                $e->full_name,
                $e->job_title,
                $e->department,
                $e->contract_type,
                $e->base_salary,
                $e->status,
            ]);

        return $this->buildXlsx(
            $this->filename('Employes'),
            ['Matricule', 'Nom complet', 'Poste', 'Département', 'Contrat', 'Salaire base', 'Statut'],
            $rows,
        );
    }

    /** Export des devis. */
    public function quotes(Request $request): StreamedResponse
    {
        $user = $request->user();
        abort_unless($user->can('quotes.view'), 403);

        $rows = Quote::forUser($user)
            ->with('project:id,name')
            ->latest()
            ->get()
            ->map(fn (Quote $q) => [
                $q->code,
                $q->title,
                $q->client_name,
                $q->status,
                $q->currency,
                $q->subtotal,
                $q->tax_rate,
                $q->total,
                optional($q->date)->format('Y-m-d'),
                optional($q->valid_until)->format('Y-m-d'),
                optional($q->project)->name,
            ]);

        return $this->buildXlsx(
            $this->filename('Devis'),
            ['Code', 'Objet', 'Client', 'Statut', 'Devise', 'HT', 'TVA %', 'TTC', 'Date', 'Validité', 'Projet'],
            $rows,
        );
    }

    /** Export des contrats. */
    public function contracts(Request $request): StreamedResponse
    {
        $user = $request->user();
        abort_unless($user->can('contracts.view'), 403);

        $this->ensureModelAvailable(Contract::class, 'contracts');

        $rows = Contract::forUser($user)
            ->with('project:id,name')
            ->latest()
            ->get()
            ->map(fn (Contract $c) => [
                $c->code,
                $c->title,
                $c->type,
                $c->party_name,
                $c->status,
                $c->amount,
                $c->currency,
                optional($c->start_date)->format('Y-m-d'),
                optional($c->end_date)->format('Y-m-d'),
                optional($c->signed_date)->format('Y-m-d'),
                optional($c->project)->name,
            ]);

        return $this->buildXlsx(
            $this->filename('Contrats'),
            ['Code', 'Objet', 'Type', 'Cocontractant', 'Statut', 'Montant', 'Devise', 'Début', 'Fin', 'Signé le', 'Projet'],
            $rows,
        );
    }

    /** Export de l'état des stocks (stock courant calculé par matériau). */
    public function stocks(Request $request): StreamedResponse
    {
        $user = $request->user();
        abort_unless($user->can('stocks.export'), 403);

        $this->ensureModelAvailable(Material::class, 'materials');

        $rows = Material::forUser($user)
            ->where('is_active', true)
            ->orderBy('name')
            ->get()
            ->map(fn (Material $m) => [
                $m->code,
                $m->name,
                $m->category,
                $m->unit,
                $m->unit_price,
                $m->min_stock,
                $m->currentStock(),
            ]);

        return $this->buildXlsx(
            $this->filename('Stocks'),
            ['Code', 'Nom', 'Catégorie', 'Unité', 'Prix réf', 'Seuil', 'Stock courant'],
            $rows,
        );
    }

    /** Export des fournisseurs. */
    public function suppliers(Request $request): StreamedResponse
    {
        $user = $request->user();
        abort_unless($user->can('suppliers.view'), 403);

        $this->ensureModelAvailable(Supplier::class, 'suppliers');

        $rows = Supplier::forUser($user)
            ->orderBy('name')
            ->get()
            ->map(fn (Supplier $s) => [
                $s->code,
                $s->name,
                $s->category,
                $s->contact_name,
                $s->phone,
                $s->email,
                $s->city,
                $s->country,
                $s->is_active ? 'Actif' : 'Inactif',
            ]);

        return $this->buildXlsx(
            $this->filename('Fournisseurs'),
            ['Code', 'Nom', 'Catégorie', 'Contact', 'Téléphone', 'Email', 'Ville', 'Pays', 'Statut'],
            $rows,
        );
    }

    /** Export des sous-traitants. */
    public function subcontractors(Request $request): StreamedResponse
    {
        $user = $request->user();
        abort_unless($user->can('subcontractors.view'), 403);

        $this->ensureModelAvailable(Subcontractor::class, 'subcontractors');

        $rows = Subcontractor::forUser($user)
            ->orderBy('name')
            ->get()
            ->map(fn (Subcontractor $s) => [
                $s->code,
                $s->name,
                $s->specialty,
                $s->contact_name,
                $s->phone,
                $s->email,
                $s->city,
                $s->country,
                $s->rating,
                $s->is_active ? 'Actif' : 'Inactif',
            ]);

        return $this->buildXlsx(
            $this->filename('Sous-traitants'),
            ['Code', 'Nom', 'Spécialité', 'Contact', 'Téléphone', 'Email', 'Ville', 'Pays', 'Note /5', 'Statut'],
            $rows,
        );
    }

    /** Export du parc matériel (équipements). */
    public function equipment(Request $request): StreamedResponse
    {
        $user = $request->user();
        abort_unless($user->can('equipment.view'), 403);

        $this->ensureModelAvailable(Equipment::class, 'equipment');

        $rows = Equipment::forUser($user)
            ->with('currentSite:id,name')
            ->orderBy('name')
            ->get()
            ->map(fn (Equipment $e) => [
                $e->code,
                $e->name,
                $e->category,
                $e->brand,
                $e->model,
                $e->registration,
                $e->status,
                optional($e->currentSite)->name,
                optional($e->acquisition_date)->format('Y-m-d'),
                $e->acquisition_value,
                $e->currency,
            ]);

        return $this->buildXlsx(
            $this->filename('Equipements'),
            ['Code', 'Désignation', 'Type', 'Marque', 'Modèle', 'Immatriculation', 'État', 'Site affecté', 'Date acquisition', 'Valeur', 'Devise'],
            $rows,
        );
    }

    /** Export des bons de commande (achats). */
    public function purchases(Request $request): StreamedResponse
    {
        $user = $request->user();
        abort_unless($user->can('purchases.view'), 403);

        $this->ensureModelAvailable(PurchaseOrder::class, 'purchase_orders');

        $rows = PurchaseOrder::forUser($user)
            ->with(['supplier:id,name', 'project:id,name'])
            ->latest('order_date')
            ->get()
            ->map(fn (PurchaseOrder $po) => [
                $po->code,
                optional($po->order_date)->format('Y-m-d'),
                optional($po->supplier)->name,
                optional($po->project)->name,
                $po->subtotal,
                $po->tax_rate,
                $po->tax_amount,
                $po->total,
                $po->currency,
                $po->status,
                optional($po->expected_date)->format('Y-m-d'),
            ]);

        return $this->buildXlsx(
            $this->filename('Achats-BC'),
            ['Numéro', 'Date commande', 'Fournisseur', 'Projet', 'Montant HT', 'TVA %', 'TVA', 'Total TTC', 'Devise', 'Statut', 'Livraison prévue'],
            $rows,
        );
    }

    /** Export des lignes budgétaires (budget prévisionnel vs réalisé). */
    public function budgets(Request $request): StreamedResponse
    {
        $user = $request->user();
        abort_unless($user->can('budget.view'), 403);

        $this->ensureModelAvailable(Budget::class, 'budgets');

        $rows = Budget::forUser($user)
            ->with(['project:id,name', 'lines'])
            ->latest()
            ->get()
            ->flatMap(fn (Budget $b) => $b->lines->map(fn (BudgetLine $l) => [
                $b->code,
                $b->title,
                optional($b->project)->name,
                $b->fiscal_year,
                $l->label,
                $l->category,
                $l->planned_amount,
                $l->actual_amount,
                (float) $l->actual_amount - (float) $l->planned_amount,
                $b->status,
                $b->currency,
            ]));

        return $this->buildXlsx(
            $this->filename('Budget'),
            ['Code budget', 'Intitulé', 'Projet', 'Exercice', 'Ligne', 'Catégorie', 'Montant prévu', 'Montant réel', 'Écart', 'Statut', 'Devise'],
            $rows,
        );
    }

    /** Export des transactions de trésorerie. */
    public function treasury(Request $request): StreamedResponse
    {
        $user = $request->user();
        abort_unless($user->can('treasury.view'), 403);

        $this->ensureModelAvailable(TreasuryTransaction::class, 'treasury_transactions');

        $rows = TreasuryTransaction::forUser($user)
            ->with('cashAccount:id,name')
            ->orderByDesc('date')
            ->get()
            ->map(fn (TreasuryTransaction $t) => [
                optional($t->date)->format('Y-m-d'),
                $t->description,
                $t->type === 'in' ? 'Entrée' : 'Sortie',
                $t->category,
                $t->amount,
                optional($t->cashAccount)->name,
                $t->reference,
            ]);

        return $this->buildXlsx(
            $this->filename('Tresorerie'),
            ['Date', 'Description', 'Type', 'Catégorie', 'Montant', 'Compte', 'Référence'],
            $rows,
        );
    }

    /** Export des bulletins de paie. */
    public function payslips(Request $request): StreamedResponse
    {
        $user = $request->user();
        abort_unless($user->can('hr.export'), 403);

        $this->ensureModelAvailable(Payslip::class, 'payslips');

        $rows = Payslip::forUser($user)
            ->with('employee:id,first_name,last_name,matricule')
            ->orderByDesc('period')
            ->get()
            ->map(fn (Payslip $p) => [
                optional($p->employee)->matricule,
                optional($p->employee) ? trim(optional($p->employee)->first_name . ' ' . optional($p->employee)->last_name) : null,
                $p->period,
                $p->country_code,
                $p->base_salary,
                $p->overtime_amount,
                $p->transport_allowance,
                $p->housing_allowance,
                $p->other_allowances,
                $p->gross_salary,
                $p->cnps_employee,
                $p->its_amount,
                $p->advance_deductions,
                $p->deductions,
                $p->net_salary,
                $p->currency,
                $p->status,
            ]);

        return $this->buildXlsx(
            $this->filename('Bulletins-Paie'),
            ['Matricule', 'Employé', 'Période', 'Pays', 'Salaire base', 'Heures sup', 'Transport', 'Logement', 'Autres primes', 'Salaire brut', 'CNPS salarié', 'ITS', 'Avances', 'Total retenues', 'Net à payer', 'Devise', 'Statut'],
            $rows,
        );
    }

    /**
     * Construit le classeur XLSX et renvoie la réponse en flux (téléchargement).
     *
     * @param  string    $filename  Nom du fichier proposé au téléchargement.
     * @param  string[]  $headers   Libellés de la ligne d'en-tête.
     * @param  iterable  $rows      Lignes de données (tableaux indexés alignés sur $headers).
     */
    private function buildXlsx(string $filename, array $headers, iterable $rows): StreamedResponse
    {
        ini_set('memory_limit', '512M');
        set_time_limit(120);

        $spreadsheet = new Spreadsheet();
        $sheet = $spreadsheet->getActiveSheet();

        // Ligne d'en-tête : libellés en gras sur fond sombre, texte blanc.
        $sheet->fromArray($headers, null, 'A1');
        $lastColumn = $sheet->getHighestColumn(1);
        $headerRange = "A1:{$lastColumn}1";

        $sheet->getStyle($headerRange)->getFont()
            ->setBold(true)
            ->getColor()->setARGB('FFFFFFFF');
        $sheet->getStyle($headerRange)->getFill()
            ->setFillType(Fill::FILL_SOLID)
            ->getStartColor()->setARGB('FF1F2937'); // gris ardoise sombre
        $sheet->getStyle($headerRange)->getAlignment()
            ->setVertical(Alignment::VERTICAL_CENTER);
        $sheet->getRowDimension(1)->setRowHeight(20);

        // Lignes de données à partir de la ligne 2.
        $rowIndex = 2;
        foreach ($rows as $row) {
            // Nettoyer les valeurs : supprimer émojis et caractères non imprimables
            $cleanRow = array_map(function ($val) {
                if (is_string($val)) {
                    // Supprimer les emojis et caractères non-BMP
                    $val = preg_replace('/[\x{10000}-\x{10FFFF}]/u', '', $val);
                    // Supprimer les caractères de contrôle
                    $val = preg_replace('/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/u', '', $val);
                }
                return $val;
            }, array_values((array) $row));
            $sheet->fromArray($cleanRow, null, "A{$rowIndex}");
            $rowIndex++;
        }

        // Largeurs de colonnes intelligentes : auto + bornes min/max par type de colonne.
        $colIndex = 'A';
        foreach ($headers as $header) {
            $sheet->getColumnDimension($colIndex)->setAutoSize(true);
            $colIndex++;
        }

        // Forcer le recalcul des largeurs et imposer les bornes.
        $sheet->calculateColumnWidths();
        $colIndex = 'A';
        foreach ($headers as $header) {
            $dim = $sheet->getColumnDimension($colIndex);
            $currentWidth = $dim->getWidth();

            // Largeur minimale : 8 caractères, maximale : 50 caractères
            $minWidth = 8;
            $maxWidth = 50;

            $label = strtolower($header);
            if (str_contains($label, 'email')) {
                $maxWidth = 40;
            } elseif (str_contains($label, 'nom') || str_contains($label, 'name') || str_contains($label, 'objet') || str_contains($label, 'désignation')) {
                $maxWidth = 45;
                $minWidth = 15;
            } elseif (str_contains($label, 'date') || str_contains($label, 'début') || str_contains($label, 'fin') || str_contains($label, 'émission') || str_contains($label, 'échéance')) {
                $minWidth = 12;
                $maxWidth = 15;
            } elseif (str_contains($label, 'code') || str_contains($label, 'ref') || str_contains($label, 'matricule')) {
                $minWidth = 10;
                $maxWidth = 20;
            } elseif (str_contains($label, 'statut') || str_contains($label, 'status') || str_contains($label, 'type')) {
                $minWidth = 10;
                $maxWidth = 22;
            } elseif (in_array($label, ['total', 'montant', 'budget', 'payé', 'reste', 'salaire', 'prix'])) {
                $minWidth = 12;
                $maxWidth = 22;
            } elseif (str_contains($label, '%') || str_contains($label, 'avanc') || str_contains($label, 'taux')) {
                $minWidth = 8;
                $maxWidth = 14;
            }

            if ($currentWidth < $minWidth) {
                $dim->setWidth($minWidth);
            }
            if ($currentWidth > $maxWidth) {
                $dim->setWidth($maxWidth);
            }

            $colIndex++;
        }

        // Paramètres d'impression : paysage A4, ajustement largeur, répétition en-tête.
        $sheet->getPageSetup()->setOrientation(\PhpOffice\PhpSpreadsheet\Worksheet\PageSetup::ORIENTATION_LANDSCAPE);
        $sheet->getPageSetup()->setPaperSize(\PhpOffice\PhpSpreadsheet\Worksheet\PageSetup::PAPERSIZE_A4);
        $sheet->getPageSetup()->setFitToWidth(1);
        $sheet->getPageSetup()->setFitToHeight(0);
        $sheet->getPageSetup()->setRowsToRepeatAtTop([1, 1]);
        $sheet->getPageMargins()->setTop(0.5);
        $sheet->getPageMargins()->setRight(0.4);
        $sheet->getPageMargins()->setBottom(0.5);
        $sheet->getPageMargins()->setLeft(0.4);
        $sheet->getPageMargins()->setHeader(0.2);
        $sheet->getPageMargins()->setFooter(0.2);

        // Fige la ligne d'en-tête au défilement.
        $sheet->freezePane('A2');

        $writer = new Xlsx($spreadsheet);

        $headersHttp = [
            'Content-Type'        => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
            'Cache-Control'       => 'max-age=0, no-store, no-cache, must-revalidate',
            'Pragma'              => 'no-cache',
        ];

        return new StreamedResponse(function () use ($writer, $spreadsheet) {
            $writer->save('php://output');
            $spreadsheet->disconnectWorksheets();
            unset($spreadsheet);
        }, 200, $headersHttp);
    }

    /** Nom de fichier normalisé : Export-XXX-YYYY-MM-DD.xlsx. */
    private function filename(string $dataset): string
    {
        return 'Export-' . $dataset . '-' . now()->format('Y-m-d') . '.xlsx';
    }

    /**
     * Garantit qu'un modèle optionnel et sa table existent avant l'export ;
     * renvoie une 404 propre dans le cas contraire.
     */
    private function ensureModelAvailable(string $modelClass, string $table): void
    {
        abort_unless(class_exists($modelClass) && Schema::hasTable($table), 404, 'Module indisponible.');
    }
}
