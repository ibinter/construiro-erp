import { useState } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import Icon from '@/Components/Icon';
import { Head, Link, router } from '@inertiajs/react';
import { formatMoney } from '@/constants';
import { METHOD_LABELS, CATEGORY_LABELS } from './Partials/PaymentForm';
import { useTrans } from '@/i18n';

export default function Index({ payments, filters, categories, methods, totalPaid, can }) {
    const { t } = useTrans();
    const [search, setSearch] = useState(filters.search ?? '');

    const applyFilters = (next = {}) => {
        router.get('/outgoing-payments', {
            search,
            category: filters.category,
            method: filters.method,
            ...next,
        }, {
            preserveState: true,
            replace: true,
        });
    };

    const fmtDate = (d) => (d ? new Date(d).toLocaleDateString('fr-FR') : '—');

    return (
        <AppLayout header="Décaissements">
            <Head title="Décaissements" />

            {/* Carte de synthèse */}
            <div className="mb-4 grid grid-cols-1 sm:grid-cols-3">
                <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
                    <div className="flex items-center gap-2 text-slate-400">
                        <Icon name="arrow-up-circle" className="h-4 w-4 text-red-500" />
                        <span className="text-xs uppercase tracking-wider">{t('Total décaissé')}</span>
                    </div>
                    <div className="mt-1 text-2xl font-bold text-red-600">
                        {formatMoney(totalPaid, 'XOF')}
                    </div>
                </div>
            </div>

            {/* Barre d'actions */}
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <form
                    onSubmit={(e) => { e.preventDefault(); applyFilters(); }}
                    className="flex flex-wrap items-center gap-2"
                >
                    <div className="relative">
                        <Icon name="search" className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder={t('Rechercher un décaissement…')}
                            className="w-full sm:w-64 rounded-md border-slate-300 pl-9 text-sm focus:border-orange-500 focus:ring-orange-500 dark:border-slate-700 dark:bg-slate-900"
                        />
                    </div>
                    <select
                        value={filters.category ?? ''}
                        onChange={(e) => applyFilters({ category: e.target.value })}
                        className="rounded-md border-slate-300 text-sm focus:border-orange-500 focus:ring-orange-500 dark:border-slate-700 dark:bg-slate-900"
                    >
                        <option value="">{t('Toutes les natures')}</option>
                        {categories.map((c) => (
                            <option key={c} value={c}>{t(CATEGORY_LABELS[c] ?? c)}</option>
                        ))}
                    </select>
                    <select
                        value={filters.method ?? ''}
                        onChange={(e) => applyFilters({ method: e.target.value })}
                        className="rounded-md border-slate-300 text-sm focus:border-orange-500 focus:ring-orange-500 dark:border-slate-700 dark:bg-slate-900"
                    >
                        <option value="">{t('Tous les modes')}</option>
                        {methods.map((m) => (
                            <option key={m} value={m}>{t(METHOD_LABELS[m] ?? m)}</option>
                        ))}
                    </select>
                </form>

                {can.create && (
                    <Link
                        href="/outgoing-payments/create"
                        className="inline-flex items-center gap-2 rounded-md bg-orange-500 px-4 py-2 text-sm font-medium text-white hover:bg-orange-600"
                    >
                        <Icon name="plus" className="h-4 w-4" />
                        {t('Nouveau décaissement')}
                    </Link>
                )}
            </div>

            {/* Tableau */}
            <div className="rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
                <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
                    <thead className="bg-slate-50 dark:bg-slate-800/50">
                        <tr className="text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                            <th className="px-4 py-3">{t('Décaissement')}</th>
                            <th className="px-4 py-3">{t('Fournisseur / Bénéficiaire')}</th>
                            <th className="px-4 py-3">{t('Nature')}</th>
                            <th className="px-4 py-3">{t('Mode')}</th>
                            <th className="px-4 py-3">{t('Date')}</th>
                            <th className="px-4 py-3 text-right">{t('Montant')}</th>
                            <th className="px-4 py-3"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {payments.data.map((payment) => (
                            <tr key={payment.id} className="text-sm hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                <td className="px-4 py-3">
                                    <Link href={`/outgoing-payments/${payment.id}`} className="font-medium text-slate-800 hover:text-orange-600 dark:text-slate-100">
                                        {payment.code}
                                    </Link>
                                    {payment.project && (
                                        <div className="text-xs text-slate-400">{payment.project.name}</div>
                                    )}
                                </td>
                                <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                                    {payment.supplier?.name ?? payment.payee_name ?? '—'}
                                </td>
                                <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                                    {t(CATEGORY_LABELS[payment.category] ?? payment.category)}
                                </td>
                                <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                                    {t(METHOD_LABELS[payment.method] ?? payment.method)}
                                </td>
                                <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                                    {fmtDate(payment.date)}
                                </td>
                                <td className="px-4 py-3 text-right font-medium text-red-600">
                                    {formatMoney(payment.amount, payment.currency)}
                                </td>
                                <td className="px-4 py-3 text-right">
                                    <Link href={`/outgoing-payments/${payment.id}`} className="text-slate-400 hover:text-orange-600">
                                        <Icon name="chevron-right" className="h-4 w-4" />
                                    </Link>
                                </td>
                            </tr>
                        ))}

                        {payments.data.length === 0 && (
                            <tr>
                                <td colSpan={7} className="px-4 py-12 text-center text-slate-400">
                                    <Icon name="arrow-up-circle" className="mx-auto mb-2 h-8 w-8" />
                                    {t('Aucun décaissement trouvé.')}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
                </div>
            </div>

            {/* Pagination */}
            {payments.last_page > 1 && (
                <div className="mt-4 flex flex-wrap gap-1">
                    {payments.links.map((link, i) => (
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
