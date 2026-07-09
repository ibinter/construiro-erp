import { useState } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import Icon from '@/Components/Icon';
import { Head, Link, router } from '@inertiajs/react';
import { PROJECT_STATUS, PROJECT_TYPE, formatMoney } from '@/constants';
import { useTrans } from '@/i18n';

function StatusBadge({ status }) {
    const { t } = useTrans();
    const s = PROJECT_STATUS[status] ?? { label: status, color: 'bg-slate-100 text-slate-600' };
    return (
        <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${s.color}`}>
            {t(s.label)}
        </span>
    );
}

function ProgressBar({ value }) {
    return (
        <div className="flex items-center gap-2">
            <div className="h-2 w-24 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                <div className="h-full rounded-full bg-orange-500" style={{ width: `${value}%` }} />
            </div>
            <span className="text-xs text-slate-500">{value}%</span>
        </div>
    );
}

export default function Index({ projects, filters, statuses, can }) {
    const { t } = useTrans();
    const [search, setSearch] = useState(filters.search ?? '');

    const applyFilters = (next = {}) => {
        router.get('/projects', { search, status: filters.status, ...next }, {
            preserveState: true,
            replace: true,
        });
    };

    return (
        <AppLayout header="Projets">
            <Head title={t('Projets')} />

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
                            placeholder={t('Rechercher un projet…')}
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
                            <option key={s} value={s}>{t(PROJECT_STATUS[s]?.label ?? s)}</option>
                        ))}
                    </select>
                </form>

                <div className="flex gap-2">
                    <a
                        href="/export/projects"
                        target="_blank"
                        rel="noopener"
                        className="inline-flex items-center gap-2 rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                    >
                        <Icon name="file-spreadsheet" className="h-4 w-4" /> {t('Exporter')}
                    </a>
                    {can.create && (
                        <Link
                            href="/projects/create"
                            className="inline-flex items-center gap-2 rounded-md bg-orange-500 px-4 py-2 text-sm font-medium text-white hover:bg-orange-600"
                        >
                            <Icon name="plus" className="h-4 w-4" />
                            {t('Nouveau projet')}
                        </Link>
                    )}
                </div>
            </div>

            {/* Tableau */}
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
                <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
                    <thead className="bg-slate-50 dark:bg-slate-800/50">
                        <tr className="text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                            <th className="px-4 py-3">{t('Projet')}</th>
                            <th className="px-4 py-3">{t('Type')}</th>
                            <th className="px-4 py-3">{t('Statut')}</th>
                            <th className="px-4 py-3">{t('Avancement')}</th>
                            <th className="px-4 py-3">{t('Budget')}</th>
                            <th className="px-4 py-3">{t('Chantiers')}</th>
                            <th className="px-4 py-3"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {projects.data.map((project) => (
                            <tr key={project.id} className="text-sm hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                <td className="px-4 py-3">
                                    <Link href={`/projects/${project.id}`} className="font-medium text-slate-800 hover:text-orange-600 dark:text-slate-100">
                                        {project.name}
                                    </Link>
                                    <div className="text-xs text-slate-400">
                                        {project.code}{project.client_name ? ` · ${project.client_name}` : ''}
                                    </div>
                                </td>
                                <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                                    {t(PROJECT_TYPE[project.type] ?? project.type)}
                                </td>
                                <td className="px-4 py-3"><StatusBadge status={project.status} /></td>
                                <td className="px-4 py-3"><ProgressBar value={project.progress} /></td>
                                <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                                    {formatMoney(project.budget_amount, project.currency)}
                                </td>
                                <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                                    {project.sites_count}
                                </td>
                                <td className="px-4 py-3 text-right">
                                    <Link href={`/projects/${project.id}`} className="text-slate-400 hover:text-orange-600">
                                        <Icon name="chevron-right" className="h-4 w-4" />
                                    </Link>
                                </td>
                            </tr>
                        ))}

                        {projects.data.length === 0 && (
                            <tr>
                                <td colSpan={7} className="px-4 py-12 text-center text-slate-400">
                                    <Icon name="folder-open" className="mx-auto mb-2 h-8 w-8" />
                                    {t('Aucun projet trouvé.')}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {projects.last_page > 1 && (
                <div className="mt-4 flex flex-wrap gap-1">
                    {projects.links.map((link, i) => (
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
