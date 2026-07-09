import { useState } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import Icon from '@/Components/Icon';
import { Head, Link, router } from '@inertiajs/react';
import { formatMoney } from '@/constants';
import { useTrans } from '@/i18n';

// Libellés et styles des contrats (FR).
const CONTRACT_STATUS = {
    draft:     { label: 'Brouillon', color: 'bg-slate-100 text-slate-600' },
    active:    { label: 'Actif',     color: 'bg-green-100 text-green-700' },
    suspended: { label: 'Suspendu',  color: 'bg-amber-100 text-amber-700' },
    closed:    { label: 'Clôturé',   color: 'bg-blue-100 text-blue-700' },
    cancelled: { label: 'Annulé',    color: 'bg-red-100 text-red-700' },
};

const CONTRACT_TYPE = {
    client:         'Client',
    sous_traitance: 'Sous-traitance',
    fournisseur:    'Fournisseur',
    autre:          'Autre',
};

function StatusBadge({ status }) {
    const { t } = useTrans();
    const s = CONTRACT_STATUS[status] ?? { label: status, color: 'bg-slate-100 text-slate-600' };
    return (
        <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${s.color}`}>
            {t(s.label)}
        </span>
    );
}

export default function Index({ contracts, filters, statuses, types, can }) {
    const { t } = useTrans();
    const [search, setSearch] = useState(filters.search ?? '');

    const applyFilters = (next = {}) => {
        router.get('/contracts', { search, status: filters.status, type: filters.type, ...next }, {
            preserveState: true,
            replace: true,
        });
    };

    const fmtDate = (d) => (d ? new Date(d).toLocaleDateString('fr-FR') : '—');

    return (
        <AppLayout header="Contrats">
            <Head title={t('Contrats')} />

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
                            placeholder={t('Rechercher un contrat…')}
                            className="w-64 rounded-md border-slate-300 pl-9 text-sm focus:border-orange-500 focus:ring-orange-500 dark:border-slate-700 dark:bg-slate-900"
                        />
                    </div>
                    <select
                        value={filters.type ?? ''}
                        onChange={(e) => applyFilters({ type: e.target.value })}
                        className="rounded-md border-slate-300 text-sm focus:border-orange-500 focus:ring-orange-500 dark:border-slate-700 dark:bg-slate-900"
                    >
                        <option value="">{t('Tous les types')}</option>
                        {types.map((ty) => (
                            <option key={ty} value={ty}>{t(CONTRACT_TYPE[ty] ?? ty)}</option>
                        ))}
                    </select>
                    <select
                        value={filters.status ?? ''}
                        onChange={(e) => applyFilters({ status: e.target.value })}
                        className="rounded-md border-slate-300 text-sm focus:border-orange-500 focus:ring-orange-500 dark:border-slate-700 dark:bg-slate-900"
                    >
                        <option value="">{t('Tous les statuts')}</option>
                        {statuses.map((s) => (
                            <option key={s} value={s}>{t(CONTRACT_STATUS[s]?.label ?? s)}</option>
                        ))}
                    </select>
                </form>

                {can.create && (
                    <Link
                        href="/contracts/create"
                        className="inline-flex items-center gap-2 rounded-md bg-orange-500 px-4 py-2 text-sm font-medium text-white hover:bg-orange-600"
                    >
                        <Icon name="plus" className="h-4 w-4" />
                        {t('Nouveau contrat')}
                    </Link>
                )}
            </div>

            {/* Tableau */}
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
                <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
                    <thead className="bg-slate-50 dark:bg-slate-800/50">
                        <tr className="text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                            <th className="px-4 py-3">{t('Contrat')}</th>
                            <th className="px-4 py-3">{t('Type')}</th>
                            <th className="px-4 py-3">{t('Contrepartie')}</th>
                            <th className="px-4 py-3">{t('Montant')}</th>
                            <th className="px-4 py-3">{t('Statut')}</th>
                            <th className="px-4 py-3">{t('Début → Fin')}</th>
                            <th className="px-4 py-3"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {contracts.data.map((contract) => (
                            <tr key={contract.id} className="text-sm hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                <td className="px-4 py-3">
                                    <Link href={`/contracts/${contract.id}`} className="font-medium text-slate-800 hover:text-orange-600 dark:text-slate-100">
                                        {contract.title}
                                    </Link>
                                    <div className="text-xs text-slate-400">
                                        {contract.code}{contract.project ? ` · ${contract.project.name}` : ''}
                                    </div>
                                </td>
                                <td className="px-4 py-3">
                                    <span className="inline-flex rounded-full bg-orange-100 px-2.5 py-0.5 text-xs font-medium text-orange-700">
                                        {t(CONTRACT_TYPE[contract.type] ?? contract.type)}
                                    </span>
                                </td>
                                <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                                    {contract.party_name ?? '—'}
                                </td>
                                <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                                    {formatMoney(contract.amount, contract.currency)}
                                </td>
                                <td className="px-4 py-3"><StatusBadge status={contract.status} /></td>
                                <td className="px-4 py-3 text-xs text-slate-500">
                                    {fmtDate(contract.start_date)} → {fmtDate(contract.end_date)}
                                </td>
                                <td className="px-4 py-3 text-right">
                                    <Link href={`/contracts/${contract.id}`} className="text-slate-400 hover:text-orange-600">
                                        <Icon name="chevron-right" className="h-4 w-4" />
                                    </Link>
                                </td>
                            </tr>
                        ))}

                        {contracts.data.length === 0 && (
                            <tr>
                                <td colSpan={7} className="px-4 py-12 text-center text-slate-400">
                                    <Icon name="file-text" className="mx-auto mb-2 h-8 w-8" />
                                    {t('Aucun contrat trouvé.')}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {contracts.last_page > 1 && (
                <div className="mt-4 flex flex-wrap gap-1">
                    {contracts.links.map((link, i) => (
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
