<?php

namespace App\Http\Controllers;

use App\Models\Boq;
use App\Models\Client;
use App\Models\Project;
use App\Models\UnitPrice;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

/**
 * DQE — Devis quantitatif estimatif. Documents chiffrés et leurs lignes.
 * Les lignes peuvent être pré-remplies depuis la bibliothèque de prix (BPU).
 * Toutes les requêtes sont isolées par entreprise (multi-tenant) et
 * protégées par les permissions « boq.* » via le middleware de route.
 */
class BoqController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();

        $boqs = Boq::forUser($user)
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

        return Inertia::render('Boqs/Index', [
            'boqs'     => $boqs,
            'filters'  => $request->only('search', 'status'),
            'statuses' => Boq::STATUSES,
            'can'      => [
                'create' => $user->can('boq.create'),
                'update' => $user->can('boq.update'),
                'delete' => $user->can('boq.delete'),
            ],
        ]);
    }

    public function create(Request $request): Response
    {
        return Inertia::render('Boqs/Create', [
            'clients'    => $this->clients($request->user()),
            'projects'   => $this->projects($request->user()),
            'statuses'   => Boq::STATUSES,
            'unitPrices' => $this->unitPrices($request->user()),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $this->validateData($request);
        $companyId = $request->user()->company_id;

        $boq = DB::transaction(function () use ($data, $companyId) {
            $lines = $data['lines'];
            unset($data['lines']);

            $data['company_id'] = $companyId;

            $boq = Boq::create($data);
            $this->syncLines($boq, $lines);
            $boq->recalculateTotal();

            return $boq;
        });

        return redirect()->route('boq.show', $boq)
            ->with('success', 'DQE créé avec succès.');
    }

    public function show(Request $request, Boq $boq): Response
    {
        $this->authorizeCompany($request->user(), $boq);

        $boq->load(['lines', 'project:id,name']);

        return Inertia::render('Boqs/Show', [
            'boq' => $boq,
            'can' => [
                'update' => $request->user()->can('boq.update'),
                'delete' => $request->user()->can('boq.delete'),
            ],
        ]);
    }

    public function edit(Request $request, Boq $boq): Response
    {
        $this->authorizeCompany($request->user(), $boq);

        $boq->load('lines');

        return Inertia::render('Boqs/Edit', [
            'boq'        => $boq,
            'clients'    => $this->clients($request->user()),
            'projects'   => $this->projects($request->user()),
            'statuses'   => Boq::STATUSES,
            'unitPrices' => $this->unitPrices($request->user()),
        ]);
    }

    public function update(Request $request, Boq $boq): RedirectResponse
    {
        $this->authorizeCompany($request->user(), $boq);

        $data = $this->validateData($request, $boq);

        DB::transaction(function () use ($boq, $data) {
            $lines = $data['lines'];
            unset($data['lines']);

            $boq->update($data);

            // Remplace intégralement les lignes existantes.
            $boq->lines()->delete();
            $this->syncLines($boq, $lines);

            $boq->recalculateTotal();
        });

        return redirect()->route('boq.show', $boq)
            ->with('success', 'DQE mis à jour.');
    }

    public function destroy(Request $request, Boq $boq): RedirectResponse
    {
        $this->authorizeCompany($request->user(), $boq);

        $boq->delete();

        return redirect()->route('boq.index')
            ->with('success', 'DQE supprimé.');
    }

    /** Crée les lignes du DQE en respectant leur ordre (position). */
    private function syncLines(Boq $boq, array $lines): void
    {
        foreach (array_values($lines) as $index => $line) {
            $boq->lines()->create([
                'position'    => $index,
                'designation' => $line['designation'],
                'unit'        => $line['unit'] ?? null,
                'quantity'    => $line['quantity'] ?? 1,
                'unit_price'  => $line['unit_price'] ?? 0,
            ]);
        }
    }

    /** Validation partagée création/mise à jour (entête + lignes). */
    private function validateData(Request $request, ?Boq $boq = null): array
    {
        $companyId = $request->user()->company_id;

        return $request->validate([
            'code'       => ['required', 'string', 'max:50', Rule::unique('boqs')->where('company_id', $companyId)->ignore($boq?->id)],
            'title'      => ['required', 'string', 'max:255'],
            'client_id'  => ['nullable', 'integer', Rule::exists('clients', 'id')->where('company_id', $companyId)],
            'status'     => ['required', Rule::in(Boq::STATUSES)],
            'currency'   => ['required', 'string', 'size:3'],
            'project_id' => ['nullable', 'integer', Rule::exists('projects', 'id')->where('company_id', $companyId)],
            'notes'      => ['nullable', 'string'],

            'lines'               => ['required', 'array', 'min:1'],
            'lines.*.designation' => ['required', 'string', 'max:255'],
            'lines.*.unit'        => ['nullable', 'string', 'max:20'],
            'lines.*.quantity'    => ['required', 'numeric', 'min:0'],
            'lines.*.unit_price'  => ['required', 'numeric', 'min:0'],
        ]);
    }

    /** Liste des clients de l'entreprise, candidats au rattachement. */
    private function clients(User $user)
    {
        return Client::where('company_id', $user->company_id)
            ->where('is_active', true)
            ->orderBy('name')
            ->get(['id', 'name']);
    }

    /** Liste des projets de l'entreprise, candidats au rattachement. */
    private function projects(User $user)
    {
        return Project::where('company_id', $user->company_id)
            ->orderBy('name')
            ->get(['id', 'name']);
    }

    /** Prix unitaires actifs de l'entreprise, pour pré-remplir les lignes. */
    private function unitPrices(User $user)
    {
        return UnitPrice::where('company_id', $user->company_id)
            ->where('is_active', true)
            ->orderBy('designation')
            ->get(['id', 'code', 'designation', 'unit', 'unit_price']);
    }

    /** Empêche l'accès à un DQE d'une autre entreprise. */
    private function authorizeCompany(User $user, Boq $boq): void
    {
        abort_unless($boq->company_id === $user->company_id, 403);
    }
}
