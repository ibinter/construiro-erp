import { useState } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import Icon from '@/Components/Icon';
import { Head, Link, router } from '@inertiajs/react';

// Libellés et styles des statuts d'étude (FR).
const STUDY_STATUS = {
    en_cours: { label: 'En cours', color: 'bg-blue-100 text-blue-700' },
    valide:   { label: 'Validée',  color: 'bg-green-100 text-green-700' },
    rejete:   { label: 'Rejetée',  color: 'bg-red-100 text-red-700' },
};

// Libellés des types d'étude (FR).
const STUDY_TYPE = {
    plan:        'Plan',
    note_calcul: 'Note de calcul',
    etude_sol:   'Étude de sol',
    autre:       'Autre',
};

function StatusBadge({ status }) {
    const s = STUDY_STATUS[status] ?? { label: status, color: 'bg-slate-100 text-slate-600' };
    return <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${s.color}`}>{s.label}</span>;
}

export default function Index({ studies, filters, statuses, can }) {
    const [search, setSearch] = useState(filters.search ?? '');

    const applyFilters = (next = {}) => {
        router.get('/design-office', { search, status: filters.status, ...next }, {
            preserveState: true,
            replace: true,
        });
    };

    return (
        <AppLayout header="Bureau d'études">
            <Head title="Bureau d'études" />

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
                            placeholder="Rechercher une étude…"
                            className="w-64 rounded-md border-slate-300 pl-9 text-sm focus:border-orange-500 focus:ring-orange-500 dark:border-slate-700 dark:bg-slate-900"
                        />
                    </div>
                    <select
                        value={filters.status ?? ''}
                        onChange={(e) => applyFilters({ status: e.target.value })}
                        className="rounded-md border-slate-300 text-sm focus:border-orange-500 focus:ring-orange-500 dark:border-slate-700 dark:bg-slate-900"
                    >
                        <option value="">Tous les statuts</option>
                        {statuses.map((s) => (
                            <option key={s} value={s}>{STUDY_STATUS[s]?.label ?? s}</option>
                        ))}
                    </select>
                </form>

                {can.create && (
                    <Link
                        href="/design-office/create"
                        className="inline-flex items-center gap-2 rounded-md bg-orange-500 px-4 py-2 text-sm font-medium text-white hover:bg-orange-600"
                    >
                        <Icon name="plus" className="h-4 w-4" />
                        Nouvelle étude
                    </Link>
                )}
            </div>

            {/* Tableau */}
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
                <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
                    <thead className="bg-slate-50 dark:bg-slate-800/50">
                        <tr className="text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                            <th className="px-4 py-3">Étude</th>
                            <th className="px-4 py-3">Type</th>
                            <th className="px-4 py-3">Auteur</th>
                            <th className="px-4 py-3">Statut</th>
                            <th className="px-4 py-3"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {studies.data.map((study) => (
                            <tr key={study.id} className="text-sm hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                <td className="px-4 py-3">
                                    <Link href={`/design-office/${study.id}`} className="font-medium text-slate-800 hover:text-orange-600 dark:text-slate-100">
                                        {study.title}
                                    </Link>
                                    <div className="text-xs text-slate-400">
                                        {study.code}{study.project ? ` · ${study.project.name}` : ''}
                                    </div>
                                </td>
                                <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{STUDY_TYPE[study.type] ?? study.type}</td>
                                <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{study.author || '—'}</td>
                                <td className="px-4 py-3"><StatusBadge status={study.status} /></td>
                                <td className="px-4 py-3 text-right">
                                    <Link href={`/design-office/${study.id}`} className="text-slate-400 hover:text-orange-600">
                                        <Icon name="chevron-right" className="h-4 w-4" />
                                    </Link>
                                </td>
                            </tr>
                        ))}

                        {studies.data.length === 0 && (
                            <tr>
                                <td colSpan={5} className="px-4 py-12 text-center text-slate-400">
                                    <Icon name="ruler" className="mx-auto mb-2 h-8 w-8" />
                                    Aucune étude trouvée.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {studies.last_page > 1 && (
                <div className="mt-4 flex flex-wrap gap-1">
                    {studies.links.map((link, i) => (
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
