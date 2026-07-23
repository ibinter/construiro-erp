<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Journal des appels IA (SARA publique + assistants internes).
 *
 * Permet de suivre la consommation de tokens par société et par fournisseur,
 * et d'appliquer les quotas journaliers configurés dans AiSetting.
 */
class AiUsageLog extends Model
{
    protected $fillable = [
        'company_id',
        'user_id',
        'context',
        'provider',
        'model',
        'input_tokens',
        'output_tokens',
        'total_tokens',
        'response_time_ms',
        'success',
        'error_message',
    ];

    protected $casts = [
        'input_tokens'     => 'integer',
        'output_tokens'    => 'integer',
        'total_tokens'     => 'integer',
        'response_time_ms' => 'integer',
        'success'          => 'boolean',
    ];

    // ---------- Relations ------------------------------------------------------

    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    // ---------- Scopes ---------------------------------------------------------

    /** Filtre les logs du mois courant. */
    public function scopeThisMonth(Builder $query): Builder
    {
        return $query->whereMonth('created_at', now()->month)
                     ->whereYear('created_at', now()->year);
    }

    /** Filtre les logs d'une société donnée. */
    public function scopeByCompany(Builder $query, int $companyId): Builder
    {
        return $query->where('company_id', $companyId);
    }

    // ---------- Méthodes statiques ---------------------------------------------

    /**
     * Nombre d'appels réussis aujourd'hui pour une société donnée.
     * Utilisé par SaraGateway pour vérifier les quotas journaliers.
     */
    public static function todayCountForCompany(int $companyId): int
    {
        return static::where('company_id', $companyId)
            ->whereDate('created_at', today())
            ->where('success', true)
            ->count();
    }
}
