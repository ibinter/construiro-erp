<?php

namespace Tests\Feature;

use App\Models\Budget;
use App\Models\Company;
use App\Models\Project;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

/**
 * Tests CRUD du module Budgets prévisionnels :
 * - Création valide avec lignes + calcul automatique du total_amount
 * - Validation (champs requis, lignes obligatoires, code dupliqué, status invalide)
 * - Lecture (liste et détail)
 * - Modification + remplacement des lignes
 * - Suppression (soft-delete)
 * - Isolation multi-tenant : un utilisateur d'une autre company est bloqué (404)
 *
 * Note : les routes utilisent le préfixe singulier « /budget »
 * (budget.index, budget.show, budget.store, …).
 */
class BudgetTest extends TestCase
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

        // Permissions du module budget
        foreach (['view', 'create', 'update', 'delete'] as $action) {
            Permission::findOrCreate("budget.{$action}", 'web');
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

    /** Payload valide pour POST /budget. */
    private function validBudgetData(array $overrides = []): array
    {
        return array_merge([
            'code'        => 'BUD-TEST-001',
            'title'       => 'Budget Prévisionnel Exercice 2026',
            'fiscal_year' => 2026,
            'status'      => 'draft',
            'currency'    => 'XOF',
            'lines'       => [
                [
                    'category'       => 'Gros Œuvre',
                    'label'          => 'Fondations et radier',
                    'planned_amount' => 50000000,
                    'actual_amount'  => 0,
                ],
                [
                    'category'       => 'Second Œuvre',
                    'label'          => 'Menuiseries et vitrerie',
                    'planned_amount' => 25000000,
                    'actual_amount'  => 0,
                ],
            ],
        ], $overrides);
    }

    /** Crée et retourne un budget appartenant à la company de test. */
    private function createBudget(array $overrides = []): Budget
    {
        return Budget::create(array_merge([
            'company_id'   => $this->company->id,
            'code'         => 'BUD-DB-001',
            'title'        => 'Budget Direct DB',
            'fiscal_year'  => 2026,
            'status'       => 'draft',
            'currency'     => 'XOF',
            'total_amount' => 0,
        ], $overrides));
    }

    // -------------------------------------------------------------------------
    // CREATE — succès
    // -------------------------------------------------------------------------

    public function test_super_admin_peut_creer_un_budget_avec_lignes(): void
    {
        $response = $this->actingAs($this->superAdmin)
            ->post('/budget', $this->validBudgetData());

        $response->assertRedirect();
        $response->assertSessionHasNoErrors();

        $this->assertDatabaseHas('budgets', [
            'company_id'  => $this->company->id,
            'code'        => 'BUD-TEST-001',
            'title'       => 'Budget Prévisionnel Exercice 2026',
            'fiscal_year' => 2026,
            'status'      => 'draft',
        ]);

        $budget = Budget::withoutGlobalScopes()->where('code', 'BUD-TEST-001')->first();
        $this->assertNotNull($budget);
        $this->assertCount(2, $budget->lines);
    }

    // -------------------------------------------------------------------------
    // Calcul automatique du total
    // -------------------------------------------------------------------------

    public function test_total_amount_est_calcule_comme_somme_des_lignes(): void
    {
        /*
         * Ligne 1 : planned_amount = 50 000 000 XOF
         * Ligne 2 : planned_amount = 25 000 000 XOF
         * Total attendu           = 75 000 000 XOF
         */
        $this->actingAs($this->superAdmin)
            ->post('/budget', $this->validBudgetData());

        $budget = Budget::withoutGlobalScopes()->where('code', 'BUD-TEST-001')->first();

        $this->assertNotNull($budget);
        $this->assertEquals(75000000.00, (float) $budget->total_amount);
    }

    // -------------------------------------------------------------------------
    // CREATE — validation
    // -------------------------------------------------------------------------

    public function test_creation_budget_echoue_sans_code(): void
    {
        $response = $this->actingAs($this->superAdmin)
            ->post('/budget', $this->validBudgetData(['code' => '']));

        $response->assertSessionHasErrors('code');
        $this->assertDatabaseCount('budgets', 0);
    }

    public function test_creation_budget_echoue_sans_title(): void
    {
        $response = $this->actingAs($this->superAdmin)
            ->post('/budget', $this->validBudgetData(['title' => '']));

        $response->assertSessionHasErrors('title');
        $this->assertDatabaseCount('budgets', 0);
    }

    public function test_creation_budget_echoue_sans_fiscal_year(): void
    {
        $response = $this->actingAs($this->superAdmin)
            ->post('/budget', $this->validBudgetData(['fiscal_year' => '']));

        $response->assertSessionHasErrors('fiscal_year');
        $this->assertDatabaseCount('budgets', 0);
    }

    public function test_creation_budget_echoue_avec_fiscal_year_invalide(): void
    {
        // Année hors plage 2000-2100
        $response = $this->actingAs($this->superAdmin)
            ->post('/budget', $this->validBudgetData(['fiscal_year' => 1999]));

        $response->assertSessionHasErrors('fiscal_year');
        $this->assertDatabaseCount('budgets', 0);
    }

    public function test_creation_budget_echoue_sans_status(): void
    {
        $response = $this->actingAs($this->superAdmin)
            ->post('/budget', $this->validBudgetData(['status' => '']));

        $response->assertSessionHasErrors('status');
        $this->assertDatabaseCount('budgets', 0);
    }

    public function test_creation_budget_echoue_avec_status_invalide(): void
    {
        $response = $this->actingAs($this->superAdmin)
            ->post('/budget', $this->validBudgetData(['status' => 'status_inexistant']));

        $response->assertSessionHasErrors('status');
        $this->assertDatabaseCount('budgets', 0);
    }

    public function test_creation_budget_echoue_sans_currency(): void
    {
        $response = $this->actingAs($this->superAdmin)
            ->post('/budget', $this->validBudgetData(['currency' => '']));

        $response->assertSessionHasErrors('currency');
        $this->assertDatabaseCount('budgets', 0);
    }

    public function test_creation_budget_echoue_sans_lignes(): void
    {
        $response = $this->actingAs($this->superAdmin)
            ->post('/budget', $this->validBudgetData(['lines' => []]));

        $response->assertSessionHasErrors('lines');
        $this->assertDatabaseCount('budgets', 0);
    }

    public function test_creation_budget_echoue_avec_label_manquant_dans_ligne(): void
    {
        $payload = $this->validBudgetData([
            'lines' => [
                ['category' => 'Gros Œuvre', 'label' => '', 'planned_amount' => 10000000, 'actual_amount' => 0],
            ],
        ]);

        $response = $this->actingAs($this->superAdmin)
            ->post('/budget', $payload);

        $response->assertSessionHasErrors('lines.0.label');
    }

    public function test_creation_budget_echoue_avec_planned_amount_negatif(): void
    {
        $payload = $this->validBudgetData([
            'lines' => [
                ['category' => 'Gros Œuvre', 'label' => 'Fondations', 'planned_amount' => -500, 'actual_amount' => 0],
            ],
        ]);

        $response = $this->actingAs($this->superAdmin)
            ->post('/budget', $payload);

        $response->assertSessionHasErrors('lines.0.planned_amount');
    }

    public function test_creation_budget_echoue_avec_code_duplique(): void
    {
        // Premier budget
        $this->actingAs($this->superAdmin)
            ->post('/budget', $this->validBudgetData());

        // Deuxième budget avec le même code
        $response = $this->actingAs($this->superAdmin)
            ->post('/budget', $this->validBudgetData(['title' => 'Autre Titre Budget']));

        $response->assertSessionHasErrors('code');
        $this->assertDatabaseCount('budgets', 1);
    }

    // -------------------------------------------------------------------------
    // READ
    // -------------------------------------------------------------------------

    public function test_super_admin_peut_voir_la_liste_de_ses_budgets(): void
    {
        $this->createBudget();

        $response = $this->actingAs($this->superAdmin)->get('/budget');

        $response->assertOk();
    }

    public function test_super_admin_peut_voir_le_detail_dun_budget(): void
    {
        $budget = $this->createBudget();

        $response = $this->actingAs($this->superAdmin)->get("/budget/{$budget->id}");

        $response->assertOk();
    }

    // -------------------------------------------------------------------------
    // UPDATE
    // -------------------------------------------------------------------------

    public function test_super_admin_peut_modifier_un_budget(): void
    {
        $budget = $this->createBudget(['code' => 'BUD-UPD-001']);

        $response = $this->actingAs($this->superAdmin)
            ->put("/budget/{$budget->id}", $this->validBudgetData([
                'code'   => 'BUD-UPD-001',
                'title'  => 'Budget Modifié 2026',
                'status' => 'validated',
            ]));

        $response->assertRedirect();
        $response->assertSessionHasNoErrors();

        $this->assertDatabaseHas('budgets', [
            'id'     => $budget->id,
            'title'  => 'Budget Modifié 2026',
            'status' => 'validated',
        ]);
    }

    public function test_modification_budget_recalcule_le_total(): void
    {
        $budget = $this->createBudget(['code' => 'BUD-CALC-001']);

        // Mise à jour avec une seule ligne de 30 000 000 XOF
        $this->actingAs($this->superAdmin)
            ->put("/budget/{$budget->id}", $this->validBudgetData([
                'code'  => 'BUD-CALC-001',
                'lines' => [
                    ['category' => 'VRD', 'label' => 'Voirie', 'planned_amount' => 30000000, 'actual_amount' => 0],
                ],
            ]));

        $budget->refresh();
        $this->assertEquals(30000000.00, (float) $budget->total_amount);
    }

    public function test_modification_budget_accepte_meme_code_pour_le_meme_budget(): void
    {
        $budget = $this->createBudget(['code' => 'BUD-UNI-001']);

        $response = $this->actingAs($this->superAdmin)
            ->put("/budget/{$budget->id}", $this->validBudgetData([
                'code'  => 'BUD-UNI-001',
                'title' => 'Titre Modifié',
            ]));

        $response->assertRedirect();
        $response->assertSessionHasNoErrors();
    }

    // -------------------------------------------------------------------------
    // DELETE
    // -------------------------------------------------------------------------

    public function test_super_admin_peut_supprimer_un_budget(): void
    {
        $budget = $this->createBudget();

        $response = $this->actingAs($this->superAdmin)
            ->delete("/budget/{$budget->id}");

        $response->assertRedirect(route('budget.index', absolute: false));
        $this->assertSoftDeleted('budgets', ['id' => $budget->id]);
    }

    // -------------------------------------------------------------------------
    // Isolation multi-tenant
    // -------------------------------------------------------------------------

    public function test_utilisateur_autre_company_ne_peut_pas_voir_un_budget(): void
    {
        $budgetA = $this->createBudget(['code' => 'BUD-A-001']);

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

        // Le global scope company_id filtre le budget → 404
        $response = $this->actingAs($userB)->get("/budget/{$budgetA->id}");

        $response->assertStatus(404);
    }

    public function test_utilisateur_autre_company_ne_peut_pas_modifier_un_budget(): void
    {
        $budgetA = $this->createBudget(['code' => 'BUD-A-001']);

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
            ->put("/budget/{$budgetA->id}", $this->validBudgetData(['code' => 'BUD-A-001']));

        $response->assertStatus(404);
    }

    public function test_utilisateur_autre_company_ne_peut_pas_supprimer_un_budget(): void
    {
        $budgetA = $this->createBudget(['code' => 'BUD-A-001']);

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

        $response = $this->actingAs($userB)->delete("/budget/{$budgetA->id}");

        $response->assertStatus(404);
        // Le budget ne doit pas avoir été supprimé
        $this->assertDatabaseHas('budgets', ['id' => $budgetA->id, 'deleted_at' => null]);
    }

    public function test_scope_for_user_ne_renvoie_que_les_budgets_de_la_meme_company(): void
    {
        $this->createBudget(['code' => 'BUD-A-001']);

        $companyB = Company::create([
            'name'          => 'Autre BTP SARL',
            'slug'          => 'autre-btp',
            'country'       => 'CI',
            'base_currency' => 'XOF',
            'locale'        => 'fr',
            'timezone'      => 'Africa/Abidjan',
            'is_active'     => true,
        ]);

        Budget::create([
            'company_id'   => $companyB->id,
            'code'         => 'BUD-B-001',
            'title'        => 'Budget Company B',
            'fiscal_year'  => 2026,
            'status'       => 'draft',
            'currency'     => 'XOF',
            'total_amount' => 0,
        ]);

        $budgetsA = Budget::forUser($this->superAdmin)->get();

        $this->assertCount(1, $budgetsA);
        $this->assertEquals('BUD-A-001', $budgetsA->first()->code);
    }

    // -------------------------------------------------------------------------
    // Budget rattaché à un projet
    // -------------------------------------------------------------------------

    public function test_creation_budget_avec_projet_rattache(): void
    {
        $project = Project::create([
            'company_id'    => $this->company->id,
            'code'          => 'PRJ-BUD-001',
            'name'          => 'Projet Test Budget',
            'type'          => 'batiment',
            'status'        => 'draft',
            'budget_amount' => 100000000,
            'currency'      => 'XOF',
            'progress'      => 0,
        ]);

        $response = $this->actingAs($this->superAdmin)
            ->post('/budget', $this->validBudgetData(['project_id' => $project->id]));

        $response->assertRedirect();
        $response->assertSessionHasNoErrors();

        $budget = Budget::withoutGlobalScopes()->where('code', 'BUD-TEST-001')->first();
        $this->assertEquals($project->id, $budget->project_id);
    }

    public function test_creation_budget_echoue_avec_project_id_dune_autre_company(): void
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

        $projectB = Project::create([
            'company_id'    => $companyB->id,
            'code'          => 'PRJ-B-001',
            'name'          => 'Projet Company B',
            'type'          => 'batiment',
            'status'        => 'draft',
            'budget_amount' => 0,
            'currency'      => 'XOF',
            'progress'      => 0,
        ]);

        // Tenter de rattacher un projet d'une autre company
        $response = $this->actingAs($this->superAdmin)
            ->post('/budget', $this->validBudgetData(['project_id' => $projectB->id]));

        $response->assertSessionHasErrors('project_id');
    }

    // -------------------------------------------------------------------------
    // Tous les statuts valides sont acceptés
    // -------------------------------------------------------------------------

    public function test_tous_les_statuts_valides_sont_acceptes(): void
    {
        foreach (Budget::STATUSES as $index => $status) {
            $response = $this->actingAs($this->superAdmin)
                ->post('/budget', $this->validBudgetData([
                    'code'   => "BUD-STA-{$index}",
                    'status' => $status,
                ]));

            $response->assertSessionHasNoErrors();
            $this->assertDatabaseHas('budgets', ['status' => $status]);
        }
    }
}
