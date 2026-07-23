<?php

namespace App\Http\Controllers;

use App\Models\ImportLog;
use App\Services\ImportService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Système d'import universel : CSV / Excel → n'importe quelle entité.
 *
 * Flux :
 *   1. GET  /import                → sélection du type
 *   2. POST /import/preview        → upload fichier → retourner colonnes + 5 lignes aperçu
 *   3. POST /import/validate       → mapping colonnes + validation règles
 *   4. POST /import/execute        → insertion en base par lots
 */
class ImportController extends Controller
{
    public function __construct(private ImportService $importService) {}

    /** Types d'entités importables et leur configuration */
    public const IMPORTABLE_TYPES = [
        'clients' => [
            'label'    => 'Clients',
            'model'    => \App\Models\Client::class,
            'columns'  => [
                'name'    => ['label' => 'Nom *',         'required' => true],
                'email'   => ['label' => 'Email',         'required' => false, 'rule' => 'email'],
                'phone'   => ['label' => 'Téléphone',     'required' => false],
                'address' => ['label' => 'Adresse',       'required' => false],
                'city'    => ['label' => 'Ville',         'required' => false],
                'country' => ['label' => 'Pays',          'required' => false],
                'siret'   => ['label' => 'SIRET/NIF',     'required' => false],
                'notes'   => ['label' => 'Notes',         'required' => false],
            ],
            'unique_on' => 'email',
        ],
        'employees' => [
            'label'    => 'Employés',
            'model'    => \App\Models\Employee::class,
            'columns'  => [
                'first_name'   => ['label' => 'Prénom *',        'required' => true],
                'last_name'    => ['label' => 'Nom *',           'required' => true],
                'email'        => ['label' => 'Email *',         'required' => true, 'rule' => 'email'],
                'phone'        => ['label' => 'Téléphone',       'required' => false],
                'position'     => ['label' => 'Poste',           'required' => false],
                'department'   => ['label' => 'Département',     'required' => false],
                'hire_date'    => ['label' => 'Date embauche',   'required' => false, 'rule' => 'date'],
                'base_salary'  => ['label' => 'Salaire de base', 'required' => false, 'rule' => 'numeric'],
                'national_id'  => ['label' => 'Pièce d\'identité', 'required' => false],
            ],
            'unique_on' => 'email',
        ],
        'products' => [
            'label'    => 'Matériaux / Articles',
            'model'    => \App\Models\Material::class,
            'columns'  => [
                'name'        => ['label' => 'Désignation *', 'required' => true],
                'code'        => ['label' => 'Code / Référence *', 'required' => true],
                'description' => ['label' => 'Description',  'required' => false],
                'unit'        => ['label' => 'Unité',        'required' => false],
                'unit_price'  => ['label' => 'Prix unitaire','required' => false, 'rule' => 'numeric'],
                'category'    => ['label' => 'Catégorie',    'required' => false],
                'min_stock'   => ['label' => 'Stock minimum','required' => false, 'rule' => 'numeric'],
            ],
            'unique_on' => 'code',
        ],

        // ── 5 nouveaux types ────────────────────────────────────────────────────

        'projects' => [
            'label'         => 'Projets',
            'model'         => \App\Models\Project::class,
            'execute_route' => 'import.projects',
            'columns'       => [
                'name'         => ['label' => 'Nom *',            'required' => true],
                'code'         => ['label' => 'Code / Référence', 'required' => false],
                'client'       => ['label' => 'Client',           'required' => false],
                'description'  => ['label' => 'Description',      'required' => false],
                'status'       => ['label' => 'Statut',           'required' => false],
                'start_date'   => ['label' => 'Date début',       'required' => false],
                'end_date'     => ['label' => 'Date fin',         'required' => false],
                'budget'       => ['label' => 'Budget',           'required' => false, 'rule' => 'numeric'],
                'location'     => ['label' => 'Lieu / Ville',     'required' => false],
                'project_type' => ['label' => 'Type de projet',   'required' => false],
            ],
            'unique_on' => 'code',
        ],

        'quotes' => [
            'label'         => 'Devis',
            'model'         => \App\Models\Quote::class,
            'execute_route' => 'import.quotes',
            'columns'       => [
                'number'      => ['label' => 'Numéro *',         'required' => true],
                'client'      => ['label' => 'Client',           'required' => false],
                'project'     => ['label' => 'Projet',           'required' => false],
                'title'       => ['label' => 'Objet / Intitulé', 'required' => false],
                'amount'      => ['label' => 'Montant HT',       'required' => false, 'rule' => 'numeric'],
                'tax_rate'    => ['label' => 'TVA (%)',           'required' => false, 'rule' => 'numeric'],
                'status'      => ['label' => 'Statut',           'required' => false],
                'issue_date'  => ['label' => 'Date émission',    'required' => false],
                'valid_until' => ['label' => 'Date validité',    'required' => false],
                'currency'    => ['label' => 'Devise',           'required' => false],
            ],
            'unique_on' => 'number',
        ],

        'invoices' => [
            'label'         => 'Factures',
            'model'         => \App\Models\Invoice::class,
            'execute_route' => 'import.invoices',
            'columns'       => [
                'number'     => ['label' => 'Numéro *',       'required' => true],
                'client'     => ['label' => 'Client',         'required' => false],
                'project'    => ['label' => 'Projet',         'required' => false],
                'title'      => ['label' => 'Objet',          'required' => false],
                'amount'     => ['label' => 'Montant HT',     'required' => false, 'rule' => 'numeric'],
                'tax_rate'   => ['label' => 'TVA (%)',         'required' => false, 'rule' => 'numeric'],
                'status'     => ['label' => 'Statut',         'required' => false],
                'issue_date' => ['label' => 'Date émission',  'required' => false],
                'due_date'   => ['label' => 'Échéance',       'required' => false],
                'currency'   => ['label' => 'Devise',         'required' => false],
            ],
            'unique_on' => 'number',
        ],

        'stocks' => [
            'label'         => 'Stocks / Matériaux',
            'model'         => \App\Models\Material::class,
            'execute_route' => 'import.stocks',
            'columns'       => [
                'code'       => ['label' => 'Code / Référence', 'required' => false],
                'name'       => ['label' => 'Désignation *',    'required' => true],
                'quantity'   => ['label' => 'Quantité',         'required' => false, 'rule' => 'numeric'],
                'unit'       => ['label' => 'Unité',            'required' => false],
                'unit_price' => ['label' => 'Prix unitaire',    'required' => false, 'rule' => 'numeric'],
                'min_stock'  => ['label' => 'Stock minimum',    'required' => false, 'rule' => 'numeric'],
                'location'   => ['label' => 'Emplacement',      'required' => false],
                'supplier'   => ['label' => 'Fournisseur',      'required' => false],
            ],
            'unique_on' => 'code',
        ],

        'equipment' => [
            'label'         => 'Équipements',
            'model'         => \App\Models\Equipment::class,
            'execute_route' => 'import.equipment',
            'columns'       => [
                'code'           => ['label' => 'Code / Référence',   'required' => false],
                'name'           => ['label' => 'Désignation / Nom *', 'required' => true],
                'type'           => ['label' => 'Type / Catégorie',    'required' => false],
                'brand'          => ['label' => 'Marque',              'required' => false],
                'model'          => ['label' => 'Modèle',              'required' => false],
                'serial_number'  => ['label' => 'Numéro de série',     'required' => false],
                'purchase_date'  => ['label' => "Date d'achat",        'required' => false],
                'purchase_price' => ['label' => 'Coût / Prix achat',   'required' => false, 'rule' => 'numeric'],
                'status'         => ['label' => 'État',                'required' => false],
                'location'       => ['label' => 'Site / Emplacement',  'required' => false],
            ],
            'unique_on' => 'serial_number',
        ],
    ];

    // ── 1. Sélection du type ─────────────────────────────────────────────────

    public function index(): Response
    {
        $types = collect(self::IMPORTABLE_TYPES)->map(fn ($cfg, $key) => [
            'key'           => $key,
            'label'         => $cfg['label'],
            'execute_route' => $cfg['execute_route'] ?? 'import.execute',
            'columns'       => collect($cfg['columns'])->map(fn ($col) => $col['label'])->values(),
            'column_keys'   => array_keys($cfg['columns']),
        ])->values();

        $logs = [];
        if (auth()->check() && auth()->user()->company_id) {
            $logs = ImportLog::where('company_id', auth()->user()->company_id)
                ->orderByDesc('created_at')
                ->limit(10)
                ->get()
                ->map(fn ($l) => [
                    'id'         => $l->id,
                    'module'     => $l->module,
                    'filename'   => $l->filename,
                    'status'     => $l->status,
                    'total'      => $l->total_rows,
                    'imported'   => $l->imported_rows,
                    'skipped'    => $l->skipped_rows,
                    'errors'     => $l->error_rows,
                    'created_at' => $l->created_at->format('d/m/Y H:i'),
                ])
                ->toArray();
        }

        return Inertia::render('Import/Index', [
            'types'   => $types,
            'modules' => $types, // alias — même données, utilisé par le flux /run
            'logs'    => $logs,
        ]);
    }

    // ── 2. Aperçu du fichier ─────────────────────────────────────────────────

    public function preview(Request $request): JsonResponse
    {
        $request->validate([
            'file' => 'required|file|mimes:csv,txt,xlsx,xls|max:10240',
            'type' => 'required|in:' . implode(',', array_keys(self::IMPORTABLE_TYPES)),
        ]);

        $file = $request->file('file');
        $ext  = strtolower($file->getClientOriginalExtension());

        $rows = match (true) {
            in_array($ext, ['xlsx', 'xls']) => $this->readExcel($file->getRealPath()),
            default                          => $this->readCsv($file->getRealPath()),
        };

        if (empty($rows)) {
            return response()->json(['error' => 'Fichier vide ou illisible.'], 422);
        }

        $headers = array_shift($rows);       // première ligne = en-têtes
        $preview = array_slice($rows, 0, 5); // 5 premières lignes

        $cfg     = self::IMPORTABLE_TYPES[$request->type];
        $targets = array_keys($cfg['columns']);

        // Suggestion de mapping automatique par similarité de nom
        $autoMap = [];
        foreach ($headers as $i => $h) {
            $slug = strtolower(preg_replace('/[^a-z0-9]/i', '_', $h));
            foreach ($targets as $target) {
                similar_text($slug, $target, $pct);
                if ($pct > 60) {
                    $autoMap[$i] = $target;
                    break;
                }
            }
        }

        // Stocker le fichier temporairement pour l'étape 4
        $tmpPath = $file->storeAs('imports_tmp', uniqid('imp_') . '.' . $ext, 'local');

        return response()->json([
            'headers'  => $headers,
            'preview'  => $preview,
            'auto_map' => $autoMap,
            'columns'  => $cfg['columns'],
            'tmp_path' => $tmpPath,
            'total'    => count($rows),
        ]);
    }

    // ── 3. Validation (optionnel, appelé par le front en temps réel) ─────────

    public function validateMapping(Request $request): JsonResponse
    {
        $request->validate([
            'type'    => 'required|in:' . implode(',', array_keys(self::IMPORTABLE_TYPES)),
            'mapping' => 'required|array',
            'rows'    => 'required|array|max:200',
        ]);

        $cfg    = self::IMPORTABLE_TYPES[$request->type];
        $errors = [];

        foreach ($request->rows as $rowIdx => $row) {
            $mapped = $this->applyMapping($row, $request->mapping, $cfg['columns']);
            $rules  = $this->buildRules($cfg['columns']);
            $v      = Validator::make($mapped, $rules);
            if ($v->fails()) {
                $errors[$rowIdx] = $v->errors()->toArray();
            }
        }

        return response()->json(['errors' => $errors, 'valid' => empty($errors)]);
    }

    // ── 4. Exécution de l'import ─────────────────────────────────────────────

    public function execute(Request $request): RedirectResponse
    {
        $request->validate([
            'type'      => 'required|in:' . implode(',', array_keys(self::IMPORTABLE_TYPES)),
            'mapping'   => 'required|array',
            'tmp_path'  => 'required|string',
            'skip_dups' => 'boolean',
        ]);

        $user      = $request->user();
        $cfg       = self::IMPORTABLE_TYPES[$request->type];
        $model     = $cfg['model'];
        $skipDups  = $request->boolean('skip_dups', true);
        $uniqueOn  = $cfg['unique_on'] ?? null;

        // Re-lire le fichier depuis le stockage temporaire
        $path = storage_path('app/' . $request->tmp_path);
        $ext  = pathinfo($path, PATHINFO_EXTENSION);

        $rows = match (true) {
            in_array($ext, ['xlsx', 'xls']) => $this->readExcel($path),
            default                          => $this->readCsv($path),
        };

        array_shift($rows); // enlever les en-têtes

        $inserted = 0;
        $skipped  = 0;
        $failed   = 0;

        DB::beginTransaction();
        try {
            foreach (array_chunk($rows, 100) as $chunk) {
                foreach ($chunk as $row) {
                    $data = $this->applyMapping($row, $request->mapping, $cfg['columns']);
                    $data['company_id'] = $user->company_id;

                    // Dédoublonnage
                    if ($skipDups && $uniqueOn && !empty($data[$uniqueOn])) {
                        $exists = $model::where('company_id', $user->company_id)
                            ->where($uniqueOn, $data[$uniqueOn])
                            ->exists();
                        if ($exists) {
                            $skipped++;
                            continue;
                        }
                    }

                    // Validation unitaire
                    $rules = $this->buildRules($cfg['columns']);
                    $v     = Validator::make($data, $rules);
                    if ($v->fails()) {
                        $failed++;
                        continue;
                    }

                    $model::create($data);
                    $inserted++;
                }
            }
            DB::commit();
        } catch (\Throwable $e) {
            DB::rollBack();
            return back()->withErrors(['import' => 'Erreur lors de l\'import : ' . $e->getMessage()]);
        }

        // Nettoyage fichier temporaire
        @unlink($path);

        return redirect()->route('import.index')
            ->with('success', "Import terminé — {$inserted} créés, {$skipped} doublons ignorés, {$failed} erreurs.");
    }

    // ── run() : flux simplifié upload → ImportLog → import ──────────────────

    /**
     * POST /import/run
     *
     * Flux stateless : reçoit le fichier + module + mapping en une seule requête.
     * Crée un ImportLog, parse, valide, insère, puis retourne un rapport.
     */
    public function run(Request $request): RedirectResponse
    {
        $moduleKeys = implode(',', array_keys(self::IMPORTABLE_TYPES));

        $request->validate([
            'file'    => 'required|file|max:10240|mimes:csv,txt,xlsx,xls',
            'module'  => "required|in:{$moduleKeys}",
            'mapping' => 'required|array',
        ]);

        $user   = $request->user();
        $module = $request->module;
        $cfg    = self::IMPORTABLE_TYPES[$module];

        $log = ImportLog::create([
            'company_id'     => $user->company_id,
            'user_id'        => $user->id,
            'module'         => $module,
            'filename'       => $request->file('file')->getClientOriginalName(),
            'status'         => 'processing',
            'column_mapping' => $request->mapping,
        ]);

        try {
            // Parse
            $data    = $this->importService->parseFile($request->file('file'));
            $mapping = $request->mapping; // ['fileCol' => 'dbCol']

            // Appliquer le mapping
            $mapped = $this->importService->applyMapping($data['rows'], $mapping);

            // Construire les règles de validation depuis la config du module
            $rules = [];
            foreach ($cfg['columns'] as $field => $colCfg) {
                $r   = [];
                $r[] = ($colCfg['required'] ?? false) ? 'required' : 'nullable';
                if (isset($colCfg['rule'])) {
                    $r[] = $colCfg['rule'];
                } else {
                    $r[] = 'string';
                    $r[] = 'max:255';
                }
                $rules[$field] = implode('|', $r);
            }

            $validated = $this->importService->validateRows($mapped, $rules);

            // Insertion par lots
            $modelClass = $cfg['model'];
            $imported   = 0;
            $skipped    = 0;

            DB::beginTransaction();
            $uniqueOn = $cfg['unique_on'] ?? null;
            foreach (array_chunk($validated['valid'], 100) as $chunk) {
                foreach ($chunk as $row) {
                    $row['company_id'] = $user->company_id;

                    // Dédoublonnage
                    if ($uniqueOn && !empty($row[$uniqueOn])) {
                        $exists = $modelClass::where('company_id', $user->company_id)
                            ->where($uniqueOn, $row[$uniqueOn])
                            ->exists();
                        if ($exists) {
                            $skipped++;
                            continue;
                        }
                    }

                    $modelClass::create($row);
                    $imported++;
                }
            }
            DB::commit();

            $log->update([
                'status'        => 'completed',
                'total_rows'    => count($data['rows']),
                'imported_rows' => $imported,
                'skipped_rows'  => $skipped,
                'error_rows'    => count($validated['errors']),
                'errors'        => $validated['errors'],
            ]);

            $msg = "{$imported} ligne(s) importée(s)";
            if ($skipped > 0) {
                $msg .= ", {$skipped} doublon(s) ignoré(s)";
            }
            if (count($validated['errors']) > 0) {
                $msg .= ', ' . count($validated['errors']) . ' erreur(s)';
            }

            return redirect()->route('import.index')->with('success', $msg . '.');
        } catch (\Throwable $e) {
            DB::rollBack();
            $log->update([
                'status' => 'failed',
                'errors' => [['message' => $e->getMessage()]],
            ]);

            return back()->withErrors(['file' => "Erreur lors de l'import : " . $e->getMessage()]);
        }
    }

    /**
     * GET /import/template/{module}
     *
     * Télécharge un modèle CSV (avec BOM UTF-8) pour le module demandé.
     */
    public function template(string $module): \Symfony\Component\HttpFoundation\StreamedResponse
    {
        abort_unless(isset(self::IMPORTABLE_TYPES[$module]), 404);

        $columns = array_keys(self::IMPORTABLE_TYPES[$module]['columns']);
        $label   = self::IMPORTABLE_TYPES[$module]['label'];

        return response()->streamDownload(function () use ($columns) {
            $h = fopen('php://output', 'w');
            // BOM UTF-8 pour compatibilité Excel
            fprintf($h, chr(0xEF) . chr(0xBB) . chr(0xBF));
            fputcsv($h, $columns, ';');
            // Ligne exemple vide
            fputcsv($h, array_fill(0, count($columns), ''), ';');
            fclose($h);
        }, "modele-import-{$module}.csv", ['Content-Type' => 'text/csv; charset=UTF-8']);
    }

    // ── Helpers ──────────────────────────────────────────────────────────────

    private function readCsv(string $path): array
    {
        $rows = [];
        if (($handle = fopen($path, 'r')) === false) {
            return $rows;
        }
        // Détection auto du délimiteur
        $firstLine = fgets($handle);
        rewind($handle);
        $delimiter = substr_count($firstLine, ';') >= substr_count($firstLine, ',') ? ';' : ',';

        while (($row = fgetcsv($handle, 0, $delimiter)) !== false) {
            $rows[] = $row;
        }
        fclose($handle);
        return $rows;
    }

    private function readExcel(string $path): array
    {
        if (!class_exists(\PhpOffice\PhpSpreadsheet\IOFactory::class)) {
            // Fallback : traiter comme CSV si extension absente
            return $this->readCsv($path);
        }
        $spreadsheet = \PhpOffice\PhpSpreadsheet\IOFactory::load($path);
        $sheet       = $spreadsheet->getActiveSheet();
        $rows        = [];
        foreach ($sheet->getRowIterator() as $row) {
            $cells = [];
            $ci    = $row->getCellIterator();
            $ci->setIterateOnlyExistingCells(false);
            foreach ($ci as $cell) {
                $cells[] = $cell->getFormattedValue();
            }
            // Ignorer les lignes entièrement vides
            if (array_filter($cells, fn ($v) => $v !== '' && $v !== null)) {
                $rows[] = $cells;
            }
        }
        return $rows;
    }

    private function applyMapping(array $row, array $mapping, array $columns): array
    {
        $data = [];
        foreach ($mapping as $colIndex => $field) {
            if ($field && isset($row[$colIndex])) {
                $data[$field] = trim($row[$colIndex]);
            }
        }
        // Remplir les champs non mappés avec null
        foreach (array_keys($columns) as $field) {
            if (!array_key_exists($field, $data)) {
                $data[$field] = null;
            }
        }
        return $data;
    }

    private function buildRules(array $columns): array
    {
        $rules = [];
        foreach ($columns as $field => $cfg) {
            $r = [];
            $r[] = $cfg['required'] ? 'required' : 'nullable';
            if (isset($cfg['rule'])) {
                $r[] = $cfg['rule'];
            }
            $rules[$field] = implode('|', $r);
        }
        return $rules;
    }

    // ── 5 méthodes d'import enrichies ────────────────────────────────────────

    /**
     * Import Projets
     * POST /import/projects
     */
    public function projects(Request $request): RedirectResponse
    {
        $request->validate([
            'mapping'   => 'required|array',
            'tmp_path'  => 'required|string',
            'skip_dups' => 'boolean',
        ]);

        $user      = $request->user();
        $companyId = $user->company_id;
        $skipDups  = $request->boolean('skip_dups', true);

        $path = storage_path('app/' . $request->tmp_path);
        $ext  = pathinfo($path, PATHINFO_EXTENSION);
        $rows = in_array($ext, ['xlsx', 'xls']) ? $this->readExcel($path) : $this->readCsv($path);
        array_shift($rows);

        $cfg = self::IMPORTABLE_TYPES['projects'];
        [$inserted, $skipped, $failed] = [0, 0, 0];

        DB::beginTransaction();
        try {
            foreach (array_chunk($rows, 100) as $chunk) {
                foreach ($chunk as $row) {
                    $mapped = $this->applyMapping($row, $request->mapping, $cfg['columns']);

                    // Génération automatique du code si absent
                    if (empty($mapped['code'])) {
                        $mapped['code'] = 'PROJ-' . strtoupper(substr(uniqid(), -5));
                    }

                    // Dédoublonnage par code
                    if ($skipDups && \App\Models\Project::where('company_id', $companyId)->where('code', $mapped['code'])->exists()) {
                        $skipped++;
                        continue;
                    }

                    // Mapping statut FR → EN
                    if (!empty($mapped['status'])) {
                        $mapped['status'] = $this->mapProjectStatus($mapped['status']);
                    }

                    // Parsing dates flexibles
                    $mapped['start_date'] = $this->parseFlexDate($mapped['start_date'] ?? null);
                    $mapped['end_date']   = $this->parseFlexDate($mapped['end_date'] ?? null);

                    // Budget : nettoyage
                    $budgetRaw = $mapped['budget'] ?? null;

                    \App\Models\Project::create([
                        'company_id'    => $companyId,
                        'code'          => $mapped['code'],
                        'name'          => $mapped['name'] ?? '',
                        'client_name'   => $mapped['client'] ?? null,
                        'description'   => $mapped['description'] ?? null,
                        'status'        => $mapped['status'] ?? 'planned',
                        'start_date'    => $mapped['start_date'],
                        'end_date'      => $mapped['end_date'],
                        'budget_amount' => is_numeric($budgetRaw) ? $budgetRaw : null,
                        'city'          => $mapped['location'] ?? null,
                        'type'          => $mapped['project_type'] ?? null,
                    ]);
                    $inserted++;
                }
            }
            DB::commit();
        } catch (\Throwable $e) {
            DB::rollBack();
            return back()->withErrors(['import' => 'Erreur import projets : ' . $e->getMessage()]);
        }
        @unlink($path);

        return redirect()->route('import.index')
            ->with('success', "Import Projets — {$inserted} créés, {$skipped} doublons ignorés, {$failed} erreurs.");
    }

    /**
     * Import Devis
     * POST /import/quotes
     */
    public function quotes(Request $request): RedirectResponse
    {
        $request->validate([
            'mapping'   => 'required|array',
            'tmp_path'  => 'required|string',
            'skip_dups' => 'boolean',
        ]);

        $user      = $request->user();
        $companyId = $user->company_id;
        $skipDups  = $request->boolean('skip_dups', true);

        $path = storage_path('app/' . $request->tmp_path);
        $ext  = pathinfo($path, PATHINFO_EXTENSION);
        $rows = in_array($ext, ['xlsx', 'xls']) ? $this->readExcel($path) : $this->readCsv($path);
        array_shift($rows);

        $cfg = self::IMPORTABLE_TYPES['quotes'];
        [$inserted, $skipped, $failed] = [0, 0, 0];

        DB::beginTransaction();
        try {
            foreach (array_chunk($rows, 100) as $chunk) {
                foreach ($chunk as $row) {
                    $mapped = $this->applyMapping($row, $request->mapping, $cfg['columns']);

                    if (empty($mapped['number'])) { $failed++; continue; }

                    // Dédoublonnage par numéro (= code)
                    if ($skipDups && \App\Models\Quote::where('company_id', $companyId)->where('code', $mapped['number'])->exists()) {
                        $skipped++;
                        continue;
                    }

                    // Lookups FK
                    $clientId  = !empty($mapped['client'])  ? $this->findClientIdByName($mapped['client'], $companyId)  : null;
                    $projectId = !empty($mapped['project']) ? $this->findProjectIdByName($mapped['project'], $companyId) : null;

                    // Statut FR → EN
                    $status = $this->mapQuoteStatus($mapped['status'] ?? '');

                    $subtotal = is_numeric($mapped['amount'] ?? null) ? (float) $mapped['amount'] : 0.0;
                    $taxRate  = is_numeric($mapped['tax_rate'] ?? null) ? (float) $mapped['tax_rate'] : 0.0;
                    $taxAmt   = round($subtotal * $taxRate / 100, 2);

                    \App\Models\Quote::create([
                        'company_id'  => $companyId,
                        'code'        => $mapped['number'],
                        'client_id'   => $clientId,
                        'client_name' => $mapped['client'] ?? null,
                        'project_id'  => $projectId,
                        'title'       => $mapped['title'] ?? null,
                        'subtotal'    => $subtotal,
                        'tax_rate'    => $taxRate,
                        'tax_amount'  => $taxAmt,
                        'total'       => round($subtotal + $taxAmt, 2),
                        'status'      => $status,
                        'date'        => $this->parseFlexDate($mapped['issue_date'] ?? null) ?? now()->toDateString(),
                        'valid_until' => $this->parseFlexDate($mapped['valid_until'] ?? null),
                        'currency'    => $mapped['currency'] ?? 'XOF',
                    ]);
                    $inserted++;
                }
            }
            DB::commit();
        } catch (\Throwable $e) {
            DB::rollBack();
            return back()->withErrors(['import' => 'Erreur import devis : ' . $e->getMessage()]);
        }
        @unlink($path);

        return redirect()->route('import.index')
            ->with('success', "Import Devis — {$inserted} créés, {$skipped} doublons ignorés, {$failed} erreurs.");
    }

    /**
     * Import Factures
     * POST /import/invoices
     */
    public function invoices(Request $request): RedirectResponse
    {
        $request->validate([
            'mapping'   => 'required|array',
            'tmp_path'  => 'required|string',
            'skip_dups' => 'boolean',
        ]);

        $user      = $request->user();
        $companyId = $user->company_id;
        $skipDups  = $request->boolean('skip_dups', true);

        $path = storage_path('app/' . $request->tmp_path);
        $ext  = pathinfo($path, PATHINFO_EXTENSION);
        $rows = in_array($ext, ['xlsx', 'xls']) ? $this->readExcel($path) : $this->readCsv($path);
        array_shift($rows);

        $cfg = self::IMPORTABLE_TYPES['invoices'];
        [$inserted, $skipped, $failed] = [0, 0, 0];

        DB::beginTransaction();
        try {
            foreach (array_chunk($rows, 100) as $chunk) {
                foreach ($chunk as $row) {
                    $mapped = $this->applyMapping($row, $request->mapping, $cfg['columns']);

                    if (empty($mapped['number'])) { $failed++; continue; }

                    // Dédoublonnage par numéro (= code)
                    if ($skipDups && \App\Models\Invoice::where('company_id', $companyId)->where('code', $mapped['number'])->exists()) {
                        $skipped++;
                        continue;
                    }

                    $clientId  = !empty($mapped['client'])  ? $this->findClientIdByName($mapped['client'], $companyId)  : null;
                    $projectId = !empty($mapped['project']) ? $this->findProjectIdByName($mapped['project'], $companyId) : null;

                    $status   = $this->mapInvoiceStatus($mapped['status'] ?? '');
                    $subtotal = is_numeric($mapped['amount'] ?? null) ? (float) $mapped['amount'] : 0.0;
                    $taxRate  = is_numeric($mapped['tax_rate'] ?? null) ? (float) $mapped['tax_rate'] : 0.0;
                    $taxAmt   = round($subtotal * $taxRate / 100, 2);

                    \App\Models\Invoice::create([
                        'company_id'  => $companyId,
                        'code'        => $mapped['number'],
                        'client_id'   => $clientId,
                        'project_id'  => $projectId,
                        'subtotal'    => $subtotal,
                        'tax_rate'    => $taxRate,
                        'tax_amount'  => $taxAmt,
                        'total'       => round($subtotal + $taxAmt, 2),
                        'amount_paid' => 0,
                        'status'      => $status,
                        'issue_date'  => $this->parseFlexDate($mapped['issue_date'] ?? null) ?? now()->toDateString(),
                        'due_date'    => $this->parseFlexDate($mapped['due_date'] ?? null),
                        'currency'    => $mapped['currency'] ?? 'XOF',
                        'notes'       => $mapped['title'] ?? null,
                    ]);
                    $inserted++;
                }
            }
            DB::commit();
        } catch (\Throwable $e) {
            DB::rollBack();
            return back()->withErrors(['import' => 'Erreur import factures : ' . $e->getMessage()]);
        }
        @unlink($path);

        return redirect()->route('import.index')
            ->with('success', "Import Factures — {$inserted} créées, {$skipped} doublons ignorés, {$failed} erreurs.");
    }

    /**
     * Import Stocks / Matériaux (updateOrCreate)
     * POST /import/stocks
     */
    public function stocks(Request $request): RedirectResponse
    {
        $request->validate([
            'mapping'   => 'required|array',
            'tmp_path'  => 'required|string',
            'skip_dups' => 'boolean',
        ]);

        $user      = $request->user();
        $companyId = $user->company_id;

        $path = storage_path('app/' . $request->tmp_path);
        $ext  = pathinfo($path, PATHINFO_EXTENSION);
        $rows = in_array($ext, ['xlsx', 'xls']) ? $this->readExcel($path) : $this->readCsv($path);
        array_shift($rows);

        $cfg = self::IMPORTABLE_TYPES['stocks'];
        [$inserted, $updated, $failed] = [0, 0, 0];

        DB::beginTransaction();
        try {
            foreach (array_chunk($rows, 100) as $chunk) {
                foreach ($chunk as $row) {
                    $mapped = $this->applyMapping($row, $request->mapping, $cfg['columns']);

                    if (empty($mapped['name'])) { $failed++; continue; }

                    // Recherche par code, puis par similarité sur le nom
                    $existing = null;
                    if (!empty($mapped['code'])) {
                        $existing = \App\Models\Material::where('company_id', $companyId)
                            ->where('code', $mapped['code'])->first();
                    }
                    if (!$existing && !empty($mapped['name'])) {
                        $candidates = \App\Models\Material::where('company_id', $companyId)->get(['id', 'name']);
                        foreach ($candidates as $candidate) {
                            similar_text(strtolower($mapped['name']), strtolower($candidate->name), $pct);
                            if ($pct >= 80) { $existing = $candidate; break; }
                        }
                    }

                    $attributes = ['company_id' => $companyId, 'code' => $mapped['code'] ?? null];
                    $values     = array_filter([
                        'name'       => $mapped['name'],
                        'unit'       => $mapped['unit'] ?? null,
                        'unit_price' => is_numeric($mapped['unit_price'] ?? null) ? $mapped['unit_price'] : null,
                        'min_stock'  => is_numeric($mapped['min_stock']  ?? null) ? $mapped['min_stock']  : null,
                        'category'   => $mapped['supplier'] ?? null,  // Fournisseur → category si disponible
                    ], fn ($v) => $v !== null);

                    if ($existing) {
                        $existing->update($values);
                        // Ajustement de stock via mouvement si quantité fournie
                        if (is_numeric($mapped['quantity'] ?? null) && $mapped['quantity'] > 0) {
                            \App\Models\StockMovement::create([
                                'company_id'  => $companyId,
                                'material_id' => $existing->id,
                                'type'        => 'adjustment',
                                'quantity'    => (float) $mapped['quantity'],
                                'notes'       => 'Import CSV',
                                'moved_at'    => now()->toDateString(),
                            ]);
                        }
                        $updated++;
                    } else {
                        $material = \App\Models\Material::create(array_merge(['company_id' => $companyId], $values, [
                            'code' => $mapped['code'] ?? ('MAT-' . strtoupper(substr(uniqid(), -5))),
                            'name' => $mapped['name'],
                        ]));
                        if (is_numeric($mapped['quantity'] ?? null) && $mapped['quantity'] > 0) {
                            \App\Models\StockMovement::create([
                                'company_id'  => $companyId,
                                'material_id' => $material->id,
                                'type'        => 'adjustment',
                                'quantity'    => (float) $mapped['quantity'],
                                'notes'       => 'Import CSV — stock initial',
                                'moved_at'    => now()->toDateString(),
                            ]);
                        }
                        $inserted++;
                    }
                }
            }
            DB::commit();
        } catch (\Throwable $e) {
            DB::rollBack();
            return back()->withErrors(['import' => 'Erreur import stocks : ' . $e->getMessage()]);
        }
        @unlink($path);

        return redirect()->route('import.index')
            ->with('success', "Import Stocks — {$inserted} créés, {$updated} mis à jour.");
    }

    /**
     * Import Équipements
     * POST /import/equipment
     */
    public function equipment(Request $request): RedirectResponse
    {
        $request->validate([
            'mapping'   => 'required|array',
            'tmp_path'  => 'required|string',
            'skip_dups' => 'boolean',
        ]);

        $user      = $request->user();
        $companyId = $user->company_id;
        $skipDups  = $request->boolean('skip_dups', true);

        $path = storage_path('app/' . $request->tmp_path);
        $ext  = pathinfo($path, PATHINFO_EXTENSION);
        $rows = in_array($ext, ['xlsx', 'xls']) ? $this->readExcel($path) : $this->readCsv($path);
        array_shift($rows);

        $cfg = self::IMPORTABLE_TYPES['equipment'];
        [$inserted, $skipped, $failed] = [0, 0, 0];

        DB::beginTransaction();
        try {
            foreach (array_chunk($rows, 100) as $chunk) {
                foreach ($chunk as $row) {
                    $mapped = $this->applyMapping($row, $request->mapping, $cfg['columns']);

                    if (empty($mapped['name'])) { $failed++; continue; }

                    // Dédoublonnage : numéro de série (registration), puis code
                    $uniqueKey = $mapped['serial_number'] ?? $mapped['code'] ?? null;
                    if ($skipDups && $uniqueKey) {
                        $exists = \App\Models\Equipment::where('company_id', $companyId)
                            ->where(fn ($q) => $q->where('registration', $uniqueKey)->orWhere('code', $uniqueKey))
                            ->exists();
                        if ($exists) { $skipped++; continue; }
                    }

                    $status = $this->mapEquipmentStatus($mapped['status'] ?? '');

                    \App\Models\Equipment::create([
                        'company_id'       => $companyId,
                        'code'             => $mapped['code'] ?? ('EQ-' . strtoupper(substr(uniqid(), -5))),
                        'name'             => $mapped['name'],
                        'category'         => $mapped['type'] ?? null,
                        'brand'            => $mapped['brand'] ?? null,
                        'model'            => $mapped['model'] ?? null,
                        'registration'     => $mapped['serial_number'] ?? null,
                        'acquisition_date' => $this->parseFlexDate($mapped['purchase_date'] ?? null),
                        'acquisition_value'=> is_numeric($mapped['purchase_price'] ?? null) ? $mapped['purchase_price'] : null,
                        'status'           => $status,
                        'notes'            => $mapped['location'] ?? null,
                        'is_active'        => true,
                    ]);
                    $inserted++;
                }
            }
            DB::commit();
        } catch (\Throwable $e) {
            DB::rollBack();
            return back()->withErrors(['import' => 'Erreur import équipements : ' . $e->getMessage()]);
        }
        @unlink($path);

        return redirect()->route('import.index')
            ->with('success', "Import Équipements — {$inserted} créés, {$skipped} doublons ignorés, {$failed} erreurs.");
    }

    // ── Helpers enrichis ─────────────────────────────────────────────────────

    /**
     * Parse une date en acceptant dd/mm/yyyy, dd-mm-yyyy, ou yyyy-mm-dd.
     * Retourne une chaîne yyyy-mm-dd ou null.
     */
    private function parseFlexDate(?string $val): ?string
    {
        if (!$val || trim($val) === '') return null;
        $val = trim($val);

        // Format dd/mm/yyyy ou dd-mm-yyyy
        if (preg_match('#^(\d{1,2})[/\-](\d{1,2})[/\-](\d{4})$#', $val, $m)) {
            return sprintf('%04d-%02d-%02d', (int) $m[3], (int) $m[2], (int) $m[1]);
        }
        // Format yyyy-mm-dd (ou yyyy/mm/dd)
        if (preg_match('#^(\d{4})[/\-](\d{1,2})[/\-](\d{1,2})$#', $val, $m)) {
            return sprintf('%04d-%02d-%02d', (int) $m[1], (int) $m[2], (int) $m[3]);
        }
        return null;
    }

    private function mapProjectStatus(string $val): string
    {
        return match (strtolower(trim($val))) {
            'en cours', 'en_cours', 'in progress', 'in_progress' => 'in_progress',
            'terminé', 'termine', 'completed', 'done', 'fini'    => 'completed',
            'suspendu', 'suspended', 'on hold', 'on_hold'        => 'on_hold',
            'annulé', 'annule', 'cancelled', 'canceled'          => 'cancelled',
            default                                               => 'planned',
        };
    }

    private function mapQuoteStatus(string $val): string
    {
        return match (strtolower(trim($val))) {
            'envoyé', 'envoye', 'sent'                    => 'sent',
            'accepté', 'accepte', 'accepted', 'signé'     => 'accepted',
            'refusé', 'refuse', 'rejected', 'décliné'     => 'rejected',
            'expiré', 'expire', 'expired'                  => 'expired',
            default                                        => 'draft',
        };
    }

    private function mapInvoiceStatus(string $val): string
    {
        return match (strtolower(trim($val))) {
            'envoyée', 'envoyé', 'sent'                    => 'sent',
            'payée', 'payee', 'paid', 'réglée'             => 'paid',
            'en retard', 'retard', 'overdue', 'impayée'    => 'overdue',
            'annulée', 'annulee', 'cancelled', 'canceled'  => 'cancelled',
            default                                         => 'draft',
        };
    }

    private function mapEquipmentStatus(string $val): string
    {
        return match (strtolower(trim($val))) {
            'en service', 'en_service', 'in_use', 'utilisé' => 'in_use',
            'maintenance', 'en maintenance', 'révision'      => 'maintenance',
            'hors service', 'hors_service', 'out_of_service',
            'défectueux', 'cassé'                            => 'out_of_service',
            default                                          => 'available',
        };
    }

    /**
     * Recherche un client par nom (exact d'abord, puis similarité > 70 %).
     */
    private function findClientIdByName(string $name, int $companyId): ?int
    {
        $exact = \App\Models\Client::where('company_id', $companyId)
            ->whereRaw('LOWER(name) = ?', [strtolower($name)])->value('id');
        if ($exact) return $exact;

        $candidates = \App\Models\Client::where('company_id', $companyId)->get(['id', 'name']);
        $best = null; $bestPct = 0;
        foreach ($candidates as $c) {
            similar_text(strtolower($name), strtolower($c->name), $pct);
            if ($pct > $bestPct) { $bestPct = $pct; $best = $c; }
        }
        return ($bestPct >= 70) ? $best?->id : null;
    }

    /**
     * Recherche un projet par nom (exact d'abord, puis similarité > 70 %).
     */
    private function findProjectIdByName(string $name, int $companyId): ?int
    {
        $exact = \App\Models\Project::where('company_id', $companyId)
            ->whereRaw('LOWER(name) = ?', [strtolower($name)])->value('id');
        if ($exact) return $exact;

        $candidates = \App\Models\Project::where('company_id', $companyId)->get(['id', 'name']);
        $best = null; $bestPct = 0;
        foreach ($candidates as $c) {
            similar_text(strtolower($name), strtolower($c->name), $pct);
            if ($pct > $bestPct) { $bestPct = $pct; $best = $c; }
        }
        return ($bestPct >= 70) ? $best?->id : null;
    }
}
