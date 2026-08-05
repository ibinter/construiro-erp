<?php

namespace Tests\Feature;

use App\Models\Company;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

/**
 * L'import universel créait des enregistrements sans contrôle de permission
 * (contournement RBAC). Ces tests verrouillent le garde-fou : chaque type
 * d'import exige la permission *.create correspondante.
 */
class ImportPermissionTest extends TestCase
{
    use RefreshDatabase;

    private Company $company;

    protected function setUp(): void
    {
        parent::setUp();

        $this->company = Company::factory()->create();

        // Permissions référencées par l'import universel
        foreach (['clients.create', 'clients.view', 'hr.create', 'materials.create'] as $perm) {
            Permission::findOrCreate($perm, 'web');
        }
    }

    private function userWithPermissions(array $permissions): User
    {
        $user = User::factory()->create(['company_id' => $this->company->id]);
        $role = Role::findOrCreate('role_' . uniqid(), 'web');
        $role->syncPermissions($permissions);
        $user->assignRole($role);

        return $user;
    }

    private function fakeCsv(): UploadedFile
    {
        return UploadedFile::fake()->createWithContent(
            'clients.csv',
            "name,email\nEntreprise A,a@example.com\n"
        );
    }

    public function test_import_preview_refuse_sans_permission(): void
    {
        // Utilisateur SANS clients.create
        $user = $this->userWithPermissions(['clients.view']);

        $response = $this->actingAs($user)->post('/import/preview', [
            'file' => $this->fakeCsv(),
            'type' => 'clients',
        ]);

        $response->assertStatus(403);
    }

    public function test_import_preview_autorise_avec_permission(): void
    {
        // Utilisateur AVEC clients.create
        $user = $this->userWithPermissions(['clients.create']);

        $response = $this->actingAs($user)->post('/import/preview', [
            'file' => $this->fakeCsv(),
            'type' => 'clients',
        ]);

        // Ne doit PAS être bloqué par le garde-fou d'autorisation (403)
        $response->assertStatus(200);
    }

    public function test_import_execute_refuse_sans_permission(): void
    {
        $user = $this->userWithPermissions(['clients.view']);

        $response = $this->actingAs($user)->post('/import/execute', [
            'type'     => 'clients',
            'mapping'  => ['name' => 0, 'email' => 1],
            'tmp_path' => 'inexistant.csv',
        ]);

        $response->assertStatus(403);
    }
}
