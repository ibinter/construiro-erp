<?php

namespace Tests\Feature;

use App\Models\Company;
use App\Models\CostEntry;
use App\Models\Project;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

/**
 * Tests du module Comptabilité Analytique (CostAccountingController) :
 * - Création d'une écriture analytique (axis, label, type, amount, date)
 * - Validation : axis invalide, amount <= 0, date manquante
 * - Affichage de la liste (dashboard analytique) + scope company
 * - Modification d'une écriture existante
 * - Isolation multi-tenant : un utilisateur d'une autre company ne peut pas
 *   accéder aux écritures d'une autre entreprise (global scope → 404)
 *
 * Note : CostEntry n'a pas de SoftDeletes et le contrôleur n'expose pas de
 * route DELETE — aucun test de suppression n'est donc inclus.
 */
class CostAccountingTest extends TestCase
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

        // --- Permissions du module comptabilité analytique -----------------
        foreach (['view', 'create', 'update', 'delete', 'export'] as $action) {
            Permission::findOrCreate("cost_accounting.{$action}", 'web');
            Permission::findOrCreate("dashboard.{$action}", 'web');
            Permission::findOrCreate("projects.{$action}", 'web');
        }

        // --- Rôles -----------------------------------------------------------
        Role::findOrCreate('admin', 'web');
        $role = Role::findOrCreate('super_admin', 'web');
        $role->syncPermissions(Permission::all());

        // --- Utilisateur super_admin rattaché à l'entreprise ---------------
        $this->superAdmin = User::factory()->create([
            'company_id' => $this->company->id,
        ]);
        $this->superAdmin->assignRole('super_admin');
    }

    // -------------------------------------------------------------------------
    // Helpers
    // -------------------------------------------------------------------------

    /** Payload valide pour POST /cost-accounting. */
    private function validPayload(array $overrides = []): array
    {
        return array_merge([
            'axis'   => 'chantier',
            'label'  => 'Achat ciment 350 kg',
            'type'   => 'charge',
            'amount' => 250000,
            'date'   => '2026-07-15',
        ], $overrides);
    }

    /** Crée une écriture directement en base pour l'entreprise courante. */
    private function createEntry(array $overrides = []): CostEntry
    {
        return CostEntry::create(array_merge([
            'company_id' => $this->company->id,
            'axis'       => 'chantier',
            'label'      => 'Test écriture',
            'type'       => 'charge',
            'amount'     => 100000,
            'date'       => '2026-07-01',
        ], $overrides));
    }

    // -------------------------------------------------------------------------
    // READ — liste (dashboard analytique)
    // -------------------------------------------------------------------------

    public function test_super_admin_peut_voir_le_tableau_de_bord_analytique(): void
    {
        $response = $this->actingAs($this->superAdmin)
            ->get('/cost-accounting');

        $response->assertOk();
    }

    public function test_liste_analytique_est_filtree_par_project_id(): void
    {
        $project = Project::create([
            'company_id'    => $this->company->id,
            'code'          => 'PRJ-ANA-001',
            'name'          => 'Chantier Analytique',
            'type'          => 'batiment',
            'status'        => 'draft',
            'budget_amount' => 10000000,
            'currency'      => 'XOF',
            'progress'      => 0,
        ]);

        $this->createEntry(['project_id' => $project->id]);
        $this->createEntry(); // sans projet

        $response = $this->actingAs($this->superAdmin)
            ->get("/cost-accounting?project_id={$project->id}");

        $response->assertOk();
    }

    // -------------------------------------------------------------------------
    // CREATE — succès
    // -------------------------------------------------------------------------

    public function test_super_admin_peut_creer_une_ecriture_analytique(): void
    {
        $response = $this->actingAs($this->superAdmin)
            ->post('/cost-accounting', $this->validPayload());

        $response->assertRedirect();
        $response->assertSessionHasNoErrors();

        $this->assertDatabaseHas('cost_entries', [
            'company_id' => $this->company->id,
            'axis'       => 'chantier',
            'label'      => 'Achat ciment 350 kg',
            'type'       => 'charge',
        ]);
    }

    public function test_ecriture_de_type_produit_est_enregistree_correctement(): void
    {
        $payload = $this->validPayload([
            'axis'   => 'main_oeuvre',
            'label'  => 'Facturation client avancement',
            'type'   => 'produit',
            'amount' => 3500000,
        ]);

        $response = $this->actingAs($this->superAdmin)
            ->post('/cost-accounting', $payload);

        $response->assertRedirect();
        $response->assertSessionHasNoErrors();

        $this->assertDatabaseHas('cost_entries', [
            'company_id' => $this->company->id,
            'type'       => 'produit',
            'axis'       => 'main_oeuvre',
        ]);
    }

    // -------------------------------------------------------------------------
    // CREATE — validation
    // -------------------------------------------------------------------------

    public function test_creation_echoue_avec_axis_invalide(): void
    {
        $response = $this->actingAs($this->superAdmin)
            ->post('/cost-accounting', $this->validPayload(['axis' => 'inexistant']));

        $response->assertSessionHasErrors('axis');
        $this->assertDatabaseCount('cost_entries', 0);
    }

    public function test_creation_echoue_avec_amount_nul(): void
    {
        $response = $this->actingAs($this->superAdmin)
            ->post('/cost-accounting', $this->validPayload(['amount' => 0]));

        $response->assertSessionHasErrors('amount');
        $this->assertDatabaseCount('cost_entries', 0);
    }

    public function test_creation_echoue_avec_amount_negatif(): void
    {
        $response = $this->actingAs($this->superAdmin)
            ->post('/cost-accounting', $this->validPayload(['amount' => -500]));

        $response->assertSessionHasErrors('amount');
        $this->assertDatabaseCount('cost_entries', 0);
    }

    public function test_creation_echoue_sans_date(): void
    {
        $response = $this->actingAs($this->superAdmin)
            ->post('/cost-accounting', $this->validPayload(['date' => '']));

        $response->assertSessionHasErrors('date');
        $this->assertDatabaseCount('cost_entries', 0);
    }

    public function test_creation_echoue_sans_label(): void
    {
        $response = $this->actingAs($this->superAdmin)
            ->post('/cost-accounting', $this->validPayload(['label' => '']));

        $response->assertSessionHasErrors('label');
        $this->assertDatabaseCount('cost_entries', 0);
    }

    public function test_creation_echoue_avec_type_invalide(): void
    {
        $response = $this->actingAs($this->superAdmin)
            ->post('/cost-accounting', $this->validPayload(['type' => 'inconnu']));

        $response->assertSessionHasErrors('type');
        $this->assertDatabaseCount('cost_entries', 0);
    }

    public function test_creation_echoue_avec_project_id_dune_autre_company(): void
    {
        $autreCompany = Company::create([
            'name'          => 'Autre BTP SARL',
            'slug'          => 'autre-btp',
            'country'       => 'CI',
            'base_currency' => 'XOF',
            'locale'        => 'fr',
            'timezone'      => 'Africa/Abidjan',
            'is_active'     => true,
        ]);

        $projetAutre = Project::create([
            'company_id'    => $autreCompany->id,
            'code'          => 'PRJ-OTHER',
            'name'          => 'Projet autre company',
            'type'          => 'batiment',
            'status'        => 'draft',
            'budget_amount' => 1000000,
            'currency'      => 'XOF',
            'progress'      => 0,
        ]);

        $response = $this->actingAs($this->superAdmin)
            ->post('/cost-accounting', $this->validPayload(['project_id' => $projetAutre->id]));

        $response->assertSessionHasErrors('project_id');
        $this->assertDatabaseCount('cost_entries', 0);
    }

    // -------------------------------------------------------------------------
    // UPDATE
    // -------------------------------------------------------------------------

    public function test_super_admin_peut_modifier_une_ecriture(): void
    {
        $entry = $this->createEntry();

        $payload = $this->validPayload([
            'axis'   => 'materiel',
            'label'  => 'Location engin modifié',
            'amount' => 750000,
        ]);

        $response = $this->actingAs($this->superAdmin)
            ->put("/cost-accounting/{$entry->id}", $payload);

        $response->assertRedirect(route('cost_accounting.index', absolute: false));
        $response->assertSessionHasNoErrors();

        $this->assertDatabaseHas('cost_entries', [
            'id'    => $entry->id,
            'axis'  => 'materiel',
            'label' => 'Location engin modifié',
        ]);
    }

    public function test_modification_echoue_avec_amount_nul(): void
    {
        $entry = $this->createEntry();

        $response = $this->actingAs($this->superAdmin)
            ->put("/cost-accounting/{$entry->id}", $this->validPayload(['amount' => 0]));

        $response->assertSessionHasErrors('amount');
    }

    // -------------------------------------------------------------------------
    // Scope company (isolation multi-tenant)
    // -------------------------------------------------------------------------

    public function test_scope_for_user_ne_renvoie_que_les_ecritures_de_la_meme_company(): void
    {
        // Écriture entreprise A
        $this->createEntry(['label' => 'Écriture company A']);

        // Entreprise B avec sa propre écriture
        $companyB = Company::create([
            'name'          => 'Autre BTP SARL',
            'slug'          => 'autre-btp',
            'country'       => 'CI',
            'base_currency' => 'XOF',
            'locale'        => 'fr',
            'timezone'      => 'Africa/Abidjan',
            'is_active'     => true,
        ]);

        CostEntry::create([
            'company_id' => $companyB->id,
            'axis'       => 'frais_generaux',
            'label'      => 'Écriture company B',
            'type'       => 'charge',
            'amount'     => 50000,
            'date'       => '2026-07-01',
        ]);

        $entriesA = CostEntry::forUser($this->superAdmin)->get();

        $this->assertCount(1, $entriesA);
        $this->assertEquals('Écriture company A', $entriesA->first()->label);
    }

    public function test_utilisateur_autre_company_ne_peut_pas_acceder_a_lecriture_en_edition(): void
    {
        // Écriture appartenant à l'entreprise A
        $entry = $this->createEntry();

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

        // Le global scope company_id filtre l'écriture → 404
        $response = $this->actingAs($userB)
            ->get("/cost-accounting/{$entry->id}/edit");

        $response->assertStatus(404);
    }

    public function test_utilisateur_autre_company_ne_peut_pas_modifier_une_ecriture(): void
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
            ->put("/cost-accounting/{$entry->id}", $this->validPayload(['label' => 'Tentative modification']));

        $response->assertStatus(404);

        // L'écriture originale doit être inchangée
        $this->assertDatabaseHas('cost_entries', [
            'id'    => $entry->id,
            'label' => 'Test écriture',
        ]);
    }
}
