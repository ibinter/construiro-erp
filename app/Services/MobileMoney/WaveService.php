<?php

namespace App\Services\MobileMoney;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class WaveService
{
    // Wave CI — API Checkout
    // Docs : https://docs.wave.com/
    private string $apiKey;
    private string $baseUrl = 'https://api.wave.com/v1';

    public function __construct()
    {
        $this->apiKey = config('services.wave.api_key', '');
    }

    /**
     * Crée une session de paiement Wave.
     *
     * @return array{id: string, wave_launch_url: string, client_reference: string, ...}
     *
     * @throws \RuntimeException
     */
    public function createCheckout(
        string $orderId,
        float  $amount,
        string $currency   = 'XOF',
        string $successUrl = '',
        string $errorUrl   = ''
    ): array {
        $response = Http::withToken($this->apiKey)
            ->withHeaders(['Content-Type' => 'application/json'])
            ->post("{$this->baseUrl}/checkout/sessions", [
                'amount'           => (string) (int) $amount,
                'currency'         => $currency,
                'success_url'      => $successUrl ?: url('/billing?status=success'),
                'error_url'        => $errorUrl   ?: url('/billing?status=error'),
                'client_reference' => $orderId,
            ]);

        if (! $response->successful()) {
            Log::error('Wave checkout error', [
                'status'   => $response->status(),
                'response' => $response->body(),
                'order_id' => $orderId,
            ]);
            throw new \RuntimeException('Wave : erreur lors de la création du checkout.');
        }

        // Retourne : { id, wave_launch_url, client_reference, ... }
        return $response->json();
    }

    /**
     * Vérifie la signature HMAC-SHA256 du webhook Wave.
     *
     * Wave envoie l'en-tête : Wave-Signature: t=<timestamp>,v=<hmac_sha256>
     * La chaîne signée est : "<timestamp>.<rawBody>"
     */
    public function verifyWebhookSignature(string $rawBody, string $signatureHeader): bool
    {
        $secret = config('services.wave.webhook_secret', '');

        if (empty($secret)) {
            Log::warning('Wave webhook: webhook_secret non configuré — vérification ignorée.');
            return true;
        }

        // Extraire timestamp et hash depuis l'en-tête "t=xxx,v=yyy"
        $parts = [];
        foreach (explode(',', $signatureHeader) as $part) {
            [$key, $val] = array_pad(explode('=', $part, 2), 2, '');
            $parts[trim($key)] = trim($val);
        }

        $timestamp = $parts['t'] ?? null;
        $received  = $parts['v'] ?? null;

        if (! $timestamp || ! $received) {
            return false;
        }

        // Tolérance de 5 minutes sur l'horodatage
        if (abs(time() - (int) $timestamp) > 300) {
            Log::warning('Wave webhook: horodatage trop ancien', ['timestamp' => $timestamp]);
            return false;
        }

        $expected = hash_hmac('sha256', "{$timestamp}.{$rawBody}", $secret);

        return hash_equals($expected, $received);
    }
}
