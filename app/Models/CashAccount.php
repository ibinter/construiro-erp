<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * Compte de trésorerie : caisse, banque ou mobile money.
 * Le solde courant n'est pas persisté : il se calcule à partir des
 * transactions (solde d'ouverture + entrées − sorties). Isolation multi-tenant.
 */
class CashAccount extends Model
{
    use HasFactory, SoftDeletes;

    public const TYPES = ['caisse', 'banque', 'mobile_money'];

    protected $fillable = [
        'company_id',
        'name', 'type', 'bank_name', 'account_number',
        'currency', 'opening_balance', 'is_active',
    ];

    protected $casts = [
        'opening_balance' => 'decimal:2',
        'is_active'       => 'boolean',
    ];

    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }

    public function transactions(): HasMany
    {
        return $this->hasMany(TreasuryTransaction::class);
    }

    /** Restreint la requête à l'entreprise de l'utilisateur (isolation multi-tenant). */
    public function scopeForUser(Builder $query, User $user): Builder
    {
        return $query->where('company_id', $user->company_id);
    }

    /**
     * Solde courant du compte : solde d'ouverture + entrées − sorties.
     * Calqué sur Material::currentStock (agrégation des transactions).
     */
    public function currentBalance(): float
    {
        $in  = (float) $this->transactions()->where('type', 'in')->sum('amount');
        $out = (float) $this->transactions()->where('type', 'out')->sum('amount');

        return (float) $this->opening_balance + $in - $out;
    }
}
