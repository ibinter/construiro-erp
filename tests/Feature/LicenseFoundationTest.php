<?php

namespace Tests\Feature;

use App\Models\Company;
use App\Models\Project;
use App\Models\Site;
use App\Models\Subscription;
use App\Services\LicenseConfig;
use App\Services\LicenseStateResolver;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * Fondations du modèle de licence à 6 états (cahier IBIG v1.1) :
 * source unique, bascule ESSAI→Découverte, plafond chantiers.
 */
class LicenseFoundationTest extends TestCase
{
    use RefreshDatabase;

    public function test_source_unique_expose_les_valeurs_du_cahier(): void
    {
        $this->assertSame(30, LicenseConfig::essaiJours());
        $this->assertSame(7, LicenseConfig::graceJours());
        $this->assertSame(90, LicenseConfig::retentionJours());
        $this->assertSame(1, LicenseConfig::quotaChantiersGratuit());
        $this->assertContains('demo', LicenseConfig::etats());
        $this->assertContains('free', LicenseConfig::etats());
    }

    public function test_essai_echu_bascule_en_decouverte_sans_coupure(): void
    {
        $resolver = new LicenseStateResolver();
        $sub = new Subscription(['status' => Subscription::TRIAL, 'trial_ends_at' => now()->subDay()]);

        $this->assertSame(Subscription::FREE, $resolver->resolve($sub));

        $attrs = $resolver->transitionAttributes($sub);
        $this->assertSame(Subscription::FREE, $attrs['status']);
        $this->assertNull($attrs['ends_at']); // gratuit à vie : plus de date de fin
    }

    public function test_active_echu_passe_en_grace_puis_expired(): void
    {
        $resolver = new LicenseStateResolver();

        $enGrace = new Subscription(['status' => Subscription::ACTIVE, 'ends_at' => now()->subDay()]);
        $this->assertSame(Subscription::GRACE, $resolver->resolve($enGrace));

        $expire = new Subscription(['status' => Subscription::ACTIVE, 'ends_at' => now()->subDays(10)]);
        $this->assertSame(Subscription::EXPIRED, $resolver->resolve($expire));

        $attrs = $resolver->transitionAttributes($expire);
        $this->assertSame(Subscription::EXPIRED, $attrs['status']);
        $this->assertNotNull($attrs['purge_at']); // purge J+90 planifiée
    }

    public function test_export_ferme_en_decouverte_ouvert_en_essai(): void
    {
        $this->assertFalse((new Subscription(['status' => Subscription::FREE]))->canExport());
        $this->assertFalse((new Subscription(['status' => Subscription::DEMO]))->canExport());
        $this->assertTrue((new Subscription(['status' => Subscription::TRIAL]))->canExport());
        $this->assertTrue((new Subscription(['status' => Subscription::ACTIVE]))->canExport());
    }

    public function test_decouverte_plafonne_a_un_seul_chantier(): void
    {
        $company = Company::factory()->create();
        Subscription::create([
            'company_id'    => $company->id,
            'plan_id'       => null,
            'status'        => Subscription::FREE,
            'billing_cycle' => 'monthly',
        ]);

        $project = Project::create([
            'company_id' => $company->id,
            'code'       => 'PRJ-1',
            'name'       => 'Projet test',
            'type'       => 'batiment',
            'status'     => 'draft',
        ]);

        // 0 chantier : la création du 1er est autorisée
        \App\Services\LicenseGuard::checkChantierLimit($company->id);

        Site::create([
            'company_id' => $company->id,
            'project_id' => $project->id,
            'code'       => 'CH-1',
            'name'       => 'Chantier 1',
            'status'     => 'preparation',
        ]);

        // 1 chantier atteint le plafond Découverte (1) : le 2e est refusé (402)
        $this->expectException(\Symfony\Component\HttpKernel\Exception\HttpException::class);
        \App\Services\LicenseGuard::checkChantierLimit($company->id);
    }
}
