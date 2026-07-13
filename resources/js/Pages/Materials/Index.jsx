import { useState } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import Icon from '@/Components/Icon';
import { Head, Link, router } from '@inertiajs/react';
import { formatMoney } from '@/constants';
import { useTrans } from '@/i18n';
import { MATERIAL_CATEGORY, MATERIAL_UNIT } from './Partials/MaterialForm';

// Abréviation compacte de l'unité pour le tableau.
const UNIT_SHORT = { u: 'u', kg: 'kg', m: 'm', m2: 'm²', m3: 'm³', ml: 'ml', sac: 'sac', tonne: 't' };

export default function Index({ materials, filters, categories, can }) {
    const { t } = useTrans();
    const [search, setSearch] = useState(filters.search ?? '');

    const applyFilters = (next = {}) => {
        router.get('/materials', { search, category: filters.category, ...next }, {
            preserveState: true,
            replace: true,
        });
    };

    return (
        <AppLayout header="Matériaux">
            <Head title={t('Matériaux')} />

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
                            placeholder={t('Rechercher un matériau…')}
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
                            <option key={c} value={c}>{t(MATERIAL_CATEGORY[c] ?? c)}</option>
                        ))}
                    </select>
                </form>

                {can.create && (
                    <Link
                        href="/materials/create"
                        className="inline-flex items-center gap-2 rounded-md bg-orange-500 px-4 py-2 text-sm font-medium text-white hover:bg-orange-600"
                    >
                        <Icon name="plus" className="h-4 w-4" />
                        {t('Nouveau matériau')}
                    </Link>
                )}
            </div>

            {/* Tableau */}
            <div className="rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
                <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
                    <thead className="bg-slate-50 dark:bg-slate-800/50">
                        <tr className="text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                            <th className="px-4 py-3">{t('Matériau')}</th>
                            <th className="px-4 py-3">{t('Catégorie')}</th>
                            <th className="px-4 py-3">{t('Unité')}</th>
                            <th className="px-4 py-3">{t('Prix réf.')}</th>
                            <th className="px-4 py-3">{t('Stock courant')}</th>
                            <th className="px-4 py-3"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {materials.data.map((material) => {
                            const belowMin = Number(material.current_stock) < Number(material.min_stock);
                            return (
                                <tr key={material.id} className="text-sm hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                    <td className="px-4 py-3">
                                        <Link href={`/materials/${material.id}`} className="font-medium text-slate-800 hover:text-orange-600 dark:text-slate-100">
                                            {material.name}
                                        </Link>
                                        <div className="text-xs text-slate-400">{material.code}</div>
                                    </td>
                                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                                        {t(MATERIAL_CATEGORY[material.category] ?? material.category)}
                                    </td>
                                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                                        {UNIT_SHORT[material.unit] ?? material.unit}
                                    </td>
                                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                                        {formatMoney(material.unit_price)}
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className="inline-flex items-center gap-2">
                                            {belowMin && (
                                                <span className="h-2 w-2 rounded-full bg-red-500" title={t("Sous le seuil d'alerte")} />
                                            )}
                                            <span className={belowMin ? 'font-semibold text-red-600' : 'text-slate-700 dark:text-slate-200'}>
                                                {Number(material.current_stock).toLocaleString('fr-FR')} {UNIT_SHORT[material.unit] ?? material.unit}
                                            </span>
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <Link href={`/materials/${material.id}`} className="text-slate-400 hover:text-orange-600">
                                            <Icon name="chevron-right" className="h-4 w-4" />
                                        </Link>
                                    </td>
                                </tr>
                            );
                        })}

                        {materials.data.length === 0 && (
                            <tr>
                                <td colSpan={6} className="px-4 py-12 text-center text-slate-400">
                                    <Icon name="package" className="mx-auto mb-2 h-8 w-8" />
                                    {t('Aucun matériau trouvé.')}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
                </div>
            </div>

            {/* Pagination */}
            {materials.last_page > 1 && (
                <div className="mt-4 flex flex-wrap gap-1">
                    {materials.links.map((link, i) => (
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
