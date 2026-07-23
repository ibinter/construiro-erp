<?php

namespace App\Services\Payment;

use App\Models\PaymentMethodConfig;

class ManualPaymentInstructionService
{
    public function getInstructions(string $methodType, string $locale = 'fr'): array
    {
        $config = PaymentMethodConfig::where('type', $methodType)
            ->where('is_active', true)
            ->first();

        if (!$config) {
            return [];
        }

        $field = $locale === 'en' ? 'instructions_en' : 'instructions_fr';

        return [
            'name'         => $config->name,
            'instructions' => $config->$field ?? $config->instructions_fr,
            'config'       => $this->getSafePublicConfig($config),
            'min_amount'   => $config->min_amount,
            'max_amount'   => $config->max_amount,
            'currency'     => $config->currency,
        ];
    }

    private function getSafePublicConfig(PaymentMethodConfig $config): array
    {
        $privateKeys = ['api_key', 'secret', 'password', 'token', 'private_key', 'webhook_secret'];
        $cfg = $config->config ?? [];

        return array_diff_key($cfg, array_flip($privateKeys));
    }
}
