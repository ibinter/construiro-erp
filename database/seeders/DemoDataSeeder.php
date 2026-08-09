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

        // Abonnement en état DEMO (données fictives, purgées chaque nuit — cahier §2, §4).
        Subscription::updateOrCreate(
            ['company_id' => $company->id],
            [
                'plan_id'       => $plan?->id,
                'status'        => Subscription::DEMO,
                'billing_cycle' => 'yearly',
                'starts_at'     => now(),
                'ends_at'       => null, // la démo n'expire pas
            ]
        );

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
                        array_merge($c, ['company_id' => $company->id, 'type' => 'entreprise', 'is_active' => true])
                    );
                } catch (\Throwable) {}
            }
        }

        // Projets fictifs BTP (colonnes réelles du modèle : code, type, budget_amount, progress)
        $projectsData = [
            ['code' => 'PRJ-2026-001', 'name' => 'Construction Résidence Les Palmiers', 'type' => 'batiment',       'status' => 'in_progress', 'budget_amount' => 450000000, 'currency' => 'XOF', 'progress' => 45, 'client_name' => 'SCI Les Palmiers',    'city' => 'Abidjan', 'description' => 'Résidence de 24 appartements à Cocody', 'start_date' => '2026-01-15', 'end_date' => '2026-12-31'],
            ['code' => 'PRJ-2026-002', 'name' => 'Réhabilitation Route N6',            'type' => 'travaux_publics', 'status' => 'in_progress', 'budget_amount' => 180000000, 'currency' => 'XOF', 'progress' => 60, 'client_name' => 'Koné Travaux Publics', 'city' => 'Bouaké',  'description' => 'Réhabilitation de 12 km de route bitumée', 'start_date' => '2026-03-01', 'end_date' => '2026-09-30'],
            ['code' => 'PRJ-2026-003', 'name' => 'Extension Usine SIVOP',              'type' => 'batiment',       'status' => 'on_hold',     'budget_amount' => 260000000, 'currency' => 'XOF', 'progress' => 30, 'client_name' => 'SIVOP',               'city' => 'Abidjan', 'description' => 'Extension d\'une unité de production',      'start_date' => '2026-02-01', 'end_date' => '2026-11-30'],
            ['code' => 'PRJ-2025-015', 'name' => 'Siège Social BCEAO Annexe',          'type' => 'batiment',       'status' => 'completed',   'budget_amount' => 820000000, 'currency' => 'XOF', 'progress' => 100,'client_name' => 'BCEAO',               'city' => 'Abidjan', 'description' => 'Immeuble R+5 à usage de bureaux',          'start_date' => '2025-04-01', 'end_date' => '2026-03-31'],
        ];

        $projects = [];
        foreach ($projectsData as $p) {
            $projects[$p['code']] = \App\Models\Project::updateOrCreate(
                ['code' => $p['code'], 'company_id' => $company->id],
                array_merge($p, ['company_id' => $company->id])
            );
        }

        // Chantiers (Site) rattachés aux projets actifs
        $sitesData = [
            ['project' => 'PRJ-2026-001', 'code' => 'CH-001', 'name' => 'Résidence Les Palmiers — Bloc A', 'status' => 'in_progress', 'progress' => 50, 'city' => 'Abidjan'],
            ['project' => 'PRJ-2026-001', 'code' => 'CH-002', 'name' => 'Résidence Les Palmiers — Bloc B', 'status' => 'in_progress', 'progress' => 35, 'city' => 'Abidjan'],
            ['project' => 'PRJ-2026-002', 'code' => 'CH-003', 'name' => 'Route N6 — PK0 à PK6',            'status' => 'in_progress', 'progress' => 65, 'city' => 'Bouaké'],
        ];
        foreach ($sitesData as $s) {
            $proj = $projects[$s['project']] ?? null;
            if ($proj) {
                \App\Models\Site::updateOrCreate(
                    ['code' => $s['code'], 'project_id' => $proj->id],
                    ['company_id' => $company->id, 'project_id' => $proj->id, 'name' => $s['name'], 'status' => $s['status'], 'progress' => $s['progress'], 'city' => $s['city']]
                );
            }
        }

        // Employés fictifs (actifs)
        $employeesData = [
            ['matricule' => 'EMP-001', 'first_name' => 'Kouassi',  'last_name' => 'Yao',    'job_title' => 'Conducteur de travaux',      'department' => 'Technique', 'base_salary' => 450000],
            ['matricule' => 'EMP-002', 'first_name' => 'Awa',      'last_name' => 'Traoré', 'job_title' => 'Ingénieure BTP',             'department' => 'Études',    'base_salary' => 650000],
            ['matricule' => 'EMP-003', 'first_name' => 'Ibrahim',  'last_name' => 'Cissé',  'job_title' => 'Chef de chantier',           'department' => 'Travaux',   'base_salary' => 380000],
            ['matricule' => 'EMP-004', 'first_name' => 'Fatou',    'last_name' => 'Bamba',  'job_title' => 'Comptable',                  'department' => 'Finances',  'base_salary' => 420000],
            ['matricule' => 'EMP-005', 'first_name' => 'Serge',    'last_name' => 'Koffi',  'job_title' => 'Chef d\'équipe maçonnerie',  'department' => 'Travaux',   'base_salary' => 250000],
            ['matricule' => 'EMP-006', 'first_name' => 'Mariam',   'last_name' => 'Sanogo', 'job_title' => 'Assistante RH',              'department' => 'RH',        'base_salary' => 300000],
        ];
        foreach ($employeesData as $e) {
            \App\Models\Employee::updateOrCreate(
                ['matricule' => $e['matricule'], 'company_id' => $company->id],
                array_merge($e, ['company_id' => $company->id, 'currency' => 'XOF', 'status' => 'active', 'is_active' => true, 'hire_date' => '2025-06-01', 'contract_type' => 'cdi'])
            );
        }

        // Factures fictives : CA du mois (payées) + impayés (envoyées / en retard)
        $clientIds = \App\Models\Client::where('company_id', $company->id)->pluck('id', 'code');
        $invoicesData = [
            ['code' => 'FAC-2026-051', 'client' => 'CLI-001', 'project' => 'PRJ-2026-001', 'status' => 'paid',    'subtotal' => 25000000, 'issue' => now()->startOfMonth()->addDays(3),  'paid' => true],
            ['code' => 'FAC-2026-052', 'client' => 'CLI-005', 'project' => 'PRJ-2026-002', 'status' => 'paid',    'subtotal' => 18000000, 'issue' => now()->startOfMonth()->addDays(9),  'paid' => true],
            ['code' => 'FAC-2026-053', 'client' => 'CLI-002', 'project' => 'PRJ-2026-001', 'status' => 'sent',    'subtotal' => 12000000, 'issue' => now()->subDays(18),                 'paid' => false],
            ['code' => 'FAC-2026-048', 'client' => 'CLI-004', 'project' => null,           'status' => 'overdue', 'subtotal' => 9500000,  'issue' => now()->subDays(55),                 'paid' => false],
        ];
        foreach ($invoicesData as $inv) {
            $sub = $inv['subtotal'];
            $tax = $sub * 0.18;
            $total = $sub + $tax;
            \App\Models\Invoice::updateOrCreate(
                ['code' => $inv['code'], 'company_id' => $company->id],
                [
                    'company_id'  => $company->id,
                    'client_id'   => $clientIds[$inv['client']] ?? null,
                    'project_id'  => $inv['project'] ? ($projects[$inv['project']]->id ?? null) : null,
                    'status'      => $inv['status'],
                    'currency'    => 'XOF',
                    'issue_date'  => $inv['issue'],
                    'due_date'    => $inv['issue']->copy()->addDays(30),
                    'tax_rate'    => 18,
                    'subtotal'    => $sub,
                    'tax_amount'  => $tax,
                    'total'       => $total,
                    'amount_paid' => $inv['paid'] ? $total : 0,
                    'verify_token' => \Illuminate\Support\Str::random(40),
                ]
            );
        }

        // Fournisseurs fictifs (colonnes réelles : code, category requis)
        $suppliersData = [
            ['code' => 'FRN-001', 'category' => 'materiaux', 'name' => 'CIMAF Côte d\'Ivoire',           'email' => 'commandes@cimaf.ci', 'phone' => '+225 27 24 00 00 00', 'city' => 'Abidjan'],
            ['code' => 'FRN-002', 'category' => 'materiaux', 'name' => 'Quincaillerie Centrale Abidjan', 'email' => 'qca@qca.ci',         'phone' => '+225 07 07 07 07 07', 'city' => 'Abidjan'],
            ['code' => 'FRN-003', 'category' => 'services',  'name' => 'Location Engins WEST AFRICA',    'email' => 'info@lewa.ci',        'phone' => '+225 01 01 01 01 01', 'city' => 'Abidjan'],
        ];

        $supplierModel = 'App\\Models\\Supplier';
        if (class_exists($supplierModel)) {
            foreach ($suppliersData as $s) {
                try {
                    $supplierModel::updateOrCreate(
                        ['code' => $s['code'], 'company_id' => $company->id],
                        array_merge($s, ['company_id' => $company->id, 'is_active' => true])
                    );
                } catch (\Throwable) {}
            }
        }

        $this->command->info('DemoDataSeeder : Données de démonstration initialisées.');
        $this->command->info('Accès démo : demo@construiro.com / demo1234');
    }
}
