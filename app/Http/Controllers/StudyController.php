<?php

namespace App\Http\Controllers;

use App\Models\Project;
use App\Models\Study;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Bureau d'études — registre des études (plans, notes de calcul, études de sol…).
 * Toutes les requêtes sont isolées par entreprise (multi-tenant) et
 * protégées par les permissions « design_office.* » via le middleware de route.
 */
class StudyController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();

        $studies = Study::forUser($user)
            ->with('project:id,name')
            ->when($request->string('search')->toString(), function ($query, $search) {
                $query->where(fn ($q) => $q
                    ->where('code', 'like', "%{$search}%")
                    ->orWhere('title', 'like', "%{$search}%")
                    ->orWhere('author', 'like', "%{$search}%"));
            })
            ->when($request->string('status')->toString(), fn ($q, $status) => $q->where('status', $status))
            ->latest()
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('Studies/Index', [
            'studies'  => $studies,
            'filters'  => $request->only('search', 'status'),
            'statuses' => Study::STATUSES,
            'types'    => Study::TYPES,
            'can'      => [
                'create' => $user->can('design_office.create'),
                'update' => $user->can('design_office.update'),
                'delete' => $user->can('design_office.delete'),
            ],
        ]);
    }

    public function create(Request $request): Response
    {
        return Inertia::render('Studies/Create', [
            'projects' => $this->projects($request->user()),
            'types'    => Study::TYPES,
            'statuses' => Study::STATUSES,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $this->validateData($request);
        $data['company_id'] = $request->user()->company_id;

        $study = Study::create($data);

        return redirect()->route('studies.show', $study)
            ->with('success', 'Étude créée avec succès.');
    }

    public function show(Request $request, Study $study): Response
    {
        $this->authorizeCompany($request->user(), $study);

        $study->load('project:id,name');

        return Inertia::render('Studies/Show', [
            'study' => $study,
            'can'   => [
                'update' => $request->user()->can('design_office.update'),
                'delete' => $request->user()->can('design_office.delete'),
            ],
        ]);
    }

    public function edit(Request $request, Study $study): Response
    {
        $this->authorizeCompany($request->user(), $study);

        return Inertia::render('Studies/Edit', [
            'study'    => $study,
            'projects' => $this->projects($request->user()),
            'types'    => Study::TYPES,
            'statuses' => Study::STATUSES,
        ]);
    }

    public function update(Request $request, Study $study): RedirectResponse
    {
        $this->authorizeCompany($request->user(), $study);

        $study->update($this->validateData($request, $study));

        return redirect()->route('studies.show', $study)
            ->with('success', 'Étude mise à jour.');
    }

    public function destroy(Request $request, Study $study): RedirectResponse
    {
        $this->authorizeCompany($request->user(), $study);

        $study->delete();

        return redirect()->route('studies.index')
            ->with('success', 'Étude supprimée.');
    }

    /** Validation partagée création/mise à jour. */
    private function validateData(Request $request, ?Study $study = null): array
    {
        $companyId = $request->user()->company_id;

        return $request->validate([
            'code'       => ['required', 'string', 'max:50', Rule::unique('studies')->where('company_id', $companyId)->ignore($study?->id)],
            'title'      => ['required', 'string', 'max:255'],
            'type'       => ['required', Rule::in(Study::TYPES)],
            'status'     => ['required', Rule::in(Study::STATUSES)],
            'author'     => ['nullable', 'string', 'max:255'],
            'project_id' => ['nullable', 'integer', Rule::exists('projects', 'id')->where('company_id', $companyId)],
            'notes'      => ['nullable', 'string'],
        ]);
    }

    /** Liste des projets de l'entreprise, candidats au rattachement. */
    private function projects(User $user)
    {
        return Project::where('company_id', $user->company_id)
            ->orderBy('name')
            ->get(['id', 'name']);
    }

    /** Empêche l'accès à une étude d'une autre entreprise. */
    private function authorizeCompany(User $user, Study $study): void
    {
        abort_unless($study->company_id === $user->company_id, 403);
    }
}
