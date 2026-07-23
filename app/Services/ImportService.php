<?php

namespace App\Services;

use App\Models\ImportLog;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Validator;

class ImportService
{
    /**
     * Lit un fichier CSV ou XLSX et retourne les données en tableau.
     *
     * @return array{headers: string[], rows: array<array<string,string>>}
     */
    public function parseFile(UploadedFile $file): array
    {
        $extension = strtolower($file->getClientOriginalExtension());

        if ($extension === 'csv' || $extension === 'txt') {
            return $this->parseCsv($file->getRealPath());
        }

        return $this->parseXlsx($file->getRealPath());
    }

    /**
     * Lit un fichier CSV (chemin absolu) et retourne les données.
     *
     * @return array{headers: string[], rows: array<array<string,string>>}
     */
    public function parseCsv(string $path): array
    {
        $rows   = [];
        $handle = fopen($path, 'r');

        if ($handle === false) {
            throw new \RuntimeException("Impossible d'ouvrir le fichier : {$path}");
        }

        // Détecter et ignorer le BOM UTF-8
        $bom = fread($handle, 3);
        if ($bom !== "\xEF\xBB\xBF") {
            rewind($handle);
        }

        // Détecter le délimiteur (point-virgule ou virgule)
        $firstLine = fgets($handle);
        rewind($handle);
        // Re-skip BOM
        $bom2 = fread($handle, 3);
        if ($bom2 !== "\xEF\xBB\xBF") {
            rewind($handle);
        }

        $delimiter = substr_count((string) $firstLine, ';') >= substr_count((string) $firstLine, ',') ? ';' : ',';

        $headers = null;
        while (($row = fgetcsv($handle, 0, $delimiter)) !== false) {
            if ($headers === null) {
                $headers = array_map('trim', $row);
                continue;
            }
            // Ignorer les lignes vides ou mal formées
            if (count($row) !== count($headers)) {
                continue;
            }
            $combined = array_combine($headers, array_map('trim', $row));
            if ($combined !== false) {
                $rows[] = $combined;
            }
        }

        fclose($handle);

        return ['headers' => $headers ?? [], 'rows' => $rows];
    }

    /**
     * Lit un fichier XLSX (chemin absolu) via PhpSpreadsheet.
     *
     * @return array{headers: string[], rows: array<array<string,string>>}
     */
    public function parseXlsx(string $path): array
    {
        if (!class_exists(\PhpOffice\PhpSpreadsheet\IOFactory::class)) {
            throw new \RuntimeException('PhpSpreadsheet non disponible. Utilisez le format CSV.');
        }

        $spreadsheet = \PhpOffice\PhpSpreadsheet\IOFactory::load($path);
        $sheet       = $spreadsheet->getActiveSheet()->toArray(null, true, true, false);

        if (empty($sheet)) {
            return ['headers' => [], 'rows' => []];
        }

        $headers = array_map(fn($v) => trim((string) $v), $sheet[0]);
        $rows    = [];

        foreach (array_slice($sheet, 1) as $row) {
            // Ignorer les lignes entièrement vides
            if (count(array_filter($row, fn($v) => $v !== '' && $v !== null)) === 0) {
                continue;
            }

            $combined = array_combine($headers, array_map(fn($v) => trim((string) $v), $row));
            if ($combined !== false) {
                $rows[] = $combined;
            }
        }

        return ['headers' => $headers, 'rows' => $rows];
    }

    /**
     * Valide les données selon les règles du module.
     *
     * @param  array<array<string,mixed>> $rows
     * @param  array<string,string>       $rules  Laravel validation rules
     * @return array{valid: array, errors: array}
     */
    public function validateRows(array $rows, array $rules): array
    {
        $errors = [];
        $valid  = [];

        foreach ($rows as $i => $row) {
            $validator = Validator::make($row, $rules);
            if ($validator->fails()) {
                $errors[] = [
                    'row'    => $i + 2, // +2 : ligne 1 = en-têtes, tableau commence à 0
                    'errors' => $validator->errors()->all(),
                ];
            } else {
                $valid[] = $row;
            }
        }

        return ['valid' => $valid, 'errors' => $errors];
    }

    /**
     * Applique un mapping colonne-fichier → champ-DB sur un tableau de lignes.
     *
     * @param  array<array<string,string>> $rows
     * @param  array<string,string>        $mapping  ['fileCol' => 'dbCol']
     * @return array<array<string,string|null>>
     */
    public function applyMapping(array $rows, array $mapping): array
    {
        return array_map(function (array $row) use ($mapping) {
            $result = [];
            foreach ($mapping as $fileCol => $dbCol) {
                if ($dbCol !== '' && $dbCol !== null) {
                    $result[$dbCol] = $row[$fileCol] ?? null;
                }
            }
            return $result;
        }, $rows);
    }
}
