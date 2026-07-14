<?php

namespace Tests\Feature;

use App\Models\Company;
use App\Models\Subscription;
use App\Models\SubscriptionPlan;
use App\Models\User;
use App\Services\LicenseGuard;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class LicenseGuardTest extends TestCase
{
    use RefreshDatabase;

    private Company $company;
    private User $admin;

    protected function setUp(): void
    {
        parent::setUp();

        $this->company = Company::factory()->create();
        $this->admin   = User::factory()->create(['company_id' => $this->company->id]);
        $this->admin->assignRole('admin');
    }

    public function test_user_creation_blocked_when_limit_reached(): void
    {
        $plan = SubscriptionPlan::factory()->create(['max_users' => 2]);
        Subscription::factory()->create([
            'company_id' => $this->company->id,
            'plan_id'    => $plan->id,
            'status'     => 'active',
            'starts_at'  => now()->subDay(),
            'ends_at'    => now()->addMonth(),
        ]);

        // Créer 2 utilisateurs (limite atteinte)
        User::factory()->count(2)->create(['company_id' => $this->company->id]);

        $this->expectException(\Symfony\Component\HttpKernel\Exception\HttpException::class);

        LicenseGuard::checkUserLimit($this->company->id);
    }

    public function test_user_creation_allowed_when_under_limit(): void
    {
        $plan = SubscriptionPlan::factory()->create(['max_users' => 10]);
        Subscription::factory()->create([
            'company_id' => $this->company->id,
            'plan_id'    => $plan->id,
            'status'     => 'active',
            'starts_at'  => now()->subDay(),
            'ends_at'    => now()->addMonth(),
        ]);

        User::factory()->count(3)->create(['company_id' => $this->company->id]);

        // Ne doit PAS lever d'exception
        LicenseGuard::checkUserLimit($this->company->id);

        $this->assertTrue(true);
    }

    public function test_unlimited_plan_never_blocks(): void
    {
        $plan = SubscriptionPlan::factory()->create(['max_users' => 9999]);
        Subscription::factory()->create([
            'company_id' => $this->company->id,
            'plan_id'    => $plan->id,
            'status'     => 'active',
            'starts_at'  => now()->subDay(),
            'ends_at'    => now()->addMonth(),
        ]);

        User::factory()->count(500)->create(['company_id' => $this->company->id]);

        LicenseGuard::checkUserLimit($this->company->id);

        $this->assertTrue(true);
    }

    public function test_usage_returns_correct_counts(): void
    {
        $plan = SubscriptionPlan::factory()->create(['max_users' => 5, 'max_projects' => 10]);
        Subscription::factory()->create([
            'company_id' => $this->company->id,
            'plan_id'    => $plan->id,
            'status'     => 'active',
            'starts_at'  => now()->subDay(),
            'ends_at'    => now()->addMonth(),
        ]);

        User::factory()->count(3)->create(['company_id' => $this->company->id]);

        $usage = LicenseGuard::usage($this->company->id);

        $this->assertArrayHasKey('users_count', $usage);
        $this->assertArrayHasKey('max_users', $usage);
        $this->assertEquals(5, $usage['max_users']);
    }
}
