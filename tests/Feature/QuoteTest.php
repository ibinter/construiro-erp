<?php

namespace Tests\Feature;

use App\Models\Client;
use App\Models\Company;
use App\Models\Quote;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

/**
 * Tests CRUD du module Devis (Bureau d'études) :
 * - Création valide avec lignes + calcul automatique des totaux (HT, TVA, TTC)
 * - Validation (champs requis, lignes obligatoires, code dupliqué, status invalide)
 * - Lecture (liste et détail)
 * - Modification + remplacement des lignes
 * - Suppression (soft-delete)
 * - Isolation multi-tenant : un utilisateur d'une autre company est bloqué (404)
 */
class QuoteTest extends TestCase
{
    use RefreshDatabase;

    private Company $company;
    private User    $superAdmin;

    protected function setUp(): void
    {
        parent::setUp();

        // Entreprise de test
        $this->company = Company::create([
            'name'          => 'BTP Test SA',
            'slug'          => 'btp-test',
            'country'       => 'CI',
            'base_currency' => 'XOF',
            'locale'        => 'fr',
            'timezone'      => 'Africa/Abidjan',
            'is_active'     => true,
        ]);

        // Permissions du module devis
        foreach (['view', 'create', 'update', 'delete', 'export'] as $action) {
            Permission::findOrCreate("quotes.{$action}", 'web');
            Permission::findOrCreate("clients.{$action}", 'web');
            Permission::findOrCreate("projects.{$action}", 'web');
            Permission::findOrCreate("dashboard.{$action}", 'web');
        }

        // Rôles
        $superAdminRole = Role::findOrCreate('super_admin', 'web');
        Role::findOrCreate('admin', 'web');

        $superAdminRole->syncPermissions(Permission::all());

        // Utilisateur super_admin
        $this->superAdmin = User::factory()->create([
            'company_id' => $this->company->id,
        ]);
        $this->superAdmin->assignRole('super_admin');
    }

    // -------------------------------------------------------------------------
    // Helpers
    // -------------------------------------------------------------------------

    /** Payload valide pour POST /quotes. */
    private function validQuoteData(array $overrides = []): array
    {
        return array_merge([
            'code'        => 'DEV-TEST-001',
            'title'       => 'Devis Fondations Immeuble R+5',
            'client_name' => 'Client Test SA',
            'status'      => 'draft',
            'currency'    => 'XOF',
            'tax_rate'    => 18,
            'date'        => '2026-05-01',
            'valid_until' => '2026-06-01',
            'lines'       => [
                [
                    'designation' => 'Terrassement général',
                    'unit'        => 'm3',
                    'quantity'    => 100,
                    'unit_price'  => 15000,
                ],
                [
                    'designation' => 'Coffrage fondations',
                    'unit'        => 'm2',
                    'quantity'    => 200,
                    'unit_price'  => 8500,
                ],
            ],
        ], $overrides);
    }

    /** Crée et retourne un devis appartenant à la company de test. */
    private function createQuote(array $overrides = []): Quote
    {
        return Quote::create(array_merge([
            'company_id'  => $this->company->id,
            'code'        => 'DEV-DB-001',
            'title'       => 'Devis Direct DB',
            'client_name' => 'Client Direct SA',
            'status'      => 'draft',
            'currency'    => 'XOF',
            'tax_rate'    => 18,
        ], $overrides));
    }

    // -------------------------------------------------------------------------
    // CREATE — succès
    // -------------------------------------------------------------------------

    public function test_super_admin_peut_creer_un_devis_avec_lignes(): void
    {
        $response = $this->actingAs($this->superAdmin)
            ->post('/quotes', $this->validQuoteData());

        $response->assertRedirect();
        $response->assertSessionHasNoErrors();

        $this->assertDatabaseHas('quotes', [
            'company_id' => $this->company->id,
            'code'       => 'DEV-TEST-001',
            'title'      => 'Devis Fondations Immeuble R+5',
            'status'     => 'draft',
        ]);

        $quote = Quote::withoutGlobalScopes()->where('code', 'DEV-TEST-001')->first();
        $this->assertNotNull($quote);
        $this->assertCount(2, $quote->lines);
    }

    // -------------------------------------------------------------------------
    // Calcul automatique des totaux
    // -------------------------------------------------------------------------

    public function test_totaux_sont_calcules_correctement_apres_creation(): void
    {
        /*
         * Ligne 1 : 100 × 15 000 = 1 500 000 XOF
         * Ligne 2 : 200 ×  8 500 = 1 700 000 XOF
         * Sous-total HT  = 3 200 000 XOF
         * TVA 18 %       =   576 000 XOF
         * Total TTC      = 3 776 000 XOF
         */
        $this->actingAs($this->superAdmin)
            ->post('/quotes', $this->validQuoteData());

        $quote = Quote::withoutGlobalScopes()
            ->where('code', 'DEV-TEST-001')
            ->with('lines')
            ->first();

        $this->assertNotNull($quote);
        $this->assertEquals(3200000.00, (float) $quote->subtotal);
        $this->assertEquals(576000.00, (float) $quote->tax_amount);
        $this->assertEquals(3776000.00, (float) $quote->total);
    }

    public function test_line_total_est_quantite_fois_prix_unitaire(): void
    {
        $this->actingAs($this->superAdmin)
            ->post('/quotes', $this->validQuoteData());

        $quote = Quote::withoutGlobalScopes()->where('code', 'DEV-TEST-001')->first();
        $line  = $quote->lines()->where('designation', 'Terrassement général')->first();

        $this->assertEquals(1500000.00, (float) $line->line_total);
    }

    // -------------------------------------------------------------------------
    // CREATE — validation
    // -------------------------------------------------------------------------

    public function test_creation_devis_echoue_sans_code(): void
    {
        $response = $this->actingAs($this->superAdmin)
            ->post('/quotes', $this->validQuoteData(['code' => '']));

        $response->assertSessionHasErrors('code');
        $this->assertDatabaseCount('quotes', 0);
    }

    public function test_creation_devis_echoue_sans_title(): void
    {
        $response = $this->actingAs($this->superAdmin)
            ->post('/quotes', $this->validQuoteData(['title' => '']));

        $response->assertSessionHasErrors('title');
        $this->assertDatabaseCount('quotes', 0);
    }

    public function test_creation_devis_echoue_sans_status(): void
    {
        $response = $this->actingAs($this->superAdmin)
            ->post('/quotes', $this->validQuoteData(['status' => '']));

        $response->assertSessionHasErrors('status');
        $this->assertDatabaseCount('quotes', 0);
    }

    public function test_creation_devis_echoue_avec_status_invalide(): void
    {
        $response = $this->actingAs($this->superAdmin)
            ->post('/quotes', $this->validQuoteData(['status' => 'status_inexistant']));

        $response->assertSessionHasErrors('status');
        $this->assertDatabaseCount('quotes', 0);
    }

    public function test_creation_devis_echoue_sans_currency(): void
    {
        $response = $this->actingAs($this->superAdmin)
            ->post('/quotes', $this->validQuoteData(['currency' => '']));

        $response->assertSessionHasErrors('currency');
        $this->assertDatabaseCount('quotes', 0);
    }

    public function test_creation_devis_echoue_sans_lignes(): void
    {
        $response = $this->actingAs($this->superAdmin)
            ->post('/quotes', $this->validQuoteData(['lines' => []]));

        $response->assertSessionHasErrors('lines');
        $this->assertDatabaseCount('quotes', 0);
    }

    public function test_creation_devis_echoue_avec_designation_manquante_dans_ligne(): void
    {
        $payload = $this->validQuoteData([
            'lines' => [
                ['designation' => '', 'unit' => 'm3', 'quantity' => 10, 'unit_price' => 5000],
            ],
        ]);

        $response = $this->actingAs($this->superAdmin)
            ->post('/quotes', $payload);

        $response->assertSessionHasErrors('lines.0.designation');
    }

    public function test_creation_devis_echoue_avec_code_duplique(): void
    {
        // Premier devis
        $this->actingAs($this->superAdmin)
            ->post('/quotes', $this->validQuoteData());

        // Deuxième devis avec le même code dans la même company
        $response = $this->actingAs($this->superAdmin)
            ->post('/quotes', $this->validQuoteData(['title' => 'Autre Titre Devis']));

        $response->assertSessionHasErrors('code');
        $this->assertDatabaseCount('quotes', 1);
    }

    public function test_creation_devis_echoue_avec_valid_until_avant_date(): void
    {
        $response = $this->actingAs($this->superAdmin)
            ->post('/quotes', $this->validQuoteData([
                'date'        => '2026-05-15',
                'valid_until' => '2026-05-01', // antérieur à date
            ]));

        $response->assertSessionHasErrors('valid_until');
    }

    // -------------------------------------------------------------------------
    // READ
    // -------------------------------------------------------------------------

    public function test_super_admin_peut_voir_la_liste_de_ses_devis(): void
    {
        $this->createQuote();

        $response = $this->actingAs($this->superAdmin)->get('/quotes');

        $response->assertOk();
    }

    public function test_super_admin_peut_voir_le_detail_dun_devis(): void
    {
        $quote = $this->createQuote();

        $response = $this->actingAs($this->superAdmin)->get("/quotes/{$quote->id}");

        $response->assertOk();
    }

    // -------------------------------------------------------------------------
    // UPDATE
    // -------------------------------------------------------------------------

    public function test_super_admin_peut_modifier_un_devis(): void
    {
        $quote = $this->createQuote(['code' => 'DEV-UPD-001']);

        $response = $this->actingAs($this->superAdmin)
            ->put("/quotes/{$quote->id}", $this->validQuoteData([
                'code'   => 'DEV-UPD-001',
                'title'  => 'Devis Modifié Gros Œuvre',
                'status' => 'sent',
            ]));

        $response->assertRedirect();
        $response->assertSessionHasNoErrors();

        $this->assertDatabaseHas('quotes', [
            'id'     => $quote->id,
            'title'  => 'Devis Modifié Gros Œuvre',
            'status' => 'sent',
        ]);
    }

    public function test_modification_devis_recalcule_les_totaux(): void
    {
        $quote = $this->createQuote(['code' => 'DEV-CALC-001', 'tax_rate' => 18]);

        // Mise à jour avec une seule ligne : 50 × 10 000 = 500 000 HT
        // TVA 18 % = 90 000 → TTC = 590 000
        $this->actingAs($this->superAdmin)
            ->put("/quotes/{$quote->id}", $this->validQuoteData([
                'code'     => 'DEV-CALC-001',
                'tax_rate' => 18,
                'lines'    => [
                    ['designation' => 'Béton armé', 'unit' => 'm3', 'quantity' => 50, 'unit_price' => 10000],
                ],
            ]));

        $quote->refresh();
        $this->assertEquals(500000.00, (float) $quote->subtotal);
        $this->assertEquals(90000.00, (float) $quote->tax_amount);
        $this->assertEquals(590000.00, (float) $quote->total);
    }

    public function test_modification_devis_accepte_meme_code_pour_le_meme_devis(): void
    {
        $quote = $this->createQuote(['code' => 'DEV-UNI-001']);

        $response = $this->actingAs($this->superAdmin)
            ->put("/quotes/{$quote->id}", $this->validQuoteData([
                'code'  => 'DEV-UNI-001',
                'title' => 'Titre Modifié',
            ]));

        $response->assertRedirect();
        $response->assertSessionHasNoErrors();
    }

    // -------------------------------------------------------------------------
    // DELETE
    // -------------------------------------------------------------------------

    public function test_super_admin_peut_supprimer_un_devis(): void
    {
        $quote = $this->createQuote();

        $response = $this->actingAs($this->superAdmin)
            ->delete("/quotes/{$quote->id}");

        $response->assertRedirect(route('quotes.index', absolute: false));
        $this->assertSoftDeleted('quotes', ['id' => $quote->id]);
    }

    // -------------------------------------------------------------------------
    // Isolation multi-tenant
    // -------------------------------------------------------------------------

    public function test_utilisateur_autre_company_ne_peut_pas_voir_un_devis(): void
    {
        $quoteA = $this->createQuote(['code' => 'DEV-A-001']);

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

        // Le global scope company_id filtre le devis → 404
        $response = $this->actingAs($userB)->get("/quotes/{$quoteA->id}");

        $response->assertStatus(404);
    }

    public function test_utilisateur_autre_company_ne_peut_pas_modifier_un_devis(): void
    {
        $quoteA = $this->createQuote(['code' => 'DEV-A-001']);

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
            ->put("/quotes/{$quoteA->id}", $this->validQuoteData(['code' => 'DEV-A-001']));

        $response->assertStatus(404);
    }

    public function test_utilisateur_autre_company_ne_peut_pas_supprimer_un_devis(): void
    {
        $quoteA = $this->createQuote(['code' => 'DEV-A-001']);

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

        $response = $this->actingAs($userB)->delete("/quotes/{$quoteA->id}");

        $response->assertStatus(404);
        // Le devis ne doit pas avoir été supprimé
        $this->assertDatabaseHas('quotes', ['id' => $quoteA->id, 'deleted_at' => null]);
    }

    public function test_scope_for_user_ne_renvoie_que_les_devis_de_la_meme_company(): void
    {
        $this->createQuote(['code' => 'DEV-A-001']);

        $companyB = Company::create([
            'name'          => 'Autre BTP SARL',
            'slug'          => 'autre-btp',
            'country'       => 'CI',
            'base_currency' => 'XOF',
            'locale'        => 'fr',
            'timezone'      => 'Africa/Abidjan',
            'is_active'     => true,
        ]);

        Quote::create([
            'company_id'  => $companyB->id,
            'code'        => 'DEV-B-001',
            'title'       => 'Devis Company B',
            'client_name' => 'Client B',
            'status'      => 'draft',
            'currency'    => 'XOF',
            'tax_rate'    => 18,
        ]);

        $quotesA = Quote::forUser($this->superAdmin)->get();

        $this->assertCount(1, $quotesA);
        $this->assertEquals('DEV-A-001', $quotesA->first()->code);
    }

    // -------------------------------------------------------------------------
    // Client rattaché au devis
    // -------------------------------------------------------------------------

    public function test_creation_devis_avec_client_rattache(): void
    {
        $client = Client::create([
            'company_id' => $this->company->id,
            'code'       => 'CLI-001',
            'type'       => 'entreprise',
            'name'       => 'Client Rattaché SARL',
            'is_active'  => true,
        ]);

        $response = $this->actingAs($this->superAdmin)
            ->post('/quotes', $this->validQuoteData(['client_id' => $client->id]));

        $response->assertRedirect();
        $response->assertSessionHasNoErrors();

        $quote = Quote::withoutGlobalScopes()->where('code', 'DEV-TEST-001')->first();
        $this->assertEquals($client->id, $quote->client_id);
    }

    public function test_creation_devis_echoue_avec_client_id_dune_autre_company(): void
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

        $clientB = Client::create([
            'company_id' => $companyB->id,
            'code'       => 'CLI-B-001',
            'type'       => 'entreprise',
            'name'       => 'Client Company B',
            'is_active'  => true,
        ]);

        // Tenter de rattacher un client appartenant à une autre company
        $response = $this->actingAs($this->superAdmin)
            ->post('/quotes', $this->validQuoteData(['client_id' => $clientB->id]));

        $response->assertSessionHasErrors('client_id');
    }
}
