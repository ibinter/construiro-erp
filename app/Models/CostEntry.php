<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Écriture analytique — une charge ou un produit ventilé selon un axe
 * analytique, optionnellement rattaché à un projet. Isolation multi-tenant.
 */
class CostEntry extends Model
{
    use BelongsToCompany;
    use HasFactory;

    public const AXES  = ['chantier', 'materiel', 'main_oeuvre', 'sous_traitance', 'frais_generaux'];
    public const TYPES = ['charge', 'produit'];

    protected $fillable = [
        'company_id', 'project_id',
        'date', 'axis', 'label', 'type', 'amount', 'reference',
    ];

    protected $casts = [
        'date'   => 'date',
        'amount' => 'decimal:2',
    ];

    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }

    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }

    /** Restreint la requête à l'entreprise de l'utilisateur (isolation multi-tenant). */
    public function scopeForUser(Builder $query, User $user): Builder
    {
        return $query->where('company_id', $user->company_id);
    }
}
