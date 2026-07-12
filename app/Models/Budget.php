<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * Budget prévisionnel. Regroupe des lignes budgétaires dont découle le
 * montant total planifié (recalculé). Isolation multi-tenant.
 */
class Budget extends Model
{
    use BelongsToCompany;
    use HasFactory, SoftDeletes;

    public const STATUSES = ['draft', 'validated', 'closed'];

    protected $fillable = [
        'company_id', 'project_id',
        'code', 'title', 'fiscal_year',
        'status', 'total_amount', 'currency', 'notes',
    ];

    protected $casts = [
        'fiscal_year'  => 'integer',
        'total_amount' => 'decimal:2',
    ];

    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }

    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }

    public function lines(): HasMany
    {
        return $this->hasMany(BudgetLine::class)->orderBy('position');
    }

    /** Restreint la requête à l'entreprise de l'utilisateur (isolation multi-tenant). */
    public function scopeForUser(Builder $query, User $user): Builder
    {
        return $query->where('company_id', $user->company_id);
    }

    /**
     * Recalcule le montant total à partir des lignes (somme des montants
     * planifiés) puis persiste le budget.
     */
    public function recalculateTotal(): void
    {
        $this->total_amount = (float) $this->lines()->sum('planned_amount');
        $this->save();
    }
}
