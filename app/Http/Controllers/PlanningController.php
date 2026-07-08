<?php

namespace App\Http\Controllers;

use App\Models\Project;
use App\Models\Task;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Module Planning & Gantt.
 * Gère les tâches de planning d'un projet. Isolation multi-tenant stricte,
 * protégé par les permissions « planning.* » via le middleware de route.
 */
class PlanningController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();

        // Liste des projets de l'entreprise pour le sélecteur.
        $projects = Project::forUser($user)
            ->orderBy('name')
            ->get(['id', 'name', 'code']);

        // Projet sélectionné (query ?project=ID), validé multi-tenant.
        $selectedProject = null;
        $tasks = [];
        $bounds = ['start' => null, 'end' => null];

        $projectId = $request->integer('project');

        if ($projectId) {
            $selectedProject = Project::forUser($user)->find($projectId);
        }

        if ($selectedProject) {
            $tasks = Task::forUser($user)
                ->where('project_id', $selectedProject->id)
                ->with('assignee:id,name')
                ->orderBy('position')
                ->orderBy('start_date')
                ->get();

            // Bornes de dates pour l'échelle temporelle du Gantt.
            $bounds = [
                'start' => optional($tasks->whereNotNull('start_date')->min('start_date'))?->toDateString()
                    ?? optional($selectedProject->start_date)?->toDateString(),
                'end'   => optional($tasks->whereNotNull('end_date')->max('end_date'))?->toDateString()
                    ?? optional($selectedProject->end_date)?->toDateString(),
            ];
        }

        return Inertia::render('Planning/Index', [
            'projects'        => $projects,
            'selectedProject' => $selectedProject
                ? $selectedProject->only(['id', 'name', 'code'])
                : null,
            'tasks'           => $tasks,
            'bounds'          => $bounds,
            'members'         => $this->members($user),
            'statuses'        => Task::STATUSES,
            'can'             => [
                'create' => $user->can('planning.create'),
                'update' => $user->can('planning.update'),
                'delete' => $user->can('planning.delete'),
            ],
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $user = $request->user();

        $data = $this->validateData($request, $user);

        // Le projet doit appartenir à l'entreprise de l'utilisateur.
        $project = Project::forUser($user)->findOrFail($data['project_id']);

        $data['company_id'] = $user->company_id;

        Task::create($data);

        return redirect()->route('planning.index', ['project' => $project->id])
            ->with('success', 'Tâche créée avec succès.');
    }

    public function update(Request $request, Task $task): RedirectResponse
    {
        $this->authorizeTask($request->user(), $task);

        $data = $this->validateData($request, $request->user(), $task);

        // Interdit de déplacer la tâche vers un projet d'une autre entreprise.
        Project::forUser($request->user())->findOrFail($data['project_id']);

        $task->update($data);

        return redirect()->route('planning.index', ['project' => $task->project_id])
            ->with('success', 'Tâche mise à jour.');
    }

    public function destroy(Request $request, Task $task): RedirectResponse
    {
        $this->authorizeTask($request->user(), $task);

        $projectId = $task->project_id;
        $task->delete();

        return redirect()->route('planning.index', ['project' => $projectId])
            ->with('success', 'Tâche supprimée.');
    }

    /** Validation partagée création / mise à jour. */
    private function validateData(Request $request, User $user, ?Task $task = null): array
    {
        $companyId = $user->company_id;

        return $request->validate([
            'project_id'  => ['required', 'integer', Rule::exists('projects', 'id')->where('company_id', $companyId)],
            'site_id'     => ['nullable', 'integer', Rule::exists('sites', 'id')->where('company_id', $companyId)],
            'parent_id'   => ['nullable', 'integer', Rule::exists('tasks', 'id')->where('company_id', $companyId)],
            'assignee_id' => ['nullable', 'integer', Rule::exists('users', 'id')->where('company_id', $companyId)],
            'name'        => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'start_date'  => ['nullable', 'date'],
            'end_date'    => ['nullable', 'date', 'after_or_equal:start_date'],
            'progress'    => ['required', 'integer', 'min:0', 'max:100'],
            'status'      => ['required', Rule::in(Task::STATUSES)],
            'position'    => ['nullable', 'integer', 'min:0'],
        ]);
    }

    /** Liste des utilisateurs de l'entreprise, candidats au rôle de responsable. */
    private function members(User $user)
    {
        return User::where('company_id', $user->company_id)
            ->orderBy('name')
            ->get(['id', 'name']);
    }

    /** Empêche l'accès à une tâche d'une autre entreprise. */
    private function authorizeTask(User $user, Task $task): void
    {
        abort_unless($task->company_id === $user->company_id, 403);
    }
}
