import { useState } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import Icon from '@/Components/Icon';
import { Head, Link, router } from '@inertiajs/react';
import { formatMoney } from '@/constants';
import { useTrans } from '@/i18n';
import { EQUIPMENT_STATUS } from '@/Pages/Equipment/Partials/EquipmentForm';

// Vue filtrée du parc matériel : engins uniquement (category = 'engin').

function StatusBadge({ status }) {
    const { t } = useTrans();
    const s = EQUIPMENT_STATUS[status] ?? { label: status, color: 'bg-slate-100 text-slate-600' };
    return (
        <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${s.color}`}>
            {t(s.label)}
        </span>
    );
}

export default function Index({ machinery, filters, statuses, can }) {
    const { t } = useTrans();
    const [search, setSearch] = useState(filters.search ?? '');

    const applyFilters = (next = {}) => {
        router.get('/machinery', { search, status: filters.status, ...next }, {
            preserveState: true,
            replace: true,
        });
    };

    return (
        <AppLayout header="Engins">
            <Head title={t('Engins')} />

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
                            placeholder={t('Rechercher un engin…')}
                            className="w-64 rounded-md border-slate-300 pl-9 text-sm focus:border-orange-500 focus:ring-orange-500 dark:border-slate-700 dark:bg-slate-900"
                        />
                    </div>
                    <select
                        value={filters.status ?? ''}
                        onChange={(e) => applyFilters({ status: e.target.value })}
                        className="rounded-md border-slate-300 text-sm focus:border-orange-500 focus:ring-orange-500 dark:border-slate-700 dark:bg-slate-900"
                    >
                        <option value="">{t('Tous les statuts')}</option>
                        {statuses.map((s) => (
                            <option key={s} value={s}>{t(EQUIPMENT_STATUS[s]?.label ?? s)}</option>
                        ))}
                    </select>
                </form>

                {can.create && (
                    <Link
                        href="/equipment/create"
                        className="inline-flex items-center gap-2 rounded-md bg-orange-500 px-4 py-2 text-sm font-medium text-white hover:bg-orange-600"
                    >
                        <Icon name="plus" className="h-4 w-4" />
                        {t('Nouvel engin')}
                    </Link>
                )}
            </div>

            {/* Tableau */}
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
                <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
                    <thead className="bg-slate-50 dark:bg-slate-800/50">
                        <tr className="text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                            <th className="px-4 py-3">{t('Engin')}</th>
                            <th className="px-4 py-3">{t('Marque / Modèle')}</th>
                            <th className="px-4 py-3">{t('Immatriculation')}</th>
                            <th className="px-4 py-3">{t('Statut')}</th>
                            <th className="px-4 py-3">{t('Chantier')}</th>
                            <th className="px-4 py-3">{t('Valeur')}</th>
                            <th className="px-4 py-3"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {machinery.data.map((item) => (
                            <tr key={item.id} className="text-sm hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                <td className="px-4 py-3">
                                    <Link href={`/machinery/${item.id}`} className="font-medium text-slate-800 hover:text-orange-600 dark:text-slate-100">
                                        {item.name}
                                    </Link>
                                    <div className="text-xs text-slate-400">{item.code}</div>
                                </td>
                                <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                                    {[item.brand, item.model].filter(Boolean).join(' ') || '—'}
                                </td>
                                <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                                    {item.registration ?? '—'}
                                </td>
                                <td className="px-4 py-3"><StatusBadge status={item.status} /></td>
                                <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                                    {item.current_site?.name ?? '—'}
                                </td>
                                <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                                    {formatMoney(item.acquisition_value, item.currency)}
                                </td>
                                <td className="px-4 py-3 text-right">
                                    <Link href={`/machinery/${item.id}`} className="text-slate-400 hover:text-orange-600">
                                        <Icon name="chevron-right" className="h-4 w-4" />
                                    </Link>
                                </td>
                            </tr>
                        ))}

                        {machinery.data.length === 0 && (
                            <tr>
                                <td colSpan={7} className="px-4 py-12 text-center text-slate-400">
                                    <Icon name="tractor" className="mx-auto mb-2 h-8 w-8" />
                                    {t('Aucun engin trouvé.')}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {machinery.last_page > 1 && (
                <div className="mt-4 flex flex-wrap gap-1">
                    {machinery.links.map((link, i) => (
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
