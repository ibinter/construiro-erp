import AppLayout from '@/Layouts/AppLayout';
import Icon from '@/Components/Icon';
import { Head, Link, router } from '@inertiajs/react';
import { formatMoney } from '@/constants';
import { ACCOUNT_TYPE, TRANSACTION_TYPE, TRANSACTION_CATEGORY } from '@/Pages/Treasury/Index';

export default function Account({ account, transactions }) {
    const t = ACCOUNT_TYPE[account.type] ?? { label: account.type, color: 'bg-slate-100 text-slate-600', icon: 'wallet' };

    const fmtDate = (d) => (d ? new Date(d).toLocaleDateString('fr-FR') : '—');

    return (
        <AppLayout header="Compte de trésorerie">
            <Head title={account.name} />

            {/* Entête compte */}
            <div className="mb-6 rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
                <div className="flex items-center gap-2">
                    <Link href="/treasury" className="text-slate-400 hover:text-orange-600">
                        <Icon name="arrow-left" className="h-5 w-5" />
                    </Link>
                    <Icon name={t.icon} className="h-6 w-6 text-slate-400" />
                    <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">{account.name}</h2>
                    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${t.color}`}>{t.label}</span>
                </div>

                <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <div>
                        <div className="text-xs uppercase tracking-wider text-slate-400">Solde courant</div>
                        <div className="mt-1 text-2xl font-bold text-orange-600">{formatMoney(account.balance, account.currency)}</div>
                    </div>
                    <div>
                        <div className="text-xs uppercase tracking-wider text-slate-400">Solde d'ouverture</div>
                        <div className="mt-1 text-lg font-medium text-slate-700 dark:text-slate-200">{formatMoney(account.opening_balance, account.currency)}</div>
                    </div>
                    <div>
                        <div className="text-xs uppercase tracking-wider text-slate-400">Banque / Opérateur</div>
                        <div className="mt-1 text-lg font-medium text-slate-700 dark:text-slate-200">{account.bank_name ?? '—'}</div>
                        {account.account_number && (
                            <div className="text-xs text-slate-400">{account.account_number}</div>
                        )}
                    </div>
                </div>
            </div>

            {/* Tableau des transactions */}
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
                <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
                    <thead className="bg-slate-50 dark:bg-slate-800/50">
                        <tr className="text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                            <th className="px-4 py-3">Date</th>
                            <th className="px-4 py-3">Type</th>
                            <th className="px-4 py-3">Catégorie</th>
                            <th className="px-4 py-3">Projet</th>
                            <th className="px-4 py-3">Référence</th>
                            <th className="px-4 py-3 text-right">Montant</th>
                            <th className="px-4 py-3">Description</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {transactions.data.map((tx) => {
                            const tt = TRANSACTION_TYPE[tx.type] ?? { label: tx.type, color: 'bg-slate-100 text-slate-600' };
                            return (
                                <tr key={tx.id} className="text-sm hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                    <td className="px-4 py-3 text-slate-500">{fmtDate(tx.date)}</td>
                                    <td className="px-4 py-3">
                                        <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${tt.color}`}>{tt.label}</span>
                                    </td>
                                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                                        {TRANSACTION_CATEGORY[tx.category] ?? tx.category ?? '—'}
                                    </td>
                                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{tx.project?.name ?? '—'}</td>
                                    <td className="px-4 py-3 text-slate-500">{tx.reference ?? '—'}</td>
                                    <td className={`px-4 py-3 text-right font-medium ${tx.type === 'in' ? 'text-green-600' : 'text-red-600'}`}>
                                        {tx.type === 'in' ? '+' : '−'} {formatMoney(tx.amount, account.currency)}
                                    </td>
                                    <td className="px-4 py-3 text-slate-500">{tx.description ?? '—'}</td>
                                </tr>
                            );
                        })}

                        {transactions.data.length === 0 && (
                            <tr>
                                <td colSpan={7} className="px-4 py-12 text-center text-slate-400">
                                    <Icon name="arrow-left-right" className="mx-auto mb-2 h-8 w-8" />
                                    Aucune transaction sur ce compte.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {transactions.last_page > 1 && (
                <div className="mt-4 flex flex-wrap gap-1">
                    {transactions.links.map((link, i) => (
                        <button
                            key={i}
                            disabled={!link.url}
                            onClick={() => link.url && router.get(link.url, {}, { preserveState: true })}
                            className={`rounded-md px-3 py-1.5 text-sm ${
                                link.active
                                    ? 'bg-orange-500 text-white'
                                    : 'text-slate-600 hover:bg-slate-100 disabled:opacity-40 dark:text-slate-300 dark:hover:bg-slate-800'
                            }`}
                            dangerouslySetInnerHTML={{ __html: link.label }}
                        />
                    ))}
                </div>
            )}
        </AppLayout>
    );
}
