<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Paramétrage IA d'une entreprise. La clé API est chiffrée au repos (cast
 * 'encrypted') et n'est jamais renvoyée telle quelle au front.
 */
class AiSetting extends Model
{
    protected $fillable = [
        'company_id', 'provider', 'api_key', 'model', 'base_url', 'enabled',
    ];

    protected $casts = [
        'api_key' => 'encrypted',
        'enabled' => 'boolean',
    ];

    /**
     * Fournisseurs supportés + valeurs par défaut (endpoint OpenAI-compatible
     * sauf Anthropic). L'utilisateur fournit sa propre clé.
     */
    public const PROVIDERS = [
        'none' => [
            'label'    => 'Aucun (moteur de règles interne)',
            'base_url' => null,
            'model'    => null,
            'docs'     => null,
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
    ];

    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
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
}
