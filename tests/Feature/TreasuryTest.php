<?php

namespace Tests\Feature;

use App\Models\CashAccount;
use App\Models\Company;
use App\Models\TreasuryTransaction;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

/**
 * Tests du module Trésorerie :
 * - Création d'un compte de trésorerie (caisse / banque / mobile money)
 * - Ajout de transactions (entrée / sortie)
 * - Vérification du solde courant
 * - Isolation multi-tenant (CompanyScope global)
 */
class TreasuryTest extends TestCase
{
    use RefreshDatabase;

    private Company    $company;
    private User       $superAdmin;
    private CashAccount $account;

    protected function setUp(): void
    {
        parent::setUp();

        $this->company = Company::create([
            'name'          => 'BTP Test SA',
            'slug'          => 'btp-test',
            'country'       => 'CI',
            'base_currency' => 'XOF',
            'locale'        => 'fr',
            'timezone'      => 'Africa/Abidjan',
            'is_active'     => true,
        ]);

        foreach (['view', 'create', 'update', 'delete'] as $action) {
            Permission::findOrCreate("treasury.{$action}", 'web');
        }

        $role = Role::findOrCreate('super_admin', 'web');
        $role->syncPermissions(Permission::all());

        $this->superAdmin = User::factory()->create([
            'company_id' => $this->company->id,
        ]);
        $this->superAdmin->assignRole('super_admin');

        // Compte de trésorerie de référence pour les tests de transaction.
        // Créé directement (pas via HTTP) avant tout actingAs.
        $this->account = CashAccount::create([
            'company_id'      => $this->company->id,
            'name'            => 'Caisse principale',
            'type'            => 'caisse',
            'currency'        => 'XOF',
            'opening_balance' => 0,
            'is_active'       => true,
        ]);
    }

    // -------------------------------------------------------------------------
    // Helpers
    // -------------------------------------------------------------------------

    private function validAccountPayload(array $overrides = []): array
    {
        return array_merge([
            'name'            => 'Banque SGBCI',
            'type'            => 'banque',
            'bank_name'       => 'SGBCI',
            'account_number'  => '12345678901',
            'currency'        => 'XOF',
            'opening_balance' => 500000,
        ], $overrides);
    }

    private function validTransactionPayload(array $overrides = []): array
    {
        return array_merge([
            'cash_account_id' => $this->account->id,
            'type'            => 'in',
            'amount'          => 250000,
            'date'            => '2026-08-01',
            'description'     => 'Virement client',
        ], $overrides);
    }

    // -------------------------------------------------------------------------
    // INDEX
    // -------------------------------------------------------------------------

    public function test_super_admin_peut_voir_le_tableau_de_bord_tresorerie(): void
    {
        $response = $this->actingAs($this->superAdmin)->get('/treasury');

        $response->assertOk();
    }

    // -------------------------------------------------------------------------
    // CREATE ACCOUNT — succès
    // -------------------------------------------------------------------------

    public function test_super_admin_peut_creer_un_compte_banque(): void
    {
        $response = $this->actingAs($this->superAdmin)
            ->post('/treasury/accounts', $this->validAccountPayload());

        $response->assertRedirect();
        $response->assertSessionHasNoErrors();

        $this->assertDatabaseHas('cash_accounts', [
            'company_id' => $this->company->id,
            'name'       => 'Banque SGBCI',
            'type'       => 'banque',
        ]);
    }

    public function test_super_admin_peut_creer_un_compte_caisse(): void
    {
        $response = $this->actingAs($this->superAdmin)
            ->post('/treasury/accounts', $this->validAccountPayload([
                'name'            => 'Caisse chantier',
                'type'            => 'caisse',
                'opening_balance' => 100000,
            ]));

        $response->assertRedirect();
        $response->assertSessionHasNoErrors();

        $this->assertDatabaseHas('cash_accounts', [
            'company_id' => $this->company->id,
            'name'       => 'Caisse chantier',
            'type'       => 'caisse',
        ]);
    }

    public function test_super_admin_peut_creer_un_compte_mobile_money(): void
    {
        $response = $this->actingAs($this->superAdmin)
            ->post('/treasury/accounts', $this->validAccountPayload([
                'name' => 'Orange Money Pro',
                'type' => 'mobile_money',
            ]));

        $response->assertRedirect();
        $response->assertSessionHasNoErrors();

        $this->assertDatabaseHas('cash_accounts', [
            'name' => 'Orange Money Pro',
            'type' => 'mobile_money',
        ]);
    }

    // -------------------------------------------------------------------------
    // CREATE ACCOUNT — validation
    // -------------------------------------------------------------------------

    public function test_creation_compte_echoue_sans_nom(): void
    {
        $response = $this->actingAs($this->superAdmin)
            ->post('/treasury/accounts', $this->validAccountPayload(['name' => '']));

        $response->assertSessionHasErrors('name');
    }

    public function test_creation_compte_echoue_avec_type_invalide(): void
    {
        $response = $this->actingAs($this->superAdmin)
            ->post('/treasury/accounts', $this->validAccountPayload(['type' => 'invalide']));

        $response->assertSessionHasErrors('type');
    }

    public function test_creation_compte_echoue_sans_devise(): void
    {
        $response = $this->actingAs($this->superAdmin)
            ->post('/treasury/accounts', $this->validAccountPayload(['currency' => '']));

        $response->assertSessionHasErrors('currency');
    }

    public function test_creation_compte_echoue_sans_solde_ouverture(): void
    {
        $response = $this->actingAs($this->superAdmin)
            ->post('/treasury/accounts', $this->validAccountPayload(['opening_balance' => '']));

        $response->assertSessionHasErrors('opening_balance');
    }

    // -------------------------------------------------------------------------
    // SHOW ACCOUNT
    // -------------------------------------------------------------------------

    public function test_super_admin_peut_voir_le_detail_dun_compte(): void
    {
        $response = $this->actingAs($this->superAdmin)
            ->get("/treasury/accounts/{$this->account->id}");

        $response->assertOk();
    }

    // -------------------------------------------------------------------------
    // TRANSACTIONS — succès
    // -------------------------------------------------------------------------

    public function test_super_admin_peut_enregistrer_une_transaction_entree(): void
    {
        $response = $this->actingAs($this->superAdmin)
            ->post('/treasury/transactions', $this->validTransactionPayload([
                'type'   => 'in',
                'amount' => 300000,
            ]));

        $response->assertRedirect();
        $response->assertSessionHasNoErrors();

        $this->assertDatabaseHas('treasury_transactions', [
            'company_id'      => $this->company->id,
            'cash_account_id' => $this->account->id,
            'type'            => 'in',
            'amount'          => 300000,
        ]);
    }

    public function test_super_admin_peut_enregistrer_une_transaction_sortie(): void
    {
        $response = $this->actingAs($this->superAdmin)
            ->post('/treasury/transactions', $this->validTransactionPayload([
                'type'        => 'out',
                'amount'      => 75000,
                'description' => 'Achat carburant',
            ]));

        $response->assertRedirect();
        $response->assertSessionHasNoErrors();

        $this->assertDatabaseHas('treasury_transactions', [
            'type'   => 'out',
            'amount' => 75000,
        ]);
    }

    // -------------------------------------------------------------------------
    // TRANSACTIONS — validation
    // -------------------------------------------------------------------------

    public function test_creation_transaction_echoue_sans_montant(): void
    {
        $response = $this->actingAs($this->superAdmin)
            ->post('/treasury/transactions', $this->validTransactionPayload(['amount' => '']));

        $response->assertSessionHasErrors('amount');
    }

    public function test_creation_transaction_echoue_avec_montant_zero(): void
    {
        $response = $this->actingAs($this->superAdmin)
            ->post('/treasury/transactions', $this->validTransactionPayload(['amount' => 0]));

        $response->assertSessionHasErrors('amount');
    }

    public function test_creation_transaction_echoue_sans_date(): void
    {
        $response = $this->actingAs($this->superAdmin)
            ->post('/treasury/transactions', $this->validTransactionPayload(['date' => '']));

        $response->assertSessionHasErrors('date');
    }

    public function test_creation_transaction_echoue_avec_type_invalide(): void
    {
        $response = $this->actingAs($this->superAdmin)
            ->post('/treasury/transactions', $this->validTransactionPayload(['type' => 'debit']));

        $response->assertSessionHasErrors('type');
    }

    // -------------------------------------------------------------------------
    // Calcul du solde
    // -------------------------------------------------------------------------

    public function test_solde_courant_est_calcule_a_partir_des_transactions(): void
    {
        /*
         * Solde d'ouverture : 100 000 XOF
         * Entrée            : 300 000 XOF
         * Sortie            :  50 000 XOF
         * Solde attendu     : 350 000 XOF
         */
        $this->account->update(['opening_balance' => 100000]);

        $this->actingAs($this->superAdmin)
            ->post('/treasury/transactions', $this->validTransactionPayload([
                'type'   => 'in',
                'amount' => 300000,
                'date'   => '2026-08-01',
            ]));

        $this->actingAs($this->superAdmin)
            ->post('/treasury/transactions', $this->validTransactionPayload([
                'type'   => 'out',
                'amount' => 50000,
                'date'   => '2026-08-02',
            ]));

        $balance = $this->account->currentBalance();

        $this->assertEquals(350000.0, $balance);
    }

    public function test_solde_sans_transaction_est_egal_au_solde_ouverture(): void
    {
        $this->account->update(['opening_balance' => 250000]);

        $this->assertEquals(250000.0, $this->account->currentBalance());
    }

    // -------------------------------------------------------------------------
    // Isolation multi-tenant
    // -------------------------------------------------------------------------

    public function test_utilisateur_autre_company_ne_peut_pas_acceder_a_un_compte(): void
    {
        // Compte appartenant à l'entreprise A ($this->account)
        // Entreprise B et son utilisateur
        $companyB = Company::create([
            'name'          => 'Autre BTP SARL',
            'slug'          => 'autre-btp',
            'country'       => 'CI',
            'base_currency' => 'XOF',
            'locale'        => 'fr',
            'timezone'      => 'Africa/Abidjan',
            'is_active'     => true,
        ]);

        $userB = User::factory()->create(['company_id' => $companyB->id]);
        $userB->assignRole('super_admin');

        // CompanyScope filtre par company_id de l'utilisateur connecté
        // → le compte A est invisible pour l'utilisateur B → 404
        $response = $this->actingAs($userB)
            ->get("/treasury/accounts/{$this->account->id}");

        $response->assertStatus(404);
    }

    public function test_utilisateur_autre_company_ne_peut_pas_creer_transaction_sur_compte_tiers(): void
    {
        // La validation Rule::exists('cash_accounts', 'id')->where('company_id', ...)
        // empêche d'utiliser le cash_account_id d'une autre entreprise.
        $companyB = Company::create([
            'name'          => 'Autre BTP SARL',
            'slug'          => 'autre-btp',
            'country'       => 'CI',
            'base_currency' => 'XOF',
            'locale'        => 'fr',
            'timezone'      => 'Africa/Abidjan',
            'is_active'     => true,
        ]);

        $userB = User::factory()->create(['company_id' => $companyB->id]);
        $userB->assignRole('super_admin');

        $response = $this->actingAs($userB)
            ->post('/treasury/transactions', [
                'cash_account_id' => $this->account->id, // appartient à company A
                'type'            => 'in',
                'amount'          => 100000,
                'date'            => '2026-08-01',
            ]);

        $response->assertSessionHasErrors('cash_account_id');
        $this->assertDatabaseCount('treasury_transactions', 0);
    }

    public function test_scope_for_user_ne_renvoie_que_les_transactions_de_la_meme_company(): void
    {
        // Transaction appartenant à la company A
        TreasuryTransaction::create([
            'company_id'      => $this->company->id,
            'cash_account_id' => $this->account->id,
            'user_id'         => $this->superAdmin->id,
            'type'            => 'in',
            'amount'          => 100000,
            'date'            => '2026-08-01',
        ]);

        // Transaction appartenant à une company B
        $companyB = Company::create([
            'name'          => 'Autre BTP SARL',
            'slug'          => 'autre-btp',
            'country'       => 'CI',
            'base_currency' => 'XOF',
            'locale'        => 'fr',
            'timezone'      => 'Africa/Abidjan',
            'is_active'     => true,
        ]);

        $accountB = CashAccount::create([
            'company_id'      => $companyB->id,
            'name'            => 'Caisse B',
            'type'            => 'caisse',
            'currency'        => 'XOF',
            'opening_balance' => 0,
            'is_active'       => true,
        ]);

        TreasuryTransaction::create([
            'company_id'      => $companyB->id,
            'cash_account_id' => $accountB->id,
            'type'            => 'in',
            'amount'          => 200000,
            'date'            => '2026-08-01',
        ]);

        $transactionsA = TreasuryTransaction::forUser($this->superAdmin)->get();

        $this->assertCount(1, $transactionsA);
        $this->assertEquals(100000, (float) $transactionsA->first()->amount);
    }
}
