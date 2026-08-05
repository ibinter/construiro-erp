<?php

namespace Tests\Feature;

use App\Models\GuideRevisionFlag;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

/**
 * Console SuperAdmin — gestion des révisions du guide utilisateur.
 */
class GuideRevisionFlagTest extends TestCase
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

    public function test_index_accessible_au_superadmin(): void
    {
        GuideRevisionFlag::create([
            'module_key'     => 'projects',
            'needs_revision' => true,
            'reason'         => 'Feature X changed',
            'flagged_at'     => now(),
        ]);

        $this->actingAs($this->superAdmin)
            ->get('/superadmin/guide-revisions')
            ->assertOk();
    }

    public function test_index_refuse_aux_non_superadmin(): void
    {
        $normal = User::factory()->create();

        $this->actingAs($normal)
            ->get('/superadmin/guide-revisions')
            ->assertForbidden();
    }

    public function test_resolve_marque_le_flag_comme_revise(): void
    {
        $flag = GuideRevisionFlag::create([
            'module_key'     => 'invoicing',
            'needs_revision' => true,
            'flagged_at'     => now(),
        ]);

        $this->actingAs($this->superAdmin)
            ->post("/superadmin/guide-revisions/{$flag->id}/resolve")
            ->assertRedirect();

        $flag->refresh();
        $this->assertFalse($flag->needs_revision);
        $this->assertNotNull($flag->resolved_at);
    }

    public function test_reopen_reactive_une_revision(): void
    {
        $flag = GuideRevisionFlag::create([
            'module_key'     => 'stocks',
            'needs_revision' => false,
            'resolved_at'    => now(),
        ]);

        $this->actingAs($this->superAdmin)
            ->post("/superadmin/guide-revisions/{$flag->id}/reopen")
            ->assertRedirect();

        $flag->refresh();
        $this->assertTrue($flag->needs_revision);
        $this->assertNull($flag->resolved_at);
    }

    public function test_destroy_supprime_le_flag(): void
    {
        $flag = GuideRevisionFlag::create([
            'module_key'     => 'crm',
            'needs_revision' => true,
            'flagged_at'     => now(),
        ]);

        $this->actingAs($this->superAdmin)
            ->delete("/superadmin/guide-revisions/{$flag->id}")
            ->assertRedirect();

        $this->assertDatabaseMissing('guide_revision_flags', ['id' => $flag->id]);
    }
}
