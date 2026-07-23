<?php

namespace App\Models;

use App\Traits\BelongsToCompany;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Paramétrage IA. Deux usages :
 *  - company_id non nul  : config IA d'une entreprise (assistant interne).
 *  - company_id null     : config globale de la plateforme (SARA publique).
 *
 * La clé API est chiffrée au repos (cast 'encrypted').
 */
class AiSetting extends Model
{
    use BelongsToCompany;

    // ---------- Constantes fournisseurs ----------------------------------------
    const PROVIDER_GROQ      = 'groq';
    const PROVIDER_OPENAI    = 'openai';
    const PROVIDER_ANTHROPIC = 'anthropic';
    const PROVIDER_GOOGLE    = 'google';
    const PROVIDER_MISTRAL   = 'mistral';
    const PROVIDER_GROK      = 'grok';

    /** Modèles disponibles par fournisseur (pour le Select du SuperAdmin). */
    const MODELS = [
        'groq'      => ['llama-3.1-8b-instant', 'llama-3.3-70b-versatile', 'mixtral-8x7b-32768'],
        'openai'    => ['gpt-4o-mini', 'gpt-4o', 'gpt-3.5-turbo'],
        'anthropic' => ['claude-haiku-4-5-20251001', 'claude-sonnet-5'],
        'google'    => ['gemini-1.5-flash', 'gemini-1.5-pro'],
        'mistral'   => ['mistral-small-latest', 'mistral-medium-latest', 'open-mixtral-8x7b'],
        'grok'      => ['grok-2-latest', 'grok-beta'],
    ];

    /**
     * Fournisseurs supportés + valeurs par défaut (endpoint OpenAI-compatible
     * sauf Anthropic et Google). L'utilisateur fournit sa propre clé.
     */
    public const PROVIDERS = [
        'none' => [
            'label'    => 'Aucun (moteur de règles interne)',
            'base_url' => null,
            'model'    => null,
            'docs'     => null,
        ],
        'groq' => [
            'label'    => 'Groq (gratuit — Llama, Mixtral…)',
            'base_url' => 'https://api.groq.com/openai/v1',
            'model'    => 'llama-3.3-70b-versatile',
            'docs'     => 'https://console.groq.com/keys',
        ],
        'grok' => [
            'label'    => 'Grok (xAI)',
            'base_url' => 'https://api.x.ai/v1',
            'model'    => 'grok-2-latest',
            'docs'     => 'https://console.x.ai',
        ],
        'anthropic' => [
            'label'    => 'Claude (Anthropic)',
            'base_url' => 'https://api.anthropic.com/v1',
            'model'    => 'claude-sonnet-5',
            'docs'     => 'https://console.anthropic.com',
        ],
        'openai' => [
            'label'    => 'OpenAI (ChatGPT)',
            'base_url' => 'https://api.openai.com/v1',
            'model'    => 'gpt-4o-mini',
            'docs'     => 'https://platform.openai.com',
        ],
        'google' => [
            'label'    => 'Google Gemini',
            'base_url' => 'https://generativelanguage.googleapis.com/v1beta',
            'model'    => 'gemini-1.5-flash',
            'docs'     => 'https://aistudio.google.com/app/apikey',
        ],
        'mistral' => [
            'label'    => 'Mistral AI',
            'base_url' => 'https://api.mistral.ai/v1',
            'model'    => 'mistral-small-latest',
            'docs'     => 'https://console.mistral.ai/api-keys',
        ],
    ];

    protected $fillable = [
        'company_id', 'provider', 'api_key', 'model', 'base_url', 'enabled',
        'sara_enabled', 'max_tokens', 'temperature', 'config',
    ];

    protected $casts = [
        'api_key'      => 'encrypted',
        'enabled'      => 'boolean',
        'sara_enabled' => 'boolean',
        'max_tokens'   => 'integer',
        'temperature'  => 'float',
        'config'       => 'array',
    ];

    // ---------- Méthodes statiques ---------------------------------------------

    /**
     * Retourne la config globale de la plateforme (company_id = null).
     * Utilisé par SaraGateway pour le chatbot public.
     * Bypass le CompanyScope (pas d'utilisateur connecté en contexte public).
     */
    public static function current(): static
    {
        return static::withoutGlobalScopes()
            ->whereNull('company_id')
            ->first()
            ?? static::make([
                'provider'     => self::PROVIDER_GROQ,
                'model'        => 'llama-3.1-8b-instant',
                'sara_enabled' => true,
                'max_tokens'   => 1024,
                'temperature'  => 0.7,
            ]);
    }

    // ---------- Accesseurs / méthodes d'instance -------------------------------

    /** Lit une valeur dans le champ JSON `config`. */
    public function getConfigValue(string $key, mixed $default = null): mixed
    {
        return data_get($this->config, $key, $default);
    }

    /** Le fournisseur est-il opérationnel (activé, connu, clé présente) ? */
    public function isOperational(): bool
    {
        return $this->enabled
            && $this->provider !== 'none'
            && isset(self::PROVIDERS[$this->provider])
            && ! empty($this->api_key);
    }

    /** Modèle effectif (celui choisi, sinon la valeur par défaut du fournisseur). */
    public function effectiveModel(): ?string
    {
        return $this->model ?: (self::PROVIDERS[$this->provider]['model'] ?? null);
    }

    /** Base URL effective. */
    public function effectiveBaseUrl(): ?string
    {
        return $this->base_url ?: (self::PROVIDERS[$this->provider]['base_url'] ?? null);
    }

    // ---------- Relations ------------------------------------------------------

    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }
}
