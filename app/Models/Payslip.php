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
    use BelongsToCompany;
    use Auditable;
    use HasFactory;

    public const STATUSES = ['draft', 'validated', 'paid'];

    protected $fillable = [
        'company_id', 'employee_id',
        'period', 'country_code',
        'working_days', 'days_worked', 'overtime_hours',
        'base_salary', 'overtime_amount',
        'transport_allowance', 'housing_allowance', 'other_allowances',
        'gross_salary',
        'cnps_employee', 'its_amount', 'advance_deductions', 'cnps_employer',
        'deductions', 'net_salary',
        'currency', 'status', 'notes',
    ];

    protected $casts = [
        'working_days'        => 'integer',
        'days_worked'         => 'decimal:2',
        'overtime_hours'      => 'decimal:2',
        'base_salary'         => 'decimal:2',
        'overtime_amount'     => 'decimal:2',
        'transport_allowance' => 'decimal:2',
        'housing_allowance'   => 'decimal:2',
        'other_allowances'    => 'decimal:2',
        'gross_salary'        => 'decimal:2',
        'cnps_employee'       => 'decimal:2',
        'its_amount'          => 'decimal:2',
        'advance_deductions'  => 'decimal:2',
        'cnps_employer'       => 'decimal:2',
        'deductions'          => 'decimal:2',
        'net_salary'          => 'decimal:2',
    ];

    /** Recalcule net_salary = gross - total deductions avant enregistrement. */
    protected static function boot(): void
    {
        parent::boot();

        static::saving(function (Payslip $payslip) {
            // Si les cotisations détaillées existent, on les totalise.
            $detailed = (float) $payslip->cnps_employee
                + (float) $payslip->its_amount
                + (float) $payslip->advance_deductions;

            if ($detailed > 0) {
                $payslip->deductions = $detailed;
            }

            $payslip->net_salary = max(0, (float) $payslip->gross_salary - (float) $payslip->deductions);
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
