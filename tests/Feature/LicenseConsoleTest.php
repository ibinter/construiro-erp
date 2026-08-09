<?php

namespace Tests\Feature;

use App\Models\Company;
use App\Models\LicenseTransition;
use App\Models\Subscription;
use App\Models\SubscriptionPlan;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

/**
 * Console SuperAdmin — actions de licence + journal append-only (cahier §12.6).
 */
class LicenseConsoleTest extends TestCase
{
    use RefreshDatabase;

    private User $superAdmin;

    protected function setUp(): void
    {
        parent::setUp();
        Role::findOrCreate('ibig_superadmin', 'web');
        $this->superAdmin = User::factory()->create();
        $this->superAdmin->assignRole('ibig_superadmin');
    }

    private function companyInGrace(): Company
    {
        $company = Company::factory()->create();
        Subscription::create([
            'company_id' => $company->id, 'plan_id' => null, 'status' => Subscription::GRACE,
            'billing_cycle' => 'monthly', 'ends_at' => now()->subDay(), 'grace_ends_at' => now()->addDays(3),
        ]);

        return $company;
    }

    public function test_extend_grace_prolonge_et_journalise(): void
    {
        $company = $this->companyInGrace();

        $this->actingAs($this->superAdmin)
            ->post("/superadmin/clients/{$company->id}/extend-grace", ['reason' => 'Négociation en cours'])
            ->assertRedirect();

        $sub = Subscription::where('company_id', $company->id)->latest()->first();
        $this->assertNotNull($sub->trial_extended_at);
        $this->assertGreaterThan(now()->addDays(10), $sub->grace_ends_at);

        $this->assertDatabaseHas('license_transitions', [
            'company_id' => $company->id,
            'cause'      => LicenseTransition::CAUSE_SUPERADMIN,
        ]);
    }

    public function test_extend_grace_refuse_la_seconde_fois(): void
    {
        $company = $this->companyInGrace();
        $url = "/superadmin/clients/{$company->id}/extend-grace";

        $this->actingAs($this->superAdmin)->post($url, ['reason' => 'Première'])->assertRedirect();
        $this->actingAs($this->superAdmin)->post($url, ['reason' => 'Seconde'])
            ->assertSessionHas('error');
    }

    public function test_extend_grace_exige_un_motif(): void
    {
        $company = $this->companyInGrace();

        $this->actingAs($this->superAdmin)
            ->post("/superadmin/clients/{$company->id}/extend-grace", ['reason' => ''])
            ->assertSessionHasErrors('reason');
    }

    public function test_start_trial_cree_essai_et_journalise(): void
    {
        $company = Company::factory()->create();
        $plan = SubscriptionPlan::create([
            'name' => 'Pro', 'slug' => 'pro', 'price_monthly' => 89000, 'price_yearly' => 890000,
            'currency' => 'XOF', 'max_users' => 20, 'max_projects' => 50, 'storage_gb' => 20,
            'trial_days' => 30, 'is_active' => true, 'sort_order' => 3,
        ]);

        $this->actingAs($this->superAdmin)
            ->post("/superadmin/clients/{$company->id}/start-trial", ['plan_id' => $plan->id])
            ->assertRedirect();

        $sub = Subscription::where('company_id', $company->id)->latest()->first();
        $this->assertSame(Subscription::TRIAL, $sub->status);
        $this->assertEqualsWithDelta(30, now()->diffInDays($sub->trial_ends_at), 1);
        $this->assertDatabaseHas('license_transitions', [
            'company_id' => $company->id,
            'to_state'   => Subscription::TRIAL,
            'cause'      => LicenseTransition::CAUSE_SUPERADMIN,
        ]);
    }

    public function test_journal_est_append_only(): void
    {
        // Le modèle ne gère pas updated_at (immuable).
        $this->assertNull(LicenseTransition::UPDATED_AT);
    }
}
