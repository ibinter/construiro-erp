import { useState } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import Icon from '@/Components/Icon';
import { Head, Link, router } from '@inertiajs/react';
import { formatMoney } from '@/constants';
import { useTrans } from '@/i18n';

// Étapes du pipeline commercial avec libellés et couleurs (FR).
export const STAGE = {
    prospect:    { label: 'Prospect',    color: 'bg-slate-100 text-slate-600' },
    qualifie:    { label: 'Qualifié',    color: 'bg-sky-100 text-sky-700' },
    proposition: { label: 'Proposition', color: 'bg-indigo-100 text-indigo-700' },
    negociation: { label: 'Négociation', color: 'bg-amber-100 text-amber-700' },
    gagne:       { label: 'Gagné',       color: 'bg-green-100 text-green-700' },
    perdu:       { label: 'Perdu',       color: 'bg-red-100 text-red-700' },
};

function StageBadge({ stage }) {
    const { t } = useTrans();
    const s = STAGE[stage] ?? { label: stage, color: 'bg-slate-100 text-slate-600' };
    return (
        <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${s.color}`}>
            {t(s.label)}
        </span>
    );
}

export default function Index({ opportunities, filters, stages, pipeline, can }) {
    const { t } = useTrans();
    const [search, setSearch] = useState(filters.search ?? '');

    const applyFilters = (next = {}) => {
        router.get('/crm', { search, stage: filters.stage, ...next }, {
            preserveState: true,
            replace: true,
        });
    };

    return (
        <AppLayout header="CRM — Opportunités">
            <Head title={t('CRM')} />

            {/* Résumé du pipeline par étape */}
            <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
                {pipeline.map((p) => {
                    const s = STAGE[p.stage] ?? { label: p.stage, color: 'bg-slate-100 text-slate-600' };
                    return (
                        <div
                            key={p.stage}
                            className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"
                        >
                            <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${s.color}`}>
                                {t(s.label)}
                            </span>
                            <div className="mt-2 text-lg font-bold text-slate-800 dark:text-slate-100">{p.count}</div>
                            <div className="text-xs text-slate-400">{formatMoney(p.total)}</div>
                        </div>
                    );
                })}
            </div>

            {/* Barre d'actions */}
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <form
                    onSubmit={(e) => { e.preventDefault(); applyFilters(); }}
                    className="flex items-center gap-2"
                >
                    <div className="relative">
                        <Icon name="search" className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder={t('Rechercher une opportunité…')}
                            className="w-full sm:w-64 rounded-md border-slate-300 pl-9 text-sm focus:border-orange-500 focus:ring-orange-500 dark:border-slate-700 dark:bg-slate-900"
                        />
                    </div>
                    <select
                        value={filters.stage ?? ''}
                        onChange={(e) => applyFilters({ stage: e.target.value })}
                        className="rounded-md border-slate-300 text-sm focus:border-orange-500 focus:ring-orange-500 dark:border-slate-700 dark:bg-slate-900"
                    >
                        <option value="">{t('Toutes les étapes')}</option>
                        {stages.map((s) => (
                            <option key={s} value={s}>{t(STAGE[s]?.label ?? s)}</option>
                        ))}
                    </select>
                </form>

                {can.create && (
                    <Link
                        href="/crm/create"
                        className="inline-flex items-center gap-2 rounded-md bg-orange-500 px-4 py-2 text-sm font-medium text-white hover:bg-orange-600"
                    >
                        <Icon name="plus" className="h-4 w-4" />
                        {t('Nouvelle opportunité')}
                    </Link>
                )}
            </div>

            {/* Tableau */}
            <div className="rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
                <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
                    <thead className="bg-slate-50 dark:bg-slate-800/50">
                        <tr className="text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                            <th className="px-4 py-3">{t('Opportunité')}</th>
                            <th className="px-4 py-3">{t('Étape')}</th>
                            <th className="px-4 py-3">{t('Probabilité')}</th>
                            <th className="px-4 py-3">{t('Montant estimé')}</th>
                            <th className="px-4 py-3">{t('Commercial')}</th>
                            <th className="px-4 py-3"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {opportunities.data.map((opp) => (
                            <tr key={opp.id} className="text-sm hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                <td className="px-4 py-3">
                                    <Link href={`/crm/${opp.id}`} className="font-medium text-slate-800 hover:text-orange-600 dark:text-slate-100">
                                        {opp.title}
                                    </Link>
                                    <div className="text-xs text-slate-400">
                                        {opp.code}
                                        {opp.client?.name
                                            ? ` · ${opp.client.name}`
                                            : opp.client_name ? ` · ${opp.client_name}` : ''}
                                    </div>
                                </td>
                                <td className="px-4 py-3"><StageBadge stage={opp.stage} /></td>
                                <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{opp.probability}%</td>
                                <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                                    {formatMoney(opp.estimated_amount, opp.currency)}
                                </td>
                                <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                                    {opp.assignee?.name ?? '—'}
                                </td>
                                <td className="px-4 py-3 text-right">
                                    <Link href={`/crm/${opp.id}`} className="text-slate-400 hover:text-orange-600">
                                        <Icon name="chevron-right" className="h-4 w-4" />
                                    </Link>
                                </td>
                            </tr>
                        ))}

                        {opportunities.data.length === 0 && (
                            <tr>
                                <td colSpan={6} className="px-4 py-12 text-center text-slate-400">
                                    <Icon name="contact" className="mx-auto mb-2 h-8 w-8" />
                                    {t('Aucune opportunité trouvée.')}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
                </div>
            </div>

            {/* Pagination */}
            {opportunities.last_page > 1 && (
                <div className="mt-4 flex flex-wrap gap-1">
                    {opportunities.links.map((link, i) => (
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
