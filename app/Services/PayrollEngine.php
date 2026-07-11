<?php

namespace App\Services;

use App\Models\Attendance;
use App\Models\Employee;
use App\Models\Payslip;
use Carbon\Carbon;
use Illuminate\Support\Collection;

/**
 * Moteur de calcul de paie.
 *
 * Prend en charge Côte d'Ivoire (CI), Sénégal (SN) et Cameroun (CM).
 * Pour les autres pays, applique le régime CI par défaut.
 *
 * Calcul :
 *   Brut = salaire_base × (jours_travaillés / jours_ouvrables) + heures_supp + allocations
 *   Cotisations salariales = CNPS_sal + ITS
 *   Net = Brut - cotisations_salariales - avances
 */
class PayrollEngine
{
    // -------------------------------------------------------------------------
    // Taux par pays
    // -------------------------------------------------------------------------

    private const RATES = [
        'CI' => [
            'cnps_employee_rate' => 0.032,   // CNPS salariale 3,2 %
            'cnps_employer_rate' => 0.1675,  // CNPS patronale 16,75 %
            'cnps_cap_annual'    => 1_647_315, // Plafond annuel CNPS XOF
            'overtime_rate'      => 1.50,    // Majoration heures supp
            // Barème ITS mensuel (sur salaire net imposable = brut × 0,80 – CNPS_sal)
            'its_brackets' => [
                [0,        75_000,    0.0],
                [75_001,   240_000,   0.145],
                [240_001,  700_000,   0.265],
                [700_001,  PHP_INT_MAX, 0.40],
            ],
        ],
        'SN' => [
            'cnps_employee_rate' => 0.056,   // IPRES salarial 5,6 %
            'cnps_employer_rate' => 0.084,   // IPRES patronal 8,4 %
            'cnps_cap_annual'    => PHP_INT_MAX,
            'overtime_rate'      => 1.50,
            'its_brackets' => [
                // TRIMF sénégalais (simplifié)
                [0,        620_000,   0.0],
                [620_001,  1_000_000, 0.02],
                [1_000_001, 3_000_000, 0.04],
                [3_000_001, PHP_INT_MAX, 0.06],
            ],
        ],
        'CM' => [
            'cnps_employee_rate' => 0.028,   // CNPS salariale 2,8 %
            'cnps_employer_rate' => 0.125,   // CNPS patronale 12,5 %
            'cnps_cap_annual'    => PHP_INT_MAX,
            'overtime_rate'      => 1.50,
            'its_brackets' => [
                [0,        62_000,    0.0],
                [62_001,   166_000,   0.10],
                [166_001,  250_000,   0.155],
                [250_001,  333_000,   0.20],
                [333_001,  500_000,   0.25],
                [500_001,  PHP_INT_MAX, 0.35],
            ],
        ],
    ];

    // -------------------------------------------------------------------------
    // API publique
    // -------------------------------------------------------------------------

    /**
     * Calcule les éléments de paie pour un employé sur une période.
     *
     * @param  Employee  $employee
     * @param  string    $period      Format 'YYYY-MM'
     * @param  string    $countryCode Code ISO 2 lettres
     * @param  array     $options     transport_allowance, housing_allowance, other_allowances, advance_deductions
     * @return array     Prêt à passer à Payslip::updateOrCreate()
     */
    public function compute(
        Employee $employee,
        string   $period,
        string   $countryCode = 'CI',
        array    $options = []
    ): array {
        $rates    = self::RATES[$countryCode] ?? self::RATES['CI'];
        $date     = Carbon::createFromFormat('Y-m', $period)->startOfMonth();
        $monthEnd = $date->copy()->endOfMonth();

        // ----- Présence -----
        $workingDays = $this->workingDaysInMonth($date);
        [$daysWorked, $overtimeHours] = $employee->id
            ? $this->attendanceSummary($employee->id, $date, $monthEnd)
            : [$workingDays, 0.0];

        // ----- Rémunération de base -----
        $baseSalary = (float) $employee->base_salary;

        $proRatedBase = match ($employee->contract_type) {
            'journalier' => $baseSalary * $daysWorked,          // taux journalier × jours
            default      => $workingDays > 0                    // CDI/CDD pro-raté
                ? $baseSalary * ($daysWorked / $workingDays)
                : 0,
        };

        // ----- Heures supplémentaires -----
        $dailyRate    = $workingDays > 0 ? $baseSalary / $workingDays : 0;
        $hourlyRate   = $dailyRate / 8;
        $overtimeAmt  = $hourlyRate * $overtimeHours * $rates['overtime_rate'];

        // ----- Allocations -----
        $transportAllowance = (float) ($options['transport_allowance'] ?? 0);
        $housingAllowance   = (float) ($options['housing_allowance']   ?? 0);
        $otherAllowances    = (float) ($options['other_allowances']    ?? 0);

        // ----- Salaire brut -----
        $grossSalary = $proRatedBase + $overtimeAmt
            + $transportAllowance + $housingAllowance + $otherAllowances;

        // ----- Cotisations salariales -----
        $cnpsCap      = $rates['cnps_cap_annual'] / 12;
        $cnpsBase     = min($grossSalary, $cnpsCap);
        $cnpsEmployee = $cnpsBase * $rates['cnps_employee_rate'];
        $cnpsEmployer = $cnpsBase * $rates['cnps_employer_rate'];

        // ITS sur revenu net imposable (abattement 20 % pour CI, brut pour SN/CM)
        $taxableIncome = $countryCode === 'CI'
            ? max(0, $grossSalary * 0.80 - $cnpsEmployee)
            : max(0, $grossSalary - $cnpsEmployee);

        $itsAmount = $this->computeIts($taxableIncome, $rates['its_brackets']);

        // ----- Avances / retenues diverses -----
        $advanceDeductions = (float) ($options['advance_deductions'] ?? 0);

        // ----- Totaux -----
        $totalDeductions = $cnpsEmployee + $itsAmount + $advanceDeductions;
        $netSalary       = max(0, $grossSalary - $totalDeductions);

        return [
            'employee_id'         => $employee->id,
            'period'              => $period,
            'country_code'        => $countryCode,
            'currency'            => $employee->currency ?: 'XOF',
            'working_days'        => $workingDays,
            'days_worked'         => round($daysWorked, 2),
            'overtime_hours'      => round($overtimeHours, 2),
            'base_salary'         => round($proRatedBase, 2),
            'overtime_amount'     => round($overtimeAmt, 2),
            'transport_allowance' => round($transportAllowance, 2),
            'housing_allowance'   => round($housingAllowance, 2),
            'other_allowances'    => round($otherAllowances, 2),
            'gross_salary'        => round($grossSalary, 2),
            'cnps_employee'       => round($cnpsEmployee, 2),
            'its_amount'          => round($itsAmount, 2),
            'advance_deductions'  => round($advanceDeductions, 2),
            'deductions'          => round($totalDeductions, 2),
            'cnps_employer'       => round($cnpsEmployer, 2),
            'net_salary'          => round($netSalary, 2),
            'status'              => 'draft',
        ];
    }

    /**
     * Génère les bulletins pour tous les employés actifs d'une entreprise.
     *
     * @return array{generated: int, errors: array}
     */
    public function generateAll(int $companyId, string $period, string $countryCode = 'CI'): array
    {
        $employees = Employee::where('company_id', $companyId)
            ->where('status', 'active')
            ->get();

        $generated = 0;
        $errors    = [];

        foreach ($employees as $employee) {
            try {
                $data = $this->compute($employee, $period, $countryCode);

                Payslip::updateOrCreate(
                    ['company_id' => $companyId, 'employee_id' => $employee->id, 'period' => $period],
                    array_merge($data, ['company_id' => $companyId])
                );

                $generated++;
            } catch (\Throwable $e) {
                $errors[] = [
                    'employee' => $employee->full_name,
                    'error'    => $e->getMessage(),
                ];
            }
        }

        return compact('generated', 'errors');
    }

    // -------------------------------------------------------------------------
    // Helpers privés
    // -------------------------------------------------------------------------

    /** Nombre de jours ouvrables (lun-ven) dans le mois. */
    private function workingDaysInMonth(Carbon $start): int
    {
        $count = 0;
        $day   = $start->copy()->startOfMonth();
        $end   = $start->copy()->endOfMonth();

        while ($day->lte($end)) {
            if ($day->isWeekday()) {
                $count++;
            }
            $day->addDay();
        }

        return $count;
    }

    /** Agrège les pointages : [jours_travaillés, heures_supp]. */
    private function attendanceSummary(int $employeeId, Carbon $from, Carbon $to): array
    {
        $rows = Attendance::where('employee_id', $employeeId)
            ->whereBetween('date', [$from->toDateString(), $to->toDateString()])
            ->get(['status', 'hours_worked', 'overtime_hours']);

        $daysWorked    = 0.0;
        $overtimeHours = 0.0;

        foreach ($rows as $row) {
            $overtimeHours += (float) $row->overtime_hours;

            $daysWorked += match ($row->status) {
                'present'  => 1.0,
                'half_day' => 0.5,
                default    => 0.0,
            };
        }

        // Si aucun pointage enregistré → on considère le mois plein (CDI)
        if ($rows->isEmpty()) {
            $daysWorked = $this->workingDaysInMonth($from);
        }

        return [$daysWorked, $overtimeHours];
    }

    /** Calcule l'ITS par application du barème progressif (mensuel). */
    private function computeIts(float $income, array $brackets): float
    {
        if ($income <= 0) {
            return 0.0;
        }

        $tax = 0.0;

        foreach ($brackets as [$low, $high, $rate]) {
            if ($income <= $low) {
                break;
            }

            $taxable = min($income, $high) - $low;
            $tax    += $taxable * $rate;
        }

        return $tax;
    }
}
