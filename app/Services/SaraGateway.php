<?php

namespace App\Services;

use App\Models\AiSetting;
use App\Models\AiUsageLog;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

/**
 * Passerelle IA multi-fournisseur pour SARA.
 *
 * Lit la configuration globale de la plateforme (AiSetting::current())
 * et route l'appel vers le bon fournisseur : Groq, OpenAI, Anthropic,
 * Google Gemini ou Mistral.
 *
 * Utilisé par :
 *  - SaraController   → chatbot public de la landing page
 *  - AiAssistantController → assistant interne en repli si aucune
 *    config d'entreprise n'est opérationnelle
 */
class SaraGateway
{
    private AiSetting $config;

    public function __construct()
    {
        $this->config = AiSetting::current();
    }

    /**
     * Envoie les messages au fournisseur configuré et renvoie la réponse texte.
     *
     * @param  array<int, array{role: string, content: string}>  $messages
     *         Messages conversation (sans le system prompt).
     * @param  string|null  $systemPrompt  Instruction système à injecter.
     * @param  string|null  $context       Contexte d'appel : public, internal, support.
     */
    public function chat(array $messages, ?string $systemPrompt = null, ?string $context = null): string
    {
        if (! $this->config->sara_enabled) {
            return 'SARA est temporairement désactivée.';
        }

        // --- Vérification du quota journalier par société ----------------------
        $companyId = auth()->user()?->company_id;

        if ($companyId !== null) {
            $dailyLimit = $this->config->getConfigValue('daily_limit_per_company');

            if ($dailyLimit !== null && (int) $dailyLimit > 0) {
                $todayCount = AiUsageLog::todayCountForCompany((int) $companyId);

                if ($todayCount >= (int) $dailyLimit) {
                    return 'Quota journalier atteint. Veuillez réessayer demain ou contacter support@ibigsoft.com.';
                }
            }
        }

        // --- RAG — Enrichissement du prompt avec la base de connaissances ------
        $ragContext = '';
        try {
            $lastMessage = end($messages)['content'] ?? '';
            if (strlen($lastMessage) >= 3) {
                $kbResults = \App\Models\KnowledgeBase::search($lastMessage, 3);
                if ($kbResults->isNotEmpty()) {
                    $ragContext = "\n\n--- INFORMATIONS OFFICIELLES CONSTRUIRO (à utiliser en priorité) ---\n";
                    foreach ($kbResults as $kb) {
                        $ragContext .= "\n## " . $kb->title_fr . "\n" . $kb->content_fr . "\n";
                    }
                    $ragContext .= "--- FIN DES INFORMATIONS ---\n";
                }
            }
        } catch (\Throwable) {
            // Ne jamais bloquer le chat à cause du RAG
        }

        $enhancedSystemPrompt = ($systemPrompt ?? '') . $ragContext;

        // --- Appel fournisseur avec mesure du temps ----------------------------
        $startTime    = microtime(true);
        $errorMessage = null;
        $success      = true;

        try {
            $response = match ($this->config->provider) {
                AiSetting::PROVIDER_GROQ      => $this->callGroq($messages, $enhancedSystemPrompt),
                AiSetting::PROVIDER_OPENAI    => $this->callOpenAI($messages, $enhancedSystemPrompt),
                AiSetting::PROVIDER_ANTHROPIC => $this->callAnthropic($messages, $enhancedSystemPrompt),
                AiSetting::PROVIDER_GOOGLE    => $this->callGoogle($messages, $enhancedSystemPrompt),
                AiSetting::PROVIDER_MISTRAL   => $this->callMistral($messages, $enhancedSystemPrompt),
                // Grok (xAI) : endpoint OpenAI-compatible
                AiSetting::PROVIDER_GROK      => $this->callOpenAICompatible(
                    $messages, $enhancedSystemPrompt,
                    $this->apiKey('GROK_API_KEY'),
                    'https://api.x.ai/v1/chat/completions',
                    $this->config->model ?? 'grok-2-latest',
                ),
                default => $this->callGroq($messages, $enhancedSystemPrompt),
            };
        } catch (\Throwable $e) {
            $success      = false;
            $errorMessage = substr($e->getMessage(), 0, 500);
            $response     = 'Je rencontre une difficulté technique. Contactez-nous : contact@ibigsoft.com';
        }

        $responseTime = (int) ((microtime(true) - $startTime) * 1000);

        // --- Journal d'utilisation ---------------------------------------------
        // Approximation : 4 caractères ≈ 1 token (heuristique universelle)
        $inputTokens  = (int) (strlen(json_encode($messages)) / 4);
        $outputTokens = (int) (strlen($response) / 4);

        try {
            AiUsageLog::create([
                'company_id'       => $companyId,
                'user_id'          => auth()->id(),
                'context'          => $context ?? 'internal',
                'provider'         => $this->config->provider ?? 'groq',
                'model'            => $this->config->model ?? 'llama-3.1-8b-instant',
                'input_tokens'     => $inputTokens,
                'output_tokens'    => $outputTokens,
                'total_tokens'     => $inputTokens + $outputTokens,
                'response_time_ms' => $responseTime,
                'success'          => $success,
                'error_message'    => $errorMessage,
            ]);
        } catch (\Throwable $e) {
            // Ne jamais bloquer l'utilisateur à cause du journal
            Log::warning('SaraGateway: impossible d'enregistrer le log IA', ['error' => $e->getMessage()]);
        }

        return $response;
    }

    public function isEnabled(): bool
    {
        return (bool) $this->config->sara_enabled;
    }

    public function getProvider(): string
    {
        return $this->config->provider ?? AiSetting::PROVIDER_GROQ;
    }

    // ---------- Fournisseurs privés --------------------------------------------

    private function callGroq(array $messages, ?string $system): string
    {
        return $this->callOpenAICompatible(
            $messages, $system,
            $this->apiKey('GROQ_API_KEY', 'groq.key'),
            'https://api.groq.com/openai/v1/chat/completions',
            $this->config->model ?? 'llama-3.1-8b-instant',
        );
    }

    private function callOpenAI(array $messages, ?string $system): string
    {
        return $this->callOpenAICompatible(
            $messages, $system,
            $this->apiKey('OPENAI_API_KEY'),
            'https://api.openai.com/v1/chat/completions',
            $this->config->model ?? 'gpt-4o-mini',
        );
    }

    private function callMistral(array $messages, ?string $system): string
    {
        return $this->callOpenAICompatible(
            $messages, $system,
            $this->apiKey('MISTRAL_API_KEY'),
            'https://api.mistral.ai/v1/chat/completions',
            $this->config->model ?? 'mistral-small-latest',
        );
    }

    /**
     * Appel générique vers un endpoint OpenAI-compatible (/chat/completions).
     * Réutilisé par Groq, OpenAI, Mistral et Grok.
     */
    private function callOpenAICompatible(
        array $messages,
        ?string $system,
        string $apiKey,
        string $endpoint,
        string $model,
    ): string {
        $msgs = $system
            ? array_merge([['role' => 'system', 'content' => $system]], $messages)
            : $messages;

        $response = Http::withToken($apiKey)
            ->timeout(30)
            ->acceptJson()
            ->post($endpoint, [
                'model'       => $model,
                'messages'    => $msgs,
                'max_tokens'  => $this->config->max_tokens ?? 1024,
                'temperature' => (float) ($this->config->temperature ?? 0.7),
            ]);

        if ($response->failed()) {
            Log::warning('SaraGateway: erreur fournisseur', [
                'provider' => $this->config->provider,
                'status'   => $response->status(),
            ]);

            return 'Je rencontre une difficulté technique. Contactez-nous : contact@ibigsoft.com';
        }

        return trim($response->json('choices.0.message.content') ?? 'Erreur de réponse.');
    }

    private function callAnthropic(array $messages, ?string $system): string
    {
        $apiKey = $this->apiKey('ANTHROPIC_API_KEY');

        $body = [
            'model'      => $this->config->model ?? 'claude-haiku-4-5-20251001',
            'max_tokens' => $this->config->max_tokens ?? 1024,
            'messages'   => $messages,
        ];

        if ($system) {
            $body['system'] = $system;
        }

        $response = Http::withHeaders([
            'x-api-key'         => $apiKey,
            'anthropic-version' => '2023-06-01',
        ])
            ->timeout(30)
            ->acceptJson()
            ->post('https://api.anthropic.com/v1/messages', $body);

        if ($response->failed()) {
            Log::warning('SaraGateway: erreur Anthropic', ['status' => $response->status()]);

            return 'Je rencontre une difficulté technique. Contactez-nous : contact@ibigsoft.com';
        }

        return trim($response->json('content.0.text') ?? 'Erreur de réponse.');
    }

    private function callGoogle(array $messages, ?string $system): string
    {
        $apiKey = $this->apiKey('GOOGLE_AI_API_KEY');
        $model  = $this->config->model ?? 'gemini-1.5-flash';

        // Convertir le format OpenAI → format Gemini
        $contents = array_map(
            fn ($m) => [
                'role'  => $m['role'] === 'assistant' ? 'model' : 'user',
                'parts' => [['text' => $m['content']]],
            ],
            $messages,
        );

        $body = [
            'contents'         => $contents,
            'generationConfig' => [
                'maxOutputTokens' => $this->config->max_tokens ?? 1024,
                'temperature'     => (float) ($this->config->temperature ?? 0.7),
            ],
        ];

        if ($system) {
            $body['systemInstruction'] = ['parts' => [['text' => $system]]];
        }

        $response = Http::timeout(30)
            ->acceptJson()
            ->post(
                "https://generativelanguage.googleapis.com/v1beta/models/{$model}:generateContent?key={$apiKey}",
                $body,
            );

        if ($response->failed()) {
            Log::warning('SaraGateway: erreur Google Gemini', ['status' => $response->status()]);

            return 'Je rencontre une difficulté technique. Contactez-nous : contact@ibigsoft.com';
        }

        return trim($response->json('candidates.0.content.parts.0.text') ?? 'Erreur de réponse.');
    }

    // ---------- Helpers --------------------------------------------------------

    /**
     * Résout la clé API dans l'ordre : config BDD → variable d'env → config Laravel.
     */
    private function apiKey(string $envKey, ?string $configKey = null): string
    {
        $fromDb = $this->config->getConfigValue('api_key');
        if (! empty($fromDb)) {
            return $fromDb;
        }

        // Clé directement sur le modèle (champ api_key chiffré)
        if (! empty($this->config->api_key)) {
            return $this->config->api_key;
        }

        // Fallback variable d'environnement
        if ($configKey && config("services.{$configKey}")) {
            return config("services.{$configKey}");
        }

        return (string) env($envKey, '');
    }
}
