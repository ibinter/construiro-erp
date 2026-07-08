<?php

namespace Database\Seeders;

use App\Models\Boq;
use App\Models\Company;
use App\Models\Project;
use App\Models\Study;
use App\Models\Takeoff;
use App\Models\UnitPrice;
use Illuminate\Database\Seeder;

/**
 * Données de démonstration du pôle Bureau d'études :
 * bibliothèque de prix (BPU), un métré, un DQE et deux études,
 * rattachés au projet de démo PRJ-2026-001 lorsque c'est pertinent.
 */
class DesignOfficeSeeder extends Seeder
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

        // 1) BPU — bibliothèque de prix unitaires.
        $unitPrices = [
            ['code' => 'BPU-001', 'designation' => 'Béton dosé 350 kg/m3',            'unit' => 'm3',      'category' => 'gros_oeuvre',   'unit_price' => 95000],
            ['code' => 'BPU-002', 'designation' => 'Coffrage voiles et poteaux',       'unit' => 'm2',      'category' => 'gros_oeuvre',   'unit_price' => 12000],
            ['code' => 'BPU-003', 'designation' => 'Aciers HA Fe500',                  'unit' => 'kg',      'category' => 'gros_oeuvre',   'unit_price' => 850],
            ['code' => 'BPU-004', 'designation' => 'Enduit intérieur au mortier',      'unit' => 'm2',      'category' => 'second_oeuvre', 'unit_price' => 3500],
            ['code' => 'BPU-005', 'designation' => 'Carrelage grès cérame 60x60',      'unit' => 'm2',      'category' => 'second_oeuvre', 'unit_price' => 18000],
            ['code' => 'BPU-006', 'designation' => 'Réseau assainissement PVC 315',    'unit' => 'ml',      'category' => 'vrd',           'unit_price' => 22000],
            ['code' => 'BPU-007', 'designation' => 'Point lumineux complet',           'unit' => 'u',       'category' => 'electricite',   'unit_price' => 15000],
            ['code' => 'BPU-008', 'designation' => 'Alimentation eau froide PER',      'unit' => 'ml',      'category' => 'plomberie',     'unit_price' => 6500],
        ];

        foreach ($unitPrices as $data) {
            UnitPrice::updateOrCreate(
                ['company_id' => $company->id, 'code' => $data['code']],
                array_merge($data, [
                    'company_id' => $company->id,
                    'currency'   => 'XOF',
                    'is_active'  => true,
                ])
            );
        }

        // 2) Métré — une feuille avec ses lignes (quantités calculées).
        $takeoff = Takeoff::updateOrCreate(
            ['company_id' => $company->id, 'code' => 'MET-2026-001'],
            [
                'company_id' => $company->id,
                'project_id' => $project?->id,
                'title'      => 'Métré gros œuvre — Niveau R+1',
                'status'     => 'validated',
                'notes'      => 'Métré établi à partir des plans d\'exécution.',
            ]
        );

        $takeoffLines = [
            ['designation' => 'Semelles isolées',       'unit' => 'm3', 'count' => 12, 'length' => 1.5, 'width' => 1.5, 'height' => 0.4, 'quantity' => 0],
            ['designation' => 'Voiles béton RDC',       'unit' => 'm2', 'count' => 1,  'length' => 45,  'width' => 3,   'height' => null, 'quantity' => 0],
            ['designation' => 'Dalle pleine plancher',  'unit' => 'm3', 'count' => 1,  'length' => 18,  'width' => 12,  'height' => 0.2, 'quantity' => 0],
            ['designation' => 'Aciers (forfait global)', 'unit' => 'kg', 'count' => 1, 'length' => null, 'width' => null, 'height' => null, 'quantity' => 48000],
        ];

        $takeoff->lines()->delete();
        foreach (array_values($takeoffLines) as $index => $line) {
            $takeoff->lines()->create(array_merge($line, ['position' => $index]));
        }

        // 3) DQE — un devis quantitatif avec ses lignes (total recalculé).
        $boq = Boq::updateOrCreate(
            ['company_id' => $company->id, 'code' => 'DQE-2026-001'],
            [
                'company_id' => $company->id,
                'project_id' => $project?->id,
                'title'      => 'DQE gros œuvre — Immeuble R+8',
                'status'     => 'draft',
                'currency'   => 'XOF',
                'notes'      => 'Établi à partir de la bibliothèque de prix (BPU).',
            ]
        );

        $boqLines = [
            ['designation' => 'Béton dosé 350 kg/m3',      'unit' => 'm3', 'quantity' => 320,   'unit_price' => 95000],
            ['designation' => 'Coffrage voiles et poteaux', 'unit' => 'm2', 'quantity' => 1450,  'unit_price' => 12000],
            ['designation' => 'Aciers HA Fe500',            'unit' => 'kg', 'quantity' => 48000, 'unit_price' => 850],
            ['designation' => 'Réseau assainissement PVC 315', 'unit' => 'ml', 'quantity' => 240, 'unit_price' => 22000],
        ];

        $boq->lines()->delete();
        foreach (array_values($boqLines) as $index => $line) {
            $boq->lines()->create(array_merge($line, ['position' => $index]));
        }
        $boq->recalculateTotal();

        // 4) Bureau d'études — deux études rattachées au projet.
        $studies = [
            [
                'code' => 'ETU-2026-001', 'title' => 'Plan de coffrage niveau R+1', 'type' => 'plan',
                'status' => 'valide', 'author' => 'Ing. Diarra',
                'notes' => 'Plan visé par le bureau de contrôle.',
            ],
            [
                'code' => 'ETU-2026-002', 'title' => 'Note de calcul structure béton armé', 'type' => 'note_calcul',
                'status' => 'en_cours', 'author' => 'BET Structures',
                'notes' => 'Calcul aux Eurocodes en cours de finalisation.',
            ],
        ];

        foreach ($studies as $data) {
            Study::updateOrCreate(
                ['company_id' => $company->id, 'code' => $data['code']],
                array_merge($data, [
                    'company_id' => $company->id,
                    'project_id' => $project?->id,
                ])
            );
        }
    }
}
