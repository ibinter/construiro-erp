<?php

namespace Tests\Feature;

use App\Models\Company;
use App\Models\Material;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

/**
 * Tests CRUD du module Matériaux :
 * - Création / lecture / mise à jour / suppression d'un matériau
 * - Validation des champs requis
 * - Isolation multi-tenant (CompanyScope global → 404 pour les autres tenants)
 */
class MaterialTest extends TestCase
{
    use RefreshDatabase;

    private Company $company;
    private User    $superAdmin;

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
            Permission::findOrCreate("materials.{$action}", 'web');
        }

        $role = Role::findOrCreate('super_admin', 'web');
        $role->syncPermissions(Permission::all());

        Role::findOrCreate('admin', 'web');

        $this->superAdmin = User::factory()->create([
            'company_id' => $this->company->id,
        ]);
        $this->superAdmin->assignRole('super_admin');
    }

    // -------------------------------------------------------------------------
    // Helpers
    // -------------------------------------------------------------------------

    /** Retourne un payload valide pour POST /materials. */
    private function validMaterialPayload(array $overrides = []): array
    {
        return array_merge([
            'code'        => 'MAT-001',
            'name'        => 'Ciment Portland 50 kg',
            'category'    => 'gros_oeuvre',
            'unit'        => 'sac',
            'unit_price'  => 8500,
            'min_stock'   => 10,
            'description' => null,
            'is_active'   => true,
        ], $overrides);
    }

    /** Crée un matériau directement en base pour les tests read/update/delete. */
    private function createMaterial(array $overrides = []): Material
    {
        return Material::create(array_merge(
            $this->validMaterialPayload(),
            ['company_id' => $this->company->id],
            $overrides
        ));
    }

    // -------------------------------------------------------------------------
    // CREATE — succès
    // -------------------------------------------------------------------------

    public function test_super_admin_peut_creer_un_materiau(): void
    {
        $response = $this->actingAs($this->superAdmin)
            ->post('/materials', $this->validMaterialPayload());

        $response->assertRedirect();
        $response->assertSessionHasNoErrors();

        $this->assertDatabaseHas('materials', [
            'company_id' => $this->company->id,
            'code'       => 'MAT-001',
            'name'       => 'Ciment Portland 50 kg',
        ]);
    }

    // -------------------------------------------------------------------------
    // CREATE — validation des champs requis
    // -------------------------------------------------------------------------

    public function test_creation_materiau_echoue_sans_code(): void
    {
        $response = $this->actingAs($this->superAdmin)
            ->post('/materials', $this->validMaterialPayload(['code' => '']));

        $response->assertSessionHasErrors('code');
        $this->assertDatabaseCount('materials', 0);
    }

    public function test_creation_materiau_echoue_sans_nom(): void
    {
        $response = $this->actingAs($this->superAdmin)
            ->post('/materials', $this->validMaterialPayload(['name' => '']));

        $response->assertSessionHasErrors('name');
        $this->assertDatabaseCount('materials', 0);
    }

    public function test_creation_materiau_echoue_sans_categorie(): void
    {
        $response = $this->actingAs($this->superAdmin)
            ->post('/materials', $this->validMaterialPayload(['category' => '']));

        $response->assertSessionHasErrors('category');
        $this->assertDatabaseCount('materials', 0);
    }

    public function test_creation_materiau_echoue_avec_categorie_invalide(): void
    {
        $response = $this->actingAs($this->superAdmin)
            ->post('/materials', $this->validMaterialPayload(['category' => 'invalide']));

        $response->assertSessionHasErrors('category');
    }

    public function test_creation_materiau_echoue_sans_unite(): void
    {
        $response = $this->actingAs($this->superAdmin)
            ->post('/materials', $this->validMaterialPayload(['unit' => '']));

        $response->assertSessionHasErrors('unit');
    }

    public function test_creation_materiau_echoue_avec_code_duplique(): void
    {
        // Première création
        $this->actingAs($this->superAdmin)
            ->post('/materials', $this->validMaterialPayload());

        // Même code → doit échouer
        $response = $this->actingAs($this->superAdmin)
            ->post('/materials', $this->validMaterialPayload());

        $response->assertSessionHasErrors('code');
        $this->assertDatabaseCount('materials', 1);
    }

    // -------------------------------------------------------------------------
    // READ
    // -------------------------------------------------------------------------

    public function test_super_admin_peut_voir_la_liste_des_materiaux(): void
    {
        $response = $this->actingAs($this->superAdmin)->get('/materials');

        $response->assertOk();
    }

    public function test_super_admin_peut_voir_le_detail_dun_materiau(): void
    {
        $material = $this->createMaterial();

        $response = $this->actingAs($this->superAdmin)
            ->get("/materials/{$material->id}");

        $response->assertOk();
    }

    // -------------------------------------------------------------------------
    // UPDATE
    // -------------------------------------------------------------------------

    public function test_super_admin_peut_modifier_un_materiau(): void
    {
        $material = $this->createMaterial();

        $response = $this->actingAs($this->superAdmin)
            ->put("/materials/{$material->id}", $this->validMaterialPayload([
                'name' => 'Ciment Portland 42.5',
            ]));

        $response->assertRedirect();
        $response->assertSessionHasNoErrors();

        $this->assertDatabaseHas('materials', [
            'id'   => $material->id,
            'name' => 'Ciment Portland 42.5',
        ]);
    }

    public function test_modification_materiau_echoue_sans_nom(): void
    {
        $material = $this->createMaterial();

        $response = $this->actingAs($this->superAdmin)
            ->put("/materials/{$material->id}", $this->validMaterialPayload(['name' => '']));

        $response->assertSessionHasErrors('name');
    }

    // -------------------------------------------------------------------------
    // DELETE
    // -------------------------------------------------------------------------

    public function test_super_admin_peut_supprimer_un_materiau(): void
    {
        $material = $this->createMaterial();

        $response = $this->actingAs($this->superAdmin)
            ->delete("/materials/{$material->id}");

        $response->assertRedirect(route('materials.index', absolute: false));
        $this->assertSoftDeleted('materials', ['id' => $material->id]);
    }

    // -------------------------------------------------------------------------
    // Isolation multi-tenant
    // -------------------------------------------------------------------------

    public function test_utilisateur_autre_company_ne_peut_pas_voir_un_materiau(): void
    {
        // Matériau de la company A
        $material = $this->createMaterial();

        // Company B et son utilisateur
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

        // Le CompanyScope global filtre le matériau → 404
        $response = $this->actingAs($userB)
            ->get("/materials/{$material->id}");

        $response->assertStatus(404);
    }

    public function test_utilisateur_autre_company_ne_peut_pas_modifier_un_materiau(): void
    {
        $material = $this->createMaterial();

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
            ->put("/materials/{$material->id}", $this->validMaterialPayload(['name' => 'Tentative']));

        $response->assertStatus(404);
    }

    public function test_utilisateur_autre_company_ne_peut_pas_supprimer_un_materiau(): void
    {
        $material = $this->createMaterial();

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
            ->delete("/materials/{$material->id}");

        $response->assertStatus(404);
    }

    public function test_scope_for_user_ne_renvoie_que_les_materiaux_de_la_meme_company(): void
    {
        // Matériau de la company A
        $this->createMaterial(['code' => 'MAT-A']);

        // Company B avec son propre matériau
        $companyB = Company::create([
            'name'          => 'Autre BTP SARL',
            'slug'          => 'autre-btp',
            'country'       => 'CI',
            'base_currency' => 'XOF',
            'locale'        => 'fr',
            'timezone'      => 'Africa/Abidjan',
            'is_active'     => true,
        ]);

        Material::create(array_merge(
            $this->validMaterialPayload(['code' => 'MAT-B']),
            ['company_id' => $companyB->id]
        ));

        $materialsA = Material::forUser($this->superAdmin)->get();

        $this->assertCount(1, $materialsA);
        $this->assertEquals('MAT-A', $materialsA->first()->code);
    }
}
