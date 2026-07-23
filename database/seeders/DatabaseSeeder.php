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
            SubscriptionPlanSeeder::class,
            PaymentMethodSeeder::class,
            LegalPageSeeder::class,
            LandingSeeder::class,
            EmailTemplateSeeder::class,
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
                'name'              => 'Administrateur',
                'password'          => Hash::make('password'),
                'email_verified_at' => now(),
                'locale'            => 'fr',
                'job_title'         => 'Administrateur système',
                'is_active'         => true,
            ]
        );
        $admin->syncRoles(['super_admin']);

        // IBIG Soft — compte SuperAdmin global (ibig_superadmin).
        $ibigAdmin = User::updateOrCreate(
            ['email' => 'sa@ibigsoft.com'],
            [
                'company_id'        => $company->id,
                'agency_id'         => $agency->id,
                'name'              => 'IBIG SuperAdmin',
                'password'          => Hash::make('Ibig@2026!'),
                'email_verified_at' => now(),
                'locale'            => 'fr',
                'job_title'         => 'SuperAdmin IBIG Soft',
                'is_active'         => true,
            ]
        );
        $ibigAdmin->syncRoles(['ibig_superadmin']);

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
                    'name'              => $name,
                    'password'          => Hash::make('password'),
                    'email_verified_at' => now(),
                    'locale'            => 'fr',
                    'job_title'         => $name,
                    'is_active'         => true,
                ]
            );
            $user->syncRoles([$role]);
        }

        // 5) Données métier de démonstration.
        //    Ordre = dépendances d'abord (référentiels), puis documents.
        $this->call(ProjectSeeder::class);        // projets + chantiers
        $this->call(ClientSeeder::class);         // clients
        $this->call(SupplierSeeder::class);       // fournisseurs
        $this->call(SubcontractorSeeder::class);  // sous-traitants
        $this->call(InventorySeeder::class);      // matériaux + magasins + mouvements
        $this->call(EquipmentSeeder::class);      // parc matériel (rattaché aux chantiers)
        $this->call(HrSeeder::class);             // employés + pointages + bulletins
        $this->call(PlanningSeeder::class);       // tâches de planning (rattachées projet)
        $this->call(TreasurySeeder::class);       // comptes + transactions de trésorerie
        $this->call(QhseSeeder::class);           // incidents QHSE + contrôles qualité
        $this->call(QuoteSeeder::class);          // devis (rattachés projet)
        $this->call(InvoiceSeeder::class);        // factures (rattachées client + projet)
        $this->call(ContractSeeder::class);       // contrats (rattachés projet)
        $this->call(PurchaseSeeder::class);       // achats (fournisseur + matériaux + projet)

        // Vague 5 — tous rattachés aux référentiels/documents déjà seedés.
        $this->call(DesignOfficeSeeder::class);   // BPU + métré + DQE + études
        $this->call(CrmSeeder::class);            // opportunités CRM + appels d'offres
        $this->call(FleetSeeder::class);          // pleins de carburant (parc)
        $this->call(AccountingSeeder::class);     // plan comptable + budget + analytique + journal
        $this->call(PaymentsSeeder::class);       // encaissements + décaissements
        $this->call(DocsLabSeeder::class);        // essais labo + documents + signatures
        $this->call(AiSeeder::class);             // historique assistant IA (démo)
        $this->call(AcademySeeder::class);        // catégories + ressources Académie (à venir)
        $this->call(PracticalCasesSeeder::class); // §12.2 cas pratiques guidés (is_published=true)
    }
}
