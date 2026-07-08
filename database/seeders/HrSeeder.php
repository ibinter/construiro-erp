<?php

namespace Database\Seeders;

use App\Models\Company;
use App\Models\Employee;
use App\Models\Site;
use Illuminate\Database\Seeder;

/**
 * Données de démonstration pour le module RH (employés, pointages, paie).
 * Rattachées à l'entreprise de démonstration « construiro-demo ».
 */
class HrSeeder extends Seeder
{
    public function run(): void
    {
        $company = Company::where('slug', 'construiro-demo')->first();
        if (! $company) {
            return;
        }

        // Chantiers existants de l'entreprise (pour les affectations).
        $sites = Site::where('company_id', $company->id)->orderBy('id')->get();
        $siteA = $sites->get(0);
        $siteB = $sites->get(1) ?? $siteA;

        $period = now()->format('Y-m');
        $today  = now()->toDateString();

        // ~8 employés réalistes du BTP.
        $employees = [
            ['matricule' => 'EMP-001', 'first_name' => 'Kouassi', 'last_name' => 'Yao',       'job_title' => 'Chef de chantier',    'department' => 'chantier',   'contract_type' => 'cdi',        'base_salary' => 650000, 'site' => $siteA],
            ['matricule' => 'EMP-002', 'first_name' => 'Adama',   'last_name' => 'Traoré',    'job_title' => 'Maçon',               'department' => 'chantier',   'contract_type' => 'cdd',        'base_salary' => 220000, 'site' => $siteA],
            ['matricule' => 'EMP-003', 'first_name' => 'Ibrahim', 'last_name' => 'Diallo',    'job_title' => 'Maçon',               'department' => 'chantier',   'contract_type' => 'journalier', 'base_salary' => 180000, 'site' => $siteA],
            ['matricule' => 'EMP-004', 'first_name' => 'Seydou',  'last_name' => 'Koné',      'job_title' => 'Ferrailleur',         'department' => 'chantier',   'contract_type' => 'cdd',        'base_salary' => 240000, 'site' => $siteB],
            ['matricule' => 'EMP-005', 'first_name' => 'Aboubacar', 'last_name' => 'Ouattara', 'job_title' => 'Électricien',        'department' => 'chantier',   'contract_type' => 'cdi',        'base_salary' => 320000, 'site' => $siteB],
            ['matricule' => 'EMP-006', 'first_name' => 'Moussa',  'last_name' => 'Cissé',     'job_title' => "Conducteur d'engin",  'department' => 'logistique', 'contract_type' => 'cdi',        'base_salary' => 380000, 'site' => $siteB],
            ['matricule' => 'EMP-007', 'first_name' => 'Aïcha',   'last_name' => 'Bamba',     'job_title' => 'Comptable',           'department' => 'bureau',     'contract_type' => 'cdi',        'base_salary' => 450000, 'site' => null],
            ['matricule' => 'EMP-008', 'first_name' => 'Jean',    'last_name' => 'Gnagne',    'job_title' => 'Magasinier',          'department' => 'logistique', 'contract_type' => 'cdd',        'base_salary' => 260000, 'site' => $siteA],
            ['matricule' => 'EMP-009', 'first_name' => 'Fatoumata', 'last_name' => 'Sanogo',  'job_title' => 'Ingénieur travaux',   'department' => 'direction',  'contract_type' => 'cdi',        'base_salary' => 850000, 'site' => null],
        ];

        $created = [];

        foreach ($employees as $data) {
            $site = $data['site'];
            unset($data['site']);

            $created[] = Employee::updateOrCreate(
                ['company_id' => $company->id, 'matricule' => $data['matricule']],
                array_merge($data, [
                    'company_id' => $company->id,
                    'site_id'    => $site?->id,
                    'currency'   => 'XOF',
                    'status'     => 'active',
                    'is_active'  => true,
                    'hire_date'  => now()->subMonths(rand(3, 36))->toDateString(),
                ])
            );
        }

        // Quelques pointages du jour.
        foreach (array_slice($created, 0, 6) as $i => $employee) {
            $employee->attendances()->updateOrCreate(
                ['date' => $today],
                [
                    'company_id'     => $company->id,
                    'site_id'        => $employee->site_id,
                    'status'         => $i === 4 ? 'absent' : ($i === 5 ? 'half_day' : 'present'),
                    'hours_worked'   => $i === 4 ? 0 : ($i === 5 ? 4 : 8),
                    'overtime_hours' => $i === 0 ? 2 : 0,
                ]
            );
        }

        // 2-3 bulletins de paie de la période courante.
        foreach (array_slice($created, 0, 3) as $employee) {
            $gross = (float) $employee->base_salary;
            $employee->payslips()->updateOrCreate(
                ['period' => $period],
                [
                    'company_id'   => $company->id,
                    'gross_salary' => $gross,
                    'deductions'   => round($gross * 0.063, 2), // Cotisation CNPS ~6,3 %
                    'currency'     => 'XOF',
                    'status'       => 'draft',
                    // net_salary calculé automatiquement (boot saving).
                ]
            );
        }
    }
}
