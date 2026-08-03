<?php

namespace Tests\Feature;

use App\Models\Company;
use App\Models\Employee;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

/**
 * Tests CRUD du module RH / Employés (EmployeeController) :
 * - Un super_admin peut créer, lire, modifier et supprimer un employé
 * - La création exige : matricule (unique par company), first_name, last_name,
 *   department, contract_type, status, base_salary, currency
 * - Un utilisateur d'une autre company ne peut pas accéder aux employés
 *   (BelongsToCompany global scope → 404 au moment du route model binding)
 *
 * Note : Employee utilise SoftDeletes → assertSoftDeleted après DELETE.
 * Les routes sont préfixées /hr (ex. : POST /hr, GET /hr/{employee}).
 */
class EmployeeTest extends TestCase
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

        // --- Permissions module RH ----------------------------------------
        foreach (['view', 'create', 'update', 'delete', 'export'] as $action) {
            Permission::findOrCreate("hr.{$action}", 'web');
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

    /** Payload valide pour POST /hr. */
    private function validPayload(array $overrides = []): array
    {
        return array_merge([
            'matricule'     => 'EMP-001',
            'first_name'    => 'Kouadio',
            'last_name'     => 'Koffi',
            'job_title'     => 'Chef de chantier',
            'department'    => 'chantier',
            'contract_type' => 'cdi',
            'status'        => 'active',
            'base_salary'   => 350000,
            'currency'      => 'XOF',
            'is_active'     => true,
        ], $overrides);
    }

    /** Crée un employé directement en base pour l'entreprise courante. */
    private function createEmployee(array $overrides = []): Employee
    {
        return Employee::create(array_merge([
            'company_id'    => $this->company->id,
            'matricule'     => 'EMP-DB-001',
            'first_name'    => 'Aya',
            'last_name'     => 'Touré',
            'department'    => 'bureau',
            'contract_type' => 'cdi',
            'status'        => 'active',
            'base_salary'   => 280000,
            'currency'      => 'XOF',
        ], $overrides));
    }

    // -------------------------------------------------------------------------
    // CREATE — succès
    // -------------------------------------------------------------------------

    public function test_super_admin_peut_creer_un_employe(): void
    {
        $response = $this->actingAs($this->superAdmin)
            ->post('/hr', $this->validPayload());

        $response->assertRedirect();
        $response->assertSessionHasNoErrors();

        $this->assertDatabaseHas('employees', [
            'company_id' => $this->company->id,
            'matricule'  => 'EMP-001',
            'first_name' => 'Kouadio',
            'last_name'  => 'Koffi',
        ]);
    }

    // -------------------------------------------------------------------------
    // CREATE — validation
    // -------------------------------------------------------------------------

    public function test_creation_echoue_sans_matricule(): void
    {
        $response = $this->actingAs($this->superAdmin)
            ->post('/hr', $this->validPayload(['matricule' => '']));

        $response->assertSessionHasErrors('matricule');
        $this->assertDatabaseCount('employees', 0);
    }

    public function test_creation_echoue_avec_matricule_duplique_dans_meme_company(): void
    {
        $this->createEmployee(['matricule' => 'EMP-001']);

        $response = $this->actingAs($this->superAdmin)
            ->post('/hr', $this->validPayload(['matricule' => 'EMP-001']));

        $response->assertSessionHasErrors('matricule');
        $this->assertDatabaseCount('employees', 1);
    }

    public function test_creation_echoue_sans_first_name(): void
    {
        $response = $this->actingAs($this->superAdmin)
            ->post('/hr', $this->validPayload(['first_name' => '']));

        $response->assertSessionHasErrors('first_name');
    }

    public function test_creation_echoue_sans_last_name(): void
    {
        $response = $this->actingAs($this->superAdmin)
            ->post('/hr', $this->validPayload(['last_name' => '']));

        $response->assertSessionHasErrors('last_name');
    }

    public function test_creation_echoue_sans_department(): void
    {
        $response = $this->actingAs($this->superAdmin)
            ->post('/hr', $this->validPayload(['department' => '']));

        $response->assertSessionHasErrors('department');
    }

    public function test_creation_echoue_avec_department_invalide(): void
    {
        $response = $this->actingAs($this->superAdmin)
            ->post('/hr', $this->validPayload(['department' => 'inexistant']));

        $response->assertSessionHasErrors('department');
    }

    public function test_creation_echoue_sans_contract_type(): void
    {
        $response = $this->actingAs($this->superAdmin)
            ->post('/hr', $this->validPayload(['contract_type' => '']));

        $response->assertSessionHasErrors('contract_type');
    }

    public function test_creation_echoue_avec_contract_type_invalide(): void
    {
        $response = $this->actingAs($this->superAdmin)
            ->post('/hr', $this->validPayload(['contract_type' => 'freelance']));

        $response->assertSessionHasErrors('contract_type');
    }

    public function test_creation_echoue_sans_status(): void
    {
        $response = $this->actingAs($this->superAdmin)
            ->post('/hr', $this->validPayload(['status' => '']));

        $response->assertSessionHasErrors('status');
    }

    public function test_creation_echoue_sans_base_salary(): void
    {
        $response = $this->actingAs($this->superAdmin)
            ->post('/hr', $this->validPayload(['base_salary' => '']));

        $response->assertSessionHasErrors('base_salary');
    }

    public function test_creation_echoue_sans_currency(): void
    {
        $response = $this->actingAs($this->superAdmin)
            ->post('/hr', $this->validPayload(['currency' => '']));

        $response->assertSessionHasErrors('currency');
    }

    // -------------------------------------------------------------------------
    // READ
    // -------------------------------------------------------------------------

    public function test_super_admin_peut_voir_la_liste_des_employes(): void
    {
        $this->createEmployee();

        $response = $this->actingAs($this->superAdmin)
            ->get('/hr');

        $response->assertOk();
    }

    public function test_super_admin_peut_voir_le_detail_dun_employe(): void
    {
        $employee = $this->createEmployee();

        $response = $this->actingAs($this->superAdmin)
            ->get("/hr/{$employee->id}");

        $response->assertOk();
    }

    public function test_super_admin_peut_voir_le_formulaire_de_creation(): void
    {
        $response = $this->actingAs($this->superAdmin)
            ->get('/hr/create');

        $response->assertOk();
    }

    // -------------------------------------------------------------------------
    // UPDATE
    // -------------------------------------------------------------------------

    public function test_super_admin_peut_modifier_un_employe(): void
    {
        $employee = $this->createEmployee();

        $response = $this->actingAs($this->superAdmin)
            ->put("/hr/{$employee->id}", $this->validPayload([
                'matricule'  => 'EMP-DB-001',
                'job_title'  => 'Directeur des travaux',
                'department' => 'direction',
                'status'     => 'active',
            ]));

        $response->assertRedirect(route('hr.show', $employee, absolute: false));
        $response->assertSessionHasNoErrors();

        $this->assertDatabaseHas('employees', [
            'id'         => $employee->id,
            'job_title'  => 'Directeur des travaux',
            'department' => 'direction',
        ]);
    }

    public function test_modification_echoue_avec_department_invalide(): void
    {
        $employee = $this->createEmployee();

        $response = $this->actingAs($this->superAdmin)
            ->put("/hr/{$employee->id}", $this->validPayload([
                'matricule'  => 'EMP-DB-001',
                'department' => 'inexistant',
            ]));

        $response->assertSessionHasErrors('department');
    }

    // -------------------------------------------------------------------------
    // DELETE
    // -------------------------------------------------------------------------

    public function test_super_admin_peut_supprimer_un_employe(): void
    {
        $employee = $this->createEmployee();

        $response = $this->actingAs($this->superAdmin)
            ->delete("/hr/{$employee->id}");

        $response->assertRedirect(route('hr.index', absolute: false));

        // Employee utilise SoftDeletes : deleted_at doit être renseigné
        $this->assertSoftDeleted('employees', ['id' => $employee->id]);
    }

    // -------------------------------------------------------------------------
    // Isolation multi-tenant
    // -------------------------------------------------------------------------

    public function test_utilisateur_autre_company_ne_peut_pas_voir_un_employe(): void
    {
        $employee = $this->createEmployee();

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

        // BelongsToCompany global scope → l'employé n'est pas trouvé → 404
        $response = $this->actingAs($userB)
            ->get("/hr/{$employee->id}");

        $response->assertStatus(404);
    }

    public function test_utilisateur_autre_company_ne_peut_pas_modifier_un_employe(): void
    {
        $employee = $this->createEmployee();

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
            ->put("/hr/{$employee->id}", $this->validPayload([
                'matricule' => 'EMP-DB-001',
                'last_name' => 'Tentative',
            ]));

        $response->assertStatus(404);

        $this->assertDatabaseHas('employees', [
            'id'        => $employee->id,
            'last_name' => 'Touré',
        ]);
    }

    public function test_utilisateur_autre_company_ne_peut_pas_supprimer_un_employe(): void
    {
        $employee = $this->createEmployee();

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
            ->delete("/hr/{$employee->id}");

        $response->assertStatus(404);

        // L'employé ne doit pas avoir été supprimé
        $this->assertDatabaseHas('employees', [
            'id'         => $employee->id,
            'deleted_at' => null,
        ]);
    }

    public function test_liste_employes_ne_renvoie_que_les_employes_de_la_meme_company(): void
    {
        $this->createEmployee(['matricule' => 'EMP-A-001']);

        $companyB = Company::create([
            'name'          => 'Autre BTP SARL',
            'slug'          => 'autre-btp',
            'country'       => 'CI',
            'base_currency' => 'XOF',
            'locale'        => 'fr',
            'timezone'      => 'Africa/Abidjan',
            'is_active'     => true,
        ]);

        Employee::create([
            'company_id'    => $companyB->id,
            'matricule'     => 'EMP-B-001',
            'first_name'    => 'Amara',
            'last_name'     => 'Diallo',
            'department'    => 'bureau',
            'contract_type' => 'cdd',
            'status'        => 'active',
            'base_salary'   => 200000,
            'currency'      => 'XOF',
        ]);

        $employeesA = Employee::forUser($this->superAdmin)->get();

        $this->assertCount(1, $employeesA);
        $this->assertEquals('EMP-A-001', $employeesA->first()->matricule);
    }
}
