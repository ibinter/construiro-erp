<?php

namespace Tests\Feature;

use App\Http\Middleware\DemoGuard;
use App\Models\Company;
use App\Models\Subscription;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Request;
use Tests\TestCase;

/**
 * Démo publique (cahier §4). Le code est inerte tant que demo.actif=false
 * (valeur par défaut de licence.config.json) — c'est ce que vérifient ces tests.
 */
class DemoPubliqueTest extends TestCase
{
    use RefreshDatabase;

    public function test_route_demo_404_quand_inactive(): void
    {
        // demo.actif=false par défaut → la démo n'est pas publiée.
        $this->get('/demo')->assertNotFound();
    }

    public function test_reset_ignore_quand_inactif(): void
    {
        $this->artisan('construiro:demo-reset')->assertSuccessful();
        $this->assertDatabaseMissing('companies', ['is_demo' => true]);
    }

    public function test_reset_force_cree_le_tenant_demo(): void
    {
        $this->artisan('construiro:demo-reset --force')->assertSuccessful();

        $this->assertDatabaseHas('companies', ['slug' => 'construiro-demo', 'is_demo' => true]);
        $company = Company::where('is_demo', true)->first();
        $this->assertSame(Subscription::DEMO, Subscription::where('company_id', $company->id)->first()->status);
    }

    public function test_demo_guard_bloque_les_actions_sensibles(): void
    {
        $demo = Company::factory()->create(['is_demo' => true]);
        $user = User::factory()->create(['company_id' => $demo->id]);

        $req = Request::create('/pdf/invoices/1', 'POST');
        $req->setUserResolver(fn () => $user);

        $resp = (new DemoGuard())->handle($req, fn () => response('ok'));

        $this->assertSame(403, $resp->getStatusCode());
    }

    public function test_demo_guard_laisse_passer_un_compte_reel(): void
    {
        $company = Company::factory()->create(['is_demo' => false]);
        $user = User::factory()->create(['company_id' => $company->id]);

        $req = Request::create('/pdf/invoices/1', 'POST');
        $req->setUserResolver(fn () => $user);

        $resp = (new DemoGuard())->handle($req, fn () => response('ok'));

        $this->assertSame(200, $resp->getStatusCode());
    }
}
