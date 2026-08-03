<?php

namespace Tests\Feature;

use App\Models\Company;
use App\Models\Contract;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

/**
 * Tests CRUD du module Contrats :
 * - Création, lecture, mise à jour, suppression d'un contrat
 * - Validation des champs requis
 * - Isolation multi-tenant (CompanyScope global)
 */
class ContractTest extends TestCase
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
            Permission::findOrCreate("contracts.{$action}", 'web');
        }

        $role = Role::findOrCreate('super_admin', 'web');
        $role->syncPermissions(Permission::all());

        $this->superAdmin = User::factory()->create([
            'company_id' => $this->company->id,
        ]);
        $this->superAdmin->assignRole('super_admin');
    }

    // -------------------------------------------------------------------------
    // Helpers
    // -------------------------------------------------------------------------

    private function validContractPayload(array $overrides = []): array
    {
        return array_merge([
            'code'       => 'CTR-TEST-001',
            'title'      => 'Contrat de construction immeuble R+4',
            'type'       => 'client',
            'party_name' => 'Groupe Immobilier Abidjan',
            'amount'     => 85000000,
            'currency'   => 'XOF',
            'status'     => 'draft',
            'start_date' => '2026-09-01',
            'end_date'   => '2027-06-30',
        ], $overrides);
    }

    /** Crée un contrat directement en base (sans HTTP). */
    private function makeContract(array $overrides = []): Contract
    {
        return Contract::create(array_merge(
            $this->validContractPayload(),
            ['company_id' => $this->company->id],
            $overrides
        ));
    }

    // -------------------------------------------------------------------------
    // INDEX
    // -------------------------------------------------------------------------

    public function test_super_admin_peut_voir_la_liste_des_contrats(): void
    {
        $response = $this->actingAs($this->superAdmin)->get('/contracts');

        $response->assertOk();
    }

    // -------------------------------------------------------------------------
    // CREATE FORM
    // -------------------------------------------------------------------------

    public function test_super_admin_peut_acceder_au_formulaire_de_creation(): void
    {
        $response = $this->actingAs($this->superAdmin)->get('/contracts/create');

        $response->assertOk();
    }

    // -------------------------------------------------------------------------
    // STORE — succès
    // -------------------------------------------------------------------------

    public function test_super_admin_peut_creer_un_contrat(): void
    {
        $response = $this->actingAs($this->superAdmin)
            ->post('/contracts', $this->validContractPayload());

        $response->assertRedirect();
        $response->assertSessionHasNoErrors();

        $this->assertDatabaseHas('contracts', [
            'company_id' => $this->company->id,
            'code'       => 'CTR-TEST-001',
            'title'      => 'Contrat de construction immeuble R+4',
            'status'     => 'draft',
        ]);
    }

    public function test_contrat_cree_redirige_vers_sa_page_de_detail(): void
    {
        $response = $this->actingAs($this->superAdmin)
            ->post('/contracts', $this->validContractPayload());

        $contract = Contract::where('code', 'CTR-TEST-001')->first();
        $response->assertRedirect(route('contracts.show', $contract, absolute: false));
    }

    // -------------------------------------------------------------------------
    // SHOW
    // -------------------------------------------------------------------------

    public function test_super_admin_peut_voir_le_detail_dun_contrat(): void
    {
        $contract = $this->makeContract();

        $response = $this->actingAs($this->superAdmin)
            ->get("/contracts/{$contract->id}");

        $response->assertOk();
    }

    // -------------------------------------------------------------------------
    // EDIT
    // -------------------------------------------------------------------------

    public function test_super_admin_peut_acceder_au_formulaire_edition(): void
    {
        $contract = $this->makeContract();

        $response = $this->actingAs($this->superAdmin)
            ->get("/contracts/{$contract->id}/edit");

        $response->assertOk();
    }

    // -------------------------------------------------------------------------
    // UPDATE
    // -------------------------------------------------------------------------

    public function test_super_admin_peut_modifier_un_contrat(): void
    {
        $contract = $this->makeContract();

        $payload = $this->validContractPayload([
            'status' => 'active',
            'title'  => 'Contrat modifié R+6',
        ]);

        $response = $this->actingAs($this->superAdmin)
            ->put("/contracts/{$contract->id}", $payload);

        $response->assertRedirect();
        $response->assertSessionHasNoErrors();

        $this->assertDatabaseHas('contracts', [
            'id'     => $contract->id,
            'status' => 'active',
            'title'  => 'Contrat modifié R+6',
        ]);
    }

    public function test_code_peut_etre_identique_lors_de_la_mise_a_jour(): void
    {
        // Le Rule::unique ignore l'id courant → mise à jour sans changer le code ne doit pas échouer
        $contract = $this->makeContract(['code' => 'CTR-UPD-001']);

        $payload = $this->validContractPayload([
            'code'   => 'CTR-UPD-001',
            'status' => 'active',
        ]);

        $response = $this->actingAs($this->superAdmin)
            ->put("/contracts/{$contract->id}", $payload);

        $response->assertRedirect();
        $response->assertSessionHasNoErrors();
    }

    // -------------------------------------------------------------------------
    // DESTROY
    // -------------------------------------------------------------------------

    public function test_super_admin_peut_supprimer_un_contrat(): void
    {
        $contract = $this->makeContract();

        $response = $this->actingAs($this->superAdmin)
            ->delete("/contracts/{$contract->id}");

        $response->assertRedirect(route('contracts.index', absolute: false));
        $this->assertSoftDeleted('contracts', ['id' => $contract->id]);
    }

    // -------------------------------------------------------------------------
    // VALIDATION — création
    // -------------------------------------------------------------------------

    public function test_creation_contrat_echoue_sans_code(): void
    {
        $response = $this->actingAs($this->superAdmin)
            ->post('/contracts', $this->validContractPayload(['code' => '']));

        $response->assertSessionHasErrors('code');
        $this->assertDatabaseCount('contracts', 0);
    }

    public function test_creation_contrat_echoue_sans_titre(): void
    {
        $response = $this->actingAs($this->superAdmin)
            ->post('/contracts', $this->validContractPayload(['title' => '']));

        $response->assertSessionHasErrors('title');
    }

    public function test_creation_contrat_echoue_sans_montant(): void
    {
        $response = $this->actingAs($this->superAdmin)
            ->post('/contracts', $this->validContractPayload(['amount' => '']));

        $response->assertSessionHasErrors('amount');
    }

    public function test_creation_contrat_echoue_sans_devise(): void
    {
        $response = $this->actingAs($this->superAdmin)
            ->post('/contracts', $this->validContractPayload(['currency' => '']));

        $response->assertSessionHasErrors('currency');
    }

    public function test_creation_contrat_echoue_avec_type_invalide(): void
    {
        $response = $this->actingAs($this->superAdmin)
            ->post('/contracts', $this->validContractPayload(['type' => 'type_invalide']));

        $response->assertSessionHasErrors('type');
    }

    public function test_creation_contrat_echoue_avec_statut_invalide(): void
    {
        $response = $this->actingAs($this->superAdmin)
            ->post('/contracts', $this->validContractPayload(['status' => 'inconnu']));

        $response->assertSessionHasErrors('status');
    }

    public function test_creation_contrat_echoue_avec_code_duplique(): void
    {
        // Premier contrat créé avec succès
        $this->actingAs($this->superAdmin)
            ->post('/contracts', $this->validContractPayload());

        // Second contrat avec le même code
        $response = $this->actingAs($this->superAdmin)
            ->post('/contracts', $this->validContractPayload());

        $response->assertSessionHasErrors('code');
        $this->assertDatabaseCount('contracts', 1);
    }

    public function test_creation_contrat_echoue_si_end_date_avant_start_date(): void
    {
        $response = $this->actingAs($this->superAdmin)
            ->post('/contracts', $this->validContractPayload([
                'start_date' => '2026-09-01',
                'end_date'   => '2026-08-01', // antérieure à start_date
            ]));

        $response->assertSessionHasErrors('end_date');
    }

    // -------------------------------------------------------------------------
    // Isolation multi-tenant
    // -------------------------------------------------------------------------

    public function test_utilisateur_autre_company_ne_peut_pas_voir_un_contrat(): void
    {
        // Contrat appartenant à l'entreprise A
        $contractA = $this->makeContract(['code' => 'CTR-A-001']);

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
        // → le contrat A est invisible pour userB → le model binding échoue → 404
        $response = $this->actingAs($userB)
            ->get("/contracts/{$contractA->id}");

        $response->assertStatus(404);
    }

    public function test_utilisateur_autre_company_ne_peut_pas_modifier_un_contrat(): void
    {
        $contractA = $this->makeContract(['code' => 'CTR-A-002']);

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
            ->put("/contracts/{$contractA->id}", $this->validContractPayload(['status' => 'active']));

        $response->assertStatus(404);

        // Le statut n'a pas changé
        $this->assertDatabaseHas('contracts', [
            'id'     => $contractA->id,
            'status' => 'draft',
        ]);
    }

    public function test_scope_for_user_ne_renvoie_que_les_contrats_de_la_meme_company(): void
    {
        // Contrat de l'entreprise A
        Contract::create(array_merge(
            $this->validContractPayload(['code' => 'CTR-A-001']),
            ['company_id' => $this->company->id]
        ));

        // Contrat d'une entreprise B
        $companyB = Company::create([
            'name'          => 'Autre BTP SARL',
            'slug'          => 'autre-btp',
            'country'       => 'CI',
            'base_currency' => 'XOF',
            'locale'        => 'fr',
            'timezone'      => 'Africa/Abidjan',
            'is_active'     => true,
        ]);

        Contract::create([
            'company_id' => $companyB->id,
            'code'       => 'CTR-B-001',
            'title'      => 'Contrat Société B',
            'type'       => 'fournisseur',
            'amount'     => 5000000,
            'currency'   => 'XOF',
            'status'     => 'active',
        ]);

        $contractsA = Contract::forUser($this->superAdmin)->get();

        $this->assertCount(1, $contractsA);
        $this->assertEquals('CTR-A-001', $contractsA->first()->code);
    }
}
