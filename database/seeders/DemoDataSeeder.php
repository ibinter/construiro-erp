<?php

namespace Database\Seeders;

use App\Models\Company;
use App\Models\User;
use App\Models\Subscription;
use App\Models\SubscriptionPlan;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DemoDataSeeder extends Seeder
{
    public function run(): void
    {
        // Ne jamais écraser des données existantes — toujours updateOrCreate
        $plan = SubscriptionPlan::where('is_active', true)->orderByDesc('price_monthly')->first();

        // Société de démo : CONSTRUIRO DEMO
        $company = Company::updateOrCreate(
            ['slug' => 'construiro-demo'],
            [
                'name'          => 'CONSTRUIRO DEMO',
                'is_demo'       => true,
                'country'       => 'CI',
                'city'          => 'Abidjan',
                'base_currency' => 'XOF',
                'phone'         => '+225 07 00 00 00 00',
                'email'         => 'demo@construiro.com',
                'address'       => 'Plateau, Abidjan, Côte d\'Ivoire',
                'is_active'     => true,
            ]
        );

        // Utilisateur admin démo
        $adminUser = User::updateOrCreate(
            ['email' => 'demo@construiro.com'],
            [
                'name'               => 'Administrateur Démo',
                'password'           => Hash::make('demo1234'),
                'company_id'         => $company->id,
                'email_verified_at'  => now(),
            ]
        );
        if (method_exists($adminUser, 'syncRoles')) {
            try {
                $adminUser->syncRoles(['direction_generale']);
            } catch (\Throwable) {
                // Rôles pas encore seedés — ignorer
            }
        }

        // Abonnement démo actif
        if ($plan) {
            Subscription::updateOrCreate(
                ['company_id' => $company->id],
                [
                    'plan_id'       => $plan->id,
                    'status'        => 'active',
                    'billing_cycle' => 'yearly',
                    'starts_at'     => now()->subMonths(2),
                    'ends_at'       => now()->addMonths(10),
                    'grace_ends_at' => now()->addMonths(10)->addDays(7),
                ]
            );
        }

        // Clients fictifs BTP
        $clientsData = [
            ['code' => 'CLI-001', 'name' => 'SOGEFAC SARL',             'email' => 'contact@sogefac.ci',    'phone' => '+225 27 20 31 00 00', 'city' => 'Abidjan', 'country' => 'CI'],
            ['code' => 'CLI-002', 'name' => 'BTP Diallo & Fils',         'email' => 'diallo@btpdf.sn',       'phone' => '+221 77 000 00 00',   'city' => 'Dakar',   'country' => 'SN'],
            ['code' => 'CLI-003', 'name' => 'Groupe Touré Construction', 'email' => 'info@toure-btp.ml',     'phone' => '+223 70 00 00 00',    'city' => 'Bamako',  'country' => 'ML'],
            ['code' => 'CLI-004', 'name' => 'IMMOCAM',                   'email' => 'contact@immocam.cm',    'phone' => '+237 670 000 000',    'city' => 'Yaoundé', 'country' => 'CM'],
            ['code' => 'CLI-005', 'name' => 'Koné Travaux Publics',      'email' => 'kone@ktp.ci',           'phone' => '+225 27 20 00 00 01', 'city' => 'Bouaké',  'country' => 'CI'],
        ];

        $clientModel = 'App\\Models\\Client';
        if (class_exists($clientModel)) {
            foreach ($clientsData as $c) {
                try {
                    $clientModel::updateOrCreate(
                        ['code' => $c['code'], 'company_id' => $company->id],
                        array_merge($c, ['company_id' => $company->id])
                    );
                } catch (\Throwable) {}
            }
        }

        // Projets fictifs BTP
        $projectsData = [
            [
                'name'        => 'Construction Résidence Les Palmiers',
                'reference'   => 'PROJ-2026-001',
                'description' => 'Résidence de 24 appartements à Cocody, Abidjan',
                'status'      => 'in_progress',
                'budget'      => 450000000,
                'start_date'  => '2026-01-15',
                'end_date'    => '2026-12-31',
            ],
            [
                'name'        => 'Réhabilitation Route N6',
                'reference'   => 'PROJ-2026-002',
                'description' => 'Réhabilitation de 12 km de route bitumée',
                'status'      => 'in_progress',
                'budget'      => 180000000,
                'start_date'  => '2026-03-01',
                'end_date'    => '2026-09-30',
            ],
            [
                'name'        => 'Siège Social BCEAO Annexe',
                'reference'   => 'PROJ-2025-015',
                'description' => 'Construction d\'un immeuble R+5 à usage de bureaux',
                'status'      => 'completed',
                'budget'      => 820000000,
                'start_date'  => '2025-04-01',
                'end_date'    => '2026-03-31',
            ],
            [
                'name'        => 'Lotissement Yopougon Extension',
                'reference'   => 'PROJ-2026-003',
                'description' => 'Viabilisation de 150 parcelles',
                'status'      => 'planning',
                'budget'      => 95000000,
                'start_date'  => '2026-08-01',
                'end_date'    => '2027-02-28',
            ],
        ];

        $projectModel = 'App\\Models\\Project';
        if (class_exists($projectModel)) {
            foreach ($projectsData as $p) {
                try {
                    $projectModel::updateOrCreate(
                        ['reference' => $p['reference'], 'company_id' => $company->id],
                        array_merge($p, ['company_id' => $company->id])
                    );
                } catch (\Throwable) {}
            }
        }

        // Fournisseurs fictifs
        $suppliersData = [
            ['name' => 'CIMAF Côte d\'Ivoire',          'email' => 'commandes@cimaf.ci', 'phone' => '+225 27 24 00 00 00', 'city' => 'Abidjan'],
            ['name' => 'Quincaillerie Centrale Abidjan', 'email' => 'qca@qca.ci',         'phone' => '+225 07 07 07 07 07', 'city' => 'Abidjan'],
            ['name' => 'Location Engins WEST AFRICA',   'email' => 'info@lewa.ci',        'phone' => '+225 01 01 01 01 01', 'city' => 'Abidjan'],
        ];

        $supplierModel = 'App\\Models\\Supplier';
        if (class_exists($supplierModel)) {
            foreach ($suppliersData as $s) {
                try {
                    $supplierModel::updateOrCreate(
                        ['name' => $s['name'], 'company_id' => $company->id],
                        array_merge($s, ['company_id' => $company->id])
                    );
                } catch (\Throwable) {}
            }
        }

        $this->command->info('DemoDataSeeder : Données de démonstration initialisées.');
        $this->command->info('Accès démo : demo@construiro.com / demo1234');
    }
}
