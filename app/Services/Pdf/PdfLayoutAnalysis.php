<?php
namespace App\Services\Pdf;

readonly class PdfLayoutAnalysis {
    public function __construct(
        public string $pageFormat,        // 'a4' ou 'a3'
        public string $orientation,       // 'portrait' ou 'landscape'
        public string $marginStyle,       // 'normal' ou 'compact'
        public array  $margins,           // [top, right, bottom, left] en mm
        public float  $usableWidth,       // mm
        public float  $usableHeight,      // mm
        public int    $fontSize,          // pt (corps tableau)
        public int    $headerFontSize,    // pt (en-têtes colonnes)
        public float  $rowHeight,         // mm (hauteur ligne estimée)
        public int    $estimatedRowsPerPage,
        public int    $estimatedPages,
        public array  $columns,           // tableau enrichi avec 'width_mm', 'nowrap', etc.
        public float  $widthUtilization,  // 0.0 à 1.0
        public float  $score,
        public string $candidateLabel,    // ex: 'A4 paysage compact'
    ) {}

    public function cssPageSize(): string {
        if ($this->pageFormat === 'a3') return $this->orientation === 'landscape' ? 'A3 landscape' : 'A3';
        return $this->orientation === 'landscape' ? 'A4 landscape' : 'A4';
    }
}
