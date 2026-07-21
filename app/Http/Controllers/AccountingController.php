<?php

namespace App\Http\Controllers;

use App\Models\Account;
use App\Models\JournalEntry;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Comptabilité générale (journal simplifié SYSCOHADA). Gère le plan comptable
 * et le journal des écritures : chaque écriture regroupe des lignes équilibrées
 * (Σ débit = Σ crédit). Isolation multi-tenant, permissions « accounting.* ».
 */
class AccountingController extends Controller
{
    /** Journal : liste paginée des écritures avec leurs lignes. */
    public function index(Request $request): Response
    {
        $user = $request->user();
        $companyId = $user->company_id;

        $entries = JournalEntry::forUser($user)
            ->with(['lines.account:id,code,label'])
            ->latest('date')
            ->latest('id')
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('Accounting/Index', [
            'entries'  => $entries,
            'accounts' => Account::forUser($user)->orderBy('code')->get(['id', 'code', 'label', 'type']),
            'can'      => [
                'create' => $user->can('accounting.create'),
            ],
        ]);
    }

    /** Plan comptable : liste des comptes (+ création rapide). */
    public function accounts(Request $request): Response
    {
        $user = $request->user();

        return Inertia::render('Accounting/Accounts', [
            'accounts' => Account::forUser($user)->orderBy('code')->get(['id', 'code', 'label', 'type']),
            'types'    => Account::TYPES,
            'can'      => [
                'create' => $user->can('accounting.create'),
            ],
        ]);
    }

    /** Création rapide d'un compte du plan comptable. */
    public function storeAccount(Request $request): RedirectResponse
    {
        $user = $request->user();
        $companyId = $user->company_id;

        $data = $request->validate([
            'code'  => ['required', 'string', 'max:20', Rule::unique('accounts')->where('company_id', $companyId)->whereNull('deleted_at')],
            'label' => ['required', 'string', 'max:255'],
            'type'  => ['required', Rule::in(Account::TYPES)],
        ]);

        $data['company_id'] = $companyId;

        Account::create($data);

        return back()->with('success', 'Compte créé.');
    }

    /**
     * Crée une écriture de journal avec ses lignes, en transaction.
     * Valide que Σ débit == Σ crédit (écriture équilibrée) sinon lève une erreur.
     */
    public function store(Request $request): RedirectResponse
    {
        $user = $request->user();
        $companyId = $user->company_id;

        $data = $request->validate([
            'date'               => ['required', 'date'],
            'piece_number'       => ['nullable', 'string', 'max:50'],
            'label'              => ['required', 'string', 'max:255'],
            'lines'              => ['required', 'array', 'min:2'],
            'lines.*.account_id' => ['required', 'integer', Rule::exists('accounts', 'id')->where('company_id', $companyId)],
            'lines.*.label'      => ['nullable', 'string', 'max:255'],
            'lines.*.debit'      => ['required', 'numeric', 'min:0'],
            'lines.*.credit'     => ['required', 'numeric', 'min:0'],
        ]);

        // Contrôle d'équilibre de la partie double (arrondi au centime).
        $totalDebit  = round(array_sum(array_column($data['lines'], 'debit')), 2);
        $totalCredit = round(array_sum(array_column($data['lines'], 'credit')), 2);

        if ($totalDebit !== $totalCredit || $totalDebit <= 0) {
            throw ValidationException::withMessages([
                'lines' => "L'écriture doit être équilibrée : total débit ({$totalDebit}) ≠ total crédit ({$totalCredit}).",
            ]);
        }

        DB::transaction(function () use ($data, $companyId) {
            $entry = JournalEntry::create([
                'company_id'   => $companyId,
                'date'         => $data['date'],
                'piece_number' => $data['piece_number'] ?? null,
                'label'        => $data['label'],
            ]);

            foreach ($data['lines'] as $line) {
                $entry->lines()->create([
                    'account_id' => $line['account_id'],
                    'label'      => $line['label'] ?? null,
                    'debit'      => $line['debit'] ?? 0,
                    'credit'     => $line['credit'] ?? 0,
                ]);
            }
        });

        return back()->with('success', 'Écriture enregistrée.');
    }

    /**
     * Formulaire d'édition d'une écriture existante.
     * Vérifie l'appartenance au tenant avant d'afficher.
     */
    public function edit(Request $request, JournalEntry $journalEntry): Response
    {
        $user = $request->user();
        abort_unless($journalEntry->company_id === $user->company_id, 403);

        // Blocage si l'écriture est verrouillée (exercice clôturé).
        // Le champ `locked` est optionnel — ignoré si absent du modèle.
        abort_if((bool) ($journalEntry->locked ?? false), 403, 'Cette écriture appartient à un exercice clôturé.');

        $journalEntry->load('lines.account:id,code,label');

        return Inertia::render('Accounting/Edit', [
            'entry'    => $journalEntry,
            'accounts' => Account::forUser($user)->orderBy('code')->get(['id', 'code', 'label', 'type']),
        ]);
    }

    /**
     * Met à jour une écriture de journal et recrée ses lignes en transaction.
     * Bloque si l'exercice est clôturé. Valide l'équilibre débit/crédit.
     */
    public function update(Request $request, JournalEntry $journalEntry): RedirectResponse
    {
        $user      = $request->user();
        $companyId = $user->company_id;

        abort_unless($journalEntry->company_id === $companyId, 403);
        abort_if((bool) ($journalEntry->locked ?? false), 403, 'Cette écriture appartient à un exercice clôturé.');

        $data = $request->validate([
            'date'               => ['required', 'date'],
            'piece_number'       => ['nullable', 'string', 'max:50'],
            'label'              => ['required', 'string', 'max:255'],
            'lines'              => ['required', 'array', 'min:2'],
            'lines.*.account_id' => ['required', 'integer', Rule::exists('accounts', 'id')->where('company_id', $companyId)],
            'lines.*.label'      => ['nullable', 'string', 'max:255'],
            'lines.*.debit'      => ['required', 'numeric', 'min:0'],
            'lines.*.credit'     => ['required', 'numeric', 'min:0'],
        ]);

        $totalDebit  = round(array_sum(array_column($data['lines'], 'debit')), 2);
        $totalCredit = round(array_sum(array_column($data['lines'], 'credit')), 2);

        if ($totalDebit !== $totalCredit || $totalDebit <= 0) {
            throw ValidationException::withMessages([
                'lines' => "L'écriture doit être équilibrée : total débit ({$totalDebit}) ≠ total crédit ({$totalCredit}).",
            ]);
        }

        DB::transaction(function () use ($journalEntry, $data) {
            $journalEntry->update([
                'date'         => $data['date'],
                'piece_number' => $data['piece_number'] ?? null,
                'label'        => $data['label'],
            ]);

            // Recréation des lignes : suppression puis insertion.
            $journalEntry->lines()->delete();

            foreach ($data['lines'] as $line) {
                $journalEntry->lines()->create([
                    'account_id' => $line['account_id'],
                    'label'      => $line['label'] ?? null,
                    'debit'      => $line['debit'] ?? 0,
                    'credit'     => $line['credit'] ?? 0,
                ]);
            }
        });

        return redirect()->route('accounting.index')
            ->with('success', 'Écriture mise à jour.');
    }

    /** Supprime une écriture de journal et ses lignes après vérification du company_id. */
    public function destroy(Request $request, JournalEntry $entry): RedirectResponse
    {
        $user = $request->user();
        abort_unless($entry->company_id === $user->company_id, 403);

        $entry->lines()->delete();
        $entry->delete();

        return redirect()->route('accounting.index')
            ->with('success', 'Écriture de journal supprimée.');
    }
}
