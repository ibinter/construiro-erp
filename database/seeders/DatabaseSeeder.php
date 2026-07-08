<?php

namespace Database\Seeders;

use App\Models\Agency;
use App\Models\Company;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // 1) Référentiels + rôles/permissions.
        $this->call([
            CurrencySeeder::class,
            RolePermissionSeeder::class,
        ]);

        // 2) Entreprise + agence de démonstration.
        $company = Company::updateOrCreate(
            ['slug' => 'construiro-demo'],
            [
                'name'          => 'CONSTRUIRO Démo BTP',
                'legal_name'    => 'CONSTRUIRO Démo BTP SARL',
                'country'       => 'CI',
                'city'          => 'Abidjan',
                'base_currency' => 'XOF',
                'locale'        => 'fr',
                'timezone'      => 'Africa/Abidjan',
                'is_active'     => true,
            ]
        );

        $agency = Agency::updateOrCreate(
            ['company_id' => $company->id, 'code' => 'SIEGE'],
            [
                'name'            => 'Siège Abidjan',
                'city'            => 'Abidjan',
                'is_headquarters' => true,
                'is_active'       => true,
            ]
        );

        // 3) Super-administrateur.
        $admin = User::updateOrCreate(
            ['email' => 'admin@construiro.com'],
            [
                'company_id' => $company->id,
                'agency_id'  => $agency->id,
                'name'       => 'Administrateur',
                'password'   => Hash::make('password'),
                'locale'     => 'fr',
                'job_title'  => 'Administrateur système',
                'is_active'  => true,
            ]
        );
        $admin->syncRoles(['super_admin']);

        // 4) Comptes de démonstration pour quelques portails clés.
        $demoUsers = [
            ['directeur_projet',   'Directeur de Projet',    'dp@construiro.com'],
            ['conducteur_travaux', 'Conducteur de Travaux',  'ct@construiro.com'],
            ['chef_chantier',      'Chef de Chantier',       'chef@construiro.com'],
            ['magasinier',         'Magasinier',             'magasin@construiro.com'],
            ['comptabilite',       'Comptable',              'compta@construiro.com'],
            ['client',             'Client Démo',            'client@construiro.com'],
        ];

        foreach ($demoUsers as [$role, $name, $email]) {
            $user = User::updateOrCreate(
                ['email' => $email],
                [
                    'company_id' => $company->id,
                    'agency_id'  => $agency->id,
                    'name'       => $name,
                    'password'   => Hash::make('password'),
                    'locale'     => 'fr',
                    'job_title'  => $name,
                    'is_active'  => true,
                ]
            );
            $user->syncRoles([$role]);
        }

        // 5) Données métier de démonstration.
        $this->call(ProjectSeeder::class);
        $this->call(QuoteSeeder::class);
        $this->call(InvoiceSeeder::class);
        $this->call(ClientSeeder::class);
        $this->call(SupplierSeeder::class);
        $this->call(ContractSeeder::class);
        $this->call(InventorySeeder::class);
    }
}
