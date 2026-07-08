<?php

namespace Database\Seeders;

use App\Models\Client;
use App\Models\Company;
use App\Models\IncomingPayment;
use App\Models\Invoice;
use App\Models\OutgoingPayment;
use App\Models\Project;
use App\Models\PurchaseOrder;
use App\Models\Supplier;
use Illuminate\Database\Seeder;

/**
 * Données de démonstration pour la trésorerie :
 *  - encaissements rattachés à des factures / clients existants,
 *  - décaissements (fournisseurs, salaires, sous-traitants, charges) réalistes.
 * Idempotent via updateOrCreate sur [company_id, code].
 */
class PaymentsSeeder extends Seeder
{
    public function run(): void
    {
        $company = Company::where('slug', 'construiro-demo')->first();
        if (! $company) {
            return;
        }

        // --- Référentiels de rattachement (peuvent être absents) -----------------
        $client  = Client::where('company_id', $company->id)->where('code', 'CLI-001')->first();
        $project = Project::where('company_id', $company->id)->where('code', 'PRJ-2026-001')->first();

        $invoicePaid    = Invoice::where('company_id', $company->id)->where('code', 'FAC-2026-001')->first();
        $invoicePartial = Invoice::where('company_id', $company->id)->where('code', 'FAC-2026-002')->first();

        $supplierCiment = Supplier::where('company_id', $company->id)->where('code', 'FRN-002')->first();
        $supplierSst    = Supplier::where('company_id', $company->id)->where('code', 'FRN-004')->first();

        $poConfirmed = PurchaseOrder::where('company_id', $company->id)->where('code', 'BC-2026-001')->first();

        // --- Encaissements -------------------------------------------------------
        $incoming = [
            [
                'code' => 'ENC-2026-001', 'amount' => 20650000, 'method' => 'virement',
                'date' => '2026-02-10', 'reference' => 'VIR-2026-0212',
                'client_id' => $client?->id, 'invoice_id' => $invoicePaid?->id, 'project_id' => $project?->id,
                'notes' => 'Règlement intégral de la facture FAC-2026-001 par virement.',
            ],
            [
                'code' => 'ENC-2026-002', 'amount' => 5000000, 'method' => 'cheque',
                'date' => '2026-03-05', 'reference' => 'CHQ-004512',
                'client_id' => $client?->id, 'invoice_id' => $invoicePartial?->id, 'project_id' => $project?->id,
                'notes' => 'Premier acompte sur la facture FAC-2026-002.',
            ],
            [
                'code' => 'ENC-2026-003', 'amount' => 750000, 'method' => 'mobile_money',
                'date' => '2026-03-22', 'reference' => 'MM-778120',
                'client_id' => $client?->id, 'invoice_id' => null, 'project_id' => null,
                'payer_name' => 'SCI Horizon', 'notes' => 'Avance sur études complémentaires.',
            ],
            [
                'code' => 'ENC-2026-004', 'amount' => 1200000, 'method' => 'especes',
                'date' => '2026-04-02', 'reference' => null,
                'client_id' => null, 'invoice_id' => null, 'project_id' => null,
                'payer_name' => 'Client comptant (guichet)', 'notes' => 'Vente de matériaux au comptant.',
            ],
        ];

        foreach ($incoming as $data) {
            IncomingPayment::updateOrCreate(
                ['company_id' => $company->id, 'code' => $data['code']],
                array_merge($data, ['company_id' => $company->id, 'currency' => 'XOF'])
            );
        }

        // --- Décaissements -------------------------------------------------------
        $outgoing = [
            [
                'code' => 'DEC-2026-001', 'amount' => 3186000, 'category' => 'fournisseur', 'method' => 'virement',
                'date' => '2026-02-16', 'reference' => 'VIR-2026-0311',
                'supplier_id' => $supplierCiment?->id, 'purchase_order_id' => $poConfirmed?->id, 'project_id' => $project?->id,
                'notes' => 'Règlement du bon de commande BC-2026-001 (ciment et aciers).',
            ],
            [
                'code' => 'DEC-2026-002', 'amount' => 8500000, 'category' => 'salaire', 'method' => 'virement',
                'date' => '2026-02-28', 'reference' => 'PAIE-2026-02',
                'supplier_id' => null, 'purchase_order_id' => null, 'project_id' => null,
                'payee_name' => 'Personnel — paie février 2026', 'notes' => 'Virement des salaires du mois de février.',
            ],
            [
                'code' => 'DEC-2026-003', 'amount' => 4500000, 'category' => 'sous_traitant', 'method' => 'cheque',
                'date' => '2026-03-10', 'reference' => 'CHQ-889001',
                'supplier_id' => $supplierSst?->id, 'purchase_order_id' => null, 'project_id' => $project?->id,
                'notes' => 'Situation n°1 du sous-traitant électricité.',
            ],
            [
                'code' => 'DEC-2026-004', 'amount' => 320000, 'category' => 'charge', 'method' => 'especes',
                'date' => '2026-03-18', 'reference' => null,
                'supplier_id' => null, 'purchase_order_id' => null, 'project_id' => null,
                'payee_name' => 'CIE — électricité chantier', 'notes' => 'Facture d\'électricité du chantier Plateau.',
            ],
            [
                'code' => 'DEC-2026-005', 'amount' => 1875000, 'category' => 'impot', 'method' => 'virement',
                'date' => '2026-04-05', 'reference' => 'DGI-TVA-0326',
                'supplier_id' => null, 'purchase_order_id' => null, 'project_id' => null,
                'payee_name' => 'Direction Générale des Impôts', 'notes' => 'Déclaration et paiement TVA mars 2026.',
            ],
        ];

        foreach ($outgoing as $data) {
            OutgoingPayment::updateOrCreate(
                ['company_id' => $company->id, 'code' => $data['code']],
                array_merge($data, ['company_id' => $company->id, 'currency' => 'XOF'])
            );
        }
    }
}
