<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * Compte du plan comptable (SYSCOHADA simplifié). Isolation multi-tenant.
 */
class Account extends Model
{
    use HasFactory, SoftDeletes;

    public const TYPES = ['actif', 'passif', 'charge', 'produit'];

    protected $fillable = [
        'company_id', 'code', 'label', 'type',
    ];

    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }

    public function journalLines(): HasMany
    {
        return $this->hasMany(JournalLine::class);
    }

    /** Restreint la requête à l'entreprise de l'utilisateur (isolation multi-tenant). */
    public function scopeForUser(Builder $query, User $user): Builder
    {
        return $query->where('company_id', $user->company_id);
    }
}
