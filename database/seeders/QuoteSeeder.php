<?php

namespace Database\Seeders;

use App\Models\Company;
use App\Models\Project;
use App\Models\Quote;
use Illuminate\Database\Seeder;

class QuoteSeeder extends Seeder
{
    public function run(): void
    {
        $company = Company::where('slug', 'construiro-demo')->first();
        if (! $company) {
            return;
        }

        // Rattachement optionnel au projet de démo, s'il existe.
        $project = Project::where('company_id', $company->id)
            ->where('code', 'PRJ-2026-001')
            ->first();

        $quotes = [
            [
                'code' => 'DEV-2026-001', 'title' => 'Gros œuvre — Immeuble R+8 Plateau', 'client_name' => 'SCI Horizon',
                'status' => 'sent', 'tax_rate' => 18, 'date' => '2026-02-05', 'valid_until' => '2026-03-05',
                'notes' => 'Offre valable un mois. Prix hors révision.',
                'project' => true,
                'lines' => [
                    ['designation' => 'Béton dosé 350 kg/m3', 'unit' => 'm3', 'quantity' => 320, 'unit_price' => 95000],
                    ['designation' => 'Coffrage voiles et poteaux', 'unit' => 'm2', 'quantity' => 1450, 'unit_price' => 12000],
                    ['designation' => 'Aciers HA Fe500', 'unit' => 'kg', 'quantity' => 48000, 'unit_price' => 850],
                    ['designation' => 'Location grue à tour', 'unit' => 'forfait', 'quantity' => 1, 'unit_price' => 8500000],
                ],
            ],
            [
                'code' => 'DEV-2026-002', 'title' => 'Terrassement et VRD', 'client_name' => 'SCI Horizon',
                'status' => 'draft', 'tax_rate' => 18, 'date' => '2026-02-10', 'valid_until' => '2026-03-10',
                'notes' => null,
                'project' => true,
                'lines' => [
                    ['designation' => 'Déblai en terrain ordinaire', 'unit' => 'm3', 'quantity' => 1200, 'unit_price' => 4500],
                    ['designation' => 'Remblai compacté', 'unit' => 'm3', 'quantity' => 800, 'unit_price' => 6000],
                    ['designation' => 'Réseau d\'assainissement PVC 315', 'unit' => 'ml', 'quantity' => 240, 'unit_price' => 22000],
                ],
            ],
            [
                'code' => 'DEV-2026-003', 'title' => 'Second œuvre — Villa témoin', 'client_name' => 'M. Koné',
                'status' => 'accepted', 'tax_rate' => 18, 'date' => '2026-01-20', 'valid_until' => '2026-02-20',
                'notes' => 'Devis accepté et signé par le client.',
                'project' => false,
                'lines' => [
                    ['designation' => 'Enduit intérieur au mortier', 'unit' => 'm2', 'quantity' => 620, 'unit_price' => 3500],
                    ['designation' => 'Carrelage grès cérame 60x60', 'unit' => 'm2', 'quantity' => 180, 'unit_price' => 18000],
                    ['designation' => 'Peinture acrylique 2 couches', 'unit' => 'm2', 'quantity' => 720, 'unit_price' => 2500],
                    ['designation' => 'Menuiserie aluminium', 'unit' => 'u', 'quantity' => 24, 'unit_price' => 145000],
                ],
            ],
        ];

        foreach ($quotes as $data) {
            $lines = $data['lines'];
            $attachProject = $data['project'];
            unset($data['lines'], $data['project']);

            $quote = Quote::updateOrCreate(
                ['company_id' => $company->id, 'code' => $data['code']],
                array_merge($data, [
                    'company_id' => $company->id,
                    'project_id' => $attachProject ? $project?->id : null,
                    'currency'   => 'XOF',
                ])
            );

            // Remplace les lignes pour rendre le seeder idempotent.
            $quote->lines()->delete();
            foreach (array_values($lines) as $index => $line) {
                $quote->lines()->create(array_merge($line, ['position' => $index]));
            }

            $quote->recalculateTotals();
        }
    }
}
