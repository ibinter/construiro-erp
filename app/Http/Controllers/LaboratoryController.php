<?php

namespace App\Http\Controllers;

use App\Models\LabTest;
use App\Models\Project;
use App\Models\Site;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Module Laboratoire — essais et prélèvements (conforme / non conforme).
 * Toutes les requêtes sont isolées par entreprise (multi-tenant) et
 * protégées par les permissions « laboratory.* » via le middleware de route.
 */
class LaboratoryController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();

        $tests = LabTest::forUser($user)
            ->with(['project:id,name', 'site:id,name'])
            ->when($request->string('search')->toString(), function ($query, $search) {
                $query->where(fn ($q) => $q
                    ->where('test_name', 'like', "%{$search}%")
                    ->orWhere('code', 'like', "%{$search}%")
                    ->orWhere('technician', 'like', "%{$search}%"));
            })
            ->when($request->string('sample_type')->toString(), fn ($q, $type) => $q->where('sample_type', $type))
            ->when($request->string('result')->toString(), fn ($q, $result) => $q->where('result', $result))
            ->latest('test_date')
            ->latest('id')
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('Laboratory/Index', [
            'tests'       => $tests,
            'filters'     => $request->only('search', 'sample_type', 'result'),
            'sampleTypes' => LabTest::SAMPLE_TYPES,
            'results'     => LabTest::RESULTS,
            'can'         => [
                'create' => $user->can('laboratory.create'),
                'update' => $user->can('laboratory.update'),
                'delete' => $user->can('laboratory.delete'),
            ],
        ]);
    }

    public function create(Request $request): Response
    {
        return Inertia::render('Laboratory/Create', [
            'projects'    => $this->projects($request->user()),
            'sites'       => $this->sites($request->user()),
            'sampleTypes' => LabTest::SAMPLE_TYPES,
            'results'     => LabTest::RESULTS,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $this->validateData($request);
        $data['company_id'] = $request->user()->company_id;

        $test = LabTest::create($data);

        return redirect()->route('laboratory.show', $test)
            ->with('success', 'Essai de laboratoire créé avec succès.');
    }

    public function show(Request $request, LabTest $laboratory): Response
    {
        $this->authorizeCompany($request->user(), $laboratory);

        $laboratory->load(['project:id,name', 'site:id,name']);

        return Inertia::render('Laboratory/Show', [
            'test' => $laboratory,
            'can'  => [
                'update' => $request->user()->can('laboratory.update'),
                'delete' => $request->user()->can('laboratory.delete'),
            ],
        ]);
    }

    public function edit(Request $request, LabTest $laboratory): Response
    {
        $this->authorizeCompany($request->user(), $laboratory);

        return Inertia::render('Laboratory/Edit', [
            'test'        => $laboratory,
            'projects'    => $this->projects($request->user()),
            'sites'       => $this->sites($request->user()),
            'sampleTypes' => LabTest::SAMPLE_TYPES,
            'results'     => LabTest::RESULTS,
        ]);
    }

    public function update(Request $request, LabTest $laboratory): RedirectResponse
    {
        $this->authorizeCompany($request->user(), $laboratory);

        $laboratory->update($this->validateData($request, $laboratory));

        return redirect()->route('laboratory.show', $laboratory)
            ->with('success', 'Essai de laboratoire mis à jour.');
    }

    public function destroy(Request $request, LabTest $laboratory): RedirectResponse
    {
        $this->authorizeCompany($request->user(), $laboratory);

        $laboratory->delete();

        return redirect()->route('laboratory.index')
            ->with('success', 'Essai de laboratoire supprimé.');
    }

    /** Validation partagée création/mise à jour. */
    private function validateData(Request $request, ?LabTest $test = null): array
    {
        $companyId = $request->user()->company_id;

        return $request->validate([
            'code'         => ['required', 'string', 'max:50', Rule::unique('lab_tests')->where('company_id', $companyId)->ignore($test?->id)],
            'sample_type'  => ['required', Rule::in(LabTest::SAMPLE_TYPES)],
            'test_name'    => ['required', 'string', 'max:255'],
            'result'       => ['required', Rule::in(LabTest::RESULTS)],
            'sample_date'  => ['nullable', 'date'],
            'test_date'    => ['nullable', 'date'],
            'result_value' => ['nullable', 'numeric'],
            'unit'         => ['nullable', 'string', 'max:50'],
            'threshold'    => ['nullable', 'numeric'],
            'technician'   => ['nullable', 'string', 'max:255'],
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

    /** Empêche l'accès à un essai d'une autre entreprise. */
    private function authorizeCompany(User $user, LabTest $test): void
    {
        abort_unless($test->company_id === $user->company_id, 403);
    }
}
