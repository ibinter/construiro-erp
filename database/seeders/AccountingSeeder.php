<?php

namespace Database\Seeders;

use App\Models\Account;
use App\Models\Budget;
use App\Models\Company;
use App\Models\CostEntry;
use App\Models\JournalEntry;
use App\Models\Project;
use Illuminate\Database\Seeder;

/**
 * Données de démonstration du pôle Comptabilité :
 *  - Plan comptable SYSCOHADA de base (~10 comptes) ;
 *  - un budget prévisionnel + ses lignes, rattaché à PRJ-2026-001 ;
 *  - quelques écritures analytiques ventilées par axe ;
 *  - deux écritures de journal équilibrées (Σ débit = Σ crédit).
 * Idempotent.
 */
class AccountingSeeder extends Seeder
{
    public function run(): void
    {
        $company = Company::where('slug', 'construiro-demo')->first();
        if (! $company) {
            return;
        }

        $project = Project::where('company_id', $company->id)
            ->where('code', 'PRJ-2026-001')
            ->first();

        // --- 1) Plan comptable SYSCOHADA de base --------------------------
        $accounts = [
            ['code' => '211', 'label' => 'Terrains',                          'type' => 'actif'],
            ['code' => '241', 'label' => 'Matériel et outillage',             'type' => 'actif'],
            ['code' => '401', 'label' => 'Fournisseurs',                      'type' => 'passif'],
            ['code' => '411', 'label' => 'Clients',                           'type' => 'actif'],
            ['code' => '521', 'label' => 'Banques',                           'type' => 'actif'],
            ['code' => '571', 'label' => 'Caisse',                            'type' => 'actif'],
            ['code' => '601', 'label' => 'Achats de matières premières',      'type' => 'charge'],
            ['code' => '605', 'label' => 'Autres achats',                     'type' => 'charge'],
            ['code' => '661', 'label' => 'Charges de personnel',              'type' => 'charge'],
            ['code' => '701', 'label' => 'Ventes de travaux',                 'type' => 'produit'],
        ];

        $accountIds = [];
        foreach ($accounts as $data) {
            $account = Account::updateOrCreate(
                ['company_id' => $company->id, 'code' => $data['code']],
                array_merge($data, ['company_id' => $company->id])
            );
            $accountIds[$data['code']] = $account->id;
        }

        // --- 2) Budget prévisionnel + lignes ------------------------------
        $budget = Budget::updateOrCreate(
            ['company_id' => $company->id, 'code' => 'BUD-2026-001'],
            [
                'company_id'  => $company->id,
                'project_id'  => $project?->id,
                'title'       => 'Budget chantier R+8 Plateau',
                'fiscal_year' => 2026,
                'status'      => 'validated',
                'currency'    => 'XOF',
                'notes'       => 'Budget prévisionnel validé pour l\'exercice 2026.',
            ]
        );

        $budgetLines = [
            ['category' => 'Matériaux',      'label' => 'Béton, ciment et agrégats',  'planned_amount' => 45000000, 'actual_amount' => 38200000],
            ['category' => 'Matériaux',      'label' => 'Aciers HA Fe500',            'planned_amount' => 28000000, 'actual_amount' => 30500000],
            ['category' => "Main d'œuvre",   'label' => 'Salaires équipes chantier',  'planned_amount' => 32000000, 'actual_amount' => 21600000],
            ['category' => 'Matériel',       'label' => 'Location grue à tour',       'planned_amount' => 12000000, 'actual_amount' => 8500000],
            ['category' => 'Sous-traitance', 'label' => 'Terrassement et VRD',        'planned_amount' => 18000000, 'actual_amount' => 17400000],
            ['category' => 'Frais généraux', 'label' => 'Frais d\'installation chantier', 'planned_amount' => 6000000, 'actual_amount' => 6300000],
        ];

        // Remplace les lignes pour rendre le seeder idempotent.
        $budget->lines()->delete();
        foreach (array_values($budgetLines) as $index => $line) {
            $budget->lines()->create(array_merge($line, ['position' => $index]));
        }
        $budget->recalculateTotal();

        // --- 3) Écritures analytiques -------------------------------------
        // Repart d'un historique propre (idempotence).
        CostEntry::where('company_id', $company->id)->delete();

        // [date, axe, libellé, type, montant, référence]
        $costEntries = [
            ['2026-05-06', 'materiel',       'Location grue à tour — mai',       'charge',  4250000, 'LOC-2026-014'],
            ['2026-05-12', 'chantier',       'Achat béton dosé 350',             'charge', 12800000, 'BC-2026-051'],
            ['2026-05-20', 'main_oeuvre',    'Salaires équipes gros œuvre',      'charge',  7200000, 'SAL-2026-05'],
            ['2026-05-28', 'sous_traitance', 'Terrassement lot 1',               'charge',  9600000, 'ST-2026-008'],
            ['2026-06-05', 'chantier',       'Situation travaux n°2 — facturée', 'produit', 42000000, 'FAC-2026-021'],
            ['2026-06-15', 'frais_generaux', 'Assurance chantier',               'charge',  1800000, 'ASS-2026-003'],
            ['2026-06-25', 'materiel',       'Carburant engins',                 'charge',  1150000, 'OM-2026-233'],
        ];

        foreach ($costEntries as [$date, $axis, $label, $type, $amount, $ref]) {
            CostEntry::create([
                'company_id' => $company->id,
                'project_id' => $project?->id,
                'date'       => $date,
                'axis'       => $axis,
                'label'      => $label,
                'type'       => $type,
                'amount'     => $amount,
                'reference'  => $ref,
            ]);
        }

        // --- 4) Écritures de journal équilibrées --------------------------
        // Repart d'un historique propre (idempotence).
        JournalEntry::where('company_id', $company->id)->delete();

        // Écriture 1 : achat de matières premières à crédit (601 D / 401 C).
        $e1 = JournalEntry::create([
            'company_id'   => $company->id,
            'date'         => '2026-05-12',
            'piece_number' => 'ACH-2026-051',
            'label'        => 'Achat béton dosé 350 — Fournisseur',
        ]);
        $e1->lines()->createMany([
            ['account_id' => $accountIds['601'], 'label' => 'Achat béton', 'debit' => 12800000, 'credit' => 0],
            ['account_id' => $accountIds['401'], 'label' => 'Dette fournisseur', 'debit' => 0, 'credit' => 12800000],
        ]);

        // Écriture 2 : facturation situation de travaux (411 D / 701 C).
        $e2 = JournalEntry::create([
            'company_id'   => $company->id,
            'date'         => '2026-06-05',
            'piece_number' => 'FAC-2026-021',
            'label'        => 'Situation travaux n°2 — Client',
        ]);
        $e2->lines()->createMany([
            ['account_id' => $accountIds['411'], 'label' => 'Créance client', 'debit' => 42000000, 'credit' => 0],
            ['account_id' => $accountIds['701'], 'label' => 'Vente de travaux', 'debit' => 0, 'credit' => 42000000],
        ]);

        // Écriture 3 : règlement fournisseur par banque (401 D / 521 C).
        $e3 = JournalEntry::create([
            'company_id'   => $company->id,
            'date'         => '2026-06-14',
            'piece_number' => 'REG-2026-033',
            'label'        => 'Règlement fournisseur par virement',
        ]);
        $e3->lines()->createMany([
            ['account_id' => $accountIds['401'], 'label' => 'Apurement dette', 'debit' => 12800000, 'credit' => 0],
            ['account_id' => $accountIds['521'], 'label' => 'Sortie banque', 'debit' => 0, 'credit' => 12800000],
        ]);
    }
}
