<?php

namespace Database\Seeders;

use App\Models\CashAccount;
use App\Models\Company;
use App\Models\Project;
use App\Models\TreasuryTransaction;
use App\Models\User;
use Illuminate\Database\Seeder;

/**
 * Données de démonstration du module Trésorerie : trois comptes réalistes
 * (caisse, banque, mobile money) avec soldes d'ouverture et une série de
 * transactions crédibles (encaissements clients, fournisseurs, salaires,
 * carburant). Idempotent.
 */
class TreasurySeeder extends Seeder
{
    public function run(): void
    {
        $company = Company::where('slug', 'construiro-demo')->first();
        if (! $company) {
            return;
        }

        $comptable = User::where('email', 'compta@construiro.com')->first()
            ?? User::where('company_id', $company->id)->first();

        // Projet éventuel à rattacher à quelques transactions.
        $project = Project::where('company_id', $company->id)->first();

        // --- Comptes de trésorerie ----------------------------------------
        $accounts = [
            'Caisse principale' => ['type' => 'caisse',       'bank_name' => null,            'account_number' => null,             'opening_balance' => 500000],
            'Compte SGBCI'      => ['type' => 'banque',       'bank_name' => 'SGBCI',         'account_number' => 'CI0010001234567', 'opening_balance' => 12000000],
            'Orange Money'      => ['type' => 'mobile_money', 'bank_name' => 'Orange CI',     'account_number' => '0708090910',      'opening_balance' => 750000],
        ];

        $accountIds = [];
        foreach ($accounts as $name => $data) {
            $account = CashAccount::updateOrCreate(
                ['company_id' => $company->id, 'name' => $name],
                array_merge($data, ['company_id' => $company->id, 'currency' => 'XOF', 'is_active' => true])
            );
            $accountIds[$name] = $account->id;
        }

        // --- Transactions -------------------------------------------------
        // Rend le seeder idempotent : on repart d'un historique propre.
        TreasuryTransaction::where('company_id', $company->id)->delete();

        // [compte, type, catégorie, montant, date, référence, description]
        $transactions = [
            ['Compte SGBCI',      'in',  'encaissement_client', 8500000, '2026-05-05', 'VIR-2026-051', 'Acompte marché voirie'],
            ['Caisse principale', 'in',  'encaissement_client', 300000,  '2026-05-10', 'REC-2026-012', 'Règlement client comptant'],
            ['Compte SGBCI',      'out', 'achat',               2400000, '2026-05-14', 'FAC-F-2026-088', 'Paiement fournisseur ciment'],
            ['Orange Money',      'out', 'carburant',           120000,  '2026-05-18', 'OM-2026-201', 'Carburant engins chantier'],
            ['Compte SGBCI',      'out', 'salaire',             3600000, '2026-05-30', 'SAL-2026-05', 'Salaires mai 2026'],
            ['Compte SGBCI',      'in',  'encaissement_client', 6000000, '2026-06-08', 'VIR-2026-062', 'Situation travaux n°2'],
            ['Caisse principale', 'out', 'achat',               180000,  '2026-06-12', 'BC-2026-045', 'Petit matériel quincaillerie'],
            ['Orange Money',      'out', 'carburant',           95000,   '2026-06-20', 'OM-2026-233', 'Carburant véhicules'],
            ['Compte SGBCI',      'out', 'salaire',             3600000, '2026-06-30', 'SAL-2026-06', 'Salaires juin 2026'],
            ['Caisse principale', 'out', 'autre',               75000,   '2026-07-02', 'DIV-2026-007', 'Frais divers de fonctionnement'],
            ['Compte SGBCI',      'out', 'achat',               1350000, '2026-07-04', 'FAC-F-2026-101', 'Paiement fournisseur fer à béton'],
        ];

        foreach ($transactions as [$accName, $type, $category, $amount, $date, $ref, $desc]) {
            TreasuryTransaction::create([
                'company_id'      => $company->id,
                'cash_account_id' => $accountIds[$accName],
                'project_id'      => $project?->id,
                'user_id'         => $comptable?->id,
                'type'            => $type,
                'category'        => $category,
                'amount'          => $amount,
                'date'            => $date,
                'reference'       => $ref,
                'description'     => $desc,
            ]);
        }
    }
}
