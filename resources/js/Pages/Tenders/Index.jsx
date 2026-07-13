import { useState } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import Icon from '@/Components/Icon';
import { Head, Link, router } from '@inertiajs/react';
import { formatMoney } from '@/constants';
import { useTrans } from '@/i18n';

// Statuts de l'appel d'offres avec libellés et couleurs (FR).
export const TENDER_STATUS = {
    identifie:      { label: 'Identifié',      color: 'bg-slate-100 text-slate-600' },
    en_preparation: { label: 'En préparation', color: 'bg-sky-100 text-sky-700' },
    soumis:         { label: 'Soumis',         color: 'bg-indigo-100 text-indigo-700' },
    gagne:          { label: 'Gagné',          color: 'bg-green-100 text-green-700' },
    perdu:          { label: 'Perdu',          color: 'bg-red-100 text-red-700' },
    annule:         { label: 'Annulé',         color: 'bg-amber-100 text-amber-700' },
};

// Nature du marché (FR).
export const TENDER_TYPE = {
    public:    'Marché public',
    prive:     'Marché privé',
    gre_a_gre: 'Gré à gré',
};

function StatusBadge({ status }) {
    const { t } = useTrans();
    const s = TENDER_STATUS[status] ?? { label: status, color: 'bg-slate-100 text-slate-600' };
    return (
        <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${s.color}`}>
            {t(s.label)}
        </span>
    );
}

export default function Index({ tenders, filters, types, statuses, can }) {
    const { t } = useTrans();
    const [search, setSearch] = useState(filters.search ?? '');

    const applyFilters = (next = {}) => {
        router.get('/tenders', { search, type: filters.type, status: filters.status, ...next }, {
            preserveState: true,
            replace: true,
        });
    };

    return (
        <AppLayout header="Appels d'offres">
            <Head title={t("Appels d'offres")} />

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
                            placeholder={t("Rechercher un appel d'offres…")}
                            className="w-full sm:w-64 rounded-md border-slate-300 pl-9 text-sm focus:border-orange-500 focus:ring-orange-500 dark:border-slate-700 dark:bg-slate-900"
                        />
                    </div>
                    <select
                        value={filters.type ?? ''}
                        onChange={(e) => applyFilters({ type: e.target.value })}
                        className="rounded-md border-slate-300 text-sm focus:border-orange-500 focus:ring-orange-500 dark:border-slate-700 dark:bg-slate-900"
                    >
                        <option value="">{t('Tous les types')}</option>
                        {types.map((ty) => (
                            <option key={ty} value={ty}>{t(TENDER_TYPE[ty] ?? ty)}</option>
                        ))}
                    </select>
                    <select
                        value={filters.status ?? ''}
                        onChange={(e) => applyFilters({ status: e.target.value })}
                        className="rounded-md border-slate-300 text-sm focus:border-orange-500 focus:ring-orange-500 dark:border-slate-700 dark:bg-slate-900"
                    >
                        <option value="">{t('Tous les statuts')}</option>
                        {statuses.map((s) => (
                            <option key={s} value={s}>{t(TENDER_STATUS[s]?.label ?? s)}</option>
                        ))}
                    </select>
                </form>

                {can.create && (
                    <Link
                        href="/tenders/create"
                        className="inline-flex items-center gap-2 rounded-md bg-orange-500 px-4 py-2 text-sm font-medium text-white hover:bg-orange-600"
                    >
                        <Icon name="plus" className="h-4 w-4" />
                        {t("Nouvel appel d'offres")}
                    </Link>
                )}
            </div>

            {/* Tableau */}
            <div className="rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
                <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
                    <thead className="bg-slate-50 dark:bg-slate-800/50">
                        <tr className="text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                            <th className="px-4 py-3">{t("Appel d'offres")}</th>
                            <th className="px-4 py-3">{t('Type')}</th>
                            <th className="px-4 py-3">{t('Statut')}</th>
                            <th className="px-4 py-3">{t('Montant estimé')}</th>
                            <th className="px-4 py-3">{t('Date limite')}</th>
                            <th className="px-4 py-3"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {tenders.data.map((tender) => (
                            <tr key={tender.id} className="text-sm hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                <td className="px-4 py-3">
                                    <Link href={`/tenders/${tender.id}`} className="font-medium text-slate-800 hover:text-orange-600 dark:text-slate-100">
                                        {tender.title}
                                    </Link>
                                    <div className="text-xs text-slate-400">
                                        {tender.code}{tender.client_name ? ` · ${tender.client_name}` : ''}
                                    </div>
                                </td>
                                <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                                    {t(TENDER_TYPE[tender.type] ?? tender.type)}
                                </td>
                                <td className="px-4 py-3"><StatusBadge status={tender.status} /></td>
                                <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                                    {formatMoney(tender.estimated_amount, tender.currency)}
                                </td>
                                <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                                    {tender.submission_deadline
                                        ? new Date(tender.submission_deadline).toLocaleDateString('fr-FR')
                                        : '—'}
                                </td>
                                <td className="px-4 py-3 text-right">
                                    <Link href={`/tenders/${tender.id}`} className="text-slate-400 hover:text-orange-600">
                                        <Icon name="chevron-right" className="h-4 w-4" />
                                    </Link>
                                </td>
                            </tr>
                        ))}

                        {tenders.data.length === 0 && (
                            <tr>
                                <td colSpan={6} className="px-4 py-12 text-center text-slate-400">
                                    <Icon name="gavel" className="mx-auto mb-2 h-8 w-8" />
                                    {t("Aucun appel d'offres trouvé.")}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
                </div>
            </div>

            {/* Pagination */}
            {tenders.last_page > 1 && (
                <div className="mt-4 flex flex-wrap gap-1">
                    {tenders.links.map((link, i) => (
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
