<?php

namespace App\Http\Controllers;

use App\Models\Project;
use App\Models\Quote;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Gestion des devis (Bureau d'études).
 * Toutes les requêtes sont isolées par entreprise (multi-tenant) et
 * protégées par les permissions « quotes.* » via le middleware de route.
 */
class QuoteController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();

        $quotes = Quote::forUser($user)
            ->with('project:id,name')
            ->when($request->string('search')->toString(), function ($query, $search) {
                $query->where(fn ($q) => $q
                    ->where('code', 'like', "%{$search}%")
                    ->orWhere('title', 'like', "%{$search}%")
                    ->orWhere('client_name', 'like', "%{$search}%"));
            })
            ->when($request->string('status')->toString(), fn ($q, $status) => $q->where('status', $status))
            ->latest()
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('Quotes/Index', [
            'quotes'   => $quotes,
            'filters'  => $request->only('search', 'status'),
            'statuses' => Quote::STATUSES,
            'can'      => [
                'create' => $user->can('quotes.create'),
                'update' => $user->can('quotes.update'),
                'delete' => $user->can('quotes.delete'),
            ],
        ]);
    }

    public function create(Request $request): Response
    {
        return Inertia::render('Quotes/Create', [
            'projects' => $this->projects($request->user()),
            'statuses' => Quote::STATUSES,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $this->validateData($request);
        $companyId = $request->user()->company_id;

        $quote = DB::transaction(function () use ($data, $companyId) {
            $lines = $data['lines'];
            unset($data['lines']);

            $data['company_id'] = $companyId;

            $quote = Quote::create($data);
            $this->syncLines($quote, $lines);
            $quote->recalculateTotals();

            return $quote;
        });

        return redirect()->route('quotes.show', $quote)
            ->with('success', 'Devis créé avec succès.');
    }

    public function show(Request $request, Quote $quote): Response
    {
        $this->authorizeCompany($request->user(), $quote);

        $quote->load(['lines', 'project:id,name']);

        return Inertia::render('Quotes/Show', [
            'quote' => $quote,
            'can'   => [
                'update' => $request->user()->can('quotes.update'),
                'delete' => $request->user()->can('quotes.delete'),
            ],
        ]);
    }

    public function edit(Request $request, Quote $quote): Response
    {
        $this->authorizeCompany($request->user(), $quote);

        $quote->load('lines');

        return Inertia::render('Quotes/Edit', [
            'quote'    => $quote,
            'projects' => $this->projects($request->user()),
            'statuses' => Quote::STATUSES,
        ]);
    }

    public function update(Request $request, Quote $quote): RedirectResponse
    {
        $this->authorizeCompany($request->user(), $quote);

        $data = $this->validateData($request, $quote);

        DB::transaction(function () use ($quote, $data) {
            $lines = $data['lines'];
            unset($data['lines']);

            $quote->update($data);

            // Remplace intégralement les lignes existantes.
            $quote->lines()->delete();
            $this->syncLines($quote, $lines);

            $quote->recalculateTotals();
        });

        return redirect()->route('quotes.show', $quote)
            ->with('success', 'Devis mis à jour.');
    }

    public function destroy(Request $request, Quote $quote): RedirectResponse
    {
        $this->authorizeCompany($request->user(), $quote);

        $quote->delete();

        return redirect()->route('quotes.index')
            ->with('success', 'Devis supprimé.');
    }

    /** Crée les lignes du devis en respectant leur ordre (position). */
    private function syncLines(Quote $quote, array $lines): void
    {
        foreach (array_values($lines) as $index => $line) {
            $quote->lines()->create([
                'position'    => $index,
                'designation' => $line['designation'],
                'unit'        => $line['unit'] ?? null,
                'quantity'    => $line['quantity'] ?? 1,
                'unit_price'  => $line['unit_price'] ?? 0,
            ]);
        }
    }

    /** Validation partagée création/mise à jour (entête + lignes). */
    private function validateData(Request $request, ?Quote $quote = null): array
    {
        $companyId = $request->user()->company_id;

        return $request->validate([
            'code'        => ['required', 'string', 'max:50', Rule::unique('quotes')->where('company_id', $companyId)->ignore($quote?->id)],
            'title'       => ['required', 'string', 'max:255'],
            'client_name' => ['nullable', 'string', 'max:255'],
            'status'      => ['required', Rule::in(Quote::STATUSES)],
            'currency'    => ['required', 'string', 'size:3'],
            'tax_rate'    => ['required', 'numeric', 'min:0', 'max:100'],
            'project_id'  => ['nullable', 'integer', Rule::exists('projects', 'id')->where('company_id', $companyId)],
            'date'        => ['nullable', 'date'],
            'valid_until' => ['nullable', 'date', 'after_or_equal:date'],
            'notes'       => ['nullable', 'string'],

            'lines'                  => ['required', 'array', 'min:1'],
            'lines.*.designation'    => ['required', 'string', 'max:255'],
            'lines.*.unit'           => ['nullable', 'string', 'max:20'],
            'lines.*.quantity'       => ['required', 'numeric', 'min:0'],
            'lines.*.unit_price'     => ['required', 'numeric', 'min:0'],
        ]);
    }

    /** Liste des projets de l'entreprise, candidats au rattachement. */
    private function projects(User $user)
    {
        return Project::where('company_id', $user->company_id)
            ->orderBy('name')
            ->get(['id', 'name']);
    }

    /** Empêche l'accès à un devis d'une autre entreprise. */
    private function authorizeCompany(User $user, Quote $quote): void
    {
        abort_unless($quote->company_id === $user->company_id, 403);
    }
}
