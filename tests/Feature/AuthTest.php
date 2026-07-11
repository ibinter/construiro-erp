<?php

namespace Tests\Feature;

use App\Models\Company;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

/**
 * Tests d'authentification :
 * - Login réussi redirige vers /dashboard
 * - Login échoué retourne une erreur de validation
 * - Les routes protégées redirigent vers /login si non connecté
 */
class AuthTest extends TestCase
{
    use RefreshDatabase;

    private Company $company;

    protected function setUp(): void
    {
        parent::setUp();

        // Créer l'entreprise de test
        $this->company = Company::create([
            'name'          => 'Test Company',
            'slug'          => 'test-company',
            'country'       => 'CI',
            'base_currency' => 'XOF',
            'locale'        => 'fr',
            'timezone'      => 'Africa/Abidjan',
            'is_active'     => true,
        ]);

        // Créer le rôle et la permission minimaux pour les tests de routes protégées
        $dashboardView = Permission::findOrCreate('dashboard.view', 'web');
        $superAdmin    = Role::findOrCreate('super_admin', 'web');
        $superAdmin->syncPermissions(Permission::all());
    }

    // -------------------------------------------------------------------------
    // Login réussi
    // -------------------------------------------------------------------------

    public function test_login_avec_identifiants_valides_redirige_vers_dashboard(): void
    {
        $user = User::factory()->create([
            'company_id' => $this->company->id,
            'email'      => 'admin@test.com',
            'password'   => bcrypt('password'),
        ]);

        $response = $this->post('/login', [
            'email'    => 'admin@test.com',
            'password' => 'password',
        ]);

        $this->assertAuthenticated();
        $response->assertRedirect(route('dashboard', absolute: false));
    }

    // -------------------------------------------------------------------------
    // Login échoué
    // -------------------------------------------------------------------------

    public function test_login_avec_mauvais_mot_de_passe_retourne_erreur(): void
    {
        User::factory()->create([
            'company_id' => $this->company->id,
            'email'      => 'admin@test.com',
            'password'   => bcrypt('password'),
        ]);

        $response = $this->post('/login', [
            'email'    => 'admin@test.com',
            'password' => 'mauvais_mot_de_passe',
        ]);

        $this->assertGuest();
        $response->assertSessionHasErrors('email');
    }

    public function test_login_avec_email_inconnu_retourne_erreur(): void
    {
        $response = $this->post('/login', [
            'email'    => 'inconnu@test.com',
            'password' => 'password',
        ]);

        $this->assertGuest();
        $response->assertSessionHasErrors('email');
    }

    // -------------------------------------------------------------------------
    // Routes protégées redirigent vers /login
    // -------------------------------------------------------------------------

    public function test_dashboard_redirige_vers_login_si_non_connecte(): void
    {
        $response = $this->get('/dashboard');

        $response->assertRedirect('/login');
    }

    public function test_liste_projets_redirige_vers_login_si_non_connecte(): void
    {
        $response = $this->get('/projects');

        $response->assertRedirect('/login');
    }

    public function test_liste_factures_redirige_vers_login_si_non_connecte(): void
    {
        $response = $this->get('/invoices');

        $response->assertRedirect('/login');
    }

    public function test_profil_redirige_vers_login_si_non_connecte(): void
    {
        $response = $this->get('/profile');

        $response->assertRedirect('/login');
    }

    // -------------------------------------------------------------------------
    // Déconnexion
    // -------------------------------------------------------------------------

    public function test_deconnexion_met_fin_a_la_session(): void
    {
        $user = User::factory()->create(['company_id' => $this->company->id]);

        $response = $this->actingAs($user)->post('/logout');

        $this->assertGuest();
        $response->assertRedirect('/');
    }
}
