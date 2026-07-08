<?php

namespace App\Http\Controllers;

use App\Models\Project;
use App\Models\Takeoff;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Métré (Bureau d'études) — feuilles de métré et leurs lignes de quantités.
 * Toutes les requêtes sont isolées par entreprise (multi-tenant) et
 * protégées par les permissions « takeoff.* » via le middleware de route.
 */
class TakeoffController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();

        $takeoffs = Takeoff::forUser($user)
            ->with('project:id,name')
            ->withCount('lines')
            ->when($request->string('search')->toString(), function ($query, $search) {
                $query->where(fn ($q) => $q
                    ->where('code', 'like', "%{$search}%")
                    ->orWhere('title', 'like', "%{$search}%"));
            })
            ->when($request->string('status')->toString(), fn ($q, $status) => $q->where('status', $status))
            ->latest()
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('Takeoffs/Index', [
            'takeoffs' => $takeoffs,
            'filters'  => $request->only('search', 'status'),
            'statuses' => Takeoff::STATUSES,
            'can'      => [
                'create' => $user->can('takeoff.create'),
                'update' => $user->can('takeoff.update'),
                'delete' => $user->can('takeoff.delete'),
            ],
        ]);
    }

    public function create(Request $request): Response
    {
        return Inertia::render('Takeoffs/Create', [
            'projects' => $this->projects($request->user()),
            'statuses' => Takeoff::STATUSES,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $this->validateData($request);
        $companyId = $request->user()->company_id;

        $takeoff = DB::transaction(function () use ($data, $companyId) {
            $lines = $data['lines'];
            unset($data['lines']);

            $data['company_id'] = $companyId;

            $takeoff = Takeoff::create($data);
            $this->syncLines($takeoff, $lines);

            return $takeoff;
        });

        return redirect()->route('takeoff.show', $takeoff)
            ->with('success', 'Métré créé avec succès.');
    }

    public function show(Request $request, Takeoff $takeoff): Response
    {
        $this->authorizeCompany($request->user(), $takeoff);

        $takeoff->load(['lines', 'project:id,name']);

        return Inertia::render('Takeoffs/Show', [
            'takeoff' => $takeoff,
            'can'     => [
                'update' => $request->user()->can('takeoff.update'),
                'delete' => $request->user()->can('takeoff.delete'),
            ],
        ]);
    }

    public function edit(Request $request, Takeoff $takeoff): Response
    {
        $this->authorizeCompany($request->user(), $takeoff);

        $takeoff->load('lines');

        return Inertia::render('Takeoffs/Edit', [
            'takeoff'  => $takeoff,
            'projects' => $this->projects($request->user()),
            'statuses' => Takeoff::STATUSES,
        ]);
    }

    public function update(Request $request, Takeoff $takeoff): RedirectResponse
    {
        $this->authorizeCompany($request->user(), $takeoff);

        $data = $this->validateData($request, $takeoff);

        DB::transaction(function () use ($takeoff, $data) {
            $lines = $data['lines'];
            unset($data['lines']);

            $takeoff->update($data);

            // Remplace intégralement les lignes existantes.
            $takeoff->lines()->delete();
            $this->syncLines($takeoff, $lines);
        });

        return redirect()->route('takeoff.show', $takeoff)
            ->with('success', 'Métré mis à jour.');
    }

    public function destroy(Request $request, Takeoff $takeoff): RedirectResponse
    {
        $this->authorizeCompany($request->user(), $takeoff);

        $takeoff->delete();

        return redirect()->route('takeoff.index')
            ->with('success', 'Métré supprimé.');
    }

    /** Crée les lignes du métré en respectant leur ordre (position). */
    private function syncLines(Takeoff $takeoff, array $lines): void
    {
        foreach (array_values($lines) as $index => $line) {
            $takeoff->lines()->create([
                'position'    => $index,
                'designation' => $line['designation'],
                'unit'        => $line['unit'] ?? null,
                'length'      => $line['length'] ?? null,
                'width'       => $line['width'] ?? null,
                'height'      => $line['height'] ?? null,
                'count'       => $line['count'] ?? 1,
                'quantity'    => $line['quantity'] ?? 0,
                'notes'       => $line['notes'] ?? null,
            ]);
        }
    }

    /** Validation partagée création/mise à jour (entête + lignes). */
    private function validateData(Request $request, ?Takeoff $takeoff = null): array
    {
        $companyId = $request->user()->company_id;

        return $request->validate([
            'code'       => ['required', 'string', 'max:50', Rule::unique('takeoffs')->where('company_id', $companyId)->ignore($takeoff?->id)],
            'title'      => ['required', 'string', 'max:255'],
            'status'     => ['required', Rule::in(Takeoff::STATUSES)],
            'project_id' => ['nullable', 'integer', Rule::exists('projects', 'id')->where('company_id', $companyId)],
            'notes'      => ['nullable', 'string'],

            'lines'                => ['required', 'array', 'min:1'],
            'lines.*.designation'  => ['required', 'string', 'max:255'],
            'lines.*.unit'         => ['nullable', 'string', 'max:20'],
            'lines.*.length'       => ['nullable', 'numeric', 'min:0'],
            'lines.*.width'        => ['nullable', 'numeric', 'min:0'],
            'lines.*.height'       => ['nullable', 'numeric', 'min:0'],
            'lines.*.count'        => ['nullable', 'numeric', 'min:0'],
            'lines.*.quantity'     => ['nullable', 'numeric', 'min:0'],
            'lines.*.notes'        => ['nullable', 'string', 'max:255'],
        ]);
    }

    /** Liste des projets de l'entreprise, candidats au rattachement. */
    private function projects(User $user)
    {
        return Project::where('company_id', $user->company_id)
            ->orderBy('name')
            ->get(['id', 'name']);
    }

    /** Empêche l'accès à un métré d'une autre entreprise. */
    private function authorizeCompany(User $user, Takeoff $takeoff): void
    {
        abort_unless($takeoff->company_id === $user->company_id, 403);
    }
}
