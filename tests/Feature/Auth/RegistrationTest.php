<?php

namespace Tests\Feature\Auth;

use App\Models\SubscriptionPlan;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RegistrationTest extends TestCase
{
    use RefreshDatabase;

    public function test_registration_screen_can_be_rendered(): void
    {
        $response = $this->get('/register');

        $response->assertStatus(200);
    }

    public function test_new_users_can_register(): void
    {
        // Le flux d'inscription requiert un plan_id valide
        $plan = SubscriptionPlan::factory()->create(['is_active' => true]);

        $response = $this->post('/register', [
            'name'                  => 'Test User',
            'email'                 => 'test@example.com',
            'password'              => 'password',
            'password_confirmation' => 'password',
            'plan_id'               => $plan->id,
        ]);

        // L'inscription redirige vers la page de succès (pas auto-login)
        $response->assertRedirect(route('register.success'));
        $this->assertDatabaseHas('users', ['email' => 'test@example.com']);
    }
}
