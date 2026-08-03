<?php

namespace Tests\Feature;

use App\Models\Company;
use App\Models\PurchaseOrder;
use App\Models\Supplier;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

/**
 * Tests du module Achats (bons de commande) :
 * - Création d'un bon de commande avec lignes
 * - Calcul automatique des totaux (sous-total HT, TVA, TTC)
 * - Confirmation (draft|sent → confirmed)
 * - Réception (confirmed → received)
 * - Validation des champs requis
 * - Isolation multi-tenant (CompanyScope global)
 */
class PurchaseTest extends TestCase
{
    use RefreshDatabase;

    private Company      $company;
    private User         $superAdmin;
    private Supplier     $supplier;

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
            Permission::findOrCreate("purchases.{$action}", 'web');
        }

        $role = Role::findOrCreate('super_admin', 'web');
        $role->syncPermissions(Permission::all());

        $this->superAdmin = User::factory()->create([
            'company_id' => $this->company->id,
        ]);
        $this->superAdmin->assignRole('super_admin');

        // Fournisseur de référence pour les bons de commande.
        // Créé directement (pas via HTTP) avant tout actingAs.
        $this->supplier = Supplier::create([
            'company_id' => $this->company->id,
            'code'       => 'SUP-TEST-001',
            'name'       => 'Fournisseur Test SARL',
            'category'   => 'materiaux',
            'is_active'  => true,
        ]);
    }

    // -------------------------------------------------------------------------
    // Helpers
    // -------------------------------------------------------------------------

    private function validPurchasePayload(array $overrides = []): array
    {
        return array_merge([
            'code'        => 'BC-TEST-001',
            'supplier_id' => $this->supplier->id,
            'status'      => 'draft',
            'currency'    => 'XOF',
            'tax_rate'    => 18,
            'order_date'  => '2026-08-01',
            'lines'       => [
                [
                    'designation' => 'Ciment CPA 42.5',
                    'unit'        => 'sac',
                    'quantity'    => 100,
                    'unit_price'  => 5500,
                ],
                [
                    'designation' => 'Sable de rivière',
                    'unit'        => 'm3',
                    'quantity'    => 20,
                    'unit_price'  => 15000,
                ],
            ],
        ], $overrides);
    }

    /** Crée un bon de commande directement en base (sans HTTP). */
    private function makeOrder(array $overrides = []): PurchaseOrder
    {
        return PurchaseOrder::create(array_merge([
            'company_id'  => $this->company->id,
            'supplier_id' => $this->supplier->id,
            'code'        => 'BC-DIRECT-001',
            'status'      => 'draft',
            'currency'    => 'XOF',
            'tax_rate'    => 18,
        ], $overrides));
    }

    // -------------------------------------------------------------------------
    // INDEX
    // -------------------------------------------------------------------------

    public function test_super_admin_peut_voir_la_liste_des_bons_de_commande(): void
    {
        $response = $this->actingAs($this->superAdmin)->get('/purchases');

        $response->assertOk();
    }

    // -------------------------------------------------------------------------
    // CREATE FORM
    // -------------------------------------------------------------------------

    public function test_super_admin_peut_acceder_au_formulaire_de_creation(): void
    {
        $response = $this->actingAs($this->superAdmin)->get('/purchases/create');

        $response->assertOk();
    }

    // -------------------------------------------------------------------------
    // STORE — succès
    // -------------------------------------------------------------------------

    public function test_super_admin_peut_creer_un_bon_de_commande_avec_lignes(): void
    {
        $response = $this->actingAs($this->superAdmin)
            ->post('/purchases', $this->validPurchasePayload());

        $response->assertRedirect();
        $response->assertSessionHasNoErrors();

        $this->assertDatabaseHas('purchase_orders', [
            'company_id' => $this->company->id,
            'code'       => 'BC-TEST-001',
            'status'     => 'draft',
        ]);

        $order = PurchaseOrder::where('code', 'BC-TEST-001')->first();
        $this->assertNotNull($order);
        $this->assertCount(2, $order->lines);
    }

    // -------------------------------------------------------------------------
    // Calcul des totaux
    // -------------------------------------------------------------------------

    public function test_totaux_bon_de_commande_calcules_correctement(): void
    {
        /*
         * Ligne 1 : 100 × 5 500 = 550 000 XOF
         * Ligne 2 :  20 × 15 000 = 300 000 XOF
         * Sous-total HT  = 850 000 XOF
         * TVA 18 %       = 153 000 XOF
         * Total TTC      = 1 003 000 XOF
         */
        $this->actingAs($this->superAdmin)
            ->post('/purchases', $this->validPurchasePayload());

        $order = PurchaseOrder::where('code', 'BC-TEST-001')->first();

        $this->assertEquals(850000.0,  (float) $order->subtotal);
        $this->assertEquals(153000.0,  (float) $order->tax_amount);
        $this->assertEquals(1003000.0, (float) $order->total);
    }

    public function test_total_ligne_est_quantite_fois_prix_unitaire(): void
    {
        $this->actingAs($this->superAdmin)
            ->post('/purchases', $this->validPurchasePayload());

        $order = PurchaseOrder::where('code', 'BC-TEST-001')->first();
        $line  = $order->lines()->where('designation', 'Ciment CPA 42.5')->first();

        $this->assertEquals(550000.0, (float) $line->line_total);
    }

    // -------------------------------------------------------------------------
    // SHOW
    // -------------------------------------------------------------------------

    public function test_super_admin_peut_voir_le_detail_dun_bon_de_commande(): void
    {
        $order = $this->makeOrder();

        $response = $this->actingAs($this->superAdmin)
            ->get("/purchases/{$order->id}");

        $response->assertOk();
    }

    // -------------------------------------------------------------------------
    // CONFIRM
    // -------------------------------------------------------------------------

    public function test_super_admin_peut_confirmer_un_bon_de_commande_brouillon(): void
    {
        $order = $this->makeOrder(['code' => 'BC-CONF-DRAFT', 'status' => 'draft']);

        $response = $this->actingAs($this->superAdmin)
            ->post("/purchases/{$order->id}/confirm");

        $response->assertRedirect();
        $response->assertSessionHasNoErrors();

        $this->assertDatabaseHas('purchase_orders', [
            'id'     => $order->id,
            'status' => 'confirmed',
        ]);
    }

    public function test_super_admin_peut_confirmer_un_bon_de_commande_envoye(): void
    {
        $order = $this->makeOrder(['code' => 'BC-CONF-SENT', 'status' => 'sent']);

        $response = $this->actingAs($this->superAdmin)
            ->post("/purchases/{$order->id}/confirm");

        $response->assertRedirect();
        $response->assertSessionHasNoErrors();

        $this->assertDatabaseHas('purchase_orders', [
            'id'     => $order->id,
            'status' => 'confirmed',
        ]);
    }

    public function test_confirmation_echoue_si_bon_de_commande_deja_recu(): void
    {
        $order = $this->makeOrder(['code' => 'BC-CONF-ERR', 'status' => 'received']);

        $response = $this->actingAs($this->superAdmin)
            ->post("/purchases/{$order->id}/confirm");

        $response->assertStatus(422);

        $this->assertDatabaseHas('purchase_orders', [
            'id'     => $order->id,
            'status' => 'received', // statut inchangé
        ]);
    }

    public function test_confirmation_echoue_si_bon_de_commande_annule(): void
    {
        $order = $this->makeOrder(['code' => 'BC-CONF-CANC', 'status' => 'cancelled']);

        $response = $this->actingAs($this->superAdmin)
            ->post("/purchases/{$order->id}/confirm");

        $response->assertStatus(422);
    }

    // -------------------------------------------------------------------------
    // MARK RECEIVED
    // -------------------------------------------------------------------------

    public function test_super_admin_peut_marquer_un_bon_de_commande_comme_recu(): void
    {
        $order = $this->makeOrder(['code' => 'BC-RCV-001', 'status' => 'confirmed']);

        $response = $this->actingAs($this->superAdmin)
            ->post("/purchases/{$order->id}/mark-received");

        $response->assertRedirect();
        $response->assertSessionHasNoErrors();

        $this->assertDatabaseHas('purchase_orders', [
            'id'     => $order->id,
            'status' => 'received',
        ]);
    }

    public function test_reception_echoue_si_bon_de_commande_non_confirme(): void
    {
        $order = $this->makeOrder(['code' => 'BC-RCV-ERR', 'status' => 'draft']);

        $response = $this->actingAs($this->superAdmin)
            ->post("/purchases/{$order->id}/mark-received");

        $response->assertStatus(422);

        $this->assertDatabaseHas('purchase_orders', [
            'id'     => $order->id,
            'status' => 'draft', // statut inchangé
        ]);
    }

    public function test_reception_echoue_si_bon_de_commande_deja_recu(): void
    {
        $order = $this->makeOrder(['code' => 'BC-RCV-DEJA', 'status' => 'received']);

        $response = $this->actingAs($this->superAdmin)
            ->post("/purchases/{$order->id}/mark-received");

        $response->assertStatus(422);
    }

    // -------------------------------------------------------------------------
    // UPDATE
    // -------------------------------------------------------------------------

    public function test_super_admin_peut_modifier_un_bon_de_commande(): void
    {
        $order = $this->makeOrder(['code' => 'BC-UPD-001', 'status' => 'draft']);

        $payload = $this->validPurchasePayload([
            'code'   => 'BC-UPD-001',
            'status' => 'sent',
        ]);

        $response = $this->actingAs($this->superAdmin)
            ->put("/purchases/{$order->id}", $payload);

        $response->assertRedirect();
        $response->assertSessionHasNoErrors();

        $this->assertDatabaseHas('purchase_orders', [
            'id'     => $order->id,
            'status' => 'sent',
        ]);
    }

    // -------------------------------------------------------------------------
    // DESTROY
    // -------------------------------------------------------------------------

    public function test_super_admin_peut_supprimer_un_bon_de_commande(): void
    {
        $order = $this->makeOrder(['code' => 'BC-DEL-001']);

        $response = $this->actingAs($this->superAdmin)
            ->delete("/purchases/{$order->id}");

        $response->assertRedirect(route('purchases.index', absolute: false));
        $this->assertSoftDeleted('purchase_orders', ['id' => $order->id]);
    }

    // -------------------------------------------------------------------------
    // VALIDATION — création
    // -------------------------------------------------------------------------

    public function test_creation_bc_echoue_sans_code(): void
    {
        $response = $this->actingAs($this->superAdmin)
            ->post('/purchases', $this->validPurchasePayload(['code' => '']));

        $response->assertSessionHasErrors('code');
        $this->assertDatabaseCount('purchase_orders', 0);
    }

    public function test_creation_bc_echoue_sans_fournisseur(): void
    {
        $response = $this->actingAs($this->superAdmin)
            ->post('/purchases', $this->validPurchasePayload(['supplier_id' => '']));

        $response->assertSessionHasErrors('supplier_id');
    }

    public function test_creation_bc_echoue_sans_devise(): void
    {
        $response = $this->actingAs($this->superAdmin)
            ->post('/purchases', $this->validPurchasePayload(['currency' => '']));

        $response->assertSessionHasErrors('currency');
    }

    public function test_creation_bc_echoue_sans_lignes(): void
    {
        $response = $this->actingAs($this->superAdmin)
            ->post('/purchases', $this->validPurchasePayload(['lines' => []]));

        $response->assertSessionHasErrors('lines');
        $this->assertDatabaseCount('purchase_orders', 0);
    }

    public function test_creation_bc_echoue_avec_designation_manquante(): void
    {
        $payload = $this->validPurchasePayload([
            'lines' => [
                ['designation' => '', 'unit' => 'sac', 'quantity' => 10, 'unit_price' => 5000],
            ],
        ]);

        $response = $this->actingAs($this->superAdmin)->post('/purchases', $payload);

        $response->assertSessionHasErrors('lines.0.designation');
    }

    public function test_creation_bc_echoue_avec_code_duplique(): void
    {
        // Premier bon de commande
        $this->actingAs($this->superAdmin)
            ->post('/purchases', $this->validPurchasePayload());

        // Second bon de commande avec le même code
        $response = $this->actingAs($this->superAdmin)
            ->post('/purchases', $this->validPurchasePayload());

        $response->assertSessionHasErrors('code');
        $this->assertDatabaseCount('purchase_orders', 1);
    }

    public function test_creation_bc_echoue_avec_statut_invalide(): void
    {
        $response = $this->actingAs($this->superAdmin)
            ->post('/purchases', $this->validPurchasePayload(['status' => 'inexistant']));

        $response->assertSessionHasErrors('status');
    }

    // -------------------------------------------------------------------------
    // Isolation multi-tenant
    // -------------------------------------------------------------------------

    public function test_utilisateur_autre_company_ne_peut_pas_voir_un_bon_de_commande(): void
    {
        // Bon de commande appartenant à l'entreprise A
        $orderA = $this->makeOrder(['code' => 'BC-A-001']);

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

        // Le CompanyScope filtre par company_id de l'utilisateur connecté
        // → le bon de commande A est invisible pour userB → 404
        $response = $this->actingAs($userB)
            ->get("/purchases/{$orderA->id}");

        $response->assertStatus(404);
    }

    public function test_utilisateur_autre_company_ne_peut_pas_confirmer_un_bon_de_commande_tiers(): void
    {
        $orderA = $this->makeOrder(['code' => 'BC-A-CONF', 'status' => 'draft']);

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
            ->post("/purchases/{$orderA->id}/confirm");

        $response->assertStatus(404);

        // Le statut n'a pas changé
        $this->assertDatabaseHas('purchase_orders', [
            'id'     => $orderA->id,
            'status' => 'draft',
        ]);
    }

    public function test_scope_for_user_ne_renvoie_que_les_bons_de_commande_de_la_meme_company(): void
    {
        // Bon de commande de l'entreprise A
        PurchaseOrder::create([
            'company_id'  => $this->company->id,
            'supplier_id' => $this->supplier->id,
            'code'        => 'BC-A-001',
            'status'      => 'draft',
            'currency'    => 'XOF',
            'tax_rate'    => 18,
        ]);

        // Bon de commande d'une entreprise B
        $companyB = Company::create([
            'name'          => 'Autre BTP SARL',
            'slug'          => 'autre-btp',
            'country'       => 'CI',
            'base_currency' => 'XOF',
            'locale'        => 'fr',
            'timezone'      => 'Africa/Abidjan',
            'is_active'     => true,
        ]);

        $supplierB = Supplier::create([
            'company_id' => $companyB->id,
            'code'       => 'SUP-B-001',
            'name'       => 'Fournisseur Société B',
            'category'   => 'services',
            'is_active'  => true,
        ]);

        PurchaseOrder::create([
            'company_id'  => $companyB->id,
            'supplier_id' => $supplierB->id,
            'code'        => 'BC-B-001',
            'status'      => 'draft',
            'currency'    => 'XOF',
            'tax_rate'    => 18,
        ]);

        $ordersA = PurchaseOrder::forUser($this->superAdmin)->get();

        $this->assertCount(1, $ordersA);
        $this->assertEquals('BC-A-001', $ordersA->first()->code);
    }
}
