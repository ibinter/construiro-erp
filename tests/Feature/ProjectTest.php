<?php

namespace Tests\Feature;

use App\Models\Company;
use App\Models\Project;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

/**
 * Tests CRUD du module Projets :
 * - Un super_admin peut créer/lire/modifier/supprimer un projet
 * - La création exige code, name, type, status (+ budget_amount, currency, progress)
 * - Un utilisateur d'une autre company ne peut pas voir les projets
 */
class ProjectTest extends TestCase
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

        // Créer les permissions nécessaires au module projets
        foreach (['view', 'create', 'update', 'delete', 'export'] as $action) {
            Permission::findOrCreate("projects.{$action}", 'web');
            Permission::findOrCreate("dashboard.{$action}", 'web');
        }

        // Créer le rôle super_admin avec toutes les permissions
        $role = Role::findOrCreate('super_admin', 'web');
        $role->syncPermissions(Permission::all());

        // Créer l'utilisateur super_admin rattaché à l'entreprise
        $this->superAdmin = User::factory()->create([
            'company_id' => $this->company->id,
        ]);
        $this->superAdmin->assignRole('super_admin');
    }

    // -------------------------------------------------------------------------
    // Données valides réutilisables
    // -------------------------------------------------------------------------

    private function validProjectData(array $overrides = []): array
    {
        return array_merge([
            'code'          => 'PRJ-TEST-001',
            'name'          => 'Immeuble Test R+5',
            'type'          => 'batiment',
            'status'        => 'draft',
            'budget_amount' => 500000000,
            'currency'      => 'XOF',
            'progress'      => 0,
        ], $overrides);
    }

    // -------------------------------------------------------------------------
    // CREATE
    // -------------------------------------------------------------------------

    public function test_super_admin_peut_creer_un_projet(): void
    {
        $response = $this->actingAs($this->superAdmin)
            ->post('/projects', $this->validProjectData());

        $response->assertRedirect();
        $response->assertSessionHasNoErrors();

        $this->assertDatabaseHas('projects', [
            'company_id' => $this->company->id,
            'code'       => 'PRJ-TEST-001',
            'name'       => 'Immeuble Test R+5',
        ]);
    }

    public function test_creation_projet_echoue_sans_code(): void
    {
        $data = $this->validProjectData(['code' => '']);

        $response = $this->actingAs($this->superAdmin)
            ->post('/projects', $data);

        $response->assertSessionHasErrors('code');
        $this->assertDatabaseCount('projects', 0);
    }

    public function test_creation_projet_echoue_sans_name(): void
    {
        $data = $this->validProjectData(['name' => '']);

        $response = $this->actingAs($this->superAdmin)
            ->post('/projects', $data);

        $response->assertSessionHasErrors('name');
    }

    public function test_creation_projet_echoue_sans_type(): void
    {
        $data = $this->validProjectData(['type' => '']);

        $response = $this->actingAs($this->superAdmin)
            ->post('/projects', $data);

        $response->assertSessionHasErrors('type');
    }

    public function test_creation_projet_echoue_sans_status(): void
    {
        $data = $this->validProjectData(['status' => '']);

        $response = $this->actingAs($this->superAdmin)
            ->post('/projects', $data);

        $response->assertSessionHasErrors('status');
    }

    public function test_creation_projet_echoue_avec_type_invalide(): void
    {
        $data = $this->validProjectData(['type' => 'inexistant']);

        $response = $this->actingAs($this->superAdmin)
            ->post('/projects', $data);

        $response->assertSessionHasErrors('type');
    }

    public function test_creation_projet_echoue_avec_code_duplique(): void
    {
        // Créer un premier projet
        Project::create(array_merge($this->validProjectData(), [
            'company_id' => $this->company->id,
        ]));

        // Tenter de créer un deuxième avec le même code dans la même company
        $response = $this->actingAs($this->superAdmin)
            ->post('/projects', $this->validProjectData());

        $response->assertSessionHasErrors('code');
        $this->assertDatabaseCount('projects', 1);
    }

    // -------------------------------------------------------------------------
    // READ
    // -------------------------------------------------------------------------

    public function test_super_admin_peut_voir_la_liste_de_ses_projets(): void
    {
        Project::create(array_merge($this->validProjectData(), [
            'company_id' => $this->company->id,
        ]));

        $response = $this->actingAs($this->superAdmin)
            ->get('/projects');

        $response->assertOk();
    }

    public function test_super_admin_peut_voir_le_detail_dun_projet(): void
    {
        $project = Project::create(array_merge($this->validProjectData(), [
            'company_id' => $this->company->id,
        ]));

        $response = $this->actingAs($this->superAdmin)
            ->get("/projects/{$project->id}");

        $response->assertOk();
    }

    // -------------------------------------------------------------------------
    // UPDATE
    // -------------------------------------------------------------------------

    public function test_super_admin_peut_modifier_un_projet(): void
    {
        $project = Project::create(array_merge($this->validProjectData(), [
            'company_id' => $this->company->id,
        ]));

        $response = $this->actingAs($this->superAdmin)
            ->put("/projects/{$project->id}", $this->validProjectData([
                'name'   => 'Immeuble Modifié',
                'status' => 'in_progress',
            ]));

        $response->assertRedirect();
        $response->assertSessionHasNoErrors();

        $this->assertDatabaseHas('projects', [
            'id'     => $project->id,
            'name'   => 'Immeuble Modifié',
            'status' => 'in_progress',
        ]);
    }

    // -------------------------------------------------------------------------
    // DELETE
    // -------------------------------------------------------------------------

    public function test_super_admin_peut_supprimer_un_projet(): void
    {
        $project = Project::create(array_merge($this->validProjectData(), [
            'company_id' => $this->company->id,
        ]));

        $response = $this->actingAs($this->superAdmin)
            ->delete("/projects/{$project->id}");

        $response->assertRedirect(route('projects.index', absolute: false));

        // SoftDeletes : le projet doit exister en base mais avec deleted_at renseigné
        $this->assertSoftDeleted('projects', ['id' => $project->id]);
    }

    // -------------------------------------------------------------------------
    // Isolation multi-tenant
    // -------------------------------------------------------------------------

    public function test_utilisateur_autre_company_ne_peut_pas_voir_un_projet(): void
    {
        // Projet appartenant à l'entreprise A
        $projectCompanyA = Project::create(array_merge($this->validProjectData(), [
            'company_id' => $this->company->id,
        ]));

        // Créer une entreprise B et un utilisateur associé
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

        // L'utilisateur B tente d'accéder au projet de l'entreprise A
        $response = $this->actingAs($userB)
            ->get("/projects/{$projectCompanyA->id}");

        $response->assertStatus(403);
    }

    public function test_liste_projets_ne_renvoie_que_les_projets_de_la_meme_company(): void
    {
        // Projet entreprise A
        Project::create(array_merge($this->validProjectData(['code' => 'PRJ-A-001']), [
            'company_id' => $this->company->id,
        ]));

        // Entreprise B avec son propre projet
        $companyB = Company::create([
            'name'          => 'Autre BTP SARL',
            'slug'          => 'autre-btp',
            'country'       => 'CI',
            'base_currency' => 'XOF',
            'locale'        => 'fr',
            'timezone'      => 'Africa/Abidjan',
            'is_active'     => true,
        ]);

        Project::create(array_merge($this->validProjectData(['code' => 'PRJ-B-001']), [
            'name'       => 'Projet entreprise B',
            'company_id' => $companyB->id,
        ]));

        // L'admin A ne voit que ses propres projets
        $userA = $this->superAdmin;
        $userAProjects = Project::forUser($userA)->get();

        $this->assertCount(1, $userAProjects);
        $this->assertEquals('PRJ-A-001', $userAProjects->first()->code);
    }
}
