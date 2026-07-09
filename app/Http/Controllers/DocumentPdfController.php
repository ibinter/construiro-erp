<?php

namespace App\Http\Controllers;

use App\Models\Boq;
use App\Models\Payslip;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Génération des documents PDF RH & métré (bulletins de paie, DQE).
 * Chaque document est isolé par entreprise (multi-tenant) et rendu via un gabarit Blade.
 */
class DocumentPdfController extends Controller
{
    public function payslip(Request $request, Payslip $payslip): Response
    {
        $this->authorizeCompany($request, $payslip->company_id, 'payroll.view');
        $payslip->load(['company', 'employee']);

        $matricule = $payslip->employee?->matricule ?? 'NA';
        $period    = str_replace(['/', ' '], '-', (string) $payslip->period);

        return $this->render('pdf.payslip', [
            'doc'     => $payslip,
            'company' => $payslip->company,
        ], "Bulletin-{$matricule}-{$period}.pdf");
    }

    public function boq(Request $request, Boq $boq): Response
    {
        $this->authorizeCompany($request, $boq->company_id, 'boq.view');
        $boq->load(['company', 'project', 'lines']);

        return $this->render('pdf.boq', [
            'doc'        => $boq,
            'company'    => $boq->company,
            'title'      => 'DQE',
            'partyLabel' => 'Projet',
            'partyName'  => $boq->project?->name ?? '—',
        ], "DQE-{$boq->code}.pdf");
    }

    /** Charge le gabarit, applique le format A4 et renvoie le flux PDF (aperçu inline). */
    private function render(string $view, array $data, string $filename): Response
    {
        return Pdf::loadView($view, $data)->setPaper('a4')->stream($filename);
    }

    private function authorizeCompany(Request $request, int $companyId, string $permission): void
    {
        $user = $request->user();
        abort_unless($user->can($permission), 403);
        abort_unless($companyId === $user->company_id, 403);
    }
}
