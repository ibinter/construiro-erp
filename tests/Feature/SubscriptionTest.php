<?php

namespace Tests\Feature;

use App\Models\Company;
use App\Models\Subscription;
use App\Models\SubscriptionPlan;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class SubscriptionTest extends TestCase
{
    use RefreshDatabase;

    private Company $company;
    private User $user;
    private SubscriptionPlan $plan;

    protected function setUp(): void
    {
        parent::setUp();

        $this->company = Company::create([
            'name' => 'Test BTP', 'slug' => 'test-btp',
            'country' => 'CI', 'base_currency' => 'XOF',
            'locale' => 'fr', 'timezone' => 'Africa/Abidjan', 'is_active' => true,
        ]);

        // Minimal permissions for dashboard + billing
        foreach (['dashboard.view', 'administration.view'] as $perm) {
            Permission::findOrCreate($perm, 'web');
        }
        $role = Role::findOrCreate('super_admin', 'web');
        $role->syncPermissions(Permission::all());

        $this->user = User::create([
            'company_id' => $this->company->id,
            'name' => 'Admin Test',
            'email' => 'admin@test.com',
            'password' => Hash::make('password'),
            'email_verified_at' => now(),
        ]);
        $this->user->assignRole('super_admin');

        $this->plan = SubscriptionPlan::create([
            'name' => 'Starter', 'slug' => 'starter',
            'price_monthly' => 49000, 'price_yearly' => 470000,
            'currency' => 'XOF', 'max_users' => 5, 'max_projects' => 10,
            'storage_gb' => 5, 'is_active' => true, 'trial_days' => 14, 'sort_order' => 1,
        ]);
    }

    public function test_billing_page_loads(): void
    {
        $this->actingAs($this->user)
            ->get('/billing')
            ->assertOk()
            ->assertInertia(fn($p) => $p->component('Billing/Index'));
    }

    public function test_active_subscription_allows_dashboard(): void
    {
        Subscription::create([
            'company_id' => $this->company->id,
            'plan_id' => $this->plan->id,
            'status' => 'active',
            'billing_cycle' => 'monthly',
            'ends_at' => now()->addMonths(1),
        ]);

        $this->actingAs($this->user)
            ->get('/dashboard')
            ->assertOk();
    }

    public function test_activation_key_activates_subscription(): void
    {
        $key = str_repeat('a', 32);
        Subscription::create([
            'company_id' => $this->company->id,
            'plan_id' => $this->plan->id,
            'status' => 'trial',
            'billing_cycle' => 'monthly',
            'activation_key' => $key,
        ]);

        $this->actingAs($this->user)
            ->post('/billing/activate', ['activation_key' => $key])
            ->assertRedirect();

        $this->assertDatabaseHas('subscriptions', [
            'company_id' => $this->company->id,
            'status' => 'active',
            'activation_key' => null,
        ]);
    }
}
