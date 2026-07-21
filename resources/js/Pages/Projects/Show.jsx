import { useState } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import Icon from '@/Components/Icon';
import Modal from '@/Components/Modal';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import DangerButton from '@/Components/DangerButton';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { PROJECT_STATUS, SITE_STATUS, PROJECT_TYPE, formatMoney } from '@/constants';
import { useTrans } from '@/i18n';

/* ---------- Libellés locaux ------------------------------------------------ */

const TASK_STATUS = {
    todo:        { label: 'À faire',    color: 'bg-slate-100 text-slate-600' },
    in_progress: { label: 'En cours',   color: 'bg-blue-100 text-blue-700' },
    done:        { label: 'Terminée',   color: 'bg-green-100 text-green-700' },
    blocked:     { label: 'Bloquée',    color: 'bg-red-100 text-red-700' },
};

/* ---------- Composants utilitaires ---------------------------------------- */

function StatusBadge({ map, status }) {
    const { t } = useTrans();
    const s = map[status] ?? { label: status, color: 'bg-slate-100 text-slate-600' };
    return (
        <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${s.color}`}>
            {t(s.label)}
        </span>
    );
}

function KpiCard({ icon, label, value, sub, accent }) {
    const accentCls = accent === 'green'
        ? 'bg-green-50 text-green-600 dark:bg-green-900/20'
        : accent === 'red'
            ? 'bg-red-50 text-red-600 dark:bg-red-900/20'
            : accent === 'blue'
                ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20'
                : 'bg-orange-50 text-orange-600 dark:bg-orange-900/20';

    return (
        <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
            <div className={`mb-3 inline-flex rounded-lg p-2 ${accentCls}`}>
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    {icon}
                </svg>
            </div>
            <div className="text-2xl font-bold text-slate-800 dark:text-slate-100">{value}</div>
            <div className="text-sm font-medium text-slate-500">{label}</div>
            {sub && <div className="mt-1 text-xs text-slate-400">{sub}</div>}
        </div>
    );
}

function SectionCard({ icon, title, action, children }) {
    return (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 dark:border-slate-800">
                <h3 className="flex items-center gap-2 font-semibold text-slate-800 dark:text-slate-100">
                    <svg className="h-5 w-5 text-orange-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                        {icon}
                    </svg>
                    {title}
                </h3>
                {action}
            </div>
            {children}
        </div>
    );
}

function EmptyRow({ message }) {
    return (
        <li className="px-5 py-8 text-center text-sm text-slate-400">{message}</li>
    );
}

/* ---------- Page principale ----------------------------------------------- */

export default function Show({
    project,
    recent_tasks  = [],
    budget_progress = { planned: 0, spent: 0 },
    sites_count   = 0,
    documents_count = 0,
    days_remaining  = null,
    can,
}) {
    const { t } = useTrans();
    const [showSiteModal,  setShowSiteModal]  = useState(false);
    const [confirmDelete, setConfirmDelete] = useState(false);

    const siteForm = useForm({
        code: '', name: '', description: '', status: 'preparation',
        progress: 0, start_date: '', end_date: '', city: '', address: '', site_manager_id: '',
    });

    const submitSite = (e) => {
        e.preventDefault();
        siteForm.post(`/projects/${project.id}/sites`, {
            onSuccess: () => { siteForm.reset(); setShowSiteModal(false); },
            preserveScroll: true,
        });
    };

    const deleteSite = (site) => {
        if (confirm(`${t('Supprimer le chantier')} « ${site.name} » ?`)) {
            router.delete(`/projects/${project.id}/sites/${site.id}`, { preserveScroll: true });
        }
    };

    const deleteProject = () => {
        router.delete(`/projects/${project.id}`);
    };

    const fmtDate = (d) => (d ? new Date(d).toLocaleDateString('fr-FR') : '—');

    const spentPct = budget_progress.planned > 0
        ? Math.min(100, Math.round((budget_progress.spent / budget_progress.planned) * 100))
        : 0;

    const spentBarColor = spentPct >= 90
        ? 'bg-red-500'
        : spentPct >= 70
            ? 'bg-amber-500'
            : 'bg-green-500';

    const daysLabel = days_remaining === null
        ? '—'
        : days_remaining === 0
            ? t("Aujourd'hui")
            : days_remaining < 0
                ? t('Terminé')
                : `${days_remaining} j`;

    return (
        <AppLayout header="Fiche projet">
            <Head title={project.name} />

            {/* Breadcrumb */}
            <nav className="mb-4 flex items-center gap-1 text-sm text-slate-400">
                <Link href="/projects" className="hover:text-orange-600">{t('Projets')}</Link>
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                </svg>
                <span className="text-slate-600 dark:text-slate-300">{project.name}</span>
            </nav>

            {/* En-tête */}
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex items-center gap-3">
                    <Link href="/projects" className="text-slate-400 hover:text-orange-600">
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                        </svg>
                    </Link>
                    <div>
                        <div className="flex flex-wrap items-center gap-2">
                            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">{project.name}</h2>
                            <StatusBadge map={PROJECT_STATUS} status={project.status} />
                        </div>
                        <p className="text-sm text-slate-400">
                            {project.code}
                            {project.type ? ` · ${t(PROJECT_TYPE[project.type] ?? project.type)}` : ''}
                            {project.client_name ? ` · ${project.client_name}` : ''}
                            {project.manager?.name ? ` · ${project.manager.name}` : ''}
                        </p>
                    </div>
                </div>

                {/* Boutons d'action */}
                <div className="flex flex-wrap gap-2">
                    <Link
                        href={`/purchases/create?project_id=${project.id}`}
                        className="inline-flex items-center gap-2 rounded-md bg-orange-500 px-3 py-2 text-sm font-medium text-white hover:bg-orange-600"
                    >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                        </svg>
                        {t('Bon de commande')}
                    </Link>
                    <Link
                        href={`/invoices/create?project_id=${project.id}`}
                        className="inline-flex items-center gap-2 rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                    >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                        </svg>
                        {t('Facture projet')}
                    </Link>
                    <a
                        href={`/projects/${project.id}/pdf`}
                        target="_blank" rel="noopener"
                        className="inline-flex items-center gap-2 rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                    >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                        </svg>
                        PDF
                    </a>
                    {can.update && (
                        <Link
                            href={`/projects/${project.id}/edit`}
                            className="inline-flex items-center gap-2 rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                        >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125" />
                            </svg>
                            {t('Modifier')}
                        </Link>
                    )}
                    {can.delete && (
                        <button
                            onClick={() => setConfirmDelete(true)}
                            className="inline-flex items-center gap-2 rounded-md border border-red-200 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:border-red-900/50"
                        >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                            </svg>
                            {t('Supprimer')}
                        </button>
                    )}
                </div>
            </div>

            {/* KPI Cards */}
            <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
                <KpiCard
                    accent="orange"
                    label={t('Budget prévu')}
                    value={formatMoney(budget_progress.planned, project.currency)}
                    sub={t('budget prévisionnel')}
                    icon={<path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />}
                />
                <KpiCard
                    accent={spentPct >= 90 ? 'red' : spentPct >= 70 ? 'orange' : 'green'}
                    label={t('Dépensé')}
                    value={formatMoney(budget_progress.spent, project.currency)}
                    sub={`${spentPct} % ${t('du budget')}`}
                    icon={<path strokeLinecap="round" strokeLinejoin="round" d="M15.75 15.75V18m-7.5-6.75h.008v.008H8.25v-.008zm0 2.25h.008v.008H8.25V13.5zm0 2.25h.008v.008H8.25v-.008zm0 2.25h.008v.008H8.25V18zm2.498-6.75h.007v.008h-.007v-.008zm0 2.25h.007v.008h-.007V13.5zm0 2.25h.007v.008h-.007v-.008zm0 2.25h.007v.008h-.007V18zm2.504-6.75h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V13.5zm0 2.25h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V18zm2.498-6.75h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V13.5zM8.25 6h7.5v2.25h-7.5V6zM12 2.25c-1.892 0-3.758.11-5.593.322C5.307 2.7 4.5 3.616 4.5 4.698V18a2.25 2.25 0 002.25 2.25h10.5A2.25 2.25 0 0019.5 18V4.698c0-1.082-.807-1.998-1.907-2.126A48.234 48.234 0 0012 2.25z" />}
                />
                <KpiCard
                    accent="blue"
                    label={t('Avancement')}
                    value={`${project.progress ?? 0} %`}
                    sub={`${sites_count} ${t('chantier(s)')}`}
                    icon={<path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />}
                />
                <KpiCard
                    accent={days_remaining !== null && days_remaining <= 7 ? 'red' : 'orange'}
                    label={t('Jours restants')}
                    value={daysLabel}
                    sub={project.end_date ? fmtDate(project.end_date) : t('Pas de date de fin')}
                    icon={<path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />}
                />
            </div>

            {/* Barre de progression budget */}
            <div className="mb-6 rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
                <div className="mb-3 flex items-center justify-between text-sm">
                    <span className="font-semibold text-slate-700 dark:text-slate-200">{t('Consommation budgétaire')}</span>
                    <span className={`font-bold ${spentPct >= 90 ? 'text-red-600' : spentPct >= 70 ? 'text-amber-600' : 'text-green-600'}`}>
                        {spentPct} %
                    </span>
                </div>
                <div className="h-3 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                    <div
                        className={`h-full rounded-full transition-all duration-500 ${spentBarColor}`}
                        style={{ width: `${spentPct}%` }}
                    />
                </div>
                <div className="mt-2 flex justify-between text-xs text-slate-400">
                    <span>{t('Dépensé')} : {formatMoney(budget_progress.spent, project.currency)}</span>
                    <span>{t('Prévu')} : {formatMoney(budget_progress.planned, project.currency)}</span>
                </div>

                {/* Barre avancement projet */}
                <div className="mt-4 border-t border-slate-100 pt-4 dark:border-slate-800">
                    <div className="mb-2 flex items-center justify-between text-sm">
                        <span className="text-slate-500">{t('Avancement des travaux')}</span>
                        <span className="font-bold text-blue-600">{project.progress ?? 0} %</span>
                    </div>
                    <div className="h-3 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                        <div
                            className="h-full rounded-full bg-blue-500 transition-all duration-500"
                            style={{ width: `${project.progress ?? 0}%` }}
                        />
                    </div>
                </div>
            </div>

            {/* Description */}
            {project.description && (
                <div className="mb-6 rounded-xl border border-slate-200 bg-white p-5 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
                    {project.description}
                </div>
            )}

            <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
                {/* Chantiers */}
                <SectionCard
                    icon={<path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18l2.25 2.25m0 0l2.25 2.25M4.5 5.25l2.25 2.25m0 0l2.25 2.25M6.75 7.5l2.25 2.25M9 9.75l2.25 2.25M11.25 12l2.25 2.25m-9-9L2.25 3m19.5 18l-2.25-2.25m0 0l-2.25-2.25m2.25 2.25l-2.25-2.25m0 0l-2.25-2.25m2.25 2.25L21 21" />}
                    title={`${t('Chantiers')} (${project.sites?.length ?? 0})`}
                    action={can.createSite && (
                        <button
                            onClick={() => setShowSiteModal(true)}
                            className="inline-flex items-center gap-1.5 rounded-md bg-orange-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-orange-600"
                        >
                            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                            </svg>
                            {t('Ajouter')}
                        </button>
                    )}
                >
                    <ul className="divide-y divide-slate-50 dark:divide-slate-800">
                        {project.sites?.length === 0
                            ? <EmptyRow message={t('Aucun chantier. Ajoutez le premier chantier de ce projet.')} />
                            : project.sites?.map((site) => (
                                <li key={site.id} className="flex items-center justify-between px-5 py-3 text-sm">
                                    <div>
                                        <div className="font-medium text-slate-800 dark:text-slate-100">{site.name}</div>
                                        <div className="text-xs text-slate-400">
                                            {site.code}{site.city ? ` · ${site.city}` : ''}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="text-xs text-slate-500">{site.progress}%</span>
                                        <StatusBadge map={SITE_STATUS} status={site.status} />
                                        {can.delete && (
                                            <button onClick={() => deleteSite(site)} className="text-slate-300 hover:text-red-600">
                                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                                                </svg>
                                            </button>
                                        )}
                                    </div>
                                </li>
                            ))
                        }
                    </ul>
                </SectionCard>

                {/* Taches récentes */}
                <SectionCard
                    icon={<path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />}
                    title={t('Tâches récentes')}
                    action={
                        <Link
                            href={`/planning?project_id=${project.id}`}
                            className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300"
                        >
                            {t('Planning')}
                        </Link>
                    }
                >
                    <ul className="divide-y divide-slate-50 dark:divide-slate-800">
                        {recent_tasks.length === 0
                            ? <EmptyRow message={t('Aucune tâche enregistrée pour ce projet.')} />
                            : recent_tasks.map((task) => (
                                <li key={task.id} className="flex items-center justify-between px-5 py-3 text-sm">
                                    <div className="min-w-0">
                                        <div className="truncate font-medium text-slate-800 dark:text-slate-100">{task.name}</div>
                                        <div className="text-xs text-slate-400">
                                            {task.assignee?.name ?? t('Non assignée')}
                                            {task.end_date ? ` · ${fmtDate(task.end_date)}` : ''}
                                        </div>
                                    </div>
                                    <div className="ml-3 flex shrink-0 items-center gap-2">
                                        <span className="text-xs text-slate-500">{task.progress}%</span>
                                        <StatusBadge map={TASK_STATUS} status={task.status} />
                                    </div>
                                </li>
                            ))
                        }
                    </ul>
                    <div className="border-t border-slate-100 px-5 py-3 dark:border-slate-800">
                        <Link href={`/planning?project_id=${project.id}`} className="text-sm text-orange-600 hover:underline">
                            {t('Voir le planning complet')} →
                        </Link>
                    </div>
                </SectionCard>
            </div>

            {/* Infos complémentaires */}
            <div className="mb-6 rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
                <h3 className="mb-4 font-semibold text-slate-800 dark:text-slate-100">{t('Informations générales')}</h3>
                <dl className="grid grid-cols-2 gap-x-8 gap-y-3 text-sm lg:grid-cols-4">
                    {[
                        [t('Code'), project.code],
                        [t('Type'), PROJECT_TYPE[project.type] ?? project.type],
                        [t('Client'), project.client_name],
                        [t('Directeur'), project.manager?.name],
                        [t('Début'), fmtDate(project.start_date)],
                        [t('Fin prévue'), fmtDate(project.end_date)],
                        [t('Ville'), project.city],
                        [t('Documents GED'), documents_count],
                    ].map(([label, val]) => (
                        <div key={label}>
                            <dt className="text-xs uppercase tracking-wider text-slate-400">{label}</dt>
                            <dd className="mt-0.5 font-medium text-slate-700 dark:text-slate-200">{val || '—'}</dd>
                        </div>
                    ))}
                </dl>
            </div>

            {/* Modal ajout chantier */}
            <Modal show={showSiteModal} onClose={() => setShowSiteModal(false)}>
                <form onSubmit={submitSite} className="p-6">
                    <h3 className="mb-4 text-lg font-semibold text-slate-800 dark:text-slate-100">{t('Nouveau chantier')}</h3>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div>
                            <InputLabel htmlFor="site_code" value={`${t('Code')} *`} />
                            <TextInput id="site_code" className="mt-1 block w-full" value={siteForm.data.code}
                                onChange={(e) => siteForm.setData('code', e.target.value)} />
                            <InputError message={siteForm.errors.code} className="mt-1" />
                        </div>
                        <div>
                            <InputLabel htmlFor="site_name" value={`${t('Nom')} *`} />
                            <TextInput id="site_name" className="mt-1 block w-full" value={siteForm.data.name}
                                onChange={(e) => siteForm.setData('name', e.target.value)} />
                            <InputError message={siteForm.errors.name} className="mt-1" />
                        </div>
                        <div>
                            <InputLabel htmlFor="site_status" value={`${t('Statut')} *`} />
                            <select id="site_status"
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
                                value={siteForm.data.status}
                                onChange={(e) => siteForm.setData('status', e.target.value)}>
                                {Object.entries(SITE_STATUS).map(([k, v]) => (
                                    <option key={k} value={k}>{v.label}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <InputLabel htmlFor="site_progress" value={t('Avancement (%)')} />
                            <TextInput id="site_progress" type="number" min={0} max={100} className="mt-1 block w-full"
                                value={siteForm.data.progress}
                                onChange={(e) => siteForm.setData('progress', e.target.value)} />
                        </div>
                        <div>
                            <InputLabel htmlFor="site_city" value={t('Ville')} />
                            <TextInput id="site_city" className="mt-1 block w-full" value={siteForm.data.city}
                                onChange={(e) => siteForm.setData('city', e.target.value)} />
                        </div>
                        <div>
                            <InputLabel htmlFor="site_start" value={t('Date de début')} />
                            <TextInput id="site_start" type="date" className="mt-1 block w-full" value={siteForm.data.start_date}
                                onChange={(e) => siteForm.setData('start_date', e.target.value)} />
                        </div>
                    </div>
                    <div className="mt-6 flex justify-end gap-3">
                        <SecondaryButton type="button" onClick={() => setShowSiteModal(false)}>{t('Annuler')}</SecondaryButton>
                        <PrimaryButton
                            disabled={siteForm.processing}
                            className="bg-orange-500 hover:bg-orange-600 focus:bg-orange-600"
                        >
                            {t('Ajouter le chantier')}
                        </PrimaryButton>
                    </div>
                </form>
            </Modal>

            {/* Modal confirmation suppression projet */}
            <Modal show={confirmDelete} onClose={() => setConfirmDelete(false)} maxWidth="md">
                <div className="p-6">
                    <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">{t('Supprimer ce projet ?')}</h3>
                    <p className="mt-2 text-sm text-slate-500">
                        {t('Le projet')} « {project.name} » {t('et ses chantiers seront supprimés. Cette action est réversible (corbeille).')}
                    </p>
                    <div className="mt-6 flex justify-end gap-3">
                        <SecondaryButton type="button" onClick={() => setConfirmDelete(false)}>{t('Annuler')}</SecondaryButton>
                        <DangerButton onClick={deleteProject}>{t('Supprimer définitivement')}</DangerButton>
                    </div>
                </div>
            </Modal>
        </AppLayout>
    );
}
