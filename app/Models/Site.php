<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * Chantier — site de travaux physique rattaché à un projet.
 */
class Site extends Model
{
    use BelongsToCompany;
    use HasFactory, SoftDeletes;

    public const STATUSES = ['preparation', 'in_progress', 'suspended', 'completed'];

    protected $fillable = [
        'company_id', 'project_id', 'site_manager_id',
        'code', 'name', 'description',
        'status', 'progress',
        'start_date', 'end_date',
        'city', 'address', 'latitude', 'longitude',
    ];

    protected $casts = [
        'progress'   => 'integer',
        'start_date' => 'date',
        'end_date'   => 'date',
        'latitude'   => 'decimal:7',
        'longitude'  => 'decimal:7',
    ];

    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }

    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }

    public function siteManager(): BelongsTo
    {
        return $this->belongsTo(User::class, 'site_manager_id');
    }

    public function scopeForUser(Builder $query, User $user): Builder
    {
        return $query->where('company_id', $user->company_id);
    }
}
