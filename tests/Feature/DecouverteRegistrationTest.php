<?php

namespace Tests\Feature;

use App\Models\Subscription;
use App\Models\SubscriptionPlan;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

/**
 * Parcours d'inscription (cahier §2) :
 *   - aucune formule / Découverte ⇒ palier gratuit « Découverte » à vie (FREE)
 *   - formule payante            ⇒ Essai de 30 jours (TRIAL)
 */
class DecouverteRegistrationTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        Mail::fake();

        SubscriptionPlan::create([
            'name' => 'Découverte', 'slug' => 'decouverte', 'price_monthly' => 0, 'price_yearly' => 0,
            'currency' => 'XOF', 'max_users' => 1, 'max_projects' => 1, 'storage_gb' => 1, 'trial_days' => 0,
            'is_active' => true, 'sort_order' => 0,
        ]);
        SubscriptionPlan::create([
            'name' => 'Pro', 'slug' => 'pro', 'price_monthly' => 89000, 'price_yearly' => 890000,
            'currency' => 'XOF', 'max_users' => 20, 'max_projects' => 50, 'storage_gb' => 20, 'trial_days' => 30,
            'is_active' => true, 'sort_order' => 3,
        ]);
    }

    private function payload(array $overrides = []): array
    {
        return array_merge([
            'name'                  => 'Jean BTP',
            'email'                 => 'jean@example.com',
            'password'              => 'Password123!',
            'password_confirmation' => 'Password123!',
        ], $overrides);
    }

    public function test_inscription_sans_formule_cree_un_palier_decouverte(): void
    {
        $this->post('/register', $this->payload())->assertRedirect();

        $sub = Subscription::latest()->first();
        $this->assertNotNull($sub);
        $this->assertSame(Subscription::FREE, $sub->status);
        $this->assertNull($sub->trial_ends_at);
        $this->assertNull($sub->ends_at);          // gratuit à vie
        $this->assertSame(1, $sub->chantierCap()); // plafond Découverte
    }

    public function test_inscription_avec_formule_decouverte_cree_free(): void
    {
        $plan = SubscriptionPlan::where('slug', 'decouverte')->first();

        $this->post('/register', $this->payload(['plan_id' => $plan->id]))->assertRedirect();

        $this->assertSame(Subscription::FREE, Subscription::latest()->first()->status);
    }

    public function test_inscription_avec_formule_payante_cree_un_essai_30j(): void
    {
        $plan = SubscriptionPlan::where('slug', 'pro')->first();

        $this->post('/register', $this->payload(['plan_id' => $plan->id]))->assertRedirect();

        $sub = Subscription::latest()->first();
        $this->assertSame(Subscription::TRIAL, $sub->status);
        $this->assertNotNull($sub->trial_ends_at);
        $this->assertEqualsWithDelta(30, now()->diffInDays($sub->trial_ends_at), 1);
    }
}
