<?php

namespace App\Http\Controllers;

use App\Models\Project;
use App\Models\Site;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

/**
 * Gestion des chantiers, rattachés à un projet.
 * Créés / modifiés depuis la fiche projet. Isolation multi-tenant.
 */
class SiteController extends Controller
{
    public function store(Request $request, Project $project): RedirectResponse
    {
        $this->authorizeCompany($request->user(), $project);

        $data = $this->validateData($request, $project);
        $data['company_id'] = $project->company_id;
        $data['project_id'] = $project->id;

        Site::create($data);

        return redirect()->route('projects.show', $project)
            ->with('success', 'Chantier ajouté.');
    }

    public function update(Request $request, Project $project, Site $site): RedirectResponse
    {
        $this->authorizeSite($request->user(), $project, $site);

        $site->update($this->validateData($request, $project, $site));

        return redirect()->route('projects.show', $project)
            ->with('success', 'Chantier mis à jour.');
    }

    public function destroy(Request $request, Project $project, Site $site): RedirectResponse
    {
        $this->authorizeSite($request->user(), $project, $site);

        $site->delete();

        return redirect()->route('projects.show', $project)
            ->with('success', 'Chantier supprimé.');
    }

    private function validateData(Request $request, Project $project, ?Site $site = null): array
    {
        return $request->validate([
            'code'            => ['required', 'string', 'max:50', Rule::unique('sites')->where('project_id', $project->id)->ignore($site?->id)],
            'name'            => ['required', 'string', 'max:255'],
            'description'     => ['nullable', 'string'],
            'status'          => ['required', Rule::in(Site::STATUSES)],
            'progress'        => ['required', 'integer', 'min:0', 'max:100'],
            'start_date'      => ['nullable', 'date'],
            'end_date'        => ['nullable', 'date', 'after_or_equal:start_date'],
            'city'            => ['nullable', 'string', 'max:120'],
            'address'         => ['nullable', 'string', 'max:255'],
            'site_manager_id' => ['nullable', 'integer', Rule::exists('users', 'id')->where('company_id', $project->company_id)],
        ]);
    }

    private function authorizeCompany(User $user, Project $project): void
    {
        abort_unless($project->company_id === $user->company_id, 403);
    }

    private function authorizeSite(User $user, Project $project, Site $site): void
    {
        abort_unless(
            $project->company_id === $user->company_id && $site->project_id === $project->id,
            403
        );
    }
}
