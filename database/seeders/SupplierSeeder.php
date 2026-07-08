<?php

namespace Database\Seeders;

use App\Models\Company;
use App\Models\Supplier;
use Illuminate\Database\Seeder;

class SupplierSeeder extends Seeder
{
    public function run(): void
    {
        $company = Company::where('slug', 'construiro-demo')->first();
        if (! $company) {
            return;
        }

        $suppliers = [
            [
                'code' => 'FRN-001', 'category' => 'materiaux', 'name' => 'SOTACI',
                'contact_name' => 'M. Konan Kouamé', 'phone' => '+225 27 21 75 80 00',
                'email' => 'commercial@sotaci.ci', 'city' => 'Abidjan',
                'address' => 'Zone industrielle de Yopougon', 'tax_id' => 'CI-9080706 A',
                'payment_terms' => '30 jours', 'notes' => 'Aciers, fers à béton et profilés métalliques.',
            ],
            [
                'code' => 'FRN-002', 'category' => 'materiaux', 'name' => 'LafargeHolcim CI',
                'contact_name' => 'Mme Adjoua Bamba', 'phone' => '+225 27 21 23 45 67',
                'email' => 'ventes@lafargeholcim.ci', 'city' => 'Abidjan',
                'address' => 'Vridi, Boulevard de Petit-Bassam', 'tax_id' => 'CI-1122334 B',
                'payment_terms' => '45 jours', 'notes' => 'Ciment CPA/CPJ et liants hydrauliques.',
            ],
            [
                'code' => 'FRN-003', 'category' => 'location', 'name' => 'Tractafric Equipment CI',
                'contact_name' => 'M. Serge Aka', 'phone' => '+225 27 21 27 90 00',
                'email' => 'location@tractafric.ci', 'city' => 'Abidjan',
                'address' => 'Koumassi, Zone industrielle', 'tax_id' => 'CI-5566778 C',
                'payment_terms' => '15 jours', 'notes' => 'Location d\'engins de chantier (pelles, chargeuses, grues).',
            ],
            [
                'code' => 'FRN-004', 'category' => 'sous_traitance', 'name' => 'SICF',
                'contact_name' => 'M. Blaise N\'Guessan', 'phone' => '+225 27 22 41 52 63',
                'email' => 'contact@sicf.ci', 'city' => 'Abidjan',
                'address' => 'Marcory, Boulevard VGE', 'tax_id' => 'CI-3344556 D',
                'payment_terms' => '60 jours', 'notes' => 'Sous-traitance gros œuvre et second œuvre bâtiment.',
            ],
            [
                'code' => 'FRN-005', 'category' => 'autre', 'name' => 'Total Énergies CI',
                'contact_name' => 'Mme Rokia Sanogo', 'phone' => '+225 27 21 75 11 11',
                'email' => 'pro@totalenergies.ci', 'city' => 'Abidjan',
                'address' => 'Plateau, Immeuble Alliance', 'tax_id' => 'CI-7788990 E',
                'payment_terms' => '30 jours', 'notes' => 'Carburant, lubrifiants et cartes professionnelles.',
            ],
        ];

        foreach ($suppliers as $data) {
            Supplier::updateOrCreate(
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
