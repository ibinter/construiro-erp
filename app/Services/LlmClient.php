<?php

namespace App\Services;

use App\Models\AiSetting;
use Illuminate\Support\Facades\Http;
use RuntimeException;

/**
 * Client d'appel aux fournisseurs LLM configurés par l'entreprise.
 * Supporte les API compatibles OpenAI (Grok, OpenAI) et l'API Anthropic (Claude).
 * La clé provient toujours de la configuration de l'entreprise (AiSetting).
 */
class LlmClient
{
    /**
     * Envoie un prompt et renvoie la réponse texte du modèle.
     *
     * @throws RuntimeException en cas d'échec (le contrôleur retombe alors sur les règles).
     */
    public function chat(AiSetting $setting, string $systemPrompt, string $userMessage): string
    {
        if (! $setting->isOperational()) {
            throw new RuntimeException('Fournisseur IA non configuré.');
        }

        return $setting->provider === 'anthropic'
            ? $this->anthropic($setting, $systemPrompt, $userMessage)
            : $this->openAiCompatible($setting, $systemPrompt, $userMessage);
    }

    /** Grok (xAI) et OpenAI : endpoint /chat/completions. */
    private function openAiCompatible(AiSetting $setting, string $system, string $user): string
    {
        $response = Http::withToken($setting->api_key)
            ->timeout(30)
            ->acceptJson()
            ->post(rtrim($setting->effectiveBaseUrl(), '/').'/chat/completions', [
                'model'       => $setting->effectiveModel(),
                'temperature' => 0.3,
                'messages'    => [
                    ['role' => 'system', 'content' => $system],
                    ['role' => 'user', 'content' => $user],
                ],
            ]);

        if ($response->failed()) {
            throw new RuntimeException('Erreur fournisseur ('.$response->status().') : '.$response->body());
        }

        $content = data_get($response->json(), 'choices.0.message.content');

        return is_string($content) && $content !== ''
            ? trim($content)
            : throw new RuntimeException('Réponse vide du fournisseur.');
    }

    /** Anthropic (Claude) : endpoint /messages. */
    private function anthropic(AiSetting $setting, string $system, string $user): string
    {
        $response = Http::withHeaders([
            'x-api-key'         => $setting->api_key,
            'anthropic-version' => '2023-06-01',
        ])
            ->timeout(30)
            ->acceptJson()
            ->post(rtrim($setting->effectiveBaseUrl(), '/').'/messages', [
                'model'      => $setting->effectiveModel(),
                'max_tokens' => 1024,
                'system'     => $system,
                'messages'   => [
                    ['role' => 'user', 'content' => $user],
                ],
            ]);

        if ($response->failed()) {
            throw new RuntimeException('Erreur fournisseur ('.$response->status().') : '.$response->body());
        }

        $content = data_get($response->json(), 'content.0.text');

        return is_string($content) && $content !== ''
            ? trim($content)
            : throw new RuntimeException('Réponse vide du fournisseur.');
    }
}
