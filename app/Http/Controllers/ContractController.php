<?php

namespace App\Http\Controllers;

use App\Models\Contract;
use App\Models\Project;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Gestion des contrats.
 * Toutes les requêtes sont isolées par entreprise (multi-tenant) et
 * protégées par les permissions « contracts.* » via le middleware de route.
 */
class ContractController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();

        $contracts = Contract::forUser($user)
            ->with('project:id,name')
            ->when($request->string('search')->toString(), function ($query, $search) {
                $query->where(fn ($q) => $q
                    ->where('code', 'like', "%{$search}%")
                    ->orWhere('title', 'like', "%{$search}%")
                    ->orWhere('party_name', 'like', "%{$search}%"));
            })
            ->when($request->string('status')->toString(), fn ($q, $status) => $q->where('status', $status))
            ->when($request->string('type')->toString(), fn ($q, $type) => $q->where('type', $type))
            ->latest()
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('Contracts/Index', [
            'contracts' => $contracts,
            'filters'   => $request->only('search', 'status', 'type'),
            'statuses'  => Contract::STATUSES,
            'types'     => Contract::TYPES,
            'can'       => [
                'create' => $user->can('contracts.create'),
                'update' => $user->can('contracts.update'),
                'delete' => $user->can('contracts.delete'),
            ],
        ]);
    }

    public function create(Request $request): Response
    {
        return Inertia::render('Contracts/Create', [
            'projects' => $this->projects($request->user()),
            'types'    => Contract::TYPES,
            'statuses' => Contract::STATUSES,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $this->validateData($request);
        $data['company_id'] = $request->user()->company_id;

        $contract = Contract::create($data);

        return redirect()->route('contracts.show', $contract)
            ->with('success', 'Contrat créé avec succès.');
    }

    public function show(Request $request, Contract $contract): Response
    {
        $this->authorizeCompany($request->user(), $contract);

        $contract->load('project:id,name');

        return Inertia::render('Contracts/Show', [
            'contract' => $contract,
            'can'      => [
                'update' => $request->user()->can('contracts.update'),
                'delete' => $request->user()->can('contracts.delete'),
                'sign'   => $request->user()->can('contracts.update'),
            ],
        ]);
    }

    public function edit(Request $request, Contract $contract): Response
    {
        $this->authorizeCompany($request->user(), $contract);

        return Inertia::render('Contracts/Edit', [
            'contract' => $contract,
            'projects' => $this->projects($request->user()),
            'types'    => Contract::TYPES,
            'statuses' => Contract::STATUSES,
        ]);
    }

    public function update(Request $request, Contract $contract): RedirectResponse
    {
        $this->authorizeCompany($request->user(), $contract);

        $contract->update($this->validateData($request, $contract));

        return redirect()->route('contracts.show', $contract)
            ->with('success', 'Contrat mis à jour.');
    }

    public function destroy(Request $request, Contract $contract): RedirectResponse
    {
        $this->authorizeCompany($request->user(), $contract);

        $contract->delete();

        return redirect()->route('contracts.index')
            ->with('success', 'Contrat supprimé.');
    }

    /** Validation partagée création/mise à jour. */
    private function validateData(Request $request, ?Contract $contract = null): array
    {
        $companyId = $request->user()->company_id;

        return $request->validate([
            'code'        => ['required', 'string', 'max:50', Rule::unique('contracts')->where('company_id', $companyId)->ignore($contract?->id)],
            'title'       => ['required', 'string', 'max:255'],
            'type'        => ['required', Rule::in(Contract::TYPES)],
            'party_name'  => ['nullable', 'string', 'max:255'],
            'amount'      => ['required', 'numeric', 'min:0'],
            'currency'    => ['required', 'string', 'size:3'],
            'status'      => ['required', Rule::in(Contract::STATUSES)],
            'start_date'  => ['nullable', 'date'],
            'end_date'    => ['nullable', 'date', 'after_or_equal:start_date'],
            'signed_date' => ['nullable', 'date'],
            'notes'       => ['nullable', 'string'],
            'project_id'  => ['nullable', 'integer', Rule::exists('projects', 'id')->where('company_id', $companyId)],
        ]);
    }

    /** Liste des projets de l'entreprise, candidats au rattachement optionnel. */
    private function projects(User $user)
    {
        return Project::where('company_id', $user->company_id)
            ->orderBy('name')
            ->get(['id', 'name']);
    }

    /** Empêche l'accès à un contrat d'une autre entreprise. */
    private function authorizeCompany(User $user, Contract $contract): void
    {
        abort_unless($contract->company_id === $user->company_id, 403);
    }
}
