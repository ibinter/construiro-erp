<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * Tâche de planning — élément d'un diagramme de Gantt rattaché à un projet.
 */
class Task extends Model
{
    use BelongsToCompany;
    use HasFactory, SoftDeletes;

    public const STATUSES = ['todo', 'in_progress', 'done', 'blocked'];

    protected $fillable = [
        'company_id', 'project_id', 'site_id', 'parent_id', 'assignee_id',
        'name', 'description',
        'start_date', 'end_date',
        'progress', 'status', 'position',
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date'   => 'date',
        'progress'   => 'integer',
        'position'   => 'integer',
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

    public function assignee(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assignee_id');
    }

    public function parent(): BelongsTo
    {
        return $this->belongsTo(Task::class, 'parent_id');
    }

    public function children(): HasMany
    {
        return $this->hasMany(Task::class, 'parent_id');
    }

    /** Restreint la requête à l'entreprise de l'utilisateur (isolation multi-tenant). */
    public function scopeForUser(Builder $query, User $user): Builder
    {
        return $query->where('company_id', $user->company_id);
    }
}
