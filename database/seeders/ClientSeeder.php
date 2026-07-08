<?php

namespace Database\Seeders;

use App\Models\Client;
use App\Models\Company;
use Illuminate\Database\Seeder;

class ClientSeeder extends Seeder
{
    public function run(): void
    {
        $company = Company::where('slug', 'construiro-demo')->first();
        if (! $company) {
            return;
        }

        $clients = [
            [
                'code' => 'CLI-001', 'type' => 'promoteur', 'name' => 'SCI Horizon',
                'contact_name' => 'Mme Aïcha Traoré', 'phone' => '+225 27 20 21 22 23',
                'email' => 'contact@sci-horizon.ci', 'city' => 'Abidjan',
                'address' => 'Plateau, Boulevard de la République', 'tax_id' => 'CI-1234567 A',
                'notes' => 'Promoteur immobilier — programme R+8 au Plateau.',
            ],
            [
                'code' => 'CLI-002', 'type' => 'public', 'name' => 'AGEROUTE',
                'contact_name' => 'M. Yao Kouassi', 'phone' => '+225 27 22 44 55 66',
                'email' => 'marches@ageroute.ci', 'city' => 'Abidjan',
                'address' => 'Cocody, Riviera Golf', 'tax_id' => 'CI-7654321 B',
                'notes' => 'Agence de gestion des routes — marchés d\'infrastructure routière.',
            ],
            [
                'code' => 'CLI-003', 'type' => 'public', 'name' => 'ONEP',
                'contact_name' => 'Mme Fatou Diabaté', 'phone' => '+225 27 20 33 44 55',
                'email' => 'projets@onep.ci', 'city' => 'Abidjan',
                'address' => 'Treichville, Avenue 16', 'tax_id' => 'CI-2468101 C',
                'notes' => 'Office national de l\'eau potable — ouvrages hydrauliques.',
            ],
            [
                'code' => 'CLI-004', 'type' => 'particulier', 'name' => 'M. Ibrahim Koné',
                'contact_name' => 'Ibrahim Koné', 'phone' => '+225 07 07 08 09 10',
                'email' => 'ibrahim.kone@gmail.com', 'city' => 'Abidjan',
                'address' => 'Cocody Angré, 7e Tranche',
                'notes' => 'Client particulier — construction villa individuelle.',
            ],
            [
                'code' => 'CLI-005', 'type' => 'public', 'name' => 'Mairie de Korhogo',
                'contact_name' => 'M. Souleymane Ouattara', 'phone' => '+225 27 36 86 00 00',
                'email' => 'secretariat@mairie-korhogo.ci', 'city' => 'Korhogo',
                'address' => 'Centre-ville, Place de la Paix', 'tax_id' => 'CI-1357911 D',
                'notes' => 'Collectivité territoriale — équipements publics communaux.',
            ],
        ];

        foreach ($clients as $data) {
            Client::updateOrCreate(
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
