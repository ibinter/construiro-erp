<?php

namespace Tests\Feature;

use App\Mail\LifecycleEmail;
use App\Models\Company;
use App\Models\Subscription;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

/**
 * Séquence d'e-mails du cycle de vie (cahier §5.4, §8.6, §8.8).
 */
class LifecycleEmailsTest extends TestCase
{
    use RefreshDatabase;

    private function companyWithAdmin(): Company
    {
        Role::findOrCreate('super_admin', 'web');
        $company = Company::factory()->create();
        $user = User::factory()->create(['company_id' => $company->id]);
        $user->assignRole('super_admin');

        return $company;
    }

    private function runCmd(): void
    {
        $this->artisan('construiro:lifecycle-emails')->assertSuccessful();
    }

    public function test_onboarding_j1(): void
    {
        Mail::fake();
        $c = $this->companyWithAdmin();
        Subscription::create(['company_id' => $c->id, 'plan_id' => null, 'status' => Subscription::TRIAL,
            'billing_cycle' => 'monthly', 'starts_at' => now()->subDay(), 'trial_ends_at' => now()->addDays(29)]);

        $this->runCmd();

        Mail::assertSent(LifecycleEmail::class, fn ($m) => $m->stage === 'onboarding');
    }

    public function test_closing_j3(): void
    {
        Mail::fake();
        $c = $this->companyWithAdmin();
        Subscription::create(['company_id' => $c->id, 'plan_id' => null, 'status' => Subscription::TRIAL,
            'billing_cycle' => 'monthly', 'starts_at' => now()->subDays(27), 'trial_ends_at' => now()->addDays(3)]);

        $this->runCmd();

        Mail::assertSent(LifecycleEmail::class, fn ($m) => $m->stage === 'closing' && ($m->vars['daysLeft'] ?? null) === 3);
    }

    public function test_switched_to_decouverte_j0(): void
    {
        Mail::fake();
        $c = $this->companyWithAdmin();
        Subscription::create(['company_id' => $c->id, 'plan_id' => null, 'status' => Subscription::FREE,
            'billing_cycle' => 'monthly', 'trial_ends_at' => now()->subDay()]);

        $this->runCmd();

        Mail::assertSent(LifecycleEmail::class, fn ($m) => $m->stage === 'switched');
    }

    public function test_purge_warning_before_j90(): void
    {
        Mail::fake();
        $c = $this->companyWithAdmin();
        Subscription::create(['company_id' => $c->id, 'plan_id' => null, 'status' => Subscription::EXPIRED,
            'billing_cycle' => 'monthly', 'ends_at' => now()->subDays(83), 'purge_at' => now()->addDays(7)]);

        $this->runCmd();

        Mail::assertSent(LifecycleEmail::class, fn ($m) => $m->stage === 'purge');
    }

    public function test_idempotence_pas_de_double_envoi(): void
    {
        Mail::fake();
        $c = $this->companyWithAdmin();
        Subscription::create(['company_id' => $c->id, 'plan_id' => null, 'status' => Subscription::FREE,
            'billing_cycle' => 'monthly', 'trial_ends_at' => now()->subDay()]);

        $this->runCmd();
        $this->runCmd(); // deuxième passage : ne doit pas renvoyer

        Mail::assertSent(LifecycleEmail::class, 1);
    }
}
