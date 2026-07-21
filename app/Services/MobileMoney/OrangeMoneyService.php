<?php

namespace App\Services\MobileMoney;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class OrangeMoneyService
{
    // Orange Money Merchant Payment API (Côte d'Ivoire / Afrique de l'Ouest)
    // Endpoints sandbox : https://api.orange.com/orange-money-webpay/dev/v1/...
    // Production : https://api.orange.com/orange-money-webpay/ci/v1/...

    private string $baseUrl;
    private string $merchantKey;
    private string $channelUsersLogin;
    private string $channelUsersPIN;
    private string $notifUrl;
    private string $returnUrl;

    public function __construct()
    {
        $sandbox  = config('services.orange_money.sandbox', true);
        $country  = config('services.orange_money.country', 'ci');
        $this->baseUrl = $sandbox
            ? 'https://api.orange.com/orange-money-webpay/dev/v1'
            : "https://api.orange.com/orange-money-webpay/{$country}/v1";

        $this->merchantKey       = config('services.orange_money.merchant_key', '');
        $this->channelUsersLogin = config('services.orange_money.login', '');
        $this->channelUsersPIN   = config('services.orange_money.pin', '');
        $this->notifUrl  = config('services.orange_money.notif_url')  ?: url('/webhooks/mobile-money/orange');
        $this->returnUrl = config('services.orange_money.return_url') ?: url('/billing');
    }

    /**
     * Initialise un paiement Orange Money.
     *
     * @return array{payment_url: string, pay_token: string, notif_token: string}
     *
     * @throws \RuntimeException
     */
    public function initPayment(
        string $orderId,
        float  $amount,
        string $currency       = 'XOF',
        string $customerPhone  = ''
    ): array {
        // 1. Obtenir un token d'accès OAuth 2.0
        $tokenResponse = Http::withHeaders([
            'Authorization' => 'Basic ' . base64_encode("{$this->channelUsersLogin}:{$this->channelUsersPIN}"),
            'Content-Type'  => 'application/x-www-form-urlencoded',
        ])->asForm()->post('https://api.orange.com/oauth/v3/token', [
            'grant_type' => 'client_credentials',
        ]);

        if (! $tokenResponse->successful()) {
            Log::error('OrangeMoney token error', [
                'status'   => $tokenResponse->status(),
                'response' => $tokenResponse->body(),
            ]);
            throw new \RuntimeException('Orange Money : impossible d\'obtenir un token d\'accès.');
        }

        $accessToken = $tokenResponse->json('access_token');

        // 2. Initialiser le paiement marchand
        $response = Http::withToken($accessToken)
            ->withHeaders(['Content-Type' => 'application/json'])
            ->post("{$this->baseUrl}/webpayment", [
                'merchant_key' => $this->merchantKey,
                'currency'     => $currency,
                'order_id'     => $orderId,
                'amount'       => (int) $amount,
                'return_url'   => $this->returnUrl,
                'cancel_url'   => $this->returnUrl . '?status=cancelled',
                'notif_url'    => $this->notifUrl,
                'lang'         => 'fr',
                'reference'    => $orderId,
            ]);

        if (! $response->successful()) {
            Log::error('OrangeMoney init error', [
                'status'   => $response->status(),
                'response' => $response->body(),
                'order_id' => $orderId,
            ]);
            throw new \RuntimeException('Orange Money : erreur lors de l\'initialisation du paiement.');
        }

        // Retourne : { payment_url, pay_token, notif_token }
        return $response->json();
    }

    /**
     * Vérifie la signature HMAC-SHA256 envoyée par Orange Money dans le webhook.
     * En-tête : X-Orange-Signature
     */
    public function verifyWebhookSignature(string $rawBody, string $signature): bool
    {
        $secret = config('services.orange_money.webhook_secret', '');

        if (empty($secret)) {
            Log::warning('OrangeMoney webhook: webhook_secret non configuré — vérification ignorée.');
            return true; // En développement sans secret, on laisse passer
        }

        $expected = hash_hmac('sha256', $rawBody, $secret);

        return hash_equals($expected, $signature);
    }
}
