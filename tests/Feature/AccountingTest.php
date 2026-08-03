<?php

namespace Tests\Feature;

use App\Models\Account;
use App\Models\Company;
use App\Models\JournalEntry;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

/**
 * Tests du module Comptabilité générale (SYSCOHADA) :
 * - Création d'un compte du plan comptable (storeAccount)
 * - Création d'une écriture de journal équilibrée (store)
 * - Modification d'une écriture (update)
 * - Suppression d'une écriture (destroy)
 * - Contrôle d'équilibre débit/crédit
 * - Validation des champs requis
 * - Isolation multi-tenant (CompanyScope global → 404)
 */
class AccountingTest extends TestCase
{
    use RefreshDatabase;

    private Company $company;
    private User    $superAdmin;
    private Account $accountDebit;
    private Account $accountCredit;

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
            Permission::findOrCreate("accounting.{$action}", 'web');
        }

        $role = Role::findOrCreate('super_admin', 'web');
        $role->syncPermissions(Permission::all());

        Role::findOrCreate('admin', 'web');

        $this->superAdmin = User::factory()->create([
            'company_id' => $this->company->id,
        ]);
        $this->superAdmin->assignRole('super_admin');

        // Comptes du plan comptable nécessaires pour les écritures de test
        $this->accountDebit = Account::create([
            'company_id' => $this->company->id,
            'code'       => '411000',
            'label'      => 'Clients',
            'type'       => 'actif',
        ]);

        $this->accountCredit = Account::create([
            'company_id' => $this->company->id,
            'code'       => '701000',
            'label'      => 'Ventes prestations',
            'type'       => 'produit',
        ]);
    }

    // -------------------------------------------------------------------------
    // Helpers
    // -------------------------------------------------------------------------

    /** Payload valide (écriture équilibrée) pour POST /accounting. */
    private function validEntryPayload(array $overrides = []): array
    {
        return array_merge([
            'date'         => '2026-06-01',
            'piece_number' => 'PCE-001',
            'label'        => 'Facture client BTP 001',
            'lines'        => [
                [
                    'account_id' => $this->accountDebit->id,
                    'label'      => 'Débit client',
                    'debit'      => 500000,
                    'credit'     => 0,
                ],
                [
                    'account_id' => $this->accountCredit->id,
                    'label'      => 'Produit vente',
                    'debit'      => 0,
                    'credit'     => 500000,
                ],
            ],
        ], $overrides);
    }

    /** Crée une écriture de journal directement en base, sans lignes. */
    private function createEntry(array $overrides = []): JournalEntry
    {
        return JournalEntry::create(array_merge([
            'company_id' => $this->company->id,
            'date'       => '2026-06-01',
            'label'      => 'Écriture de test',
        ], $overrides));
    }

    // -------------------------------------------------------------------------
    // PLAN COMPTABLE — storeAccount
    // -------------------------------------------------------------------------

    public function test_super_admin_peut_creer_un_compte_comptable(): void
    {
        $response = $this->actingAs($this->superAdmin)
            ->post('/accounting/accounts', [
                'code'  => '512000',
                'label' => 'Banque',
                'type'  => 'actif',
            ]);

        $response->assertRedirect();
        $response->assertSessionHasNoErrors();

        $this->assertDatabaseHas('accounts', [
            'company_id' => $this->company->id,
            'code'       => '512000',
            'label'      => 'Banque',
            'type'       => 'actif',
        ]);
    }

    public function test_creation_compte_echoue_sans_code(): void
    {
        $response = $this->actingAs($this->superAdmin)
            ->post('/accounting/accounts', ['code' => '', 'label' => 'Banque', 'type' => 'actif']);

        $response->assertSessionHasErrors('code');
    }

    public function test_creation_compte_echoue_sans_libelle(): void
    {
        $response = $this->actingAs($this->superAdmin)
            ->post('/accounting/accounts', ['code' => '512000', 'label' => '', 'type' => 'actif']);

        $response->assertSessionHasErrors('label');
    }

    public function test_creation_compte_echoue_avec_type_invalide(): void
    {
        $response = $this->actingAs($this->superAdmin)
            ->post('/accounting/accounts', ['code' => '999', 'label' => 'Test', 'type' => 'invalide']);

        $response->assertSessionHasErrors('type');
    }

    public function test_creation_compte_echoue_avec_code_duplique(): void
    {
        $this->actingAs($this->superAdmin)
            ->post('/accounting/accounts', ['code' => '512000', 'label' => 'Banque', 'type' => 'actif']);

        $response = $this->actingAs($this->superAdmin)
            ->post('/accounting/accounts', ['code' => '512000', 'label' => 'Banque bis', 'type' => 'actif']);

        $response->assertSessionHasErrors('code');
    }

    // -------------------------------------------------------------------------
    // JOURNAL — index
    // -------------------------------------------------------------------------

    public function test_super_admin_peut_voir_le_journal_comptable(): void
    {
        $response = $this->actingAs($this->superAdmin)->get('/accounting');

        $response->assertOk();
    }

    public function test_super_admin_peut_voir_le_plan_comptable(): void
    {
        $response = $this->actingAs($this->superAdmin)->get('/accounting/accounts');

        $response->assertOk();
    }

    // -------------------------------------------------------------------------
    // JOURNAL — store (écriture équilibrée)
    // -------------------------------------------------------------------------

    public function test_super_admin_peut_creer_une_ecriture_equilibree(): void
    {
        $response = $this->actingAs($this->superAdmin)
            ->post('/accounting', $this->validEntryPayload());

        $response->assertRedirect();
        $response->assertSessionHasNoErrors();

        $this->assertDatabaseHas('journal_entries', [
            'company_id' => $this->company->id,
            'label'      => 'Facture client BTP 001',
        ]);

        $entry = JournalEntry::where('label', 'Facture client BTP 001')->first();
        $this->assertNotNull($entry);
        $this->assertCount(2, $entry->lines);
    }

    public function test_creation_ecriture_echoue_si_desequilibree(): void
    {
        $payload = $this->validEntryPayload([
            'lines' => [
                [
                    'account_id' => $this->accountDebit->id,
                    'label'      => 'Débit client',
                    'debit'      => 500000,
                    'credit'     => 0,
                ],
                [
                    'account_id' => $this->accountCredit->id,
                    'label'      => 'Produit vente',
                    'debit'      => 0,
                    'credit'     => 400000, // déséquilibré : 500 000 ≠ 400 000
                ],
            ],
        ]);

        $response = $this->actingAs($this->superAdmin)
            ->post('/accounting', $payload);

        $response->assertSessionHasErrors('lines');
        $this->assertDatabaseCount('journal_entries', 0);
    }

    public function test_creation_ecriture_echoue_sans_libelle(): void
    {
        $response = $this->actingAs($this->superAdmin)
            ->post('/accounting', $this->validEntryPayload(['label' => '']));

        $response->assertSessionHasErrors('label');
    }

    public function test_creation_ecriture_echoue_avec_moins_de_deux_lignes(): void
    {
        $payload = $this->validEntryPayload([
            'lines' => [
                ['account_id' => $this->accountDebit->id, 'label' => null, 'debit' => 100000, 'credit' => 0],
            ],
        ]);

        $response = $this->actingAs($this->superAdmin)
            ->post('/accounting', $payload);

        $response->assertSessionHasErrors('lines');
    }

    public function test_creation_ecriture_echoue_sans_date(): void
    {
        $response = $this->actingAs($this->superAdmin)
            ->post('/accounting', $this->validEntryPayload(['date' => '']));

        $response->assertSessionHasErrors('date');
    }

    public function test_creation_ecriture_echoue_avec_compte_autre_company(): void
    {
        $companyB = Company::create([
            'name'          => 'Autre BTP SARL',
            'slug'          => 'autre-btp',
            'country'       => 'CI',
            'base_currency' => 'XOF',
            'locale'        => 'fr',
            'timezone'      => 'Africa/Abidjan',
            'is_active'     => true,
        ]);

        $accountB = Account::create([
            'company_id' => $companyB->id,
            'code'       => '411000',
            'label'      => 'Clients B',
            'type'       => 'actif',
        ]);

        // superAdmin (company A) tente d'utiliser un compte de company B
        $payload = $this->validEntryPayload([
            'lines' => [
                ['account_id' => $accountB->id, 'label' => null, 'debit' => 100000, 'credit' => 0],
                ['account_id' => $this->accountCredit->id, 'label' => null, 'debit' => 0, 'credit' => 100000],
            ],
        ]);

        $response = $this->actingAs($this->superAdmin)
            ->post('/accounting', $payload);

        $response->assertSessionHasErrors('lines.0.account_id');
    }

    // -------------------------------------------------------------------------
    // UPDATE
    // -------------------------------------------------------------------------

    public function test_super_admin_peut_modifier_une_ecriture(): void
    {
        $this->actingAs($this->superAdmin)
            ->post('/accounting', $this->validEntryPayload());

        $entry = JournalEntry::where('label', 'Facture client BTP 001')->first();

        $response = $this->actingAs($this->superAdmin)
            ->put("/accounting/{$entry->id}", $this->validEntryPayload([
                'label' => 'Facture client BTP 001 — corrigée',
            ]));

        $response->assertRedirect(route('accounting.index', absolute: false));
        $response->assertSessionHasNoErrors();

        $this->assertDatabaseHas('journal_entries', [
            'id'    => $entry->id,
            'label' => 'Facture client BTP 001 — corrigée',
        ]);
    }

    public function test_modification_ecriture_echoue_si_desequilibree(): void
    {
        $this->actingAs($this->superAdmin)
            ->post('/accounting', $this->validEntryPayload());

        $entry = JournalEntry::where('label', 'Facture client BTP 001')->first();

        $payload = $this->validEntryPayload([
            'lines' => [
                ['account_id' => $this->accountDebit->id, 'label' => null, 'debit' => 300000, 'credit' => 0],
                ['account_id' => $this->accountCredit->id, 'label' => null, 'debit' => 0, 'credit' => 200000],
            ],
        ]);

        $response = $this->actingAs($this->superAdmin)
            ->put("/accounting/{$entry->id}", $payload);

        $response->assertSessionHasErrors('lines');
    }

    // -------------------------------------------------------------------------
    // DESTROY
    // -------------------------------------------------------------------------

    public function test_super_admin_peut_supprimer_une_ecriture(): void
    {
        $this->actingAs($this->superAdmin)
            ->post('/accounting', $this->validEntryPayload());

        $entry = JournalEntry::where('label', 'Facture client BTP 001')->first();

        $response = $this->actingAs($this->superAdmin)
            ->delete("/accounting/{$entry->id}");

        $response->assertRedirect(route('accounting.index', absolute: false));
        $this->assertDatabaseMissing('journal_entries', ['id' => $entry->id]);
    }

    public function test_suppression_ecriture_supprime_aussi_les_lignes(): void
    {
        $this->actingAs($this->superAdmin)
            ->post('/accounting', $this->validEntryPayload());

        $entry = JournalEntry::where('label', 'Facture client BTP 001')->first();
        $lineIds = $entry->lines->pluck('id');

        $this->actingAs($this->superAdmin)
            ->delete("/accounting/{$entry->id}");

        foreach ($lineIds as $lineId) {
            $this->assertDatabaseMissing('journal_lines', ['id' => $lineId]);
        }
    }

    // -------------------------------------------------------------------------
    // Isolation multi-tenant
    // -------------------------------------------------------------------------

    public function test_utilisateur_autre_company_ne_peut_pas_modifier_une_ecriture(): void
    {
        // Écriture appartenant à la company A
        $entry = $this->createEntry();

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

        // Comptes propres à company B pour construire un payload valide
        $accountB1 = Account::create([
            'company_id' => $companyB->id,
            'code'       => '411000',
            'label'      => 'Clients B',
            'type'       => 'actif',
        ]);

        $accountB2 = Account::create([
            'company_id' => $companyB->id,
            'code'       => '701000',
            'label'      => 'Ventes B',
            'type'       => 'produit',
        ]);

        // Le CompanyScope filtre l'écriture de company A → 404 avant même le controller
        $response = $this->actingAs($userB)
            ->put("/accounting/{$entry->id}", [
                'date'  => '2026-06-01',
                'label' => 'Tentative de modification',
                'lines' => [
                    ['account_id' => $accountB1->id, 'label' => null, 'debit' => 100000, 'credit' => 0],
                    ['account_id' => $accountB2->id, 'label' => null, 'debit' => 0, 'credit' => 100000],
                ],
            ]);

        $response->assertStatus(404);
    }

    public function test_utilisateur_autre_company_ne_peut_pas_supprimer_une_ecriture(): void
    {
        $entry = $this->createEntry();

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
            ->delete("/accounting/{$entry->id}");

        $response->assertStatus(404);
    }

    public function test_scope_for_user_ne_renvoie_que_les_ecritures_de_la_meme_company(): void
    {
        // Écriture de la company A
        $this->createEntry(['label' => 'Écriture A']);

        $companyB = Company::create([
            'name'          => 'Autre BTP SARL',
            'slug'          => 'autre-btp',
            'country'       => 'CI',
            'base_currency' => 'XOF',
            'locale'        => 'fr',
            'timezone'      => 'Africa/Abidjan',
            'is_active'     => true,
        ]);

        // Écriture de la company B
        JournalEntry::create([
            'company_id' => $companyB->id,
            'date'       => '2026-06-01',
            'label'      => 'Écriture B',
        ]);

        $entriesA = JournalEntry::forUser($this->superAdmin)->get();

        $this->assertCount(1, $entriesA);
        $this->assertEquals('Écriture A', $entriesA->first()->label);
    }
}
