<?php

namespace App\Services\MobileMoney;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class MtnMomoService
{
    // MTN MoMo Collections API
    // Sandbox : https://sandbox.momodeveloper.mtn.com
    // Production proxy : https://proxy.momoapi.mtn.com

    private string $baseUrl;
    private string $subscriptionKey;
    private string $apiUser;
    private string $apiKey;
    private string $environment;

    public function __construct()
    {
        $this->environment     = config('services.mtn_momo.environment', 'sandbox');
        $isSandbox             = $this->environment === 'sandbox';
        $this->baseUrl         = $isSandbox
            ? 'https://sandbox.momodeveloper.mtn.com'
            : 'https://proxy.momoapi.mtn.com';
        $this->subscriptionKey = config('services.mtn_momo.subscription_key', '');
        $this->apiUser         = config('services.mtn_momo.api_user', '');
        $this->apiKey          = config('services.mtn_momo.api_key', '');
    }

    /**
     * Obtient un token d'accès OAuth 2.0 MTN MoMo Collections.
     *
     * @throws \RuntimeException
     */
    private function getAccessToken(): string
    {
        $response = Http::withHeaders([
            'Ocp-Apim-Subscription-Key' => $this->subscriptionKey,
        ])->withBasicAuth($this->apiUser, $this->apiKey)
          ->post("{$this->baseUrl}/collection/token/");

        if (! $response->successful()) {
            Log::error('MtnMoMo token error', [
                'status'   => $response->status(),
                'response' => $response->body(),
            ]);
            throw new \RuntimeException('MTN MoMo : impossible d\'obtenir un token d\'accès.');
        }

        return $response->json('access_token');
    }

    /**
     * Demande un paiement à l'abonné MTN (Request to Pay).
     * Le client reçoit une notification sur son téléphone pour valider.
     *
     * @return string $referenceId — UUID à stocker pour vérifier le statut ultérieurement
     *
     * @throws \RuntimeException
     */
    public function requestToPay(
        string $externalId,
        float  $amount,
        string $msisdn,
        string $currency = 'XOF',
        string $note     = 'Paiement CONSTRUIRO ERP'
    ): string {
        $referenceId = Str::uuid()->toString();
        $accessToken = $this->getAccessToken();

        $response = Http::withToken($accessToken)
            ->withHeaders([
                'X-Reference-Id'            => $referenceId,
                'X-Target-Environment'      => $this->environment,
                'Ocp-Apim-Subscription-Key' => $this->subscriptionKey,
                'Content-Type'              => 'application/json',
            ])
            ->post("{$this->baseUrl}/collection/v1_0/requesttopay", [
                'amount'     => (string) (int) $amount,
                'currency'   => $currency,
                'externalId' => $externalId,
                'payer'      => [
                    'partyIdType' => 'MSISDN',
                    'partyId'     => ltrim($msisdn, '+'),
                ],
                'payerMessage' => $note,
                'payeeNote'    => $note,
            ]);

        if ($response->status() !== 202) {
            Log::error('MtnMoMo requestToPay error', [
                'status'      => $response->status(),
                'body'        => $response->body(),
                'external_id' => $externalId,
                'msisdn'      => $msisdn,
            ]);
            throw new \RuntimeException('MTN MoMo : erreur lors de la demande de paiement (statut ' . $response->status() . ').');
        }

        return $referenceId;
    }

    /**
     * Vérifie le statut d'une transaction MTN MoMo.
     *
     * @return array{status: string, ...} status = PENDING | SUCCESSFUL | FAILED
     */
    public function getTransactionStatus(string $referenceId): array
    {
        $accessToken = $this->getAccessToken();

        $response = Http::withToken($accessToken)
            ->withHeaders([
                'X-Target-Environment'      => $this->environment,
                'Ocp-Apim-Subscription-Key' => $this->subscriptionKey,
            ])
            ->get("{$this->baseUrl}/collection/v1_0/requesttopay/{$referenceId}");

        if (! $response->successful()) {
            Log::warning('MtnMoMo getTransactionStatus error', [
                'referenceId' => $referenceId,
                'status'      => $response->status(),
            ]);
            return ['status' => 'PENDING'];
        }

        return $response->json();
    }

    /**
     * Vérifie la signature HMAC optionnelle du webhook MTN.
     * MTN MoMo ne standardise pas encore la signature des callbacks —
     * en production on vérifie le statut via l'API plutôt que par HMAC.
     */
    public function verifyWebhookSignature(string $rawBody, string $signature): bool
    {
        $secret = config('services.mtn_momo.webhook_secret', '');

        if (empty($secret)) {
            // MTN ne signe pas encore les webhooks sandbox
            return true;
        }

        $expected = hash_hmac('sha256', $rawBody, $secret);

        return hash_equals($expected, $signature);
    }
}
