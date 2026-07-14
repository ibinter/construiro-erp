<?php

namespace App\Http\Controllers;

use App\Models\Project;
use App\Models\User;
use App\Services\LicenseGuard;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Gestion des projets de construction.
 * Toutes les requêtes sont isolées par entreprise (multi-tenant) et
 * protégées par les permissions « projects.* » via le middleware de route.
 */
class ProjectController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();

        $projects = Project::forUser($user)
            ->with('manager:id,name')
            ->withCount('sites')
            ->when($request->string('search')->toString(), function ($query, $search) {
                $query->where(fn ($q) => $q
                    ->where('name', 'like', "%{$search}%")
                    ->orWhere('code', 'like', "%{$search}%")
                    ->orWhere('client_name', 'like', "%{$search}%"));
            })
            ->when($request->string('status')->toString(), fn ($q, $status) => $q->where('status', $status))
            ->latest()
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('Projects/Index', [
            'projects' => $projects,
            'filters'  => $request->only('search', 'status'),
            'statuses' => Project::STATUSES,
            'can'      => [
                'create' => $user->can('projects.create'),
                'update' => $user->can('projects.update'),
                'delete' => $user->can('projects.delete'),
                'export' => $user->can('projects.export'),
            ],
        ]);
    }

    public function create(Request $request): Response
    {
        return Inertia::render('Projects/Create', [
            'managers' => $this->managers($request->user()),
            'types'    => Project::TYPES,
            'statuses' => Project::STATUSES,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        LicenseGuard::checkProjectLimit($request->user()->company_id);

        $data = $this->validateData($request);
        $data['company_id'] = $request->user()->company_id;
        $data['agency_id'] = $request->user()->agency_id;

        $project = Project::create($data);

        return redirect()->route('projects.show', $project)
            ->with('success', 'Projet créé avec succès.');
    }

    public function show(Request $request, Project $project): Response
    {
        $this->authorizeCompany($request->user(), $project);

        $project->load(['manager:id,name', 'sites' => fn ($q) => $q->latest()]);

        return Inertia::render('Projects/Show', [
            'project' => $project,
            'can'     => [
                'update'      => $request->user()->can('projects.update'),
                'delete'      => $request->user()->can('projects.delete'),
                'createSite'  => $request->user()->can('sites.create'),
            ],
        ]);
    }

    public function edit(Request $request, Project $project): Response
    {
        $this->authorizeCompany($request->user(), $project);

        return Inertia::render('Projects/Edit', [
            'project'  => $project,
            'managers' => $this->managers($request->user()),
            'types'    => Project::TYPES,
            'statuses' => Project::STATUSES,
        ]);
    }

    public function update(Request $request, Project $project): RedirectResponse
    {
        $this->authorizeCompany($request->user(), $project);

        $project->update($this->validateData($request, $project));

        return redirect()->route('projects.show', $project)
            ->with('success', 'Projet mis à jour.');
    }

    public function destroy(Request $request, Project $project): RedirectResponse
    {
        $this->authorizeCompany($request->user(), $project);

        $project->delete();

        return redirect()->route('projects.index')
            ->with('success', 'Projet supprimé.');
    }

    /** Validation partagée création/mise à jour. */
    private function validateData(Request $request, ?Project $project = null): array
    {
        $companyId = $request->user()->company_id;

        return $request->validate([
            'code'          => ['required', 'string', 'max:50', Rule::unique('projects')->where('company_id', $companyId)->ignore($project?->id)],
            'name'          => ['required', 'string', 'max:255'],
            'description'   => ['nullable', 'string'],
            'client_name'   => ['nullable', 'string', 'max:255'],
            'type'          => ['required', Rule::in(Project::TYPES)],
            'status'        => ['required', Rule::in(Project::STATUSES)],
            'budget_amount' => ['required', 'numeric', 'min:0'],
            'currency'      => ['required', 'string', 'size:3'],
            'progress'      => ['required', 'integer', 'min:0', 'max:100'],
            'start_date'    => ['nullable', 'date'],
            'end_date'      => ['nullable', 'date', 'after_or_equal:start_date'],
            'manager_id'    => ['nullable', 'integer', Rule::exists('users', 'id')->where('company_id', $companyId)],
            'city'          => ['nullable', 'string', 'max:120'],
            'address'       => ['nullable', 'string', 'max:255'],
        ]);
    }

    /** Liste des utilisateurs de l'entreprise, candidats au rôle de directeur de projet. */
    private function managers(User $user)
    {
        return User::where('company_id', $user->company_id)
            ->orderBy('name')
            ->get(['id', 'name']);
    }

    /** Empêche l'accès à un projet d'une autre entreprise. */
    private function authorizeCompany(User $user, Project $project): void
    {
        abort_unless($project->company_id === $user->company_id, 403);
    }
}
