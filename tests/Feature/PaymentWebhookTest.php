<?php

namespace Tests\Feature;

use App\Models\Company;
use App\Models\PaymentOrder;
use App\Services\Payment\CinetPayGateway;
use App\Services\Payment\PaymentService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Tests\TestCase;

/**
 * §37 — Tests webhook CinetPay
 *
 * 1. Signature HMAC invalide → 401
 * 2. Payload valide → confirmViaWebhook appelé, retourne 200
 * 3. Paiement dupliqué (event_id déjà confirmé) → idempotent, pas de doublon
 * 4. cpm_result != '00' (paiement échoué/montant incorrect) → order non confirmé
 */
class PaymentWebhookTest extends TestCase
{
    use RefreshDatabase;

    /** Payload CinetPay minimal valide */
    private function payload(array $overrides = []): array
    {
        return array_merge([
            'cpm_site_id'    => 'SITE123',
            'cpm_trans_id'   => 'PAY-WEBHOOK-001',
            'cpm_trans_date' => now()->format('Y-m-d H:i:s'),
            'cpm_amount'     => '150000',
            'cpm_currency'   => 'XOF',
            'signature'      => 'raw_sig',
            'cpm_signature'  => 'expected_hmac',
            'cpm_result'     => '00',
            'cpm_payid'      => 'PAYID_NEW_001',
        ], $overrides);
    }

    /** Crée une entreprise + commande de paiement minimales pour les tests. */
    private function createOrder(array $orderOverrides = []): PaymentOrder
    {
        $company = Company::create([
            'name'          => 'BTP Test SA',
            'slug'          => 'btp-test-sa-' . Str::random(4),
            'country'       => 'CI',
            'base_currency' => 'XOF',
            'locale'        => 'fr',
            'timezone'      => 'Africa/Abidjan',
            'is_active'     => true,
        ]);

        return PaymentOrder::create(array_merge([
            'reference'           => 'PAY-WEBHOOK-001',
            'company_id'          => $company->id,
            'amount'              => '150000.00',
            'currency'            => 'XOF',
            'billing_cycle'       => 'monthly',
            'payment_method_type' => 'electronic',
            'payment_method_sub'  => 'cinetpay',
            'status'              => PaymentOrder::STATUS_PENDING,
            'idempotency_key'     => Str::uuid()->toString(),
        ], $orderOverrides));
    }

    // ─── Test 1 : Signature HMAC invalide → 401 ──────────────────────────────

    /**
     * Un webhook avec une signature incorrecte doit être rejeté avec 401.
     * C'est la première ligne de défense contre les requêtes frauduleuses.
     */
    public function test_webhook_rejects_invalid_hmac_signature(): void
    {
        $this->mock(CinetPayGateway::class, function ($mock) {
            $mock->shouldReceive('verifyWebhook')->once()->andReturn(false);
        });

        $response = $this->postJson('/webhooks/cinetpay', $this->payload());

        $response->assertStatus(401)
                 ->assertJson(['error' => 'Invalid signature']);
    }

    // ─── Test 2 : Payload valide → confirmViaWebhook appelé ──────────────────

    /**
     * Un webhook valide (signature OK, order trouvé, cpm_result='00') doit
     * déclencher confirmViaWebhook et retourner { status: "ok" }.
     */
    public function test_valid_webhook_confirms_payment(): void
    {
        $this->createOrder(['reference' => 'PAY-WEBHOOK-001']);

        $this->mock(CinetPayGateway::class, function ($mock) {
            $mock->shouldReceive('verifyWebhook')->once()->andReturn(true);
        });

        $this->mock(PaymentService::class, function ($mock) {
            $mock->shouldReceive('confirmViaWebhook')->once();
        });

        $response = $this->postJson('/webhooks/cinetpay', $this->payload([
            'cpm_trans_id' => 'PAY-WEBHOOK-001',
            'cpm_payid'    => 'PAYID_NEW_001',
        ]));

        $response->assertOk()->assertJson(['status' => 'ok']);
    }

    // ─── Test 3 : Paiement dupliqué → idempotence ────────────────────────────

    /**
     * Si PaymentService::confirmViaWebhook est appelé avec un event_id déjà
     * confirmé, il doit retourner immédiatement sans modifier la commande
     * (vérification interne : event_id + status=confirmed → early return).
     */
    public function test_duplicate_payment_webhook_is_idempotent(): void
    {
        $order = $this->createOrder([
            'reference' => 'PAY-DUP-001',
            'status'    => PaymentOrder::STATUS_CONFIRMED,
            'event_id'  => 'cinetpay_ALREADY_PROCESSED',
        ]);

        /** @var PaymentService $service */
        $service = app(PaymentService::class);

        // Appel avec le même event_id → doit retourner sans crash ni doublon
        $service->confirmViaWebhook($order, 'cinetpay_ALREADY_PROCESSED', []);

        // La commande doit toujours être dans l'état confirmed, non modifié
        $this->assertEquals(PaymentOrder::STATUS_CONFIRMED, $order->fresh()->status);
        // L'event_id est inchangé
        $this->assertEquals('cinetpay_ALREADY_PROCESSED', $order->fresh()->event_id);
    }

    // ─── Test 4 : cpm_result != '00' → paiement non confirmé ────────────────

    /**
     * Si CinetPay retourne un résultat d'échec (cpm_result != '00'), la commande
     * ne doit PAS être confirmée. Cela couvre le cas d'un montant rejeté par
     * la passerelle (insuffisant, annulé, frauduleux, etc.).
     */
    public function test_failed_payment_result_is_not_confirmed(): void
    {
        $this->createOrder(['reference' => 'PAY-FAILED-001']);

        $this->mock(CinetPayGateway::class, function ($mock) {
            $mock->shouldReceive('verifyWebhook')->once()->andReturn(true);
        });

        // PaymentService::confirmViaWebhook NE doit PAS être appelé
        $this->mock(PaymentService::class, function ($mock) {
            $mock->shouldReceive('confirmViaWebhook')->never();
        });

        // cpm_result = '01' = échec (code d'erreur CinetPay, ex: montant insuffisant)
        $response = $this->postJson('/webhooks/cinetpay', $this->payload([
            'cpm_trans_id' => 'PAY-FAILED-001',
            'cpm_result'   => '01',
        ]));

        // Le webhook retourne 200 (pour éviter les retries CinetPay) mais n'active pas l'abonnement
        $response->assertOk()->assertJson(['status' => 'ok']);
    }
}
