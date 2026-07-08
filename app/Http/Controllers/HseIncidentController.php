<?php

namespace App\Http\Controllers;

use App\Models\HseIncident;
use App\Models\Project;
use App\Models\Site;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Module QHSE — déclaration et suivi des incidents / accidents.
 * Toutes les requêtes sont isolées par entreprise (multi-tenant) et
 * protégées par les permissions « qhse.* » via le middleware de route.
 */
class HseIncidentController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();

        $incidents = HseIncident::forUser($user)
            ->with(['project:id,name', 'site:id,name'])
            ->when($request->string('search')->toString(), function ($query, $search) {
                $query->where(fn ($q) => $q
                    ->where('title', 'like', "%{$search}%")
                    ->orWhere('code', 'like', "%{$search}%"));
            })
            ->when($request->string('type')->toString(), fn ($q, $type) => $q->where('type', $type))
            ->when($request->string('severity')->toString(), fn ($q, $severity) => $q->where('severity', $severity))
            ->when($request->string('status')->toString(), fn ($q, $status) => $q->where('status', $status))
            ->latest('incident_date')
            ->latest('id')
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('Hse/Index', [
            'incidents'  => $incidents,
            'filters'    => $request->only('search', 'type', 'severity', 'status'),
            'types'      => HseIncident::TYPES,
            'severities' => HseIncident::SEVERITIES,
            'statuses'   => HseIncident::STATUSES,
            'can'        => [
                'create' => $user->can('qhse.create'),
                'update' => $user->can('qhse.update'),
                'delete' => $user->can('qhse.delete'),
            ],
        ]);
    }

    public function create(Request $request): Response
    {
        return Inertia::render('Hse/Create', [
            'projects'   => $this->projects($request->user()),
            'sites'      => $this->sites($request->user()),
            'types'      => HseIncident::TYPES,
            'severities' => HseIncident::SEVERITIES,
            'statuses'   => HseIncident::STATUSES,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $this->validateData($request);
        $data['company_id'] = $request->user()->company_id;

        $incident = HseIncident::create($data);

        return redirect()->route('hse.show', $incident)
            ->with('success', 'Incident QHSE déclaré avec succès.');
    }

    public function show(Request $request, HseIncident $hse): Response
    {
        $this->authorizeCompany($request->user(), $hse);

        $hse->load(['project:id,name', 'site:id,name']);

        return Inertia::render('Hse/Show', [
            'incident' => $hse,
            'can'      => [
                'update' => $request->user()->can('qhse.update'),
                'delete' => $request->user()->can('qhse.delete'),
            ],
        ]);
    }

    public function edit(Request $request, HseIncident $hse): Response
    {
        $this->authorizeCompany($request->user(), $hse);

        return Inertia::render('Hse/Edit', [
            'incident'   => $hse,
            'projects'   => $this->projects($request->user()),
            'sites'      => $this->sites($request->user()),
            'types'      => HseIncident::TYPES,
            'severities' => HseIncident::SEVERITIES,
            'statuses'   => HseIncident::STATUSES,
        ]);
    }

    public function update(Request $request, HseIncident $hse): RedirectResponse
    {
        $this->authorizeCompany($request->user(), $hse);

        $hse->update($this->validateData($request, $hse));

        return redirect()->route('hse.show', $hse)
            ->with('success', 'Incident QHSE mis à jour.');
    }

    public function destroy(Request $request, HseIncident $hse): RedirectResponse
    {
        $this->authorizeCompany($request->user(), $hse);

        $hse->delete();

        return redirect()->route('hse.index')
            ->with('success', 'Incident QHSE supprimé.');
    }

    /** Validation partagée création/mise à jour. */
    private function validateData(Request $request, ?HseIncident $incident = null): array
    {
        $companyId = $request->user()->company_id;

        return $request->validate([
            'code'              => ['required', 'string', 'max:50', Rule::unique('hse_incidents')->where('company_id', $companyId)->ignore($incident?->id)],
            'title'             => ['required', 'string', 'max:255'],
            'type'              => ['required', Rule::in(HseIncident::TYPES)],
            'severity'          => ['required', Rule::in(HseIncident::SEVERITIES)],
            'status'            => ['required', Rule::in(HseIncident::STATUSES)],
            'description'       => ['nullable', 'string'],
            'incident_date'     => ['required', 'date'],
            'location'          => ['nullable', 'string', 'max:255'],
            'corrective_action' => ['nullable', 'string'],
            'reported_by'       => ['nullable', 'string', 'max:255'],
            'project_id'        => ['nullable', 'integer', Rule::exists('projects', 'id')->where('company_id', $companyId)],
            'site_id'           => ['nullable', 'integer', Rule::exists('sites', 'id')->where('company_id', $companyId)],
        ]);
    }

    /** Liste des projets de l'entreprise pour le rattachement. */
    private function projects(User $user)
    {
        return Project::where('company_id', $user->company_id)
            ->orderBy('name')
            ->get(['id', 'name', 'code']);
    }

    /** Liste des chantiers de l'entreprise pour le rattachement. */
    private function sites(User $user)
    {
        return Site::where('company_id', $user->company_id)
            ->orderBy('name')
            ->get(['id', 'name', 'code']);
    }

    /** Empêche l'accès à un incident d'une autre entreprise. */
    private function authorizeCompany(User $user, HseIncident $incident): void
    {
        abort_unless($incident->company_id === $user->company_id, 403);
    }
}
