<?php

namespace Database\Seeders;

use App\Models\Company;
use App\Models\Equipment;
use App\Models\Site;
use Illuminate\Database\Seeder;

/**
 * Données de démonstration du module Parc matériel : engins, véhicules,
 * matériel et outillage réalistes, certains affectés à un chantier existant,
 * avec quelques enregistrements de maintenance. Idempotent.
 */
class EquipmentSeeder extends Seeder
{
    public function run(): void
    {
        $company = Company::where('slug', 'construiro-demo')->first();
        if (! $company) {
            return;
        }

        // Deux chantiers de l'entreprise pour l'affectation (facultatif).
        $sites = Site::where('company_id', $company->id)->orderBy('id')->get();
        $site1 = $sites->get(0);
        $site2 = $sites->get(1) ?? $site1;

        // --- Équipements ---------------------------------------------------
        $items = [
            'EQ-001' => [
                'name' => 'Grue à tour Potain MDT 219', 'category' => 'engin', 'brand' => 'Potain', 'model' => 'MDT 219',
                'registration' => 'SN-POT-219-0412', 'status' => 'in_use', 'current_site_id' => $site1?->id,
                'acquisition_date' => '2023-04-15', 'acquisition_value' => 185000000,
                'maintenance' => [
                    ['preventive', 'Graissage et contrôle des câbles', 120000, '2026-05-10'],
                    ['revision', 'Révision annuelle complète', 850000, '2026-03-02'],
                ],
            ],
            'EQ-002' => [
                'name' => 'Pelle hydraulique Caterpillar 320D', 'category' => 'engin', 'brand' => 'Caterpillar', 'model' => '320D',
                'registration' => '4521 CI 01', 'status' => 'in_use', 'current_site_id' => $site2?->id,
                'acquisition_date' => '2022-09-20', 'acquisition_value' => 95000000,
                'maintenance' => [
                    ['curative', 'Remplacement flexible hydraulique', 320000, '2026-06-01'],
                ],
            ],
            'EQ-003' => [
                'name' => 'Camion benne Renault Kerax', 'category' => 'vehicule', 'brand' => 'Renault', 'model' => 'Kerax 380',
                'registration' => '7788 CI 02', 'status' => 'available', 'current_site_id' => null,
                'acquisition_date' => '2021-06-10', 'acquisition_value' => 42000000,
                'maintenance' => [
                    ['preventive', 'Vidange et filtres', 95000, '2026-04-18'],
                ],
            ],
            'EQ-004' => [
                'name' => 'Bétonnière Altrad B180', 'category' => 'materiel', 'brand' => 'Altrad', 'model' => 'B180',
                'registration' => 'SN-ALT-B180-2210', 'status' => 'available', 'current_site_id' => $site1?->id,
                'acquisition_date' => '2024-01-12', 'acquisition_value' => 1250000,
                'maintenance' => [],
            ],
            'EQ-005' => [
                'name' => 'Groupe électrogène SDMO 100 kVA', 'category' => 'materiel', 'brand' => 'SDMO', 'model' => 'J110K',
                'registration' => 'SN-SDMO-100-0087', 'status' => 'maintenance', 'current_site_id' => $site2?->id,
                'acquisition_date' => '2022-11-05', 'acquisition_value' => 18500000,
                'maintenance' => [
                    ['curative', 'Réparation alternateur', 640000, '2026-06-25'],
                    ['preventive', 'Contrôle niveau et batterie', 45000, '2026-05-30'],
                ],
            ],
            'EQ-006' => [
                'name' => 'Compacteur Bomag BW 211', 'category' => 'engin', 'brand' => 'Bomag', 'model' => 'BW 211 D-4',
                'registration' => '3312 CI 03', 'status' => 'out_of_service', 'current_site_id' => null,
                'acquisition_date' => '2020-03-22', 'acquisition_value' => 58000000,
                'maintenance' => [
                    ['revision', 'Diagnostic panne moteur', 210000, '2026-07-02'],
                ],
            ],
        ];

        foreach ($items as $code => $data) {
            $maintenance = $data['maintenance'];
            unset($data['maintenance']);

            $equipment = Equipment::updateOrCreate(
                ['company_id' => $company->id, 'code' => $code],
                array_merge($data, [
                    'company_id' => $company->id,
                    'currency'   => 'XOF',
                    'is_active'  => true,
                ])
            );

            // Repart d'un historique propre pour rester idempotent.
            $equipment->maintenanceRecords()->delete();

            foreach ($maintenance as [$type, $description, $cost, $date]) {
                $equipment->maintenanceRecords()->create([
                    'company_id'   => $company->id,
                    'type'         => $type,
                    'description'  => $description,
                    'cost'         => $cost,
                    'performed_at' => $date,
                ]);
            }
        }
    }
}
