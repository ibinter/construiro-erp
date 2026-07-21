<?php

namespace App\Http\Controllers;

use App\Models\CostEntry;
use App\Models\Project;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Comptabilité analytique : ventilation des charges et produits par axe
 * analytique (chantier, matériel, main d'œuvre, sous-traitance, frais
 * généraux). La répartition par axe se calcule par agrégation SQL groupée.
 * Isolation multi-tenant par entreprise, permissions « cost_accounting.* ».
 */
class CostAccountingController extends Controller
{
    /**
     * Tableau de bord analytique : synthèse charges / produits / marge par axe
     * (agrégation groupée, anti N+1) + liste des écritures. Filtre par projet.
     */
    public function index(Request $request): Response
    {
        $user = $request->user();
        $companyId = $user->company_id;
        $projectId = $request->integer('project_id') ?: null;

        // Répartition par axe analytique (une seule requête groupée).
        $breakdown = CostEntry::query()
            ->where('company_id', $companyId)
            ->when($projectId, fn ($q) => $q->where('project_id', $projectId))
            ->selectRaw("axis,
                SUM(CASE WHEN type = 'charge' THEN amount ELSE 0 END) as charges,
                SUM(CASE WHEN type = 'produit' THEN amount ELSE 0 END) as produits")
            ->groupBy('axis')
            ->get()
            ->map(fn ($row) => [
                'axis'     => $row->axis,
                'charges'  => (float) $row->charges,
                'produits' => (float) $row->produits,
                'marge'    => (float) $row->produits - (float) $row->charges,
            ]);

        // Totaux consolidés (tous axes confondus).
        $totals = [
            'charges'  => (float) $breakdown->sum('charges'),
            'produits' => (float) $breakdown->sum('produits'),
            'marge'    => (float) $breakdown->sum('marge'),
        ];

        // Écritures récentes (filtrées éventuellement par projet).
        $entries = CostEntry::query()
            ->where('company_id', $companyId)
            ->with('project:id,name,code')
            ->when($projectId, fn ($q) => $q->where('project_id', $projectId))
            ->latest('date')
            ->latest('id')
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('CostAccounting/Index', [
            'breakdown' => $breakdown,
            'totals'    => $totals,
            'entries'   => $entries,
            'projects'  => Project::where('company_id', $companyId)->orderBy('name')->get(['id', 'name']),
            'axes'      => CostEntry::AXES,
            'types'     => CostEntry::TYPES,
            'filters'   => ['project_id' => $projectId],
            'can'       => [
                'create' => $user->can('cost_accounting.create'),
            ],
        ]);
    }

    /** Formulaire d'édition d'une écriture analytique. */
    public function edit(Request $request, CostEntry $costEntry): Response
    {
        $user = $request->user();
        abort_unless($costEntry->company_id === $user->company_id, 403);

        $costEntry->load('project:id,name');

        return Inertia::render('CostAccounting/Edit', [
            'entry'    => $costEntry,
            'projects' => Project::where('company_id', $user->company_id)->orderBy('name')->get(['id', 'name']),
            'axes'     => CostEntry::AXES,
            'types'    => CostEntry::TYPES,
        ]);
    }

    /** Met à jour une écriture analytique existante. */
    public function update(Request $request, CostEntry $costEntry): RedirectResponse
    {
        $user      = $request->user();
        $companyId = $user->company_id;

        abort_unless($costEntry->company_id === $companyId, 403);

        $data = $request->validate([
            'project_id' => ['nullable', 'integer', Rule::exists('projects', 'id')->where('company_id', $companyId)],
            'date'       => ['required', 'date'],
            'axis'       => ['required', Rule::in(CostEntry::AXES)],
            'label'      => ['required', 'string', 'max:255'],
            'type'       => ['required', Rule::in(CostEntry::TYPES)],
            'amount'     => ['required', 'numeric', 'min:0.01'],
            'reference'  => ['nullable', 'string', 'max:255'],
        ]);

        $costEntry->update($data);

        return redirect()->route('cost_accounting.index')
            ->with('success', 'Écriture analytique mise à jour.');
    }

    /** Enregistre une écriture analytique (charge ou produit) sur un axe. */
    public function store(Request $request): RedirectResponse
    {
        $user = $request->user();
        $companyId = $user->company_id;

        $data = $request->validate([
            'project_id' => ['nullable', 'integer', Rule::exists('projects', 'id')->where('company_id', $companyId)],
            'date'       => ['required', 'date'],
            'axis'       => ['required', Rule::in(CostEntry::AXES)],
            'label'      => ['required', 'string', 'max:255'],
            'type'       => ['required', Rule::in(CostEntry::TYPES)],
            'amount'     => ['required', 'numeric', 'min:0.01'],
            'reference'  => ['nullable', 'string', 'max:255'],
        ]);

        $data['company_id'] = $companyId;

        CostEntry::create($data);

        return back()->with('success', 'Écriture analytique enregistrée.');
    }
}
