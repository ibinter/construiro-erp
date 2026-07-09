<?php

namespace App\Http\Controllers;

use App\Models\Client;
use App\Models\Employee;
use App\Models\Invoice;
use App\Models\Material;
use App\Models\Project;
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

    /**
     * Construit le classeur XLSX et renvoie la réponse en flux (téléchargement).
     *
     * @param  string    $filename  Nom du fichier proposé au téléchargement.
     * @param  string[]  $headers   Libellés de la ligne d'en-tête.
     * @param  iterable  $rows      Lignes de données (tableaux indexés alignés sur $headers).
     */
    private function buildXlsx(string $filename, array $headers, iterable $rows): StreamedResponse
    {
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
            $sheet->fromArray(array_values((array) $row), null, "A{$rowIndex}");
            $rowIndex++;
        }

        // Largeurs de colonnes automatiques (bornées pour rester raisonnables).
        foreach (range('A', $lastColumn) as $column) {
            $sheet->getColumnDimension($column)->setAutoSize(true);
        }

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
