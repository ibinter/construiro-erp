<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Transaction de trésorerie : entrée (in) ou sortie (out) sur un compte.
 * Le solde d'un compte se déduit de l'agrégation de ces transactions.
 * Isolation multi-tenant par entreprise.
 */
class TreasuryTransaction extends Model
{
    use BelongsToCompany;
    use HasFactory;

    public const TYPES = ['in', 'out'];

    protected $fillable = [
        'company_id', 'cash_account_id', 'project_id', 'user_id',
        'type', 'category', 'amount', 'date', 'reference', 'description',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'date'   => 'date',
    ];

    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }

    public function cashAccount(): BelongsTo
    {
        return $this->belongsTo(CashAccount::class);
    }

    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /** Restreint la requête à l'entreprise de l'utilisateur (isolation multi-tenant). */
    public function scopeForUser(Builder $query, User $user): Builder
    {
        return $query->where('company_id', $user->company_id);
    }
}
