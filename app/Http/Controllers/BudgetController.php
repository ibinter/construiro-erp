<?php

namespace App\Http\Controllers;

use App\Models\Budget;
use App\Models\Project;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Gestion des budgets prévisionnels. Chaque budget regroupe des lignes
 * budgétaires (planifié vs réalisé). Isolation multi-tenant par entreprise,
 * permissions « budget.* » via le middleware de route.
 */
class BudgetController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();

        $budgets = Budget::forUser($user)
            ->with('project:id,name')
            ->when($request->string('search')->toString(), function ($query, $search) {
                $query->where(fn ($q) => $q
                    ->where('code', 'like', "%{$search}%")
                    ->orWhere('title', 'like', "%{$search}%"));
            })
            ->when($request->string('status')->toString(), fn ($q, $status) => $q->where('status', $status))
            ->latest()
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('Budgets/Index', [
            'budgets'  => $budgets,
            'filters'  => $request->only('search', 'status'),
            'statuses' => Budget::STATUSES,
            'can'      => [
                'create' => $user->can('budget.create'),
                'update' => $user->can('budget.update'),
                'delete' => $user->can('budget.delete'),
            ],
        ]);
    }

    public function create(Request $request): Response
    {
        return Inertia::render('Budgets/Create', [
            'projects' => $this->projects($request->user()),
            'statuses' => Budget::STATUSES,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $this->validateData($request);
        $companyId = $request->user()->company_id;

        $budget = DB::transaction(function () use ($data, $companyId) {
            $lines = $data['lines'];
            unset($data['lines']);

            $data['company_id'] = $companyId;

            $budget = Budget::create($data);
            $this->syncLines($budget, $lines);
            $budget->recalculateTotal();

            return $budget;
        });

        return redirect()->route('budget.show', $budget)
            ->with('success', 'Budget créé avec succès.');
    }

    public function show(Request $request, Budget $budget): Response
    {
        $this->authorizeCompany($request->user(), $budget);

        $budget->load(['lines', 'project:id,name']);

        return Inertia::render('Budgets/Show', [
            'budget' => $budget,
            'can'    => [
                'update' => $request->user()->can('budget.update'),
                'delete' => $request->user()->can('budget.delete'),
            ],
        ]);
    }

    public function edit(Request $request, Budget $budget): Response
    {
        $this->authorizeCompany($request->user(), $budget);

        $budget->load('lines');

        return Inertia::render('Budgets/Edit', [
            'budget'   => $budget,
            'projects' => $this->projects($request->user()),
            'statuses' => Budget::STATUSES,
        ]);
    }

    public function update(Request $request, Budget $budget): RedirectResponse
    {
        $this->authorizeCompany($request->user(), $budget);

        $data = $this->validateData($request, $budget);

        DB::transaction(function () use ($budget, $data) {
            $lines = $data['lines'];
            unset($data['lines']);

            $budget->update($data);

            // Remplace intégralement les lignes existantes.
            $budget->lines()->delete();
            $this->syncLines($budget, $lines);

            $budget->recalculateTotal();
        });

        return redirect()->route('budget.show', $budget)
            ->with('success', 'Budget mis à jour.');
    }

    public function destroy(Request $request, Budget $budget): RedirectResponse
    {
        $this->authorizeCompany($request->user(), $budget);

        $budget->delete();

        return redirect()->route('budget.index')
            ->with('success', 'Budget supprimé.');
    }

    /** Crée les lignes du budget en respectant leur ordre (position). */
    private function syncLines(Budget $budget, array $lines): void
    {
        foreach (array_values($lines) as $index => $line) {
            $budget->lines()->create([
                'position'       => $index,
                'category'       => $line['category'] ?? null,
                'label'          => $line['label'],
                'planned_amount' => $line['planned_amount'] ?? 0,
                'actual_amount'  => $line['actual_amount'] ?? 0,
            ]);
        }
    }

    /** Validation partagée création/mise à jour (entête + lignes). */
    private function validateData(Request $request, ?Budget $budget = null): array
    {
        $companyId = $request->user()->company_id;

        return $request->validate([
            'code'        => ['required', 'string', 'max:50', Rule::unique('budgets')->where('company_id', $companyId)->ignore($budget?->id)],
            'title'       => ['required', 'string', 'max:255'],
            'fiscal_year' => ['required', 'integer', 'min:2000', 'max:2100'],
            'status'      => ['required', Rule::in(Budget::STATUSES)],
            'currency'    => ['required', 'string', 'size:3'],
            'project_id'  => ['nullable', 'integer', Rule::exists('projects', 'id')->where('company_id', $companyId)],
            'notes'       => ['nullable', 'string'],

            'lines'                    => ['required', 'array', 'min:1'],
            'lines.*.category'         => ['nullable', 'string', 'max:120'],
            'lines.*.label'            => ['required', 'string', 'max:255'],
            'lines.*.planned_amount'   => ['required', 'numeric', 'min:0'],
            'lines.*.actual_amount'    => ['nullable', 'numeric', 'min:0'],
        ]);
    }

    /** Liste des projets de l'entreprise, candidats au rattachement. */
    private function projects(User $user)
    {
        return Project::where('company_id', $user->company_id)
            ->orderBy('name')
            ->get(['id', 'name']);
    }

    /** Empêche l'accès à un budget d'une autre entreprise. */
    private function authorizeCompany(User $user, Budget $budget): void
    {
        abort_unless($budget->company_id === $user->company_id, 403);
    }
}
