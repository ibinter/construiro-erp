<?php

namespace App\Services\Payment;

use App\Models\PaymentMethodConfig;
use App\Models\PaymentOrder;

class CinetPayGateway
{
    private ?PaymentMethodConfig $config;

    public function __construct()
    {
        $this->config = PaymentMethodConfig::where('type', 'electronic')
            ->where('is_active', true)
            ->first();
    }

    public function initiate(PaymentOrder $order): string
    {
        $apiKey = $this->config?->getConfigValue('cinetpay_api_key');
        $siteId = $this->config?->getConfigValue('cinetpay_site_id');

        // TODO: remplacer par appel réel à l'API CinetPay v2
        $params = http_build_query([
            'apikey'         => $apiKey,
            'site_id'        => $siteId,
            'transaction_id' => $order->reference,
            'amount'         => (int) $order->amount,
            'currency'       => $order->currency,
            'description'    => 'Abonnement CONSTRUIRO - ' . ($order->plan?->name ?? ''),
            'return_url'     => route('billing.payment.return', $order->reference),
            'notify_url'     => route('webhooks.cinetpay'),
            'customer_name'  => $order->company?->name ?? '',
            'customer_email' => $order->company?->users()->first()?->email ?? '',
        ]);

        return 'https://api.cinetpay.com/v2/?' . $params;
    }

    public function verifyWebhook(array $payload): bool
    {
        $secret = $this->config?->getConfigValue('cinetpay_secret');

        if (!$secret) {
            return false;
        }

        $expectedSig = hash('sha256',
            ($payload['cpm_site_id'] ?? '') .
            ($payload['cpm_trans_id'] ?? '') .
            ($payload['cpm_trans_date'] ?? '') .
            ($payload['cpm_amount'] ?? '') .
            ($payload['cpm_currency'] ?? '') .
            ($payload['signature'] ?? '') .
            $secret
        );

        return hash_equals($expectedSig, $payload['cpm_signature'] ?? '');
    }
}
