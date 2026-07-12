<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * Étude (Bureau d'études) — élément du registre d'études (plan, note de calcul,
 * étude de sol…), optionnellement rattaché à un projet. Isolation multi-tenant.
 */
class Study extends Model
{
    use BelongsToCompany;
    use HasFactory, SoftDeletes;

    public const TYPES = ['plan', 'note_calcul', 'etude_sol', 'autre'];
    public const STATUSES = ['en_cours', 'valide', 'rejete'];

    protected $fillable = [
        'company_id', 'project_id',
        'code', 'title', 'type', 'status', 'author', 'notes',
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
