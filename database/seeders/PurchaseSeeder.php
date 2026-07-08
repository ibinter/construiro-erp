<?php

namespace Database\Seeders;

use App\Models\Company;
use App\Models\Project;
use App\Models\PurchaseOrder;
use App\Models\Supplier;
use Illuminate\Database\Seeder;

class PurchaseSeeder extends Seeder
{
    public function run(): void
    {
        $company = Company::where('slug', 'construiro-demo')->first();
        if (! $company) {
            return;
        }

        // Fournisseur de démo (ciment/liants) et projet optionnel.
        $supplier = Supplier::where('company_id', $company->id)
            ->where('code', 'FRN-002')
            ->first();
        if (! $supplier) {
            return;
        }

        $project = Project::where('company_id', $company->id)
            ->where('code', 'PRJ-2026-001')
            ->first();

        $orders = [
            [
                'code' => 'BC-2026-001', 'status' => 'confirmed', 'tax_rate' => 18,
                'order_date' => '2026-02-08', 'expected_date' => '2026-02-15',
                'notes' => 'Livraison sur chantier Plateau. Bon confirmé par le fournisseur.',
                'project' => true,
                'lines' => [
                    ['designation' => 'Ciment CPJ 42.5 — sac 50 kg', 'unit' => 'sac', 'quantity' => 600, 'unit_price' => 4500],
                    ['designation' => 'Fer à béton HA Fe500 Ø12', 'unit' => 'kg', 'quantity' => 8000, 'unit_price' => 850],
                    ['designation' => 'Sable de rivière', 'unit' => 'm3', 'quantity' => 45, 'unit_price' => 12000],
                ],
            ],
            [
                'code' => 'BC-2026-002', 'status' => 'sent', 'tax_rate' => 18,
                'order_date' => '2026-02-12', 'expected_date' => '2026-02-20',
                'notes' => null,
                'project' => true,
                'lines' => [
                    ['designation' => 'Gravier concassé 5/15', 'unit' => 'm3', 'quantity' => 60, 'unit_price' => 15000],
                    ['designation' => 'Fer à béton HA Fe500 Ø8', 'unit' => 'kg', 'quantity' => 3200, 'unit_price' => 870],
                ],
            ],
            [
                'code' => 'BC-2026-003', 'status' => 'draft', 'tax_rate' => 18,
                'order_date' => '2026-02-18', 'expected_date' => null,
                'notes' => 'À valider par le conducteur de travaux.',
                'project' => false,
                'lines' => [
                    ['designation' => 'Ciment CPA 55 — sac 50 kg', 'unit' => 'sac', 'quantity' => 200, 'unit_price' => 5200],
                    ['designation' => 'Chaux hydraulique — sac 25 kg', 'unit' => 'sac', 'quantity' => 80, 'unit_price' => 3800],
                    ['designation' => 'Parpaings creux 20x20x40', 'unit' => 'u', 'quantity' => 1500, 'unit_price' => 350],
                ],
            ],
        ];

        foreach ($orders as $data) {
            $lines = $data['lines'];
            $attachProject = $data['project'];
            unset($data['lines'], $data['project']);

            $order = PurchaseOrder::updateOrCreate(
                ['company_id' => $company->id, 'code' => $data['code']],
                array_merge($data, [
                    'company_id'  => $company->id,
                    'supplier_id' => $supplier->id,
                    'project_id'  => $attachProject ? $project?->id : null,
                    'currency'    => 'XOF',
                ])
            );

            // Remplace les lignes pour rendre le seeder idempotent.
            $order->lines()->delete();
            foreach (array_values($lines) as $index => $line) {
                $order->lines()->create(array_merge($line, ['position' => $index]));
            }

            $order->recalculateTotals();
        }
    }
}
