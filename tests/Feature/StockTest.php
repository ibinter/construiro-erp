<?php

namespace Tests\Feature;

use App\Models\Company;
use App\Models\Material;
use App\Models\StockMovement;
use App\Models\User;
use App\Models\Warehouse;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

/**
 * Tests du module Stock :
 * - Consultation des niveaux de stock (index)
 * - Consultation de la liste des mouvements (movements)
 * - Enregistrement d'un mouvement entrant / sortant (storeMovement)
 * - Calcul du stock courant (in − out + adjustment)
 * - Validation des champs requis
 * - Isolation multi-tenant (Rule::exists filtre par company_id)
 */
class StockTest extends TestCase
{
    use RefreshDatabase;

    private Company   $company;
    private User      $superAdmin;
    private Material  $material;
    private Warehouse $warehouse;

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

        foreach (['view', 'create'] as $action) {
            Permission::findOrCreate("stocks.{$action}", 'web');
        }

        $role = Role::findOrCreate('super_admin', 'web');
        $role->syncPermissions(Permission::all());

        Role::findOrCreate('admin', 'web');

        $this->superAdmin = User::factory()->create([
            'company_id' => $this->company->id,
        ]);
        $this->superAdmin->assignRole('super_admin');

        // Magasin de test
        $this->warehouse = Warehouse::create([
            'company_id' => $this->company->id,
            'code'       => 'DEP-001',
            'name'       => 'Dépôt Central',
            'is_active'  => true,
        ]);

        // Matériau de test
        $this->material = Material::create([
            'company_id' => $this->company->id,
            'code'       => 'MAT-001',
            'name'       => 'Ciment Portland',
            'category'   => 'gros_oeuvre',
            'unit'       => 'sac',
            'unit_price' => 8500,
            'min_stock'  => 10,
        ]);
    }

    // -------------------------------------------------------------------------
    // Helpers
    // -------------------------------------------------------------------------

    /** Payload valide pour POST /stocks/movements. */
    private function validMovementPayload(array $overrides = []): array
    {
        return array_merge([
            'warehouse_id' => $this->warehouse->id,
            'material_id'  => $this->material->id,
            'type'         => 'in',
            'quantity'     => 50,
            'unit_price'   => 8500,
            'reference'    => 'BON-2026-001',
            'notes'        => null,
            'moved_at'     => '2026-06-01',
        ], $overrides);
    }

    // -------------------------------------------------------------------------
    // INDEX — niveaux de stock
    // -------------------------------------------------------------------------

    public function test_super_admin_peut_voir_les_niveaux_de_stock(): void
    {
        $response = $this->actingAs($this->superAdmin)->get('/stocks');

        $response->assertOk();
    }

    // -------------------------------------------------------------------------
    // MOVEMENTS — liste des mouvements
    // -------------------------------------------------------------------------

    public function test_super_admin_peut_voir_la_liste_des_mouvements(): void
    {
        $response = $this->actingAs($this->superAdmin)->get('/stocks/movements');

        $response->assertOk();
    }

    // -------------------------------------------------------------------------
    // STORE MOVEMENT — succès
    // -------------------------------------------------------------------------

    public function test_super_admin_peut_enregistrer_un_mouvement_entrant(): void
    {
        $response = $this->actingAs($this->superAdmin)
            ->post('/stocks/movements', $this->validMovementPayload());

        $response->assertRedirect();
        $response->assertSessionHasNoErrors();

        $this->assertDatabaseHas('stock_movements', [
            'company_id'   => $this->company->id,
            'warehouse_id' => $this->warehouse->id,
            'material_id'  => $this->material->id,
            'type'         => 'in',
            'quantity'     => 50,
        ]);
    }

    public function test_super_admin_peut_enregistrer_un_mouvement_sortant(): void
    {
        // Stock initial
        $this->actingAs($this->superAdmin)
            ->post('/stocks/movements', $this->validMovementPayload(['quantity' => 100, 'type' => 'in']));

        $response = $this->actingAs($this->superAdmin)
            ->post('/stocks/movements', $this->validMovementPayload([
                'type'      => 'out',
                'quantity'  => 30,
                'reference' => 'BON-2026-002',
            ]));

        $response->assertRedirect();
        $response->assertSessionHasNoErrors();

        $this->assertDatabaseHas('stock_movements', [
            'type'     => 'out',
            'quantity' => 30,
        ]);
    }

    public function test_super_admin_peut_enregistrer_un_ajustement(): void
    {
        $response = $this->actingAs($this->superAdmin)
            ->post('/stocks/movements', $this->validMovementPayload([
                'type'      => 'adjustment',
                'quantity'  => 5,
                'reference' => 'INVT-2026',
            ]));

        $response->assertRedirect();
        $response->assertSessionHasNoErrors();

        $this->assertDatabaseHas('stock_movements', [
            'type'     => 'adjustment',
            'quantity' => 5,
        ]);
    }

    // -------------------------------------------------------------------------
    // STORE MOVEMENT — validation
    // -------------------------------------------------------------------------

    public function test_storeMovement_echoue_sans_warehouse(): void
    {
        $response = $this->actingAs($this->superAdmin)
            ->post('/stocks/movements', $this->validMovementPayload(['warehouse_id' => '']));

        $response->assertSessionHasErrors('warehouse_id');
        $this->assertDatabaseCount('stock_movements', 0);
    }

    public function test_storeMovement_echoue_sans_materiau(): void
    {
        $response = $this->actingAs($this->superAdmin)
            ->post('/stocks/movements', $this->validMovementPayload(['material_id' => '']));

        $response->assertSessionHasErrors('material_id');
        $this->assertDatabaseCount('stock_movements', 0);
    }

    public function test_storeMovement_echoue_avec_type_invalide(): void
    {
        $response = $this->actingAs($this->superAdmin)
            ->post('/stocks/movements', $this->validMovementPayload(['type' => 'invalide']));

        $response->assertSessionHasErrors('type');
    }

    public function test_storeMovement_echoue_sans_date(): void
    {
        $response = $this->actingAs($this->superAdmin)
            ->post('/stocks/movements', $this->validMovementPayload(['moved_at' => '']));

        $response->assertSessionHasErrors('moved_at');
    }

    // -------------------------------------------------------------------------
    // Calcul du stock courant
    // -------------------------------------------------------------------------

    public function test_stock_courant_est_calcule_correctement(): void
    {
        /*
         * 100 entrées - 30 sorties + 5 ajustements = 75 sacs
         */
        $this->actingAs($this->superAdmin)
            ->post('/stocks/movements', $this->validMovementPayload(['type' => 'in', 'quantity' => 100]));

        $this->actingAs($this->superAdmin)
            ->post('/stocks/movements', $this->validMovementPayload(['type' => 'out', 'quantity' => 30]));

        $this->actingAs($this->superAdmin)
            ->post('/stocks/movements', $this->validMovementPayload(['type' => 'adjustment', 'quantity' => 5]));

        $stock = $this->material->currentStock();

        $this->assertEquals(75.0, $stock);
    }

    public function test_stock_initial_est_zero(): void
    {
        $stock = $this->material->currentStock();

        $this->assertEquals(0.0, $stock);
    }

    // -------------------------------------------------------------------------
    // Isolation multi-tenant
    // -------------------------------------------------------------------------

    public function test_storeMovement_refuse_warehouse_dune_autre_company(): void
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

        $userB = User::factory()->create(['company_id' => $companyB->id]);
        $userB->assignRole('super_admin');

        // userB tente d'utiliser l'entrepôt et le matériau de la company A.
        // Rule::exists filtre par company_id → échec de validation.
        $response = $this->actingAs($userB)
            ->post('/stocks/movements', $this->validMovementPayload());

        $response->assertSessionHasErrors(['warehouse_id', 'material_id']);
        $this->assertDatabaseCount('stock_movements', 0);
    }

    public function test_scope_for_user_ne_renvoie_que_les_mouvements_de_la_meme_company(): void
    {
        // Mouvement de la company A
        StockMovement::create([
            'company_id'   => $this->company->id,
            'warehouse_id' => $this->warehouse->id,
            'material_id'  => $this->material->id,
            'user_id'      => $this->superAdmin->id,
            'type'         => 'in',
            'quantity'     => 50,
            'unit_price'   => 8500,
            'moved_at'     => '2026-06-01',
        ]);

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

        // userB ne voit aucun mouvement (stock vide)
        $movementsB = StockMovement::forUser($userB)->get();
        $this->assertCount(0, $movementsB);

        // La company A a bien 1 mouvement
        $movementsA = StockMovement::forUser($this->superAdmin)->get();
        $this->assertCount(1, $movementsA);
    }
}
