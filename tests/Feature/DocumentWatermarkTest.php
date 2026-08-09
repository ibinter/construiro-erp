<?php

namespace Tests\Feature;

use App\Models\Company;
use App\Models\Subscription;
use App\Services\DocumentWatermark;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * Filigrane des documents (cahier §3.5) : présent aux paliers Découverte/Demo,
 * retiré dès qu'un abonnement est actif.
 */
class DocumentWatermarkTest extends TestCase
{
    use RefreshDatabase;

    private function companyWith(string $status): Company
    {
        $company = Company::factory()->create();
        Subscription::create([
            'company_id' => $company->id,
            'plan_id'    => null,
            'status'     => $status,
            'billing_cycle' => 'monthly',
        ]);

        return $company;
    }

    public function test_filigrane_present_en_decouverte(): void
    {
        $c = $this->companyWith(Subscription::FREE);
        $this->assertTrue(DocumentWatermark::shouldStamp($c->id));
        $this->assertStringContainsString('CONSTRUIRO', DocumentWatermark::forCompany($c->id));
    }

    public function test_filigrane_absent_en_abonnement_actif(): void
    {
        $c = $this->companyWith(Subscription::ACTIVE);
        $this->assertFalse(DocumentWatermark::shouldStamp($c->id));
        $this->assertNull(DocumentWatermark::forCompany($c->id));
    }

    public function test_filigrane_absent_sans_societe(): void
    {
        $this->assertFalse(DocumentWatermark::shouldStamp(null));
    }
}
