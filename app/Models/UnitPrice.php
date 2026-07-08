<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * BPU — prix unitaire de la bibliothèque de prix, rattaché à une entreprise.
 * Réutilisable pour pré-remplir les lignes de DQE. Isolation multi-tenant.
 */
class UnitPrice extends Model
{
    use HasFactory, SoftDeletes;

    public const UNITS = ['u', 'm2', 'm3', 'ml', 'kg', 'forfait'];
    public const CATEGORIES = ['gros_oeuvre', 'second_oeuvre', 'vrd', 'electricite', 'plomberie', 'autre'];

    protected $fillable = [
        'company_id',
        'code', 'designation', 'unit', 'category',
        'unit_price', 'currency', 'is_active',
    ];

    protected $casts = [
        'unit_price' => 'decimal:2',
        'is_active'  => 'boolean',
    ];

    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }

    /** Restreint la requête à l'entreprise de l'utilisateur (isolation multi-tenant). */
    public function scopeForUser(Builder $query, User $user): Builder
    {
        return $query->where('company_id', $user->company_id);
    }
}
