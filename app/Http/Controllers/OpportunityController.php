<?php

namespace App\Http\Controllers;

use App\Models\Client;
use App\Models\Opportunity;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Gestion des opportunités commerciales (CRM).
 * Toutes les requêtes sont isolées par entreprise (multi-tenant) et
 * protégées par les permissions « crm.* » via le middleware de route.
 */
class OpportunityController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();

        $opportunities = Opportunity::forUser($user)
            ->with(['client:id,name', 'assignee:id,name'])
            ->when($request->string('search')->toString(), function ($query, $search) {
                $query->where(fn ($q) => $q
                    ->where('title', 'like', "%{$search}%")
                    ->orWhere('code', 'like', "%{$search}%")
                    ->orWhere('client_name', 'like', "%{$search}%"));
            })
            ->when($request->string('stage')->toString(), fn ($q, $stage) => $q->where('stage', $stage))
            ->latest()
            ->paginate(10)
            ->withQueryString();

        // Résumé du pipeline : nombre et montant estimé par étape.
        $pipeline = Opportunity::forUser($user)
            ->selectRaw('stage, COUNT(*) as count, SUM(estimated_amount) as total')
            ->groupBy('stage')
            ->get()
            ->keyBy('stage');

        return Inertia::render('Crm/Index', [
            'opportunities' => $opportunities,
            'filters'       => $request->only('search', 'stage'),
            'stages'        => Opportunity::STAGES,
            'pipeline'      => collect(Opportunity::STAGES)->map(fn ($stage) => [
                'stage' => $stage,
                'count' => (int) ($pipeline[$stage]->count ?? 0),
                'total' => (float) ($pipeline[$stage]->total ?? 0),
            ])->values(),
            'can' => [
                'create' => $user->can('crm.create'),
                'update' => $user->can('crm.update'),
                'delete' => $user->can('crm.delete'),
            ],
        ]);
    }

    public function create(Request $request): Response
    {
        $user = $request->user();

        return Inertia::render('Crm/Create', [
            'stages'  => Opportunity::STAGES,
            'clients' => $this->clients($user),
            'users'   => $this->users($user),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $this->validateData($request);
        $data['company_id'] = $request->user()->company_id;

        $opportunity = Opportunity::create($data);

        return redirect()->route('crm.show', $opportunity)
            ->with('success', 'Opportunité créée avec succès.');
    }

    public function show(Request $request, Opportunity $opportunity): Response
    {
        $this->authorizeCompany($request->user(), $opportunity);

        $opportunity->load(['client:id,name', 'assignee:id,name']);

        return Inertia::render('Crm/Show', [
            'opportunity' => $opportunity,
            'can'         => [
                'update' => $request->user()->can('crm.update'),
                'delete' => $request->user()->can('crm.delete'),
            ],
        ]);
    }

    public function edit(Request $request, Opportunity $opportunity): Response
    {
        $this->authorizeCompany($request->user(), $opportunity);

        $user = $request->user();

        return Inertia::render('Crm/Edit', [
            'opportunity' => $opportunity,
            'stages'      => Opportunity::STAGES,
            'clients'     => $this->clients($user),
            'users'       => $this->users($user),
        ]);
    }

    public function update(Request $request, Opportunity $opportunity): RedirectResponse
    {
        $this->authorizeCompany($request->user(), $opportunity);

        $opportunity->update($this->validateData($request, $opportunity));

        return redirect()->route('crm.show', $opportunity)
            ->with('success', 'Opportunité mise à jour.');
    }

    public function destroy(Request $request, Opportunity $opportunity): RedirectResponse
    {
        $this->authorizeCompany($request->user(), $opportunity);

        $opportunity->delete();

        return redirect()->route('crm.index')
            ->with('success', 'Opportunité supprimée.');
    }

    /** Validation partagée création/mise à jour. */
    private function validateData(Request $request, ?Opportunity $opportunity = null): array
    {
        $companyId = $request->user()->company_id;

        return $request->validate([
            'code'                => ['required', 'string', 'max:50', Rule::unique('opportunities')->where('company_id', $companyId)->ignore($opportunity?->id)],
            'title'               => ['required', 'string', 'max:255'],
            'client_name'         => ['nullable', 'string', 'max:255'],
            'client_id'           => ['nullable', 'integer', Rule::exists('clients', 'id')->where('company_id', $companyId)],
            'assignee_id'         => ['nullable', 'integer', Rule::exists('users', 'id')->where('company_id', $companyId)],
            'estimated_amount'    => ['required', 'numeric', 'min:0'],
            'currency'            => ['required', 'string', 'size:3'],
            'stage'               => ['required', Rule::in(Opportunity::STAGES)],
            'probability'         => ['required', 'integer', 'min:0', 'max:100'],
            'expected_close_date' => ['nullable', 'date'],
            'source'              => ['nullable', 'string', 'max:255'],
            'notes'               => ['nullable', 'string'],
        ]);
    }

    /** Clients de l'entreprise, candidats au rattachement. */
    private function clients(User $user)
    {
        return Client::where('company_id', $user->company_id)
            ->orderBy('name')
            ->get(['id', 'name']);
    }

    /** Utilisateurs de l'entreprise, candidats au rôle de commercial. */
    private function users(User $user)
    {
        return User::where('company_id', $user->company_id)
            ->orderBy('name')
            ->get(['id', 'name']);
    }

    /** Empêche l'accès à une opportunité d'une autre entreprise. */
    private function authorizeCompany(User $user, Opportunity $opportunity): void
    {
        abort_unless($opportunity->company_id === $user->company_id, 403);
    }
}
