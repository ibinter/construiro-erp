import { useState } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import Icon from '@/Components/Icon';
import { Head, Link, router } from '@inertiajs/react';
import { formatMoney } from '@/constants';
import { useTrans } from '@/i18n';

// Libellés des catégories de prix (FR) — local à ce module.
const CATEGORY_LABEL = {
    gros_oeuvre:   'Gros œuvre',
    second_oeuvre: 'Second œuvre',
    vrd:           'VRD',
    electricite:   'Électricité',
    plomberie:     'Plomberie',
    autre:         'Autre',
};

const CATEGORY_COLOR = {
    gros_oeuvre:   'bg-orange-100 text-orange-700',
    second_oeuvre: 'bg-blue-100 text-blue-700',
    vrd:           'bg-amber-100 text-amber-700',
    electricite:   'bg-purple-100 text-purple-700',
    plomberie:     'bg-cyan-100 text-cyan-700',
    autre:         'bg-slate-100 text-slate-600',
};

function CategoryBadge({ category }) {
    const { t } = useTrans();
    const color = CATEGORY_COLOR[category] ?? 'bg-slate-100 text-slate-600';
    return (
        <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${color}`}>
            {t(CATEGORY_LABEL[category] ?? category)}
        </span>
    );
}

export default function Index({ unitPrices, filters, categories, can }) {
    const { t } = useTrans();
    const [search, setSearch] = useState(filters.search ?? '');

    const applyFilters = (next = {}) => {
        router.get('/unit-prices', { search, category: filters.category, ...next }, {
            preserveState: true,
            replace: true,
        });
    };

    return (
        <AppLayout header="BPU — Prix unitaires">
            <Head title={t('BPU — Prix unitaires')} />

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
                            placeholder={t('Rechercher un prix…')}
                            className="w-64 rounded-md border-slate-300 pl-9 text-sm focus:border-orange-500 focus:ring-orange-500 dark:border-slate-700 dark:bg-slate-900"
                        />
                    </div>
                    <select
                        value={filters.category ?? ''}
                        onChange={(e) => applyFilters({ category: e.target.value })}
                        className="rounded-md border-slate-300 text-sm focus:border-orange-500 focus:ring-orange-500 dark:border-slate-700 dark:bg-slate-900"
                    >
                        <option value="">{t('Toutes les catégories')}</option>
                        {categories.map((c) => (
                            <option key={c} value={c}>{t(CATEGORY_LABEL[c] ?? c)}</option>
                        ))}
                    </select>
                </form>

                {can.create && (
                    <Link
                        href="/unit-prices/create"
                        className="inline-flex items-center gap-2 rounded-md bg-orange-500 px-4 py-2 text-sm font-medium text-white hover:bg-orange-600"
                    >
                        <Icon name="plus" className="h-4 w-4" />
                        {t('Nouveau prix')}
                    </Link>
                )}
            </div>

            {/* Tableau */}
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
                <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
                    <thead className="bg-slate-50 dark:bg-slate-800/50">
                        <tr className="text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                            <th className="px-4 py-3">{t('Désignation')}</th>
                            <th className="px-4 py-3">{t('Catégorie')}</th>
                            <th className="px-4 py-3">{t('Unité')}</th>
                            <th className="px-4 py-3 text-right">{t('Prix unitaire')}</th>
                            <th className="px-4 py-3">{t('Statut')}</th>
                            <th className="px-4 py-3"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {unitPrices.data.map((price) => (
                            <tr key={price.id} className="text-sm hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                <td className="px-4 py-3">
                                    <Link href={`/unit-prices/${price.id}`} className="font-medium text-slate-800 hover:text-orange-600 dark:text-slate-100">
                                        {price.designation}
                                    </Link>
                                    <div className="text-xs text-slate-400">{price.code}</div>
                                </td>
                                <td className="px-4 py-3"><CategoryBadge category={price.category} /></td>
                                <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{price.unit}</td>
                                <td className="px-4 py-3 text-right font-medium text-slate-700 dark:text-slate-200">
                                    {formatMoney(price.unit_price, price.currency)}
                                </td>
                                <td className="px-4 py-3">
                                    {price.is_active ? (
                                        <span className="inline-flex rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700">{t('Actif')}</span>
                                    ) : (
                                        <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-500">{t('Inactif')}</span>
                                    )}
                                </td>
                                <td className="px-4 py-3 text-right">
                                    <Link href={`/unit-prices/${price.id}`} className="text-slate-400 hover:text-orange-600">
                                        <Icon name="chevron-right" className="h-4 w-4" />
                                    </Link>
                                </td>
                            </tr>
                        ))}

                        {unitPrices.data.length === 0 && (
                            <tr>
                                <td colSpan={6} className="px-4 py-12 text-center text-slate-400">
                                    <Icon name="tags" className="mx-auto mb-2 h-8 w-8" />
                                    {t('Aucun prix unitaire trouvé.')}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {unitPrices.last_page > 1 && (
                <div className="mt-4 flex flex-wrap gap-1">
                    {unitPrices.links.map((link, i) => (
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
