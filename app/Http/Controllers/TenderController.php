<?php

namespace App\Http\Controllers;

use App\Models\Project;
use App\Models\Tender;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Gestion des appels d'offres (tenders).
 * Toutes les requêtes sont isolées par entreprise (multi-tenant) et
 * protégées par les permissions « tenders.* » via le middleware de route.
 */
class TenderController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();

        $tenders = Tender::forUser($user)
            ->with('project:id,name')
            ->when($request->string('search')->toString(), function ($query, $search) {
                $query->where(fn ($q) => $q
                    ->where('title', 'like', "%{$search}%")
                    ->orWhere('code', 'like', "%{$search}%")
                    ->orWhere('client_name', 'like', "%{$search}%"));
            })
            ->when($request->string('type')->toString(), fn ($q, $type) => $q->where('type', $type))
            ->when($request->string('status')->toString(), fn ($q, $status) => $q->where('status', $status))
            ->latest()
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('Tenders/Index', [
            'tenders'  => $tenders,
            'filters'  => $request->only('search', 'type', 'status'),
            'types'    => Tender::TYPES,
            'statuses' => Tender::STATUSES,
            'can'      => [
                'create' => $user->can('tenders.create'),
                'update' => $user->can('tenders.update'),
                'delete' => $user->can('tenders.delete'),
            ],
        ]);
    }

    public function create(Request $request): Response
    {
        return Inertia::render('Tenders/Create', [
            'types'    => Tender::TYPES,
            'statuses' => Tender::STATUSES,
            'projects' => $this->projects($request->user()),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $this->validateData($request);
        $data['company_id'] = $request->user()->company_id;

        $tender = Tender::create($data);

        return redirect()->route('tenders.show', $tender)
            ->with('success', 'Appel d\'offres créé avec succès.');
    }

    public function show(Request $request, Tender $tender): Response
    {
        $this->authorizeCompany($request->user(), $tender);

        $tender->load('project:id,name');

        return Inertia::render('Tenders/Show', [
            'tender' => $tender,
            'can'    => [
                'update' => $request->user()->can('tenders.update'),
                'delete' => $request->user()->can('tenders.delete'),
            ],
        ]);
    }

    public function edit(Request $request, Tender $tender): Response
    {
        $this->authorizeCompany($request->user(), $tender);

        return Inertia::render('Tenders/Edit', [
            'tender'   => $tender,
            'types'    => Tender::TYPES,
            'statuses' => Tender::STATUSES,
            'projects' => $this->projects($request->user()),
        ]);
    }

    public function update(Request $request, Tender $tender): RedirectResponse
    {
        $this->authorizeCompany($request->user(), $tender);

        $tender->update($this->validateData($request, $tender));

        return redirect()->route('tenders.show', $tender)
            ->with('success', 'Appel d\'offres mis à jour.');
    }

    public function destroy(Request $request, Tender $tender): RedirectResponse
    {
        $this->authorizeCompany($request->user(), $tender);

        $tender->delete();

        return redirect()->route('tenders.index')
            ->with('success', 'Appel d\'offres supprimé.');
    }

    /** Validation partagée création/mise à jour. */
    private function validateData(Request $request, ?Tender $tender = null): array
    {
        $companyId = $request->user()->company_id;

        return $request->validate([
            'code'                => ['required', 'string', 'max:50', Rule::unique('tenders')->where('company_id', $companyId)->ignore($tender?->id)],
            'title'               => ['required', 'string', 'max:255'],
            'client_name'         => ['nullable', 'string', 'max:255'],
            'project_id'          => ['nullable', 'integer', Rule::exists('projects', 'id')->where('company_id', $companyId)],
            'type'                => ['required', Rule::in(Tender::TYPES)],
            'estimated_amount'    => ['required', 'numeric', 'min:0'],
            'currency'            => ['required', 'string', 'size:3'],
            'status'              => ['required', Rule::in(Tender::STATUSES)],
            'submission_deadline' => ['nullable', 'date'],
            'submitted_at'        => ['nullable', 'date'],
            'notes'               => ['nullable', 'string'],
        ]);
    }

    /** Projets de l'entreprise, candidats au rattachement. */
    private function projects(User $user)
    {
        return Project::where('company_id', $user->company_id)
            ->orderBy('name')
            ->get(['id', 'name']);
    }

    /** Empêche l'accès à un appel d'offres d'une autre entreprise. */
    private function authorizeCompany(User $user, Tender $tender): void
    {
        abort_unless($tender->company_id === $user->company_id, 403);
    }
}
