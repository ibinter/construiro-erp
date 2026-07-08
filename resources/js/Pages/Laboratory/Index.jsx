import { useState } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import Icon from '@/Components/Icon';
import { Head, Link, router } from '@inertiajs/react';
import { SAMPLE_TYPE, RESULT } from './Partials/LabTestForm';

// Couleurs des badges de résultat (conforme vert / non conforme rouge / en attente ambre).
const RESULT_COLOR = {
    conforme:     'bg-green-100 text-green-700',
    non_conforme: 'bg-red-100 text-red-700',
    en_attente:   'bg-amber-100 text-amber-700',
};

function ResultBadge({ result }) {
    const color = RESULT_COLOR[result] ?? 'bg-slate-100 text-slate-600';
    return (
        <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${color}`}>
            {RESULT[result] ?? result}
        </span>
    );
}

export default function Index({ tests, filters, sampleTypes, results, can }) {
    const [search, setSearch] = useState(filters.search ?? '');

    const applyFilters = (next = {}) => {
        router.get('/laboratory',
            { search, sample_type: filters.sample_type, result: filters.result, ...next },
            { preserveState: true, replace: true },
        );
    };

    return (
        <AppLayout header="Laboratoire">
            <Head title="Laboratoire" />

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
                            placeholder="Rechercher un essai…"
                            className="w-64 rounded-md border-slate-300 pl-9 text-sm focus:border-orange-500 focus:ring-orange-500 dark:border-slate-700 dark:bg-slate-900"
                        />
                    </div>
                    <select
                        value={filters.sample_type ?? ''}
                        onChange={(e) => applyFilters({ sample_type: e.target.value })}
                        className="rounded-md border-slate-300 text-sm focus:border-orange-500 focus:ring-orange-500 dark:border-slate-700 dark:bg-slate-900"
                    >
                        <option value="">Tous les types</option>
                        {sampleTypes.map((t) => (
                            <option key={t} value={t}>{SAMPLE_TYPE[t] ?? t}</option>
                        ))}
                    </select>
                    <select
                        value={filters.result ?? ''}
                        onChange={(e) => applyFilters({ result: e.target.value })}
                        className="rounded-md border-slate-300 text-sm focus:border-orange-500 focus:ring-orange-500 dark:border-slate-700 dark:bg-slate-900"
                    >
                        <option value="">Tous les résultats</option>
                        {results.map((r) => (
                            <option key={r} value={r}>{RESULT[r] ?? r}</option>
                        ))}
                    </select>
                </form>

                {can.create && (
                    <Link
                        href="/laboratory/create"
                        className="inline-flex items-center gap-2 rounded-md bg-orange-500 px-4 py-2 text-sm font-medium text-white hover:bg-orange-600"
                    >
                        <Icon name="plus" className="h-4 w-4" />
                        Nouvel essai
                    </Link>
                )}
            </div>

            {/* Tableau */}
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
                <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
                    <thead className="bg-slate-50 dark:bg-slate-800/50">
                        <tr className="text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                            <th className="px-4 py-3">Essai</th>
                            <th className="px-4 py-3">Type</th>
                            <th className="px-4 py-3">Valeur</th>
                            <th className="px-4 py-3">Date</th>
                            <th className="px-4 py-3">Résultat</th>
                            <th className="px-4 py-3"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {tests.data.map((test) => (
                            <tr key={test.id} className="text-sm hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                <td className="px-4 py-3">
                                    <Link href={`/laboratory/${test.id}`} className="font-medium text-slate-800 hover:text-orange-600 dark:text-slate-100">
                                        {test.test_name}
                                    </Link>
                                    <div className="text-xs text-slate-400">
                                        {test.code}{test.project ? ` · ${test.project.name}` : ''}
                                    </div>
                                </td>
                                <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                                    {SAMPLE_TYPE[test.sample_type] ?? test.sample_type}
                                </td>
                                <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                                    {test.result_value != null ? `${test.result_value}${test.unit ? ` ${test.unit}` : ''}` : '—'}
                                </td>
                                <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                                    {test.test_date ? new Date(test.test_date).toLocaleDateString('fr-FR') : '—'}
                                </td>
                                <td className="px-4 py-3"><ResultBadge result={test.result} /></td>
                                <td className="px-4 py-3 text-right">
                                    <Link href={`/laboratory/${test.id}`} className="text-slate-400 hover:text-orange-600">
                                        <Icon name="chevron-right" className="h-4 w-4" />
                                    </Link>
                                </td>
                            </tr>
                        ))}

                        {tests.data.length === 0 && (
                            <tr>
                                <td colSpan={6} className="px-4 py-12 text-center text-slate-400">
                                    <Icon name="flask-conical" className="mx-auto mb-2 h-8 w-8" />
                                    Aucun essai trouvé.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {tests.last_page > 1 && (
                <div className="mt-4 flex flex-wrap gap-1">
                    {tests.links.map((link, i) => (
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
