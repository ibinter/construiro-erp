<?php

namespace App\Http\Controllers;

use App\Models\Employee;
use App\Models\Payslip;
use App\Models\User;
use App\Services\PayrollEngine;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Paie — génération et suivi des bulletins de paie.
 * Toutes les requêtes sont isolées par entreprise (multi-tenant) et
 * protégées par les permissions « payroll.* » via le middleware de route.
 */
class PayslipController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();

        // Période filtrée (par défaut : mois courant, format 'YYYY-MM').
        $period = $request->string('period')->toString() ?: now()->format('Y-m');

        $payslips = Payslip::forUser($user)
            ->with('employee:id,matricule,first_name,last_name')
            ->where('period', $period)
            ->latest('id')
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('Payroll/Index', [
            'payslips'  => $payslips,
            'filters'   => ['period' => $period],
            'employees' => $this->employees($user),
            'statuses'  => Payslip::STATUSES,
            'can'       => [
                'create' => $user->can('payroll.create'),
                'update' => $user->can('payroll.update'),
            ],
        ]);
    }

    /**
     * Génère automatiquement les bulletins pour tous les employés actifs
     * à partir des pointages de la période.
     */
    public function generateAll(Request $request): RedirectResponse
    {
        $user = $request->user();

        $data = $request->validate([
            'period'       => ['required', 'string', 'regex:/^\d{4}-\d{2}$/'],
            'country_code' => ['nullable', 'string', 'size:2'],
        ]);

        $countryCode = strtoupper($data['country_code'] ?? $user->company?->country ?? 'CI');

        $result = (new PayrollEngine())->generateAll(
            $user->company_id,
            $data['period'],
            $countryCode
        );

        $msg = "{$result['generated']} bulletin(s) généré(s) automatiquement.";
        if (!empty($result['errors'])) {
            $msg .= ' Erreurs : ' . collect($result['errors'])->pluck('employee')->join(', ') . '.';
        }

        return redirect()->route('payroll.index', ['period' => $data['period']])
            ->with('success', $msg);
    }

    public function store(Request $request): RedirectResponse
    {
        $user = $request->user();
        $companyId = $user->company_id;

        $data = $request->validate([
            'employee_id'  => ['required', 'integer', Rule::exists('employees', 'id')->where('company_id', $companyId)],
            'period'       => ['required', 'string', 'regex:/^\d{4}-\d{2}$/'],
            'gross_salary' => ['required', 'numeric', 'min:0'],
            'deductions'   => ['nullable', 'numeric', 'min:0'],
            'currency'     => ['required', 'string', 'size:3'],
            'notes'        => ['nullable', 'string', 'max:255'],
        ]);

        // Un seul bulletin par employé et par période.
        Payslip::updateOrCreate(
            ['employee_id' => $data['employee_id'], 'period' => $data['period']],
            array_merge($data, [
                'company_id' => $companyId,
                'deductions' => $data['deductions'] ?? 0,
                // net_salary calculé automatiquement (boot saving du modèle).
            ])
        );

        return redirect()->route('payroll.index', ['period' => $data['period']])
            ->with('success', 'Bulletin de paie généré.');
    }

    public function updateStatus(Request $request, Payslip $payslip): RedirectResponse
    {
        $this->authorizeCompany($request->user(), $payslip);

        $data = $request->validate([
            'status' => ['required', Rule::in(Payslip::STATUSES)],
        ]);

        $payslip->update(['status' => $data['status']]);

        return redirect()->route('payroll.index', ['period' => $payslip->period])
            ->with('success', 'Statut du bulletin mis à jour.');
    }

    /** Employés actifs de l'entreprise, candidats à un bulletin. */
    private function employees(User $user)
    {
        return Employee::where('company_id', $user->company_id)
            ->where('status', 'active')
            ->orderBy('last_name')
            ->get(['id', 'matricule', 'first_name', 'last_name', 'base_salary', 'currency']);
    }

    /** Empêche l'accès à un bulletin d'une autre entreprise. */
    private function authorizeCompany(User $user, Payslip $payslip): void
    {
        abort_unless($payslip->company_id === $user->company_id, 403);
    }
}
