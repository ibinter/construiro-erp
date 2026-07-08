<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Bulletin de paie — un bulletin par employé et par période (mois).
 * Le salaire net est recalculé automatiquement à l'enregistrement.
 */
class Payslip extends Model
{
    use HasFactory;

    public const STATUSES = ['draft', 'validated', 'paid'];

    protected $fillable = [
        'company_id', 'employee_id',
        'period', 'gross_salary', 'deductions', 'net_salary',
        'currency', 'status', 'notes',
    ];

    protected $casts = [
        'gross_salary' => 'decimal:2',
        'deductions'   => 'decimal:2',
        'net_salary'   => 'decimal:2',
    ];

    /** Calcule le salaire net (brut - retenues) avant chaque enregistrement. */
    protected static function boot(): void
    {
        parent::boot();

        static::saving(function (Payslip $payslip) {
            $payslip->net_salary = (float) $payslip->gross_salary - (float) $payslip->deductions;
        });
    }

    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }

    public function employee(): BelongsTo
    {
        return $this->belongsTo(Employee::class);
    }

    /** Restreint la requête à l'entreprise de l'utilisateur (isolation multi-tenant). */
    public function scopeForUser(Builder $query, User $user): Builder
    {
        return $query->where('company_id', $user->company_id);
    }
}
