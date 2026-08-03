<?php

namespace Tests\Feature;

use App\Models\Client;
use App\Models\Company;
use App\Models\Invoice;
use App\Models\Project;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

/**
 * Vérifie l'isolation des données entre entreprises (CompanyScope multi-tenant).
 */
class MultiTenantIsolationTest extends TestCase
{
    use RefreshDatabase;

    private Company $companyA;
    private Company $companyB;
    private User $userA;
    private User $userB;

    protected function setUp(): void
    {
        parent::setUp();

        $this->companyA = Company::factory()->create(['name' => 'Entreprise A']);
        $this->companyB = Company::factory()->create(['name' => 'Entreprise B']);

        Role::findOrCreate('admin', 'web');

        $this->userA = User::factory()->create(['company_id' => $this->companyA->id]);
        $this->userA->assignRole('admin');

        $this->userB = User::factory()->create(['company_id' => $this->companyB->id]);
        $this->userB->assignRole('admin');
    }

    public function test_user_cannot_see_other_company_projects(): void
    {
        $projectA = Project::factory()->create(['company_id' => $this->companyA->id]);
        $projectB = Project::factory()->create(['company_id' => $this->companyB->id]);

        $response = $this->actingAs($this->userA)->get(route('projects.index'));

        $response->assertStatus(200);
        $response->assertInertia(fn($page) => $page
            ->has('projects')
            ->where('projects.data.0.id', $projectA->id)
        );

        // Tenter d'accéder directement au projet de l'entreprise B
        // Le global scope company_id filtre le projet → 404 (plus sécurisé que 403)
        $response = $this->actingAs($this->userA)->get(route('projects.show', $projectB->id));
        $response->assertStatus(404);
    }

    public function test_user_cannot_see_other_company_clients(): void
    {
        $clientA = Client::factory()->create(['company_id' => $this->companyA->id]);
        Client::factory()->create(['company_id' => $this->companyB->id]);

        $response = $this->actingAs($this->userA)->get(route('clients.index'));
        $response->assertStatus(200);
        // La réponse est paginée → clients.data
        $response->assertInertia(fn($page) => $page
            ->has('clients.data', 1)
            ->where('clients.data.0.id', $clientA->id)
        );
    }

    public function test_user_cannot_access_other_company_invoice_pdf(): void
    {
        $invoiceB = Invoice::factory()->create(['company_id' => $this->companyB->id]);

        // Accès direct à la page de la facture (isolée par global scope) → 404
        $response = $this->actingAs($this->userA)->get(route('invoices.show', $invoiceB->id));
        $response->assertStatus(404);
    }

    public function test_projects_scoped_to_authenticated_company(): void
    {
        Project::factory()->count(3)->create(['company_id' => $this->companyA->id]);
        Project::factory()->count(5)->create(['company_id' => $this->companyB->id]);

        $response = $this->actingAs($this->userA)->get(route('projects.index'));
        $response->assertStatus(200);
        $response->assertInertia(fn($page) => $page
            ->has('projects.data', 3)
        );
    }
}
