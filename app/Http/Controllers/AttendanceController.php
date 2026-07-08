<?php

namespace App\Http\Controllers;

use App\Models\Attendance;
use App\Models\Employee;
use App\Models\Site;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Pointage — enregistrement des présences journalières des employés.
 * Toutes les requêtes sont isolées par entreprise (multi-tenant) et
 * protégées par les permissions « attendance.* » via le middleware de route.
 */
class AttendanceController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();

        // Date filtrée (par défaut : aujourd'hui).
        $date = $request->string('date')->toString() ?: now()->toDateString();

        $attendances = Attendance::forUser($user)
            ->with('employee:id,matricule,first_name,last_name', 'site:id,name')
            ->where('date', $date)
            ->when($request->integer('site_id'), fn ($q, $siteId) => $q->where('site_id', $siteId))
            ->latest('id')
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('Attendance/Index', [
            'attendances' => $attendances,
            'filters'     => ['date' => $date, 'site_id' => $request->integer('site_id') ?: ''],
            'employees'   => $this->employees($user),
            'sites'       => $this->sites($user),
            'statuses'    => Attendance::STATUSES,
            'can'         => [
                'create' => $user->can('attendance.create'),
            ],
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $user = $request->user();
        $companyId = $user->company_id;

        $data = $request->validate([
            'employee_id'    => ['required', 'integer', Rule::exists('employees', 'id')->where('company_id', $companyId)],
            'date'           => ['required', 'date'],
            'status'         => ['required', Rule::in(Attendance::STATUSES)],
            'hours_worked'   => ['required', 'numeric', 'min:0', 'max:24'],
            'overtime_hours' => ['nullable', 'numeric', 'min:0', 'max:24'],
            'site_id'        => ['nullable', 'integer', Rule::exists('sites', 'id')->where('company_id', $companyId)],
            'notes'          => ['nullable', 'string', 'max:255'],
        ]);

        // Un seul pointage par employé et par date : on met à jour le cas échéant.
        Attendance::updateOrCreate(
            ['employee_id' => $data['employee_id'], 'date' => $data['date']],
            array_merge($data, [
                'company_id'     => $companyId,
                'overtime_hours' => $data['overtime_hours'] ?? 0,
            ])
        );

        return redirect()->route('attendance.index', ['date' => $data['date']])
            ->with('success', 'Pointage enregistré.');
    }

    /** Employés actifs de l'entreprise, candidats au pointage. */
    private function employees(User $user)
    {
        return Employee::where('company_id', $user->company_id)
            ->where('status', 'active')
            ->orderBy('last_name')
            ->get(['id', 'matricule', 'first_name', 'last_name']);
    }

    /** Chantiers de l'entreprise. */
    private function sites(User $user)
    {
        return Site::where('company_id', $user->company_id)
            ->orderBy('name')
            ->get(['id', 'name']);
    }
}
