<?php

namespace App\Models;

use App\Traits\BelongsToCompany;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * Incident QHSE — évènement de sécurité, santé ou environnement.
 * Déclaré et suivi jusqu'à clôture. Rattachement optionnel à un projet
 * et à un chantier. Isolation multi-tenant par entreprise.
 */
class HseIncident extends Model
{
    use BelongsToCompany;
    use HasFactory, SoftDeletes;

    public const TYPES = ['accident', 'presque_accident', 'environnement', 'incendie', 'autre'];
    public const SEVERITIES = ['mineur', 'modere', 'majeur', 'critique'];
    public const STATUSES = ['ouvert', 'en_cours', 'cloture'];

    protected $fillable = [
        'company_id', 'project_id', 'site_id',
        'code', 'type', 'severity', 'title', 'description',
        'incident_date', 'location', 'status', 'corrective_action', 'reported_by',
    ];

    protected $casts = [
        'incident_date' => 'date',
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
