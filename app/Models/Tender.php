<?php

namespace App\Models;

use App\Traits\BelongsToCompany;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * Appel d'offres (tender). Suivi d'un marché BTP auquel l'entreprise répond,
 * rattaché à une entreprise (multi-tenant).
 */
class Tender extends Model
{
    use BelongsToCompany;
    use HasFactory, SoftDeletes;

    /** Statuts de suivi de l'appel d'offres. */
    public const STATUSES = ['identifie', 'en_preparation', 'soumis', 'gagne', 'perdu', 'annule'];

    /** Nature du marché. */
    public const TYPES = ['public', 'prive', 'gre_a_gre'];

    protected $fillable = [
        'company_id', 'project_id',
        'code', 'title', 'client_name',
        'type', 'estimated_amount', 'currency', 'status',
        'submission_deadline', 'submitted_at', 'notes',
    ];

    protected $casts = [
        'estimated_amount'    => 'decimal:2',
        'submission_deadline' => 'date',
        'submitted_at'        => 'date',
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
