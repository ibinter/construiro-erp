<?php

namespace Tests\Feature;

use App\Models\Company;
use App\Models\SupportTicket;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class SupportTicketTest extends TestCase
{
    use RefreshDatabase;

    private function makeUser(string $email = 'u@test.com'): User
    {
        $company = Company::create([
            'name' => "Co {$email}", 'slug' => str_replace('@', '-', $email),
            'country' => 'CI', 'base_currency' => 'XOF',
            'locale' => 'fr', 'timezone' => 'Africa/Abidjan', 'is_active' => true,
        ]);

        $role = Role::findOrCreate('super_admin', 'web');

        $user = User::create([
            'company_id' => $company->id,
            'name' => 'Test User',
            'email' => $email,
            'password' => Hash::make('password'),
            'email_verified_at' => now(),
        ]);
        $user->assignRole('super_admin');
        return $user;
    }

    public function test_support_index_loads(): void
    {
        $this->actingAs($this->makeUser())
            ->get('/support')
            ->assertOk()
            ->assertInertia(fn($p) => $p->component('Support/Index'));
    }

    public function test_user_can_create_ticket(): void
    {
        $user = $this->makeUser();

        $this->actingAs($user)
            ->post('/support', [
                'subject' => 'Problème de connexion',
                'description' => 'Je n\'arrive pas à me connecter depuis hier.',
                'priority' => 'high',
                'category' => 'technical',
            ])
            ->assertRedirect();

        $this->assertDatabaseHas('support_tickets', [
            'company_id' => $user->company_id,
            'subject' => 'Problème de connexion',
            'priority' => 'high',
            'status' => 'new',
        ]);
    }

    public function test_user_cannot_see_other_company_ticket(): void
    {
        $otherUser = $this->makeUser('other@test.com');

        $ticket = SupportTicket::create([
            'company_id' => $otherUser->company_id,
            'user_id' => $otherUser->id,
            'subject' => 'Ticket privé',
            'description' => 'Confidentiel',
            'priority' => 'low',
            'status' => 'new',
        ]);

        $user = $this->makeUser('me@test.com');
        $this->actingAs($user)
            ->get("/support/{$ticket->id}")
            ->assertForbidden();
    }
}
