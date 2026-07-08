import { useState } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import Icon from '@/Components/Icon';
import { Head, Link, router } from '@inertiajs/react';
import { CATEGORY, CATEGORY_ICON } from './Partials/DocumentForm';

export default function Index({ documents, filters, categories, can }) {
    const [search, setSearch] = useState(filters.search ?? '');

    const applyFilters = (next = {}) => {
        router.get('/documents',
            { search, category: filters.category, ...next },
            { preserveState: true, replace: true },
        );
    };

    return (
        <AppLayout header="Gestion documentaire">
            <Head title="Documents" />

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
                            placeholder="Rechercher un document…"
                            className="w-64 rounded-md border-slate-300 pl-9 text-sm focus:border-orange-500 focus:ring-orange-500 dark:border-slate-700 dark:bg-slate-900"
                        />
                    </div>
                    <select
                        value={filters.category ?? ''}
                        onChange={(e) => applyFilters({ category: e.target.value })}
                        className="rounded-md border-slate-300 text-sm focus:border-orange-500 focus:ring-orange-500 dark:border-slate-700 dark:bg-slate-900"
                    >
                        <option value="">Toutes les catégories</option>
                        {categories.map((c) => (
                            <option key={c} value={c}>{CATEGORY[c] ?? c}</option>
                        ))}
                    </select>
                </form>

                {can.create && (
                    <Link
                        href="/documents/create"
                        className="inline-flex items-center gap-2 rounded-md bg-orange-500 px-4 py-2 text-sm font-medium text-white hover:bg-orange-600"
                    >
                        <Icon name="plus" className="h-4 w-4" />
                        Nouveau document
                    </Link>
                )}
            </div>

            {/* Tableau */}
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
                <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
                    <thead className="bg-slate-50 dark:bg-slate-800/50">
                        <tr className="text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                            <th className="px-4 py-3">Document</th>
                            <th className="px-4 py-3">Catégorie</th>
                            <th className="px-4 py-3">Version</th>
                            <th className="px-4 py-3">Projet</th>
                            <th className="px-4 py-3"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {documents.data.map((doc) => (
                            <tr key={doc.id} className="text-sm hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                <td className="px-4 py-3">
                                    <div className="flex items-center gap-3">
                                        <Icon name={CATEGORY_ICON[doc.category] ?? 'file'} className="h-5 w-5 text-orange-500" />
                                        <div>
                                            <Link href={`/documents/${doc.id}`} className="font-medium text-slate-800 hover:text-orange-600 dark:text-slate-100">
                                                {doc.title}
                                            </Link>
                                            <div className="text-xs text-slate-400">
                                                {doc.code}{doc.file_name ? ` · ${doc.file_name}` : ''}
                                            </div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                                    {CATEGORY[doc.category] ?? doc.category}
                                </td>
                                <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{doc.version}</td>
                                <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{doc.project?.name || '—'}</td>
                                <td className="px-4 py-3 text-right">
                                    <Link href={`/documents/${doc.id}`} className="text-slate-400 hover:text-orange-600">
                                        <Icon name="chevron-right" className="h-4 w-4" />
                                    </Link>
                                </td>
                            </tr>
                        ))}

                        {documents.data.length === 0 && (
                            <tr>
                                <td colSpan={5} className="px-4 py-12 text-center text-slate-400">
                                    <Icon name="files" className="mx-auto mb-2 h-8 w-8" />
                                    Aucun document trouvé.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {documents.last_page > 1 && (
                <div className="mt-4 flex flex-wrap gap-1">
                    {documents.links.map((link, i) => (
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
