<?php

namespace Tests\Feature;

use App\Models\Invoice;
use App\Models\Company;
use App\Models\User;
use App\Services\DocumentVerifier;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DocumentVerifierTest extends TestCase
{
    use RefreshDatabase;

    private Company $company;
    private User $user;

    protected function setUp(): void
    {
        parent::setUp();
        $this->company = Company::factory()->create();
        $this->user    = User::factory()->create(['company_id' => $this->company->id]);
    }

    public function test_stamp_generates_token_and_hash(): void
    {
        $invoice = Invoice::factory()->create(['company_id' => $this->company->id]);

        DocumentVerifier::stamp($invoice);
        $invoice->refresh();

        $this->assertNotNull($invoice->verify_token);
        $this->assertNotNull($invoice->document_hash);
        $this->assertEquals(48, strlen($invoice->verify_token));
        $this->assertEquals(64, strlen($invoice->document_hash)); // SHA-256 hex
    }

    public function test_verify_returns_true_for_intact_document(): void
    {
        $invoice = Invoice::factory()->create(['company_id' => $this->company->id]);
        DocumentVerifier::stamp($invoice);
        $invoice->refresh();

        $this->assertTrue(DocumentVerifier::verify($invoice));
    }

    public function test_verify_returns_false_when_document_altered(): void
    {
        $invoice = Invoice::factory()->create([
            'company_id' => $this->company->id,
            'total'      => 1000,
        ]);
        DocumentVerifier::stamp($invoice);

        // Modification frauduleuse directe en BDD (contournement du modèle)
        Invoice::where('id', $invoice->id)->update(['total' => 99999]);
        $invoice->refresh();

        $this->assertFalse(DocumentVerifier::verify($invoice));
    }

    public function test_resolve_by_token_finds_correct_document(): void
    {
        $invoice = Invoice::factory()->create(['company_id' => $this->company->id]);
        DocumentVerifier::stamp($invoice);
        $invoice->refresh();

        $result = DocumentVerifier::resolveByToken($invoice->verify_token);

        $this->assertNotNull($result);
        $this->assertEquals('invoice', $result['type']);
        $this->assertEquals($invoice->id, $result['document']->id);
    }

    public function test_resolve_by_token_returns_null_for_unknown_token(): void
    {
        $result = DocumentVerifier::resolveByToken('nonexistenttoken12345678901234567890123456789012');

        $this->assertNull($result);
    }

    public function test_public_verify_page_shows_authentic_for_valid_token(): void
    {
        $invoice = Invoice::factory()->create(['company_id' => $this->company->id]);
        DocumentVerifier::stamp($invoice);
        $invoice->refresh();

        $response = $this->get(route('verify.document', $invoice->verify_token));

        $response->assertStatus(200);
        $response->assertInertia(fn($page) => $page
            ->component('Verify/Show')
            ->where('status', 'authentic')
        );
    }

    public function test_public_verify_page_shows_not_found_for_invalid_token(): void
    {
        $response = $this->get(route('verify.document', str_repeat('x', 48)));

        $response->assertStatus(200);
        $response->assertInertia(fn($page) => $page
            ->component('Verify/Show')
            ->where('status', 'not_found')
        );
    }
}
