import { useState } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import Icon from '@/Components/Icon';
import { Head, Link, router } from '@inertiajs/react';
import { useTrans } from '@/i18n';

function ActiveBadge({ active }) {
    const { t } = useTrans();
    return active ? (
        <span className="inline-flex rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700">{t('Actif')}</span>
    ) : (
        <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">{t('Inactif')}</span>
    );
}

export default function Index({ warehouses, filters, can }) {
    const { t } = useTrans();
    const [search, setSearch] = useState(filters.search ?? '');

    const applyFilters = (next = {}) => {
        router.get('/warehouses', { search, ...next }, { preserveState: true, replace: true });
    };

    return (
        <AppLayout header="Magasins">
            <Head title={t('Magasins')} />

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
                            placeholder={t('Rechercher un magasin…')}
                            className="w-full sm:w-64 rounded-md border-slate-300 pl-9 text-sm focus:border-orange-500 focus:ring-orange-500 dark:border-slate-700 dark:bg-slate-900"
                        />
                    </div>
                </form>

                {can.create && (
                    <Link
                        href="/warehouses/create"
                        className="inline-flex items-center gap-2 rounded-md bg-orange-500 px-4 py-2 text-sm font-medium text-white hover:bg-orange-600"
                    >
                        <Icon name="plus" className="h-4 w-4" />
                        {t('Nouveau magasin')}
                    </Link>
                )}
            </div>

            {/* Tableau */}
            <div className="rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
                <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
                    <thead className="bg-slate-50 dark:bg-slate-800/50">
                        <tr className="text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                            <th className="px-4 py-3">{t('Magasin')}</th>
                            <th className="px-4 py-3">{t('Ville')}</th>
                            <th className="px-4 py-3">{t('Responsable')}</th>
                            <th className="px-4 py-3">{t('Statut')}</th>
                            <th className="px-4 py-3"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {warehouses.data.map((warehouse) => (
                            <tr key={warehouse.id} className="text-sm hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                <td className="px-4 py-3">
                                    <Link href={`/warehouses/${warehouse.id}`} className="font-medium text-slate-800 hover:text-orange-600 dark:text-slate-100">
                                        {warehouse.name}
                                    </Link>
                                    <div className="text-xs text-slate-400">{warehouse.code}</div>
                                </td>
                                <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{warehouse.city ?? '—'}</td>
                                <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{warehouse.manager_name ?? '—'}</td>
                                <td className="px-4 py-3"><ActiveBadge active={warehouse.is_active} /></td>
                                <td className="px-4 py-3 text-right">
                                    <Link href={`/warehouses/${warehouse.id}`} className="text-slate-400 hover:text-orange-600">
                                        <Icon name="chevron-right" className="h-4 w-4" />
                                    </Link>
                                </td>
                            </tr>
                        ))}

                        {warehouses.data.length === 0 && (
                            <tr>
                                <td colSpan={5} className="px-4 py-12 text-center text-slate-400">
                                    <Icon name="warehouse" className="mx-auto mb-2 h-8 w-8" />
                                    {t('Aucun magasin trouvé.')}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
                </div>
            </div>

            {/* Pagination */}
            {warehouses.last_page > 1 && (
                <div className="mt-4 flex flex-wrap gap-1">
                    {warehouses.links.map((link, i) => (
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
