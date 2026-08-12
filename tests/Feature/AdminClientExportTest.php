<?php

namespace Tests\Feature;

use App\Mail\NewRegistrationMail;
use App\Models\Company;
use App\Models\Subscription;
use App\Models\SubscriptionPlan;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

/**
 * 1) Export CSV de la base clients (SuperAdmin, tous statuts / par statut).
 * 2) Notification e-mail à chaque nouvelle inscription.
 */
class AdminClientExportTest extends TestCase
{
    use RefreshDatabase;

    private function superAdmin(): User
    {
        Role::findOrCreate('ibig_superadmin', 'web');
        $u = User::factory()->create();
        $u->assignRole('ibig_superadmin');

        return $u;
    }

    private function clientWith(string $status, string $name, ?string $email = null): Company
    {
        $company = Company::factory()->create(['name' => $name, 'address' => 'Cocody, Abidjan', 'is_active' => $status !== 'inactive']);
        User::factory()->create(['company_id' => $company->id, 'name' => 'Contact ' . $name, 'email' => $email ?? \Illuminate\Support\Str::slug($name) . '@ex.com']);
        Subscription::create([
            'company_id' => $company->id, 'plan_id' => null, 'status' => $status,
            'billing_cycle' => 'monthly', 'trial_ends_at' => now()->addDays(30),
        ]);

        return $company;
    }

    // ── Export ────────────────────────────────────────────────────────────────

    public function test_export_tous_les_clients_en_csv(): void
    {
        $this->clientWith(Subscription::TRIAL, 'BTP Kouassi', 'kouassi@ex.com');

        $resp = $this->actingAs($this->superAdmin())->get('/superadmin/clients/export');

        $resp->assertOk();
        $csv = $resp->streamedContent();
        $this->assertStringContainsString('Statut', $csv);          // en-tête
        $this->assertStringContainsString('BTP Kouassi', $csv);     // entreprise
        $this->assertStringContainsString('kouassi@ex.com', $csv);  // e-mail contact
    }

    public function test_export_inclut_tous_les_statuts(): void
    {
        $this->clientWith(Subscription::EXPIRED, 'Client Expire');
        $this->clientWith(Subscription::FREE, 'Client Decouverte');

        $csv = $this->actingAs($this->superAdmin())->get('/superadmin/clients/export')->streamedContent();

        $this->assertStringContainsString('Client Expire', $csv);
        $this->assertStringContainsString('Client Decouverte', $csv);
    }

    public function test_export_par_statut_filtre(): void
    {
        $this->clientWith(Subscription::ACTIVE, 'Client Actif');
        $this->clientWith(Subscription::TRIAL, 'Client Essai');

        $csv = $this->actingAs($this->superAdmin())->get('/superadmin/clients/export?status=active')->streamedContent();

        $this->assertStringContainsString('Client Actif', $csv);
        $this->assertStringNotContainsString('Client Essai', $csv);
    }

    public function test_export_refuse_aux_non_admin(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)->get('/superadmin/clients/export')->assertForbidden();
    }

    // ── Notification d'inscription ──────────────────────────────────────────────

    public function test_inscription_envoie_une_notification_admin(): void
    {
        Mail::fake();
        SubscriptionPlan::create([
            'name' => 'Découverte', 'slug' => 'decouverte', 'price_monthly' => 0, 'price_yearly' => 0,
            'currency' => 'XOF', 'max_users' => 1, 'max_projects' => 1, 'storage_gb' => 1, 'trial_days' => 0,
            'is_active' => true, 'sort_order' => 0,
        ]);

        $resp = $this->post('/register', [
            'name' => 'Awa Traoré', 'email' => 'awa@ex.com',
            'password' => 'Password123!', 'password_confirmation' => 'Password123!',
        ]);

        $resp->assertRedirect();
        // L'inscription est valide (utilisateur créé)…
        $this->assertDatabaseHas('users', ['email' => 'awa@ex.com']);
        // …et une notification part vers l'adresse d'administration.
        Mail::assertSent(NewRegistrationMail::class, function ($m) {
            return $m->hasTo(config('construiro.admin_notification_email'))
                && ($m->data['email'] ?? null) === 'awa@ex.com';
        });
    }
}
