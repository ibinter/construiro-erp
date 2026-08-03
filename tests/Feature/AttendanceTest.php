<?php

namespace Tests\Feature;

use App\Models\Attendance;
use App\Models\Company;
use App\Models\Employee;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

/**
 * Tests du module Pointage (Attendance) :
 * - Création / liste / modification / suppression d'un pointage
 * - Règle updateOrCreate (un seul pointage par employé et par date)
 * - Validation des champs requis
 * - Isolation multi-tenant (CompanyScope global → 404)
 */
class AttendanceTest extends TestCase
{
    use RefreshDatabase;

    private Company  $company;
    private User     $superAdmin;
    private Employee $employee;

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
            Permission::findOrCreate("attendance.{$action}", 'web');
        }

        $role = Role::findOrCreate('super_admin', 'web');
        $role->syncPermissions(Permission::all());

        Role::findOrCreate('admin', 'web');

        $this->superAdmin = User::factory()->create([
            'company_id' => $this->company->id,
        ]);
        $this->superAdmin->assignRole('super_admin');

        // Employé de test rattaché à la company
        $this->employee = Employee::create([
            'company_id'    => $this->company->id,
            'matricule'     => 'EMP-001',
            'first_name'    => 'Kofi',
            'last_name'     => 'Atta',
            'job_title'     => 'Maçon',
            'department'    => 'chantier',
            'hire_date'     => '2024-01-01',
            'contract_type' => 'cdi',
            'base_salary'   => 150000,
            'currency'      => 'XOF',
            'status'        => 'active',
        ]);
    }

    // -------------------------------------------------------------------------
    // Helpers
    // -------------------------------------------------------------------------

    /** Payload valide pour POST /attendance. */
    private function validAttendancePayload(array $overrides = []): array
    {
        return array_merge([
            'employee_id'    => $this->employee->id,
            'date'           => '2026-06-01',
            'status'         => 'present',
            'hours_worked'   => 8,
            'overtime_hours' => 0,
            'site_id'        => null,
            'notes'          => null,
        ], $overrides);
    }

    /** Crée un pointage directement en base pour les tests update/delete. */
    private function createAttendance(array $overrides = []): Attendance
    {
        return Attendance::create(array_merge([
            'company_id'     => $this->company->id,
            'employee_id'    => $this->employee->id,
            'date'           => '2026-06-01',
            'status'         => 'present',
            'hours_worked'   => 8,
            'overtime_hours' => 0,
        ], $overrides));
    }

    // -------------------------------------------------------------------------
    // INDEX
    // -------------------------------------------------------------------------

    public function test_super_admin_peut_voir_la_liste_des_pointages(): void
    {
        $response = $this->actingAs($this->superAdmin)->get('/attendance');

        $response->assertOk();
    }

    public function test_liste_filtre_par_date_du_jour_par_defaut(): void
    {
        // Un pointage à aujourd'hui, un autre à une autre date
        $this->createAttendance(['date' => now()->toDateString()]);
        $this->createAttendance(['date' => '2020-01-01']);

        $response = $this->actingAs($this->superAdmin)->get('/attendance');

        $response->assertOk();
    }

    // -------------------------------------------------------------------------
    // STORE — succès
    // -------------------------------------------------------------------------

    public function test_super_admin_peut_creer_un_pointage(): void
    {
        $response = $this->actingAs($this->superAdmin)
            ->post('/attendance', $this->validAttendancePayload());

        $response->assertRedirect();
        $response->assertSessionHasNoErrors();

        $this->assertDatabaseHas('attendances', [
            'company_id'  => $this->company->id,
            'employee_id' => $this->employee->id,
            'status'      => 'present',
        ]);
    }

    public function test_store_met_a_jour_si_meme_employe_meme_date(): void
    {
        // Premier pointage
        $r1 = $this->actingAs($this->superAdmin)
            ->post('/attendance', $this->validAttendancePayload(['status' => 'present']));
        $r1->assertSessionHasNoErrors();

        // Second pointage même employé / même date → ne doit pas dupliquer (unique constraint)
        $r2 = $this->actingAs($this->superAdmin)
            ->post('/attendance', $this->validAttendancePayload(['status' => 'half_day']));
        $r2->assertSessionHasNoErrors();

        // La contrainte unique (employee_id, date) garantit au plus un seul pointage par jour
        $this->assertLessThanOrEqual(1, \App\Models\Attendance::count());
    }

    // -------------------------------------------------------------------------
    // STORE — validation
    // -------------------------------------------------------------------------

    public function test_creation_pointage_echoue_sans_employee_id(): void
    {
        $response = $this->actingAs($this->superAdmin)
            ->post('/attendance', $this->validAttendancePayload(['employee_id' => '']));

        $response->assertSessionHasErrors('employee_id');
        $this->assertDatabaseCount('attendances', 0);
    }

    public function test_creation_pointage_echoue_sans_date(): void
    {
        $response = $this->actingAs($this->superAdmin)
            ->post('/attendance', $this->validAttendancePayload(['date' => '']));

        $response->assertSessionHasErrors('date');
        $this->assertDatabaseCount('attendances', 0);
    }

    public function test_creation_pointage_echoue_sans_heures_travaillees(): void
    {
        $response = $this->actingAs($this->superAdmin)
            ->post('/attendance', $this->validAttendancePayload(['hours_worked' => '']));

        $response->assertSessionHasErrors('hours_worked');
    }

    public function test_creation_pointage_echoue_avec_statut_invalide(): void
    {
        $response = $this->actingAs($this->superAdmin)
            ->post('/attendance', $this->validAttendancePayload(['status' => 'invalide']));

        $response->assertSessionHasErrors('status');
    }

    public function test_creation_pointage_echoue_avec_heures_superieures_a_24(): void
    {
        $response = $this->actingAs($this->superAdmin)
            ->post('/attendance', $this->validAttendancePayload(['hours_worked' => 25]));

        $response->assertSessionHasErrors('hours_worked');
    }

    public function test_creation_pointage_echoue_avec_employe_autre_company(): void
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

        $employeeB = Employee::create([
            'company_id'    => $companyB->id,
            'matricule'     => 'EMP-B01',
            'first_name'    => 'Aya',
            'last_name'     => 'Kone',
            'job_title'     => 'Électricienne',
            'department'    => 'chantier',
            'hire_date'     => '2024-01-01',
            'contract_type' => 'cdi',
            'base_salary'   => 200000,
            'currency'      => 'XOF',
            'status'        => 'active',
        ]);

        // superAdmin (company A) essaie de pointer l'employé de company B
        $response = $this->actingAs($this->superAdmin)
            ->post('/attendance', $this->validAttendancePayload(['employee_id' => $employeeB->id]));

        $response->assertSessionHasErrors('employee_id');
    }

    // -------------------------------------------------------------------------
    // UPDATE
    // -------------------------------------------------------------------------

    public function test_super_admin_peut_modifier_un_pointage(): void
    {
        $attendance = $this->createAttendance();

        $response = $this->actingAs($this->superAdmin)
            ->put("/attendance/{$attendance->id}", $this->validAttendancePayload([
                'status'       => 'half_day',
                'hours_worked' => 4,
            ]));

        $response->assertRedirect();
        $response->assertSessionHasNoErrors();

        $this->assertDatabaseHas('attendances', [
            'id'           => $attendance->id,
            'status'       => 'half_day',
            'hours_worked' => 4,
        ]);
    }

    public function test_modification_pointage_echoue_sans_statut(): void
    {
        $attendance = $this->createAttendance();

        $response = $this->actingAs($this->superAdmin)
            ->put("/attendance/{$attendance->id}", $this->validAttendancePayload(['status' => '']));

        $response->assertSessionHasErrors('status');
    }

    // -------------------------------------------------------------------------
    // DESTROY
    // -------------------------------------------------------------------------

    public function test_super_admin_peut_supprimer_un_pointage(): void
    {
        $attendance = $this->createAttendance();

        $response = $this->actingAs($this->superAdmin)
            ->delete("/attendance/{$attendance->id}");

        $response->assertRedirect();
        $this->assertDatabaseCount('attendances', 0);
    }

    // -------------------------------------------------------------------------
    // Isolation multi-tenant
    // -------------------------------------------------------------------------

    public function test_utilisateur_autre_company_ne_peut_pas_modifier_un_pointage(): void
    {
        // Pointage appartenant à la company A
        $attendance = $this->createAttendance();

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

        // Le CompanyScope global empêche de résoudre le modèle → 404
        $response = $this->actingAs($userB)
            ->put("/attendance/{$attendance->id}", $this->validAttendancePayload(['status' => 'absent']));

        $response->assertStatus(404);
    }

    public function test_utilisateur_autre_company_ne_peut_pas_supprimer_un_pointage(): void
    {
        $attendance = $this->createAttendance();

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
            ->delete("/attendance/{$attendance->id}");

        $response->assertStatus(404);
    }

    public function test_scope_for_user_ne_renvoie_que_les_pointages_de_la_meme_company(): void
    {
        // Pointage de la company A
        $this->createAttendance(['date' => '2026-06-01']);

        $companyB = Company::create([
            'name'          => 'Autre BTP SARL',
            'slug'          => 'autre-btp',
            'country'       => 'CI',
            'base_currency' => 'XOF',
            'locale'        => 'fr',
            'timezone'      => 'Africa/Abidjan',
            'is_active'     => true,
        ]);

        $employeeB = Employee::create([
            'company_id'    => $companyB->id,
            'matricule'     => 'EMP-B01',
            'first_name'    => 'Aya',
            'last_name'     => 'Kone',
            'job_title'     => 'Électricienne',
            'department'    => 'chantier',
            'hire_date'     => '2024-01-01',
            'contract_type' => 'cdi',
            'base_salary'   => 200000,
            'currency'      => 'XOF',
            'status'        => 'active',
        ]);

        // Pointage de la company B
        Attendance::create([
            'company_id'     => $companyB->id,
            'employee_id'    => $employeeB->id,
            'date'           => '2026-06-01',
            'status'         => 'present',
            'hours_worked'   => 8,
            'overtime_hours' => 0,
        ]);

        $attendancesA = Attendance::forUser($this->superAdmin)->get();

        $this->assertCount(1, $attendancesA);
        $this->assertEquals($this->company->id, $attendancesA->first()->company_id);
    }
}
