<?php

namespace App\Http\Controllers;

use App\Models\Agency;
use App\Models\Employee;
use App\Models\Site;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Gestion des employés (Ressources humaines).
 * Toutes les requêtes sont isolées par entreprise (multi-tenant) et
 * protégées par les permissions « hr.* » via le middleware de route.
 */
class EmployeeController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();

        $employees = Employee::forUser($user)
            ->with('site:id,name')
            ->withCount('attendances')
            ->when($request->string('search')->toString(), function ($query, $search) {
                $query->where(fn ($q) => $q
                    ->where('matricule', 'like', "%{$search}%")
                    ->orWhere('first_name', 'like', "%{$search}%")
                    ->orWhere('last_name', 'like', "%{$search}%")
                    ->orWhere('job_title', 'like', "%{$search}%"));
            })
            ->when($request->string('department')->toString(), fn ($q, $d) => $q->where('department', $d))
            ->when($request->string('status')->toString(), fn ($q, $s) => $q->where('status', $s))
            ->latest()
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('Employees/Index', [
            'employees'      => $employees,
            'filters'        => $request->only('search', 'department', 'status'),
            'departments'    => Employee::DEPARTMENTS,
            'statuses'       => Employee::STATUSES,
            'contractTypes'  => Employee::CONTRACT_TYPES,
            'can'            => [
                'create' => $user->can('hr.create'),
                'update' => $user->can('hr.update'),
                'delete' => $user->can('hr.delete'),
            ],
        ]);
    }

    public function create(Request $request): Response
    {
        return Inertia::render('Employees/Create', [
            'sites'          => $this->sites($request->user()),
            'agencies'       => $this->agencies($request->user()),
            'departments'    => Employee::DEPARTMENTS,
            'contractTypes'  => Employee::CONTRACT_TYPES,
            'statuses'       => Employee::STATUSES,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $this->validateData($request);
        $data['company_id'] = $request->user()->company_id;

        $employee = Employee::create($data);

        return redirect()->route('hr.show', $employee)
            ->with('success', 'Employé créé avec succès.');
    }

    public function show(Request $request, Employee $employee): Response
    {
        $this->authorizeCompany($request->user(), $employee);

        $employee->load('site:id,name', 'agency:id,name');

        // Pointages des 30 derniers jours (pour l'historique + le calendrier).
        $attendances = $employee->attendances()
            ->with('site:id,name')
            ->latest('date')
            ->limit(30)
            ->get();

        // Stats du mois en cours (KPIs).
        $now  = now();
        $monthAtt = $employee->attendances()
            ->whereYear('date', $now->year)
            ->whereMonth('date', $now->month)
            ->get();

        $payslips = $employee->payslips()
            ->orderByDesc('period')
            ->limit(6)
            ->get();

        $dernierSalaire = null;
        if ($payslips->isNotEmpty()) {
            $last = $payslips->first();
            $dernierSalaire = [
                'amount'   => (float) $last->net_salary,
                'currency' => $last->currency,
                'period'   => $last->period,
            ];
        }

        $kpis = [
            'presences'       => $monthAtt->whereIn('status', ['present', 'half_day'])->count(),
            'absences'        => $monthAtt->where('status', 'absent')->count(),
            'heures_sup'      => (float) $monthAtt->sum('overtime_hours'),
            'dernier_salaire' => $dernierSalaire,
        ];

        return Inertia::render('HR/Show', [
            'employee'    => $employee,
            'attendances' => $attendances,
            'payslips'    => $payslips,
            'kpis'        => $kpis,
            'can'         => [
                'update' => $request->user()->can('hr.update'),
                'delete' => $request->user()->can('hr.delete'),
            ],
        ]);
    }

    public function edit(Request $request, Employee $employee): Response
    {
        $this->authorizeCompany($request->user(), $employee);

        return Inertia::render('Employees/Edit', [
            'employee'       => $employee,
            'sites'          => $this->sites($request->user()),
            'agencies'       => $this->agencies($request->user()),
            'departments'    => Employee::DEPARTMENTS,
            'contractTypes'  => Employee::CONTRACT_TYPES,
            'statuses'       => Employee::STATUSES,
        ]);
    }

    public function update(Request $request, Employee $employee): RedirectResponse
    {
        $this->authorizeCompany($request->user(), $employee);

        $employee->update($this->validateData($request, $employee));

        return redirect()->route('hr.show', $employee)
            ->with('success', 'Employé mis à jour.');
    }

    public function destroy(Request $request, Employee $employee): RedirectResponse
    {
        $this->authorizeCompany($request->user(), $employee);

        $employee->delete();

        return redirect()->route('hr.index')
            ->with('success', 'Employé supprimé.');
    }

    /** Validation partagée création/mise à jour. */
    private function validateData(Request $request, ?Employee $employee = null): array
    {
        $companyId = $request->user()->company_id;

        return $request->validate([
            'matricule'     => ['required', 'string', 'max:50', Rule::unique('employees')->where('company_id', $companyId)->ignore($employee?->id)],
            'first_name'    => ['required', 'string', 'max:120'],
            'last_name'     => ['required', 'string', 'max:120'],
            'job_title'     => ['nullable', 'string', 'max:150'],
            'department'    => ['required', Rule::in(Employee::DEPARTMENTS)],
            'contract_type' => ['required', Rule::in(Employee::CONTRACT_TYPES)],
            'status'        => ['required', Rule::in(Employee::STATUSES)],
            'phone'         => ['nullable', 'string', 'max:50'],
            'email'         => ['nullable', 'email', 'max:255'],
            'hire_date'     => ['nullable', 'date'],
            'base_salary'   => ['required', 'numeric', 'min:0'],
            'currency'      => ['required', 'string', 'size:3'],
            'site_id'       => ['nullable', 'integer', Rule::exists('sites', 'id')->where('company_id', $companyId)],
            'agency_id'     => ['nullable', 'integer', Rule::exists('agencies', 'id')->where('company_id', $companyId)],
            'is_active'     => ['boolean'],
            'notes'         => ['nullable', 'string'],
        ]);
    }

    /** Chantiers de l'entreprise, candidats à l'affectation. */
    private function sites(User $user)
    {
        return Site::where('company_id', $user->company_id)
            ->orderBy('name')
            ->get(['id', 'name']);
    }

    /** Agences de l'entreprise. */
    private function agencies(User $user)
    {
        return Agency::where('company_id', $user->company_id)
            ->orderBy('name')
            ->get(['id', 'name']);
    }

    /** Empêche l'accès à un employé d'une autre entreprise. */
    private function authorizeCompany(User $user, Employee $employee): void
    {
        abort_unless($employee->company_id === $user->company_id, 403);
    }
}
