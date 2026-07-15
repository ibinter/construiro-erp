<?php
namespace App\Services\Pdf;

use App\Models\Company;
use App\Models\User;
use Barryvdh\DomPDF\Facade\Pdf;
use Symfony\Component\HttpFoundation\StreamedResponse;

class PdfTableExportService {
    /**
     * Génère un PDF de liste adaptatif.
     *
     * @param string  $title       Titre du document
     * @param array   $columnDefs  [['key','label','type','priority','nowrap(opt)'], ...]
     * @param array   $rows        Données (tableaux associatifs)
     * @param Company $company     Société de l'utilisateur
     * @param User    $user        Utilisateur courant
     * @param array   $options     ['filename'=>..., 'subtitle'=>..., 'filters'=>[...]]
     */
    public static function export(
        string  $title,
        array   $columnDefs,
        array   $rows,
        Company $company,
        User    $user,
        array   $options = [],
    ): StreamedResponse {
        // 1. Sélectionner le meilleur layout
        $layout = PdfLayoutEngine::selectBestLayout($columnDefs, $rows, $options);

        // 2. Rendu Blade
        $html = view('pdf.engine.list', [
            'layout'   => $layout,
            'title'    => $title,
            'subtitle' => $options['subtitle'] ?? null,
            'filters'  => $options['filters'] ?? [],
            'company'  => $company,
            'user'     => $user,
            'rows'     => $rows,
            'rowCount' => count($rows),
            'generatedAt' => now()->format('d/m/Y à H:i'),
        ])->render();

        // 3. DomPDF avec orientation dynamique
        $pdf = Pdf::loadHTML($html);
        $pdf->setPaper($layout->pageFormat, $layout->orientation);
        $pdf->set_option('defaultFont', 'DejaVu Sans');
        $pdf->set_option('isRemoteEnabled', false);

        $filename = $options['filename'] ?? 'Export-' . str()->slug($title) . '-' . now()->format('Y-m-d') . '.pdf';

        return new StreamedResponse(function () use ($pdf) {
            echo $pdf->output();
        }, 200, [
            'Content-Type'        => 'application/pdf',
            'Content-Disposition' => 'attachment; filename="' . $filename . '"',
            'Cache-Control'       => 'max-age=0, no-store, no-cache, must-revalidate',
        ]);
    }

    /**
     * Affiche le PDF inline (aperçu navigateur).
     */
    public static function stream(
        string $title, array $columnDefs, array $rows,
        Company $company, User $user, array $options = [],
    ): StreamedResponse {
        $layout = PdfLayoutEngine::selectBestLayout($columnDefs, $rows, $options);
        $html = view('pdf.engine.list', compact('layout', 'title') + [
            'subtitle'    => $options['subtitle'] ?? null,
            'filters'     => $options['filters'] ?? [],
            'company'     => $company,
            'user'        => $user,
            'rows'        => $rows,
            'rowCount'    => count($rows),
            'generatedAt' => now()->format('d/m/Y à H:i'),
        ])->render();

        $pdf = Pdf::loadHTML($html);
        $pdf->setPaper($layout->pageFormat, $layout->orientation);
        $pdf->set_option('defaultFont', 'DejaVu Sans');

        $filename = $options['filename'] ?? 'Export-' . now()->format('Y-m-d') . '.pdf';

        return new StreamedResponse(function () use ($pdf) {
            echo $pdf->output();
        }, 200, [
            'Content-Type'        => 'application/pdf',
            'Content-Disposition' => 'inline; filename="' . $filename . '"',
        ]);
    }
}
