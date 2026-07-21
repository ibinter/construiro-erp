<?php

namespace App\Http\Controllers;

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
    ];

    // ── 1. Sélection du type ─────────────────────────────────────────────────

    public function index(): Response
    {
        return Inertia::render('Import/Index', [
            'types' => collect(self::IMPORTABLE_TYPES)->map(fn ($cfg, $key) => [
                'key'   => $key,
                'label' => $cfg['label'],
            ])->values(),
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
}
