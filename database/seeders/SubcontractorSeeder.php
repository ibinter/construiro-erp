<?php

namespace Database\Seeders;

use App\Models\Company;
use App\Models\Subcontractor;
use Illuminate\Database\Seeder;

class SubcontractorSeeder extends Seeder
{
    public function run(): void
    {
        $company = Company::where('slug', 'construiro-demo')->first();
        if (! $company) {
            return;
        }

        $subcontractors = [
            [
                'code' => 'STR-001', 'specialty' => 'gros_oeuvre', 'name' => 'Entreprise Kouassi BTP',
                'contact_name' => 'M. Yao Kouassi', 'phone' => '+225 07 08 12 34 56',
                'email' => 'contact@kouassibtp.ci', 'city' => 'Abidjan',
                'address' => 'Yopougon, Rue des Bâtisseurs', 'tax_id' => 'CI-2233445 F',
                'rating' => 5, 'notes' => 'Fondations, maçonnerie et béton armé. Équipe expérimentée.',
            ],
            [
                'code' => 'STR-002', 'specialty' => 'electricite', 'name' => 'Sté Ivoire Électricité',
                'contact_name' => 'Mme Aïcha Traoré', 'phone' => '+225 05 06 78 90 12',
                'email' => 'devis@ivoire-elec.ci', 'city' => 'Abidjan',
                'address' => 'Cocody, Angré 8e Tranche', 'tax_id' => 'CI-3344556 G',
                'rating' => 4, 'notes' => 'Installations électriques BT, courants faibles et tableaux.',
            ],
            [
                'code' => 'STR-003', 'specialty' => 'plomberie', 'name' => 'Plomberie Sanitaire du Sud',
                'contact_name' => 'M. Ibrahim Coulibaly', 'phone' => '+225 01 02 34 56 78',
                'email' => 'info@plss.ci', 'city' => 'San-Pédro',
                'address' => 'Zone portuaire, San-Pédro', 'tax_id' => 'CI-4455667 H',
                'rating' => 3, 'notes' => 'Plomberie, réseaux d\'eau et évacuation. Interventions Sud-Ouest.',
            ],
            [
                'code' => 'STR-004', 'specialty' => 'etancheite', 'name' => 'Étanche Pro CI',
                'contact_name' => 'M. Gérard Zadi', 'phone' => '+225 27 21 44 55 66',
                'email' => 'contact@etanchepro.ci', 'city' => 'Abidjan',
                'address' => 'Marcory, Zone 4', 'tax_id' => 'CI-5566778 I',
                'rating' => 4, 'notes' => 'Étanchéité toitures-terrasses, membranes bitumineuses.',
            ],
            [
                'code' => 'STR-005', 'specialty' => 'vrd', 'name' => 'Bouaké Terrassement VRD',
                'contact_name' => 'M. Adama Sangaré', 'phone' => '+225 27 31 63 21 09',
                'email' => 'travaux@btvrd.ci', 'city' => 'Bouaké',
                'address' => 'Quartier Air France, Bouaké', 'tax_id' => 'CI-6677889 J',
                'rating' => null, 'notes' => 'Voirie et réseaux divers, terrassement et assainissement.',
            ],
        ];

        foreach ($subcontractors as $data) {
            Subcontractor::updateOrCreate(
                ['company_id' => $company->id, 'code' => $data['code']],
                array_merge($data, [
                    'company_id' => $company->id,
                    'country'    => 'CI',
                    'is_active'  => true,
                ])
            );
        }
    }
}
