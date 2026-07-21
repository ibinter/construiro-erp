<?php

namespace App\Http\Controllers;

use App\Models\CashAccount;
use App\Models\Project;
use App\Models\TreasuryTransaction;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Tableau de bord de la trésorerie : comptes (caisse, banque, mobile money),
 * leur solde courant et les transactions (entrées / sorties).
 * Le solde d'un compte se calcule par agrégation SQL sur treasury_transactions
 * (solde d'ouverture + entrées − sorties). Isolation multi-tenant par entreprise.
 * Permissions « treasury.* » via le middleware de route.
 */
class TreasuryController extends Controller
{
    /**
     * Tableau de bord : liste des comptes avec leur solde courant (agrégation
     * groupée, anti N+1), solde total consolidé et dernières transactions.
     */
    public function index(Request $request): Response
    {
        $user = $request->user();

        // Agrégation groupée des transactions par compte (une seule requête).
        $flows = TreasuryTransaction::query()
            ->where('company_id', $user->company_id)
            ->selectRaw("cash_account_id, SUM(CASE
                WHEN type = 'in' THEN amount
                WHEN type = 'out' THEN -amount
                ELSE 0 END) as flow")
            ->groupBy('cash_account_id')
            ->pluck('flow', 'cash_account_id');

        // Tous les comptes de l'entreprise, avec leur solde calculé.
        $accounts = CashAccount::forUser($user)
            ->orderBy('name')
            ->get()
            ->map(function ($account) use ($flows) {
                $balance = (float) $account->opening_balance + (float) ($flows[$account->id] ?? 0);

                return [
                    'id'              => $account->id,
                    'name'            => $account->name,
                    'type'            => $account->type,
                    'bank_name'       => $account->bank_name,
                    'account_number'  => $account->account_number,
                    'currency'        => $account->currency,
                    'opening_balance' => (float) $account->opening_balance,
                    'is_active'       => $account->is_active,
                    'balance'         => $balance,
                ];
            });

        // Solde total consolidé (tous comptes confondus).
        $totalBalance = $accounts->sum('balance');

        return Inertia::render('Treasury/Index', [
            'accounts'      => $accounts,
            'totalBalance'  => $totalBalance,
            'transactions'  => $this->recentTransactions($user),
            'types'         => TreasuryTransaction::TYPES,
            'accountTypes'  => CashAccount::TYPES,
            'can'           => [
                'create' => $user->can('treasury.create'),
            ],
        ]);
    }

    /** Crée un compte de trésorerie (caisse, banque ou mobile money). */
    public function storeAccount(Request $request): RedirectResponse
    {
        $user = $request->user();

        $data = $request->validate([
            'name'            => ['required', 'string', 'max:255'],
            'type'            => ['required', Rule::in(CashAccount::TYPES)],
            'bank_name'       => ['nullable', 'string', 'max:255'],
            'account_number'  => ['nullable', 'string', 'max:255'],
            'currency'        => ['required', 'string', 'size:3'],
            'opening_balance' => ['required', 'numeric'],
        ]);

        $data['company_id'] = $user->company_id;
        $data['is_active'] = true;

        CashAccount::create($data);

        return back()->with('success', 'Compte de trésorerie créé.');
    }

    /** Détail d'un compte + ses transactions paginées. */
    public function showAccount(Request $request, CashAccount $account): Response
    {
        $user = $request->user();
        abort_unless($account->company_id === $user->company_id, 403);

        $transactions = $account->transactions()
            ->with(['project:id,name,code', 'user:id,name'])
            ->latest('date')
            ->latest('id')
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('Treasury/Account', [
            'account' => [
                'id'              => $account->id,
                'name'            => $account->name,
                'type'            => $account->type,
                'bank_name'       => $account->bank_name,
                'account_number'  => $account->account_number,
                'currency'        => $account->currency,
                'opening_balance' => (float) $account->opening_balance,
                'is_active'       => $account->is_active,
                'balance'         => $account->currentBalance(),
            ],
            'transactions' => $transactions,
            'types'        => TreasuryTransaction::TYPES,
        ]);
    }

    /** Enregistre une transaction (entrée / sortie) sur un compte de l'entreprise. */
    public function storeTransaction(Request $request): RedirectResponse
    {
        $user = $request->user();
        $companyId = $user->company_id;

        $data = $request->validate([
            'cash_account_id' => ['required', 'integer', Rule::exists('cash_accounts', 'id')->where('company_id', $companyId)],
            'project_id'      => ['nullable', 'integer', Rule::exists('projects', 'id')->where('company_id', $companyId)],
            'type'            => ['required', Rule::in(TreasuryTransaction::TYPES)],
            'category'        => ['nullable', 'string', 'max:255'],
            'amount'          => ['required', 'numeric', 'min:0.01'],
            'date'            => ['required', 'date'],
            'reference'       => ['nullable', 'string', 'max:255'],
            'description'     => ['nullable', 'string'],
        ]);

        $data['company_id'] = $companyId;
        $data['user_id'] = $user->id;

        TreasuryTransaction::create($data);

        return back()->with('success', 'Transaction enregistrée.');
    }

    /** Formulaire d'édition d'une transaction. */
    public function edit(Request $request, TreasuryTransaction $transaction): Response
    {
        $user = $request->user();
        abort_unless($transaction->company_id === $user->company_id, 403);

        return Inertia::render('Treasury/Edit', [
            'transaction' => $transaction->load(['cashAccount:id,name,currency', 'project:id,name']),
            'accounts'    => CashAccount::forUser($user)->orderBy('name')->get(['id', 'name', 'type', 'currency']),
            'projects'    => Project::forUser($user)->orderBy('name')->get(['id', 'name', 'code']),
            'types'       => TreasuryTransaction::TYPES,
        ]);
    }

    /** Met à jour une transaction existante. */
    public function update(Request $request, TreasuryTransaction $transaction): RedirectResponse
    {
        $user = $request->user();
        abort_unless($transaction->company_id === $user->company_id, 403);
        $companyId = $user->company_id;

        $data = $request->validate([
            'cash_account_id' => ['required', 'integer', Rule::exists('cash_accounts', 'id')->where('company_id', $companyId)],
            'project_id'      => ['nullable', 'integer', Rule::exists('projects', 'id')->where('company_id', $companyId)],
            'type'            => ['required', Rule::in(TreasuryTransaction::TYPES)],
            'category'        => ['nullable', 'string', 'max:255'],
            'amount'          => ['required', 'numeric', 'min:0.01'],
            'date'            => ['required', 'date'],
            'reference'       => ['nullable', 'string', 'max:255'],
            'description'     => ['nullable', 'string'],
        ]);

        $transaction->update($data);

        return redirect()->route('treasury.accounts.show', $data['cash_account_id'])
            ->with('success', 'Transaction mise à jour.');
    }

    /** Supprime une transaction après vérification du company_id. */
    public function destroy(Request $request, TreasuryTransaction $transaction): RedirectResponse
    {
        $user = $request->user();
        abort_unless($transaction->company_id === $user->company_id, 403);

        $accountId = $transaction->cash_account_id;
        $transaction->delete();

        return redirect()->route('treasury.accounts.show', $accountId)
            ->with('success', 'Transaction supprimée.');
    }

    /** Dernières transactions pour affichage sur le tableau de bord. */
    private function recentTransactions(User $user)
    {
        return TreasuryTransaction::query()
            ->where('company_id', $user->company_id)
            ->with(['cashAccount:id,name,type', 'project:id,name'])
            ->latest('date')
            ->latest('id')
            ->limit(10)
            ->get();
    }
}
