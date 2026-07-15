<?php
namespace App\Services\Pdf;

class ColumnWidthCalculator {
    /**
     * Analyse les données et retourne les colonnes enrichies avec 'natural_width_mm'.
     * @param array $columnDefs  [['key'=>..,'label'=>..,'type'=>..,'priority'=>..], ...]
     * @param array $rows        Lignes de données (tableaux associatifs ou objets)
     */
    public static function calculate(array $columnDefs, array $rows): array {
        // Facteur largeur : nb chars × mm/char selon type
        // Nombre moyen de mm par caractère selon la police DejaVu 9pt ≈ 1.8mm
        // Pour les chiffres c'est plus compact ≈ 1.5mm
        $mmPerChar = [
            'amount' => 1.4, 'number' => 1.4, 'percentage' => 1.4,
            'date' => 1.6, 'datetime' => 1.6, 'phone' => 1.7, 'id' => 1.5,
            'default' => 1.85,
        ];

        $enriched = [];
        foreach ($columnDefs as $col) {
            $type = $col['type'] ?? 'default';
            $rules = ColumnDefinition::rulesFor($type);
            $mpc = $mmPerChar[$type] ?? $mmPerChar['default'];

            // Calculer le 90e percentile des longueurs de valeur
            $lengths = [];
            foreach ($rows as $row) {
                $val = is_array($row) ? ($row[$col['key']] ?? '') : (is_object($row) ? ($row->{$col['key']} ?? '') : '');
                $lengths[] = mb_strlen((string) $val);
            }

            if (empty($lengths)) {
                $p90 = 0;
            } else {
                sort($lengths);
                $idx = (int) ceil(count($lengths) * 0.90) - 1;
                $p90 = $lengths[max(0, $idx)];
            }

            // Largeur label
            $labelWidth = mb_strlen($col['label'] ?? '') * $mpc * 1.1; // +10% gras

            // Largeur naturelle = max(label, p90 données)
            $natural = max($labelWidth, $p90 * $mpc);

            // Padding interne (2×4mm)
            $natural += 8;

            // Clamp min/max
            $natural = max($rules['min'], min($rules['max'], $natural));

            $enriched[] = array_merge($col, [
                'type'            => $type,
                'nowrap'          => $col['nowrap'] ?? $rules['nowrap'],
                'priority'        => $col['priority'] ?? 'important',
                'natural_width_mm'=> $natural,
                'min_width_mm'    => $rules['min'],
                'max_width_mm'    => $rules['max'],
                'flex'            => $rules['flex'],
            ]);
        }

        return $enriched;
    }
}
