import { useState } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import Icon from '@/Components/Icon';
import { Head, Link, router } from '@inertiajs/react';
import { formatMoney } from '@/constants';
import { useTrans } from '@/i18n';

// Libellés locaux au module RH (FR).
const DEPARTMENT = {
    chantier:   { label: 'Chantier',   color: 'bg-orange-100 text-orange-700' },
    bureau:     { label: 'Bureau',     color: 'bg-blue-100 text-blue-700' },
    direction:  { label: 'Direction',  color: 'bg-purple-100 text-purple-700' },
    logistique: { label: 'Logistique', color: 'bg-teal-100 text-teal-700' },
    autre:      { label: 'Autre',      color: 'bg-slate-100 text-slate-600' },
};

const CONTRACT_TYPE = {
    cdi:        'CDI',
    cdd:        'CDD',
    journalier: 'Journalier',
    stage:      'Stage',
    prestation: 'Prestation',
};

const STATUS = {
    active:     { label: 'Actif',    color: 'bg-green-100 text-green-700' },
    suspended:  { label: 'Suspendu', color: 'bg-amber-100 text-amber-700' },
    terminated: { label: 'Sorti',    color: 'bg-red-100 text-red-700' },
};

function DepartmentBadge({ department }) {
    const { t } = useTrans();
    const d = DEPARTMENT[department] ?? { label: department, color: 'bg-slate-100 text-slate-600' };
    return <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${d.color}`}>{t(d.label)}</span>;
}

function StatusBadge({ status }) {
    const { t } = useTrans();
    const s = STATUS[status] ?? { label: status, color: 'bg-slate-100 text-slate-600' };
    return <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${s.color}`}>{t(s.label)}</span>;
}

export default function Index({ employees, filters, departments, statuses, can }) {
    const { t } = useTrans();
    const [search, setSearch] = useState(filters.search ?? '');

    const applyFilters = (next = {}) => {
        router.get('/hr', { search, department: filters.department, status: filters.status, ...next }, {
            preserveState: true,
            replace: true,
        });
    };

    return (
        <AppLayout header="Ressources humaines">
            <Head title={t('Employés')} />

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
                            placeholder={t('Rechercher (matricule, nom…)')}
                            className="w-64 rounded-md border-slate-300 pl-9 text-sm focus:border-orange-500 focus:ring-orange-500 dark:border-slate-700 dark:bg-slate-900"
                        />
                    </div>
                    <select
                        value={filters.department ?? ''}
                        onChange={(e) => applyFilters({ department: e.target.value })}
                        className="rounded-md border-slate-300 text-sm focus:border-orange-500 focus:ring-orange-500 dark:border-slate-700 dark:bg-slate-900"
                    >
                        <option value="">{t('Tous les services')}</option>
                        {departments.map((d) => (
                            <option key={d} value={d}>{t(DEPARTMENT[d]?.label ?? d)}</option>
                        ))}
                    </select>
                    <select
                        value={filters.status ?? ''}
                        onChange={(e) => applyFilters({ status: e.target.value })}
                        className="rounded-md border-slate-300 text-sm focus:border-orange-500 focus:ring-orange-500 dark:border-slate-700 dark:bg-slate-900"
                    >
                        <option value="">{t('Tous les statuts')}</option>
                        {statuses.map((s) => (
                            <option key={s} value={s}>{t(STATUS[s]?.label ?? s)}</option>
                        ))}
                    </select>
                </form>

                <div className="flex gap-2">
                    <a href="/export/employees" target="_blank" rel="noopener"
                        className="inline-flex items-center gap-2 rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800">
                        <Icon name="file-spreadsheet" className="h-4 w-4" /> {t('Exporter')}
                    </a>
                    {can.create && (
                        <Link
                            href="/hr/create"
                            className="inline-flex items-center gap-2 rounded-md bg-orange-500 px-4 py-2 text-sm font-medium text-white hover:bg-orange-600"
                        >
                            <Icon name="user-plus" className="h-4 w-4" />
                            {t('Nouvel employé')}
                        </Link>
                    )}
                </div>
            </div>

            {/* Tableau */}
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
                <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
                    <thead className="bg-slate-50 dark:bg-slate-800/50">
                        <tr className="text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                            <th className="px-4 py-3">{t('Matricule')}</th>
                            <th className="px-4 py-3">{t('Employé')}</th>
                            <th className="px-4 py-3">{t('Poste')}</th>
                            <th className="px-4 py-3">{t('Service')}</th>
                            <th className="px-4 py-3">{t('Contrat')}</th>
                            <th className="px-4 py-3">{t('Salaire')}</th>
                            <th className="px-4 py-3">{t('Statut')}</th>
                            <th className="px-4 py-3"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {employees.data.map((employee) => (
                            <tr key={employee.id} className="text-sm hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                <td className="px-4 py-3 font-mono text-xs text-slate-500">{employee.matricule}</td>
                                <td className="px-4 py-3">
                                    <Link href={`/hr/${employee.id}`} className="font-medium text-slate-800 hover:text-orange-600 dark:text-slate-100">
                                        {employee.full_name}
                                    </Link>
                                    {employee.site ? <div className="text-xs text-slate-400">{employee.site.name}</div> : null}
                                </td>
                                <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{employee.job_title || '—'}</td>
                                <td className="px-4 py-3"><DepartmentBadge department={employee.department} /></td>
                                <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                                    {t(CONTRACT_TYPE[employee.contract_type] ?? employee.contract_type)}
                                </td>
                                <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                                    {formatMoney(employee.base_salary, employee.currency)}
                                </td>
                                <td className="px-4 py-3"><StatusBadge status={employee.status} /></td>
                                <td className="px-4 py-3 text-right">
                                    <Link href={`/hr/${employee.id}`} className="text-slate-400 hover:text-orange-600">
                                        <Icon name="chevron-right" className="h-4 w-4" />
                                    </Link>
                                </td>
                            </tr>
                        ))}

                        {employees.data.length === 0 && (
                            <tr>
                                <td colSpan={8} className="px-4 py-12 text-center text-slate-400">
                                    <Icon name="users" className="mx-auto mb-2 h-8 w-8" />
                                    {t('Aucun employé trouvé.')}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {employees.last_page > 1 && (
                <div className="mt-4 flex flex-wrap gap-1">
                    {employees.links.map((link, i) => (
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
