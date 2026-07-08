<?php

namespace App\Http\Controllers;

use App\Models\Project;
use App\Models\QualityControl;
use App\Models\Site;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Module Qualité — contrôles et inspections (conforme / non conforme).
 * Toutes les requêtes sont isolées par entreprise (multi-tenant) et
 * protégées par les permissions « quality.* » via le middleware de route.
 */
class QualityController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();

        $controls = QualityControl::forUser($user)
            ->with(['project:id,name', 'site:id,name'])
            ->when($request->string('search')->toString(), function ($query, $search) {
                $query->where(fn ($q) => $q
                    ->where('title', 'like', "%{$search}%")
                    ->orWhere('code', 'like', "%{$search}%"));
            })
            ->when($request->string('control_type')->toString(), fn ($q, $type) => $q->where('control_type', $type))
            ->when($request->string('result')->toString(), fn ($q, $result) => $q->where('result', $result))
            ->latest('control_date')
            ->latest('id')
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('Quality/Index', [
            'controls'     => $controls,
            'filters'      => $request->only('search', 'control_type', 'result'),
            'controlTypes' => QualityControl::CONTROL_TYPES,
            'results'      => QualityControl::RESULTS,
            'can'          => [
                'create' => $user->can('quality.create'),
                'update' => $user->can('quality.update'),
                'delete' => $user->can('quality.delete'),
            ],
        ]);
    }

    public function create(Request $request): Response
    {
        return Inertia::render('Quality/Create', [
            'projects'     => $this->projects($request->user()),
            'sites'        => $this->sites($request->user()),
            'controlTypes' => QualityControl::CONTROL_TYPES,
            'results'      => QualityControl::RESULTS,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $this->validateData($request);
        $data['company_id'] = $request->user()->company_id;

        $control = QualityControl::create($data);

        return redirect()->route('quality.show', $control)
            ->with('success', 'Contrôle qualité créé avec succès.');
    }

    public function show(Request $request, QualityControl $quality): Response
    {
        $this->authorizeCompany($request->user(), $quality);

        $quality->load(['project:id,name', 'site:id,name']);

        return Inertia::render('Quality/Show', [
            'control' => $quality,
            'can'     => [
                'update' => $request->user()->can('quality.update'),
                'delete' => $request->user()->can('quality.delete'),
            ],
        ]);
    }

    public function edit(Request $request, QualityControl $quality): Response
    {
        $this->authorizeCompany($request->user(), $quality);

        return Inertia::render('Quality/Edit', [
            'control'      => $quality,
            'projects'     => $this->projects($request->user()),
            'sites'        => $this->sites($request->user()),
            'controlTypes' => QualityControl::CONTROL_TYPES,
            'results'      => QualityControl::RESULTS,
        ]);
    }

    public function update(Request $request, QualityControl $quality): RedirectResponse
    {
        $this->authorizeCompany($request->user(), $quality);

        $quality->update($this->validateData($request, $quality));

        return redirect()->route('quality.show', $quality)
            ->with('success', 'Contrôle qualité mis à jour.');
    }

    public function destroy(Request $request, QualityControl $quality): RedirectResponse
    {
        $this->authorizeCompany($request->user(), $quality);

        $quality->delete();

        return redirect()->route('quality.index')
            ->with('success', 'Contrôle qualité supprimé.');
    }

    /** Validation partagée création/mise à jour. */
    private function validateData(Request $request, ?QualityControl $control = null): array
    {
        $companyId = $request->user()->company_id;

        return $request->validate([
            'code'         => ['required', 'string', 'max:50', Rule::unique('quality_controls')->where('company_id', $companyId)->ignore($control?->id)],
            'title'        => ['required', 'string', 'max:255'],
            'control_type' => ['required', Rule::in(QualityControl::CONTROL_TYPES)],
            'result'       => ['required', Rule::in(QualityControl::RESULTS)],
            'description'  => ['nullable', 'string'],
            'control_date' => ['required', 'date'],
            'inspector'    => ['nullable', 'string', 'max:255'],
            'observations' => ['nullable', 'string'],
            'project_id'   => ['nullable', 'integer', Rule::exists('projects', 'id')->where('company_id', $companyId)],
            'site_id'      => ['nullable', 'integer', Rule::exists('sites', 'id')->where('company_id', $companyId)],
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

    /** Empêche l'accès à un contrôle d'une autre entreprise. */
    private function authorizeCompany(User $user, QualityControl $control): void
    {
        abort_unless($control->company_id === $user->company_id, 403);
    }
}
