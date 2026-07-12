<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * Contrôle qualité — inspection ou essai avec un résultat.
 * Rattachement optionnel à un projet et à un chantier.
 * Isolation multi-tenant par entreprise.
 */
class QualityControl extends Model
{
    use BelongsToCompany;
    use HasFactory, SoftDeletes;

    public const CONTROL_TYPES = ['reception', 'en_cours', 'essai', 'final'];
    public const RESULTS = ['conforme', 'non_conforme', 'en_attente'];

    protected $fillable = [
        'company_id', 'project_id', 'site_id',
        'code', 'control_type', 'title', 'description',
        'control_date', 'inspector', 'result', 'observations',
    ];

    protected $casts = [
        'control_date' => 'date',
    ];

    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }

    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }

    public function site(): BelongsTo
    {
        return $this->belongsTo(Site::class);
    }

    /** Restreint la requête à l'entreprise de l'utilisateur (isolation multi-tenant). */
    public function scopeForUser(Builder $query, User $user): Builder
    {
        return $query->where('company_id', $user->company_id);
    }
}
