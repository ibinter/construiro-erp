<?php

namespace App\Models;

use App\Traits\BelongsToCompany;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * Projet de construction (marché / opération). Regroupe des chantiers.
 */
class Project extends Model
{
    use BelongsToCompany;
    use Auditable;
    use HasFactory, SoftDeletes;

    public const STATUSES = ['draft', 'in_progress', 'on_hold', 'completed', 'cancelled'];
    public const TYPES = ['batiment', 'genie_civil', 'route', 'hydraulique', 'vrd', 'autre'];

    protected $fillable = [
        'company_id', 'agency_id', 'manager_id',
        'code', 'name', 'description', 'client_name',
        'type', 'status', 'budget_amount', 'currency', 'progress',
        'start_date', 'end_date',
        'country', 'city', 'address', 'latitude', 'longitude',
    ];

    protected $casts = [
        'budget_amount' => 'decimal:2',
        'progress'      => 'integer',
        'start_date'    => 'date',
        'end_date'      => 'date',
        'latitude'      => 'decimal:7',
        'longitude'     => 'decimal:7',
    ];

    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }

    public function agency(): BelongsTo
    {
        return $this->belongsTo(Agency::class);
    }

    public function manager(): BelongsTo
    {
        return $this->belongsTo(User::class, 'manager_id');
    }

    public function sites(): HasMany
    {
        return $this->hasMany(Site::class);
    }

    /** Restreint la requête à l'entreprise de l'utilisateur (isolation multi-tenant). */
    public function scopeForUser(Builder $query, User $user): Builder
    {
        return $query->where('company_id', $user->company_id);
    }
}
