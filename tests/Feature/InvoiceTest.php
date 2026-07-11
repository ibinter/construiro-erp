<?php

namespace Tests\Feature;

use App\Models\Client;
use App\Models\Company;
use App\Models\Invoice;
use App\Models\InvoiceLine;
use App\Models\Project;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

/**
 * Tests CRUD du module Facturation :
 * - Création d'une facture avec lignes
 * - Calcul automatique du total TTC
 * - Isolation multi-tenant (seul le propriétaire company peut accéder)
 */
class InvoiceTest extends TestCase
{
    use RefreshDatabase;

    private Company $company;
    private User    $superAdmin;

    protected function setUp(): void
    {
        parent::setUp();

        // Créer l'entreprise de test
        $this->company = Company::create([
            'name'          => 'BTP Test SA',
            'slug'          => 'btp-test',
            'country'       => 'CI',
            'base_currency' => 'XOF',
            'locale'        => 'fr',
            'timezone'      => 'Africa/Abidjan',
            'is_active'     => true,
        ]);

        // Créer les permissions du module facturation
        foreach (['view', 'create', 'update', 'delete', 'export'] as $action) {
            Permission::findOrCreate("invoicing.{$action}", 'web');
            Permission::findOrCreate("dashboard.{$action}", 'web');
            Permission::findOrCreate("projects.{$action}", 'web');
        }

        // Rôle super_admin avec toutes les permissions
        $role = Role::findOrCreate('super_admin', 'web');
        $role->syncPermissions(Permission::all());

        // Utilisateur super_admin
        $this->superAdmin = User::factory()->create([
            'company_id' => $this->company->id,
        ]);
        $this->superAdmin->assignRole('super_admin');
    }

    // -------------------------------------------------------------------------
    // Helpers
    // -------------------------------------------------------------------------

    /** Retourne un payload valide pour POST /invoices. */
    private function validInvoicePayload(array $overrides = []): array
    {
        return array_merge([
            'code'       => 'FAC-TEST-001',
            'status'     => 'draft',
            'currency'   => 'XOF',
            'tax_rate'   => 18,
            'issue_date' => '2026-05-01',
            'due_date'   => '2026-06-01',
            'lines'      => [
                [
                    'designation' => 'Béton dosé 350 kg/m3',
                    'unit'        => 'm3',
                    'quantity'    => 10,
                    'unit_price'  => 95000,
                ],
                [
                    'designation' => 'Coffrage voiles',
                    'unit'        => 'm2',
                    'quantity'    => 50,
                    'unit_price'  => 12000,
                ],
            ],
        ], $overrides);
    }

    // -------------------------------------------------------------------------
    // CREATE — succès
    // -------------------------------------------------------------------------

    public function test_super_admin_peut_creer_une_facture_avec_lignes(): void
    {
        $response = $this->actingAs($this->superAdmin)
            ->post('/invoices', $this->validInvoicePayload());

        $response->assertRedirect();
        $response->assertSessionHasNoErrors();

        $this->assertDatabaseHas('invoices', [
            'company_id' => $this->company->id,
            'code'       => 'FAC-TEST-001',
            'status'     => 'draft',
        ]);

        $invoice = Invoice::where('code', 'FAC-TEST-001')->first();
        $this->assertNotNull($invoice);
        $this->assertCount(2, $invoice->lines);
    }

    // -------------------------------------------------------------------------
    // Calcul du total TTC
    // -------------------------------------------------------------------------

    public function test_total_ttc_est_calcule_correctement(): void
    {
        /*
         * Ligne 1 : 10 × 95 000 = 950 000 XOF
         * Ligne 2 : 50 × 12 000 = 600 000 XOF
         * Sous-total HT  = 1 550 000 XOF
         * TVA 18 %       =   279 000 XOF
         * Total TTC      = 1 829 000 XOF
         */
        $this->actingAs($this->superAdmin)
            ->post('/invoices', $this->validInvoicePayload());

        $invoice = Invoice::where('code', 'FAC-TEST-001')
            ->with('lines')
            ->first();

        $this->assertNotNull($invoice);
        $this->assertEquals(1550000.00, (float) $invoice->subtotal);
        $this->assertEquals(279000.00, (float) $invoice->tax_amount);
        $this->assertEquals(1829000.00, (float) $invoice->total);
    }

    public function test_line_total_est_quantite_fois_prix_unitaire(): void
    {
        $this->actingAs($this->superAdmin)
            ->post('/invoices', $this->validInvoicePayload());

        $invoice = Invoice::where('code', 'FAC-TEST-001')->first();
        $line    = $invoice->lines()->where('designation', 'Béton dosé 350 kg/m3')->first();

        $this->assertEquals(950000.00, (float) $line->line_total);
    }

    public function test_balance_est_egal_a_total_moins_montant_paye(): void
    {
        $invoice = Invoice::create([
            'company_id'  => $this->company->id,
            'code'        => 'FAC-TEST-BAL',
            'status'      => 'partial',
            'currency'    => 'XOF',
            'tax_rate'    => 18,
            'subtotal'    => 1000000,
            'tax_amount'  => 180000,
            'total'       => 1180000,
            'amount_paid' => 500000,
        ]);

        $this->assertEquals(680000.00, $invoice->balance);
    }

    public function test_balance_ne_peut_pas_etre_negative(): void
    {
        $invoice = Invoice::create([
            'company_id'  => $this->company->id,
            'code'        => 'FAC-TEST-NEG',
            'status'      => 'paid',
            'currency'    => 'XOF',
            'tax_rate'    => 18,
            'subtotal'    => 1000000,
            'tax_amount'  => 180000,
            'total'       => 1180000,
            'amount_paid' => 1500000, // sur-payé
        ]);

        $this->assertEquals(0.0, $invoice->balance);
    }

    // -------------------------------------------------------------------------
    // CREATE — validation
    // -------------------------------------------------------------------------

    public function test_creation_facture_echoue_sans_code(): void
    {
        $response = $this->actingAs($this->superAdmin)
            ->post('/invoices', $this->validInvoicePayload(['code' => '']));

        $response->assertSessionHasErrors('code');
        $this->assertDatabaseCount('invoices', 0);
    }

    public function test_creation_facture_echoue_sans_lignes(): void
    {
        $response = $this->actingAs($this->superAdmin)
            ->post('/invoices', $this->validInvoicePayload(['lines' => []]));

        $response->assertSessionHasErrors('lines');
    }

    public function test_creation_facture_echoue_avec_designation_manquante(): void
    {
        $payload = $this->validInvoicePayload([
            'lines' => [
                ['designation' => '', 'unit' => 'm3', 'quantity' => 1, 'unit_price' => 1000],
            ],
        ]);

        $response = $this->actingAs($this->superAdmin)
            ->post('/invoices', $payload);

        $response->assertSessionHasErrors('lines.0.designation');
    }

    public function test_creation_facture_echoue_avec_code_duplique(): void
    {
        // Première facture
        $this->actingAs($this->superAdmin)
            ->post('/invoices', $this->validInvoicePayload());

        // Deuxième facture avec le même code
        $response = $this->actingAs($this->superAdmin)
            ->post('/invoices', $this->validInvoicePayload());

        $response->assertSessionHasErrors('code');
        $this->assertDatabaseCount('invoices', 1);
    }

    // -------------------------------------------------------------------------
    // READ
    // -------------------------------------------------------------------------

    public function test_super_admin_peut_voir_la_liste_de_ses_factures(): void
    {
        Invoice::create([
            'company_id' => $this->company->id,
            'code'       => 'FAC-LIST-001',
            'status'     => 'draft',
            'currency'   => 'XOF',
            'tax_rate'   => 18,
        ]);

        $response = $this->actingAs($this->superAdmin)->get('/invoices');

        $response->assertOk();
    }

    public function test_super_admin_peut_voir_le_detail_dune_facture(): void
    {
        $invoice = Invoice::create([
            'company_id' => $this->company->id,
            'code'       => 'FAC-SHOW-001',
            'status'     => 'draft',
            'currency'   => 'XOF',
            'tax_rate'   => 18,
        ]);

        $response = $this->actingAs($this->superAdmin)->get("/invoices/{$invoice->id}");

        $response->assertOk();
    }

    // -------------------------------------------------------------------------
    // UPDATE
    // -------------------------------------------------------------------------

    public function test_super_admin_peut_modifier_une_facture(): void
    {
        $invoice = Invoice::create([
            'company_id' => $this->company->id,
            'code'       => 'FAC-UPD-001',
            'status'     => 'draft',
            'currency'   => 'XOF',
            'tax_rate'   => 18,
        ]);

        $payload = $this->validInvoicePayload([
            'code'   => 'FAC-UPD-001',
            'status' => 'sent',
        ]);

        $response = $this->actingAs($this->superAdmin)
            ->put("/invoices/{$invoice->id}", $payload);

        $response->assertRedirect();
        $response->assertSessionHasNoErrors();

        $this->assertDatabaseHas('invoices', [
            'id'     => $invoice->id,
            'status' => 'sent',
        ]);
    }

    // -------------------------------------------------------------------------
    // DELETE
    // -------------------------------------------------------------------------

    public function test_super_admin_peut_supprimer_une_facture(): void
    {
        $invoice = Invoice::create([
            'company_id' => $this->company->id,
            'code'       => 'FAC-DEL-001',
            'status'     => 'draft',
            'currency'   => 'XOF',
            'tax_rate'   => 18,
        ]);

        $response = $this->actingAs($this->superAdmin)
            ->delete("/invoices/{$invoice->id}");

        $response->assertRedirect(route('invoices.index', absolute: false));
        $this->assertSoftDeleted('invoices', ['id' => $invoice->id]);
    }

    // -------------------------------------------------------------------------
    // Isolation multi-tenant
    // -------------------------------------------------------------------------

    public function test_utilisateur_autre_company_ne_peut_pas_acceder_a_une_facture(): void
    {
        // Facture appartenant à l'entreprise A
        $invoiceA = Invoice::create([
            'company_id' => $this->company->id,
            'code'       => 'FAC-A-001',
            'status'     => 'draft',
            'currency'   => 'XOF',
            'tax_rate'   => 18,
        ]);

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

        // L'utilisateur B tente d'accéder à la facture de l'entreprise A
        $response = $this->actingAs($userB)
            ->get("/invoices/{$invoiceA->id}");

        $response->assertStatus(403);
    }

    public function test_scope_for_user_ne_renvoie_que_les_factures_de_la_meme_company(): void
    {
        // Facture entreprise A
        Invoice::create([
            'company_id' => $this->company->id,
            'code'       => 'FAC-A-001',
            'status'     => 'draft',
            'currency'   => 'XOF',
            'tax_rate'   => 18,
        ]);

        // Entreprise B avec sa propre facture
        $companyB = Company::create([
            'name'          => 'Autre BTP SARL',
            'slug'          => 'autre-btp',
            'country'       => 'CI',
            'base_currency' => 'XOF',
            'locale'        => 'fr',
            'timezone'      => 'Africa/Abidjan',
            'is_active'     => true,
        ]);

        Invoice::create([
            'company_id' => $companyB->id,
            'code'       => 'FAC-B-001',
            'status'     => 'draft',
            'currency'   => 'XOF',
            'tax_rate'   => 18,
        ]);

        $invoicesA = Invoice::forUser($this->superAdmin)->get();

        $this->assertCount(1, $invoicesA);
        $this->assertEquals('FAC-A-001', $invoicesA->first()->code);
    }

    // -------------------------------------------------------------------------
    // Enregistrement d'un paiement
    // -------------------------------------------------------------------------

    public function test_enregistrement_paiement_met_a_jour_amount_paid_et_statut(): void
    {
        $invoice = Invoice::create([
            'company_id'  => $this->company->id,
            'code'        => 'FAC-PAY-001',
            'status'      => 'sent',
            'currency'    => 'XOF',
            'tax_rate'    => 18,
            'subtotal'    => 1000000,
            'tax_amount'  => 180000,
            'total'       => 1180000,
            'amount_paid' => 0,
        ]);

        $response = $this->actingAs($this->superAdmin)
            ->post("/invoices/{$invoice->id}/payment", ['amount' => 1180000]);

        $response->assertRedirect();
        $response->assertSessionHasNoErrors();

        $this->assertDatabaseHas('invoices', [
            'id'          => $invoice->id,
            'amount_paid' => 1180000,
            'status'      => 'paid',
        ]);
    }
}
