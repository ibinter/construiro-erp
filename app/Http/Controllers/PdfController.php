<?php

namespace App\Http\Controllers;

use App\Models\Client;
use App\Models\Contract;
use App\Models\Employee;
use App\Models\Invoice;
use App\Models\Project;
use App\Models\PurchaseOrder;
use App\Models\Quote;
use App\Services\DocumentVerifier;
use SimpleSoftwareIO\QrCode\Generator as QrGenerator;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Génération des documents PDF professionnels (devis, factures, bons de commande).
 * Chaque document est isolé par entreprise (multi-tenant) et rendu via un gabarit Blade.
 */
class PdfController extends Controller
{
    public function quote(Request $request, Quote $quote): Response
    {
        $this->authorizeCompany($request, $quote->company_id, 'quotes.view');
        $quote->load(['company', 'project', 'lines']);
        DocumentVerifier::stamp($quote);

        return $this->render('pdf.quote', [
            'doc'        => $quote,
            'company'    => $quote->company,
            'title'      => 'DEVIS',
            'partyLabel' => 'Client',
            'partyName'  => $quote->client_name,
            'qr_svg'     => $this->makeQrSvg(route('verify.document', $quote->verify_token)),
            'verify_url' => route('verify.document', $quote->verify_token),
        ], "Devis-{$quote->code}.pdf");
    }

    public function invoice(Request $request, Invoice $invoice): Response
    {
        $this->authorizeCompany($request, $invoice->company_id, 'invoicing.view');
        $invoice->load(['company', 'client', 'project', 'lines']);
        DocumentVerifier::stamp($invoice);

        return $this->render('pdf.invoice', [
            'doc'        => $invoice,
            'company'    => $invoice->company,
            'title'      => 'FACTURE',
            'partyLabel' => 'Client',
            'partyName'  => $invoice->client?->name ?? '—',
            'qr_svg'     => $this->makeQrSvg(route('verify.document', $invoice->verify_token)),
            'verify_url' => route('verify.document', $invoice->verify_token),
        ], "Facture-{$invoice->code}.pdf");
    }

    public function purchase(Request $request, PurchaseOrder $purchase): Response
    {
        $this->authorizeCompany($request, $purchase->company_id, 'purchases.view');
        $purchase->load(['company', 'supplier', 'project', 'lines']);

        return $this->render('pdf.purchase', [
            'doc'        => $purchase,
            'company'    => $purchase->company,
            'title'      => 'BON DE COMMANDE',
            'partyLabel' => 'Fournisseur',
            'partyName'  => $purchase->supplier?->name ?? '—',
        ], "BonCommande-{$purchase->code}.pdf");
    }

    public function project(Request $request, Project $project): Response
    {
        $this->authorizeCompany($request, $project->company_id, 'projects.view');
        $project->load(['company', 'manager:id,name', 'sites']);

        return $this->render('pdf.project', [
            'project' => $project,
            'company' => $project->company,
        ], "Projet-{$project->code}.pdf");
    }

    public function client(Request $request, Client $client): Response
    {
        $this->authorizeCompany($request, $client->company_id, 'clients.view');
        $client->load('company');

        return $this->render('pdf.client', [
            'client'  => $client,
            'company' => $client->company,
        ], "Client-{$client->code}.pdf");
    }

    public function employee(Request $request, Employee $employee): Response
    {
        $this->authorizeCompany($request, $employee->company_id, 'hr.view');
        $employee->load(['company', 'site:id,name']);

        $payslips = $employee->payslips()
            ->orderByDesc('period')
            ->limit(6)
            ->get();

        return $this->render('pdf.employee', [
            'employee' => $employee,
            'company'  => $employee->company,
            'payslips' => $payslips,
        ], "Employe-{$employee->matricule}.pdf");
    }

    public function contract(Request $request, Contract $contract): Response
    {
        $this->authorizeCompany($request, $contract->company_id, 'contracts.view');
        $contract->load(['company', 'project:id,name']);
        DocumentVerifier::stamp($contract);

        return $this->render('pdf.contract', [
            'contract'   => $contract,
            'company'    => $contract->company,
            'qr_svg'     => $this->makeQrSvg(route('verify.document', $contract->verify_token)),
            'verify_url' => route('verify.document', $contract->verify_token),
        ], "Contrat-{$contract->code}.pdf");
    }

    /** Génère un SVG QR code pour l'URL donnée via simplesoftwareio/simple-qrcode. */
    private function makeQrSvg(string $url): string
    {
        return (string) (new QrGenerator())->format('svg')->size(120)->generate($url);
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
