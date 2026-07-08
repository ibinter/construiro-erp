<?php

namespace Database\Seeders;

use App\Models\Company;
use App\Models\Contract;
use App\Models\Project;
use Illuminate\Database\Seeder;

class ContractSeeder extends Seeder
{
    public function run(): void
    {
        $company = Company::where('slug', 'construiro-demo')->first();
        if (! $company) {
            return;
        }

        // Projet de référence pour rattacher certains contrats (optionnel).
        $project = Project::where('company_id', $company->id)
            ->where('code', 'PRJ-2026-001')
            ->first();

        $contracts = [
            [
                'code' => 'CTR-2026-001', 'title' => 'Marché principal — Immeuble R+8 Plateau',
                'type' => 'client', 'party_name' => 'SCI Horizon', 'status' => 'active',
                'amount' => 1250000000, 'project_id' => $project?->id,
                'start_date' => '2026-02-01', 'end_date' => '2027-06-30', 'signed_date' => '2026-01-20',
                'notes' => 'Contrat de construction du gros œuvre et second œuvre.',
            ],
            [
                'code' => 'CTR-2026-002', 'title' => 'Sous-traitance électricité',
                'type' => 'sous_traitance', 'party_name' => 'Élec Pro CI', 'status' => 'active',
                'amount' => 85000000, 'project_id' => $project?->id,
                'start_date' => '2026-05-01', 'end_date' => '2026-11-30', 'signed_date' => '2026-04-15',
                'notes' => 'Installation électrique complète du bâtiment R+8.',
            ],
            [
                'code' => 'CTR-2026-003', 'title' => 'Fourniture de ciment',
                'type' => 'fournisseur', 'party_name' => 'LafargeHolcim CI', 'status' => 'draft',
                'amount' => 220000000, 'project_id' => null,
                'start_date' => '2026-03-01', 'end_date' => '2026-12-31', 'signed_date' => null,
                'notes' => 'Accord-cadre de fourniture de ciment CPA 45.',
            ],
            [
                'code' => 'CTR-2025-018', 'title' => 'Location grue à tour',
                'type' => 'autre', 'party_name' => 'BTP Location SA', 'status' => 'closed',
                'amount' => 45000000, 'project_id' => null,
                'start_date' => '2025-06-01', 'end_date' => '2025-12-31', 'signed_date' => '2025-05-25',
                'notes' => 'Location d\'une grue à tour avec grutier.',
            ],
        ];

        foreach ($contracts as $data) {
            Contract::updateOrCreate(
                ['company_id' => $company->id, 'code' => $data['code']],
                array_merge($data, [
                    'company_id' => $company->id,
                    'currency'   => 'XOF',
                ])
            );
        }
    }
}
