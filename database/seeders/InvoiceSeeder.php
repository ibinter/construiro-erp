<?php

namespace Database\Seeders;

use App\Models\Client;
use App\Models\Company;
use App\Models\Invoice;
use App\Models\Project;
use Illuminate\Database\Seeder;

class InvoiceSeeder extends Seeder
{
    public function run(): void
    {
        $company = Company::where('slug', 'construiro-demo')->first();
        if (! $company) {
            return;
        }

        // Rattachements optionnels au client et projet de démo, s'ils existent.
        $client = Client::where('company_id', $company->id)
            ->where('code', 'CLI-001')
            ->first();

        $project = Project::where('company_id', $company->id)
            ->where('code', 'PRJ-2026-001')
            ->first();

        $invoices = [
            [
                'code' => 'FAC-2026-001', 'status' => 'paid', 'tax_rate' => 18,
                'issue_date' => '2026-01-15', 'due_date' => '2026-02-15',
                'notes' => 'Facture soldée. Règlement par virement.',
                'client' => true, 'project' => true, 'amount_paid' => null, // Soldée automatiquement (= total)
                'lines' => [
                    ['designation' => 'Acompte gros œuvre — situation n°1', 'unit' => 'forfait', 'quantity' => 1, 'unit_price' => 15000000],
                    ['designation' => 'Béton dosé 350 kg/m3', 'unit' => 'm3', 'quantity' => 120, 'unit_price' => 95000],
                ],
            ],
            [
                'code' => 'FAC-2026-002', 'status' => 'partial', 'tax_rate' => 18,
                'issue_date' => '2026-03-01', 'due_date' => '2026-04-01',
                'notes' => 'Un premier acompte a été encaissé.',
                'client' => true, 'project' => true, 'amount_paid' => 5000000,
                'lines' => [
                    ['designation' => 'Coffrage voiles et poteaux', 'unit' => 'm2', 'quantity' => 850, 'unit_price' => 12000],
                    ['designation' => 'Aciers HA Fe500', 'unit' => 'kg', 'quantity' => 24000, 'unit_price' => 850],
                ],
            ],
            [
                'code' => 'FAC-2026-003', 'status' => 'sent', 'tax_rate' => 18,
                'issue_date' => '2026-04-10', 'due_date' => '2026-05-10',
                'notes' => null,
                'client' => true, 'project' => false, 'amount_paid' => 0,
                'lines' => [
                    ['designation' => 'Enduit intérieur au mortier', 'unit' => 'm2', 'quantity' => 620, 'unit_price' => 3500],
                    ['designation' => 'Carrelage grès cérame 60x60', 'unit' => 'm2', 'quantity' => 180, 'unit_price' => 18000],
                    ['designation' => 'Peinture acrylique 2 couches', 'unit' => 'm2', 'quantity' => 720, 'unit_price' => 2500],
                ],
            ],
        ];

        foreach ($invoices as $data) {
            $lines = $data['lines'];
            $attachClient = $data['client'];
            $attachProject = $data['project'];
            $amountPaid = $data['amount_paid'];
            unset($data['lines'], $data['client'], $data['project'], $data['amount_paid']);

            $invoice = Invoice::updateOrCreate(
                ['company_id' => $company->id, 'code' => $data['code']],
                array_merge($data, [
                    'company_id' => $company->id,
                    'client_id'  => $attachClient ? $client?->id : null,
                    'project_id' => $attachProject ? $project?->id : null,
                    'currency'   => 'XOF',
                    'amount_paid' => 0,
                ])
            );

            // Remplace les lignes pour rendre le seeder idempotent.
            $invoice->lines()->delete();
            foreach (array_values($lines) as $index => $line) {
                $invoice->lines()->create(array_merge($line, ['position' => $index]));
            }

            $invoice->recalculateTotals();

            // Ajuste le montant payé après calcul du total : null => facture soldée.
            $invoice->amount_paid = $amountPaid === null ? $invoice->total : $amountPaid;
            $invoice->save();
        }
    }
}
