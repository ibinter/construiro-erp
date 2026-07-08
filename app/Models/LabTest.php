<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * Essai de laboratoire — prélèvement et mesure avec un résultat.
 * Rattachement optionnel à un projet et à un chantier.
 * Isolation multi-tenant par entreprise.
 */
class LabTest extends Model
{
    use HasFactory, SoftDeletes;

    public const SAMPLE_TYPES = ['beton', 'sol', 'granulat', 'acier', 'bitume', 'autre'];
    public const RESULTS = ['conforme', 'non_conforme', 'en_attente'];

    protected $fillable = [
        'company_id', 'project_id', 'site_id',
        'code', 'sample_type', 'test_name',
        'sample_date', 'test_date',
        'result_value', 'unit', 'threshold',
        'result', 'technician', 'observations',
    ];

    protected $casts = [
        'sample_date'  => 'date',
        'test_date'    => 'date',
        'result_value' => 'decimal:3',
        'threshold'    => 'decimal:3',
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
