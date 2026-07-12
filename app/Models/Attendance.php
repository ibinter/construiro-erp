<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Pointage — présence journalière d'un employé (éventuellement sur un chantier).
 */
class Attendance extends Model
{
    use BelongsToCompany;
    use HasFactory;

    public const STATUSES = ['present', 'absent', 'leave', 'half_day'];

    protected $fillable = [
        'company_id', 'employee_id', 'site_id',
        'date', 'status', 'hours_worked', 'overtime_hours', 'notes',
    ];

    protected $casts = [
        'date'           => 'date',
        'hours_worked'   => 'decimal:2',
        'overtime_hours' => 'decimal:2',
    ];

    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }

    public function employee(): BelongsTo
    {
        return $this->belongsTo(Employee::class);
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
