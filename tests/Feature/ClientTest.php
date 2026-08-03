<?php

namespace Tests\Feature;

use App\Models\Client;
use App\Models\Company;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

/**
 * Tests CRUD du module Clients (maîtres d'ouvrage) :
 * - Création valide + validation (champs requis, type invalide, code dupliqué)
 * - Lecture (liste et détail)
 * - Modification
 * - Suppression (soft-delete)
 * - Isolation multi-tenant : un utilisateur d'une autre company est bloqué (404)
 */
class ClientTest extends TestCase
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

        // Permissions du module clients
        foreach (['view', 'create', 'update', 'delete', 'export'] as $action) {
            Permission::findOrCreate("clients.{$action}", 'web');
            Permission::findOrCreate("dashboard.{$action}", 'web');
        }

        // Rôles (super_admin + admin créés systématiquement)
        $superAdminRole = Role::findOrCreate('super_admin', 'web');
        Role::findOrCreate('admin', 'web');

        $superAdminRole->syncPermissions(Permission::all());

        // Utilisateur super_admin rattaché à l'entreprise
        $this->superAdmin = User::factory()->create([
            'company_id' => $this->company->id,
        ]);
        $this->superAdmin->assignRole('super_admin');
    }

    // -------------------------------------------------------------------------
    // Helpers
    // -------------------------------------------------------------------------

    /** Payload valide pour POST /clients. */
    private function validClientData(array $overrides = []): array
    {
        return array_merge([
            'code'         => 'CLI-TEST-001',
            'type'         => 'entreprise',
            'name'         => 'Constructions Africaines SARL',
            'contact_name' => 'Kouassi Jean',
            'phone'        => '+225 07 00 00 00',
            'email'        => 'contact@constructions-africaines.ci',
            'city'         => 'Abidjan',
            'country'      => 'CI',
            'is_active'    => true,
        ], $overrides);
    }

    /** Crée et retourne un client appartenant à l'entreprise de test. */
    private function createClient(array $overrides = []): Client
    {
        return Client::create(array_merge([
            'company_id'   => $this->company->id,
            'code'         => 'CLI-DB-001',
            'type'         => 'entreprise',
            'name'         => 'Client DB SARL',
            'is_active'    => true,
        ], $overrides));
    }

    // -------------------------------------------------------------------------
    // CREATE — succès
    // -------------------------------------------------------------------------

    public function test_super_admin_peut_creer_un_client(): void
    {
        $response = $this->actingAs($this->superAdmin)
            ->post('/clients', $this->validClientData());

        $response->assertRedirect();
        $response->assertSessionHasNoErrors();

        $this->assertDatabaseHas('clients', [
            'company_id' => $this->company->id,
            'code'       => 'CLI-TEST-001',
            'name'       => 'Constructions Africaines SARL',
            'type'       => 'entreprise',
        ]);
    }

    public function test_creation_client_assigne_company_id_depuis_utilisateur(): void
    {
        $this->actingAs($this->superAdmin)
            ->post('/clients', $this->validClientData());

        $client = Client::withoutGlobalScopes()->where('code', 'CLI-TEST-001')->first();

        $this->assertNotNull($client);
        $this->assertEquals($this->company->id, $client->company_id);
    }

    // -------------------------------------------------------------------------
    // CREATE — validation
    // -------------------------------------------------------------------------

    public function test_creation_client_echoue_sans_code(): void
    {
        $response = $this->actingAs($this->superAdmin)
            ->post('/clients', $this->validClientData(['code' => '']));

        $response->assertSessionHasErrors('code');
        $this->assertDatabaseCount('clients', 0);
    }

    public function test_creation_client_echoue_sans_name(): void
    {
        $response = $this->actingAs($this->superAdmin)
            ->post('/clients', $this->validClientData(['name' => '']));

        $response->assertSessionHasErrors('name');
        $this->assertDatabaseCount('clients', 0);
    }

    public function test_creation_client_echoue_sans_type(): void
    {
        $response = $this->actingAs($this->superAdmin)
            ->post('/clients', $this->validClientData(['type' => '']));

        $response->assertSessionHasErrors('type');
        $this->assertDatabaseCount('clients', 0);
    }

    public function test_creation_client_echoue_avec_type_invalide(): void
    {
        $response = $this->actingAs($this->superAdmin)
            ->post('/clients', $this->validClientData(['type' => 'type_invalide']));

        $response->assertSessionHasErrors('type');
        $this->assertDatabaseCount('clients', 0);
    }

    public function test_creation_client_echoue_avec_email_invalide(): void
    {
        $response = $this->actingAs($this->superAdmin)
            ->post('/clients', $this->validClientData(['email' => 'pas-un-email']));

        $response->assertSessionHasErrors('email');
        $this->assertDatabaseCount('clients', 0);
    }

    public function test_creation_client_echoue_avec_code_duplique(): void
    {
        // Premier client
        $this->actingAs($this->superAdmin)
            ->post('/clients', $this->validClientData());

        // Deuxième client avec le même code dans la même company
        $response = $this->actingAs($this->superAdmin)
            ->post('/clients', $this->validClientData(['name' => 'Autre Nom SARL']));

        $response->assertSessionHasErrors('code');
        $this->assertDatabaseCount('clients', 1);
    }

    // -------------------------------------------------------------------------
    // READ
    // -------------------------------------------------------------------------

    public function test_super_admin_peut_voir_la_liste_de_ses_clients(): void
    {
        $this->createClient();

        $response = $this->actingAs($this->superAdmin)->get('/clients');

        $response->assertOk();
    }

    public function test_super_admin_peut_voir_le_detail_dun_client(): void
    {
        $client = $this->createClient();

        $response = $this->actingAs($this->superAdmin)->get("/clients/{$client->id}");

        $response->assertOk();
    }

    // -------------------------------------------------------------------------
    // UPDATE
    // -------------------------------------------------------------------------

    public function test_super_admin_peut_modifier_un_client(): void
    {
        $client = $this->createClient();

        $response = $this->actingAs($this->superAdmin)
            ->put("/clients/{$client->id}", $this->validClientData([
                'code' => 'CLI-DB-001',   // même code pour ignorer l'unicité
                'name' => 'Nouveau Nom Construction',
                'type' => 'promoteur',
            ]));

        $response->assertRedirect();
        $response->assertSessionHasNoErrors();

        $this->assertDatabaseHas('clients', [
            'id'   => $client->id,
            'name' => 'Nouveau Nom Construction',
            'type' => 'promoteur',
        ]);
    }

    public function test_modification_client_accepte_meme_code_pour_le_meme_client(): void
    {
        $client = $this->createClient(['code' => 'CLI-UNI-001']);

        // Mettre à jour en gardant le même code → pas d'erreur de doublon
        $response = $this->actingAs($this->superAdmin)
            ->put("/clients/{$client->id}", $this->validClientData([
                'code' => 'CLI-UNI-001',
                'name' => 'Nom Modifié',
            ]));

        $response->assertRedirect();
        $response->assertSessionHasNoErrors();
    }

    // -------------------------------------------------------------------------
    // DELETE
    // -------------------------------------------------------------------------

    public function test_super_admin_peut_supprimer_un_client(): void
    {
        $client = $this->createClient();

        $response = $this->actingAs($this->superAdmin)
            ->delete("/clients/{$client->id}");

        $response->assertRedirect(route('clients.index', absolute: false));
        $this->assertSoftDeleted('clients', ['id' => $client->id]);
    }

    // -------------------------------------------------------------------------
    // Isolation multi-tenant
    // -------------------------------------------------------------------------

    public function test_utilisateur_autre_company_ne_peut_pas_voir_un_client(): void
    {
        // Client appartenant à la company A
        $clientA = $this->createClient(['code' => 'CLI-A-001']);

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

        // Le global scope company_id filtre le client → 404
        $response = $this->actingAs($userB)
            ->get("/clients/{$clientA->id}");

        $response->assertStatus(404);
    }

    public function test_utilisateur_autre_company_ne_peut_pas_modifier_un_client(): void
    {
        $clientA = $this->createClient(['code' => 'CLI-A-001']);

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

        // Route model binding filtre par company → 404
        $response = $this->actingAs($userB)
            ->put("/clients/{$clientA->id}", $this->validClientData(['code' => 'CLI-A-001']));

        $response->assertStatus(404);
    }

    public function test_utilisateur_autre_company_ne_peut_pas_supprimer_un_client(): void
    {
        $clientA = $this->createClient(['code' => 'CLI-A-001']);

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
            ->delete("/clients/{$clientA->id}");

        $response->assertStatus(404);

        // Le client ne doit pas avoir été supprimé
        $this->assertDatabaseHas('clients', ['id' => $clientA->id, 'deleted_at' => null]);
    }

    public function test_liste_clients_ne_renvoie_que_les_clients_de_la_meme_company(): void
    {
        // Client company A
        $this->createClient(['code' => 'CLI-A-001']);

        // Company B avec son propre client
        $companyB = Company::create([
            'name'          => 'Autre BTP SARL',
            'slug'          => 'autre-btp',
            'country'       => 'CI',
            'base_currency' => 'XOF',
            'locale'        => 'fr',
            'timezone'      => 'Africa/Abidjan',
            'is_active'     => true,
        ]);

        Client::create([
            'company_id' => $companyB->id,
            'code'       => 'CLI-B-001',
            'type'       => 'particulier',
            'name'       => 'Client Company B',
            'is_active'  => true,
        ]);

        // Le scope forUser ne renvoie que les clients de la company A
        $clientsA = Client::forUser($this->superAdmin)->get();

        $this->assertCount(1, $clientsA);
        $this->assertEquals('CLI-A-001', $clientsA->first()->code);
    }

    // -------------------------------------------------------------------------
    // Tous les types valides sont acceptés
    // -------------------------------------------------------------------------

    public function test_tous_les_types_valides_sont_acceptes(): void
    {
        foreach (Client::TYPES as $index => $type) {
            $response = $this->actingAs($this->superAdmin)
                ->post('/clients', $this->validClientData([
                    'code' => "CLI-TYPE-{$index}",
                    'type' => $type,
                ]));

            $response->assertSessionHasNoErrors();
            $this->assertDatabaseHas('clients', ['type' => $type]);
        }
    }
}
