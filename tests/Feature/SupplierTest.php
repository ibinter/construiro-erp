<?php

namespace Tests\Feature;

use App\Models\Company;
use App\Models\Supplier;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

/**
 * Tests CRUD du module Fournisseurs (SupplierController) :
 * - Un super_admin peut créer, lire, modifier et supprimer un fournisseur
 * - La création exige : code (unique par company), category, name
 * - Un utilisateur d'une autre company ne peut pas accéder aux fournisseurs
 *   (BelongsToCompany global scope → 404 au moment du route model binding)
 *
 * Note : Supplier utilise SoftDeletes → assertSoftDeleted après DELETE.
 * Catégories valides : materiaux, services, location, sous_traitance, autre.
 */
class SupplierTest extends TestCase
{
    use RefreshDatabase;

    private Company $company;
    private User    $superAdmin;

    protected function setUp(): void
    {
        parent::setUp();

        // --- Entreprise de test -------------------------------------------
        $this->company = Company::create([
            'name'          => 'BTP Test SA',
            'slug'          => 'btp-test',
            'country'       => 'CI',
            'base_currency' => 'XOF',
            'locale'        => 'fr',
            'timezone'      => 'Africa/Abidjan',
            'is_active'     => true,
        ]);

        // --- Permissions module fournisseurs ---------------------------------
        foreach (['view', 'create', 'update', 'delete', 'export'] as $action) {
            Permission::findOrCreate("suppliers.{$action}", 'web');
            Permission::findOrCreate("dashboard.{$action}", 'web');
        }

        // --- Rôles -----------------------------------------------------------
        Role::findOrCreate('admin', 'web');
        $role = Role::findOrCreate('super_admin', 'web');
        $role->syncPermissions(Permission::all());

        // --- Utilisateur super_admin ----------------------------------------
        $this->superAdmin = User::factory()->create([
            'company_id' => $this->company->id,
        ]);
        $this->superAdmin->assignRole('super_admin');
    }

    // -------------------------------------------------------------------------
    // Helpers
    // -------------------------------------------------------------------------

    /** Payload valide pour POST /suppliers. */
    private function validPayload(array $overrides = []): array
    {
        return array_merge([
            'code'         => 'FOUR-001',
            'category'     => 'materiaux',
            'name'         => 'Cimaf Côte d\'Ivoire',
            'contact_name' => 'M. Diabaté',
            'phone'        => '+225 07 01 02 03',
            'email'        => 'contact@cimaf.ci',
            'city'         => 'Abidjan',
            'is_active'    => true,
        ], $overrides);
    }

    /** Crée un fournisseur directement en base pour l'entreprise courante. */
    private function createSupplier(array $overrides = []): Supplier
    {
        return Supplier::create(array_merge([
            'company_id' => $this->company->id,
            'code'       => 'FOUR-DB-001',
            'category'   => 'services',
            'name'       => 'Prestataire Test SARL',
            'is_active'  => true,
        ], $overrides));
    }

    // -------------------------------------------------------------------------
    // CREATE — succès
    // -------------------------------------------------------------------------

    public function test_super_admin_peut_creer_un_fournisseur(): void
    {
        $response = $this->actingAs($this->superAdmin)
            ->post('/suppliers', $this->validPayload());

        $response->assertRedirect();
        $response->assertSessionHasNoErrors();

        $this->assertDatabaseHas('suppliers', [
            'company_id' => $this->company->id,
            'code'       => 'FOUR-001',
            'name'       => 'Cimaf Côte d\'Ivoire',
            'category'   => 'materiaux',
        ]);
    }

    // -------------------------------------------------------------------------
    // CREATE — validation
    // -------------------------------------------------------------------------

    public function test_creation_echoue_sans_code(): void
    {
        $response = $this->actingAs($this->superAdmin)
            ->post('/suppliers', $this->validPayload(['code' => '']));

        $response->assertSessionHasErrors('code');
        $this->assertDatabaseCount('suppliers', 0);
    }

    public function test_creation_echoue_avec_code_duplique_dans_meme_company(): void
    {
        $this->createSupplier(['code' => 'FOUR-001']);

        $response = $this->actingAs($this->superAdmin)
            ->post('/suppliers', $this->validPayload(['code' => 'FOUR-001']));

        $response->assertSessionHasErrors('code');
        $this->assertDatabaseCount('suppliers', 1);
    }

    public function test_creation_echoue_sans_category(): void
    {
        $response = $this->actingAs($this->superAdmin)
            ->post('/suppliers', $this->validPayload(['category' => '']));

        $response->assertSessionHasErrors('category');
        $this->assertDatabaseCount('suppliers', 0);
    }

    public function test_creation_echoue_avec_category_invalide(): void
    {
        $response = $this->actingAs($this->superAdmin)
            ->post('/suppliers', $this->validPayload(['category' => 'inconnu']));

        $response->assertSessionHasErrors('category');
        $this->assertDatabaseCount('suppliers', 0);
    }

    public function test_creation_echoue_sans_name(): void
    {
        $response = $this->actingAs($this->superAdmin)
            ->post('/suppliers', $this->validPayload(['name' => '']));

        $response->assertSessionHasErrors('name');
        $this->assertDatabaseCount('suppliers', 0);
    }

    public function test_creation_echoue_avec_email_invalide(): void
    {
        $response = $this->actingAs($this->superAdmin)
            ->post('/suppliers', $this->validPayload(['email' => 'pas-un-email']));

        $response->assertSessionHasErrors('email');
    }

    // -------------------------------------------------------------------------
    // READ
    // -------------------------------------------------------------------------

    public function test_super_admin_peut_voir_la_liste_des_fournisseurs(): void
    {
        $this->createSupplier();

        $response = $this->actingAs($this->superAdmin)
            ->get('/suppliers');

        $response->assertOk();
    }

    public function test_super_admin_peut_voir_le_detail_dun_fournisseur(): void
    {
        $supplier = $this->createSupplier();

        $response = $this->actingAs($this->superAdmin)
            ->get("/suppliers/{$supplier->id}");

        $response->assertOk();
    }

    public function test_super_admin_peut_voir_le_formulaire_de_creation(): void
    {
        $response = $this->actingAs($this->superAdmin)
            ->get('/suppliers/create');

        $response->assertOk();
    }

    // -------------------------------------------------------------------------
    // UPDATE
    // -------------------------------------------------------------------------

    public function test_super_admin_peut_modifier_un_fournisseur(): void
    {
        $supplier = $this->createSupplier();

        $response = $this->actingAs($this->superAdmin)
            ->put("/suppliers/{$supplier->id}", $this->validPayload([
                'code'     => 'FOUR-DB-001',
                'name'     => 'Prestataire Test SARL Modifié',
                'category' => 'location',
            ]));

        $response->assertRedirect(route('suppliers.show', $supplier, absolute: false));
        $response->assertSessionHasNoErrors();

        $this->assertDatabaseHas('suppliers', [
            'id'       => $supplier->id,
            'name'     => 'Prestataire Test SARL Modifié',
            'category' => 'location',
        ]);
    }

    public function test_modification_echoue_avec_category_invalide(): void
    {
        $supplier = $this->createSupplier();

        $response = $this->actingAs($this->superAdmin)
            ->put("/suppliers/{$supplier->id}", $this->validPayload([
                'code'     => 'FOUR-DB-001',
                'category' => 'inexistant',
            ]));

        $response->assertSessionHasErrors('category');
    }

    public function test_code_reste_unique_par_company_lors_de_la_modification(): void
    {
        $supplierA = $this->createSupplier(['code' => 'FOUR-A-001']);
        $supplierB = $this->createSupplier(['code' => 'FOUR-B-001']);

        // Tenter de donner à B le code de A
        $response = $this->actingAs($this->superAdmin)
            ->put("/suppliers/{$supplierB->id}", $this->validPayload([
                'code'     => 'FOUR-A-001',
                'category' => 'services',
                'name'     => 'Prestataire Test SARL',
            ]));

        $response->assertSessionHasErrors('code');
    }

    // -------------------------------------------------------------------------
    // DELETE
    // -------------------------------------------------------------------------

    public function test_super_admin_peut_supprimer_un_fournisseur(): void
    {
        $supplier = $this->createSupplier();

        $response = $this->actingAs($this->superAdmin)
            ->delete("/suppliers/{$supplier->id}");

        $response->assertRedirect(route('suppliers.index', absolute: false));

        // Supplier utilise SoftDeletes : deleted_at doit être renseigné
        $this->assertSoftDeleted('suppliers', ['id' => $supplier->id]);
    }

    // -------------------------------------------------------------------------
    // Isolation multi-tenant
    // -------------------------------------------------------------------------

    public function test_utilisateur_autre_company_ne_peut_pas_voir_un_fournisseur(): void
    {
        $supplier = $this->createSupplier();

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

        // BelongsToCompany global scope → le fournisseur n'est pas trouvé → 404
        $response = $this->actingAs($userB)
            ->get("/suppliers/{$supplier->id}");

        $response->assertStatus(404);
    }

    public function test_utilisateur_autre_company_ne_peut_pas_modifier_un_fournisseur(): void
    {
        $supplier = $this->createSupplier();

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
            ->put("/suppliers/{$supplier->id}", $this->validPayload([
                'code'     => 'FOUR-DB-001',
                'name'     => 'Tentative de modification',
                'category' => 'services',
            ]));

        $response->assertStatus(404);

        $this->assertDatabaseHas('suppliers', [
            'id'   => $supplier->id,
            'name' => 'Prestataire Test SARL',
        ]);
    }

    public function test_utilisateur_autre_company_ne_peut_pas_supprimer_un_fournisseur(): void
    {
        $supplier = $this->createSupplier();

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
            ->delete("/suppliers/{$supplier->id}");

        $response->assertStatus(404);

        $this->assertDatabaseHas('suppliers', [
            'id'         => $supplier->id,
            'deleted_at' => null,
        ]);
    }

    public function test_liste_fournisseurs_ne_renvoie_que_les_fournisseurs_de_la_meme_company(): void
    {
        $this->createSupplier(['code' => 'FOUR-A-001']);

        $companyB = Company::create([
            'name'          => 'Autre BTP SARL',
            'slug'          => 'autre-btp',
            'country'       => 'CI',
            'base_currency' => 'XOF',
            'locale'        => 'fr',
            'timezone'      => 'Africa/Abidjan',
            'is_active'     => true,
        ]);

        Supplier::create([
            'company_id' => $companyB->id,
            'code'       => 'FOUR-B-001',
            'category'   => 'autre',
            'name'       => 'Fournisseur company B',
            'is_active'  => true,
        ]);

        $suppliersA = Supplier::forUser($this->superAdmin)->get();

        $this->assertCount(1, $suppliersA);
        $this->assertEquals('FOUR-A-001', $suppliersA->first()->code);
    }
}
