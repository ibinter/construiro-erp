<?php
namespace App\Services\Pdf;

class PdfLayoutEngine {
    // Candidats ordonnés par préférence (essayé dans l'ordre, on prend le premier qui passe le seuil)
    private const CANDIDATES = [
        ['format' => 'a4', 'orientation' => 'portrait',  'margin' => 'normal',  'usable' => 186.0, 'height' => 257.0, 'label' => 'A4 portrait normal'],
        ['format' => 'a4', 'orientation' => 'portrait',  'margin' => 'compact', 'usable' => 194.0, 'height' => 271.0, 'label' => 'A4 portrait compact'],
        ['format' => 'a4', 'orientation' => 'landscape', 'margin' => 'normal',  'usable' => 273.0, 'height' => 170.0, 'label' => 'A4 paysage normal'],
        ['format' => 'a4', 'orientation' => 'landscape', 'margin' => 'compact', 'usable' => 281.0, 'height' => 182.0, 'label' => 'A4 paysage compact'],
        ['format' => 'a3', 'orientation' => 'landscape', 'margin' => 'normal',  'usable' => 393.0, 'height' => 257.0, 'label' => 'A3 paysage'],
    ];

    private const MARGINS = [
        'normal'  => ['top' => 15, 'right' => 12, 'bottom' => 15, 'left' => 12],
        'compact' => ['top' => 10, 'right' =>  8, 'bottom' => 10, 'left' =>  8],
    ];

    // Hauteur réservée au header et footer (première page, mm)
    private const HEADER_HEIGHT_FIRST = 38.0;
    private const HEADER_HEIGHT_CONT  = 14.0; // pages suivantes
    private const FOOTER_HEIGHT       = 12.0;
    private const TABLE_HEADER_HEIGHT = 8.0;

    public static function selectBestLayout(array $columnDefs, array $rows, array $options = []): PdfLayoutAnalysis {
        // Enrichir les colonnes avec largeurs naturelles
        $enrichedCols = ColumnWidthCalculator::calculate($columnDefs, $rows);
        $rowCount = count($rows);

        $bestScore = -PHP_FLOAT_MAX;
        $bestAnalysis = null;

        foreach (self::CANDIDATES as $candidate) {
            $analysis = self::evaluateCandidate($candidate, $enrichedCols, $rowCount, $options);
            if ($analysis->score > $bestScore) {
                $bestScore = $analysis->score;
                $bestAnalysis = $analysis;
            }
            // Si A4 portrait normal donne un bon score, l'utiliser directement
            if ($candidate['orientation'] === 'portrait' && $candidate['margin'] === 'normal' && $analysis->score >= 0.70) {
                break;
            }
        }

        return $bestAnalysis;
    }

    private static function evaluateCandidate(array $cand, array $cols, int $rowCount, array $options): PdfLayoutAnalysis {
        $usable = $cand['usable'];
        $usableH = $cand['height'];
        $margins = self::MARGINS[$cand['margin']];

        // 1. Distribuer les largeurs : commencer par les min, redistribuer l'espace flex
        $totalMin = array_sum(array_column($cols, 'min_width_mm'));
        $totalFlex = array_sum(array_column($cols, 'flex'));
        $remaining = $usable - $totalMin;

        $computedCols = [];
        $totalWidth = 0;

        foreach ($cols as $col) {
            if ($remaining > 0 && $totalFlex > 0) {
                $extra = $remaining * ($col['flex'] / $totalFlex);
            } else {
                $extra = 0;
            }
            $w = min($col['max_width_mm'], $col['min_width_mm'] + $extra);
            $totalWidth += $w;
            $computedCols[] = array_merge($col, ['width_mm' => round($w, 1)]);
        }

        // 2. Si trop large, essayer de compresser (réduire les flex-heavy en premier)
        $overflow = $totalWidth - $usable;
        if ($overflow > 0.5) {
            // Réduire proportionnellement les colonnes > min
            foreach ($computedCols as &$col) {
                $headroom = $col['width_mm'] - $col['min_width_mm'];
                if ($headroom > 0 && $overflow > 0) {
                    $cut = min($headroom, $overflow * ($col['flex'] / max($totalFlex, 0.01)));
                    $col['width_mm'] = round($col['width_mm'] - $cut, 1);
                    $overflow -= $cut;
                }
            }
            unset($col);
            $totalWidth = array_sum(array_column($computedCols, 'width_mm'));
        }

        // 3. Étirer si sous-utilisé (widthUtil < 0.88)
        $widthUtil = min(1.0, $totalWidth / $usable);
        if ($widthUtil < 0.88) {
            $gapPerFlex = ($usable - $totalWidth) / max($totalFlex, 0.01);
            foreach ($computedCols as &$col) {
                $bonus = $gapPerFlex * $col['flex'];
                $col['width_mm'] = round(min($col['max_width_mm'], $col['width_mm'] + $bonus), 1);
            }
            unset($col);
            $totalWidth = array_sum(array_column($computedCols, 'width_mm'));
            $widthUtil = min(1.0, $totalWidth / $usable);
        }

        // 4. Taille de police adaptative
        $colCount = count($cols);
        $fontSize = 9;
        if ($colCount <= 5) $fontSize = 10;
        if ($colCount >= 10) $fontSize = 8;
        if ($totalWidth > $usable * 0.98) $fontSize = max(7, $fontSize - 1);

        $headerFontSize = max(7, $fontSize - 1);

        // 5. Hauteur de ligne
        $rowHeight = $fontSize * 0.352778 + 4.5; // pt → mm + padding

        // 6. Lignes par page
        $firstPageUsableH = $usableH - self::HEADER_HEIGHT_FIRST - self::FOOTER_HEIGHT - self::TABLE_HEADER_HEIGHT;
        $contPageUsableH  = $usableH - self::HEADER_HEIGHT_CONT  - self::FOOTER_HEIGHT - self::TABLE_HEADER_HEIGHT;
        $rowsPage1  = max(1, (int) floor($firstPageUsableH / $rowHeight));
        $rowsPageN  = max(1, (int) floor($contPageUsableH  / $rowHeight));

        // 7. Nombre de pages estimé
        if ($rowCount <= $rowsPage1) {
            $estPages = 1;
            $lastPageFill = $rowCount / max(1, $rowsPage1);
        } else {
            $remaining2 = $rowCount - $rowsPage1;
            $extraPages = (int) ceil($remaining2 / $rowsPageN);
            $estPages = 1 + $extraPages;
            $lastFill = $remaining2 % $rowsPageN;
            $lastPageFill = $lastFill === 0 ? 1.0 : ($lastFill / $rowsPageN);
        }

        // 8. Pénalités / score
        $nearlyEmptyLastPage = ($estPages > 1 && $lastPageFill < 0.25) ? 1 : 0;
        $tooManyPages        = max(0, $estPages - 3) * 0.05;
        $fontTooSmall        = $fontSize < 8 ? 0.3 : 0;
        $colsTooNarrow       = count(array_filter($computedCols, fn($c) => $c['width_mm'] < $c['min_width_mm'])) > 0 ? 0.4 : 0;

        $score = 0.35 * $widthUtil
               + 0.25 * ($fontSize >= 9 ? 1.0 : ($fontSize / 9))
               + 0.20 * (1 / max(1, $estPages))
               - 0.20 * $nearlyEmptyLastPage
               - 0.10 * $tooManyPages
               - $fontTooSmall
               - $colsTooNarrow;

        // Bonus fort pour A4 portrait (préférence)
        if ($cand['format'] === 'a4' && $cand['orientation'] === 'portrait') {
            $score += 0.15;
        }

        return new PdfLayoutAnalysis(
            pageFormat:             $cand['format'],
            orientation:            $cand['orientation'],
            marginStyle:            $cand['margin'],
            margins:                $margins,
            usableWidth:            $usable,
            usableHeight:           $usableH,
            fontSize:               $fontSize,
            headerFontSize:         $headerFontSize,
            rowHeight:              round($rowHeight, 2),
            estimatedRowsPerPage:   $rowsPage1,
            estimatedPages:         $estPages,
            columns:                $computedCols,
            widthUtilization:       round($widthUtil, 3),
            score:                  round($score, 4),
            candidateLabel:         $cand['label'],
        );
    }
}
