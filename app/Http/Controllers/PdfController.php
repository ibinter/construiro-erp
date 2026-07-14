<?php

namespace App\Http\Controllers;

use App\Models\Invoice;
use App\Models\PurchaseOrder;
use App\Models\Quote;
use App\Services\DocumentVerifier;
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
