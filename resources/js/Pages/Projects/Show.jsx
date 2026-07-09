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

function StatusBadge({ map, status }) {
    const { t } = useTrans();
    const s = map[status] ?? { label: status, color: 'bg-slate-100 text-slate-600' };
    return <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${s.color}`}>{t(s.label)}</span>;
}

function InfoTile({ icon, label, value }) {
    return (
        <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center gap-2 text-slate-400">
                <Icon name={icon} className="h-4 w-4" />
                <span className="text-xs uppercase tracking-wider">{label}</span>
            </div>
            <div className="mt-1 font-semibold text-slate-800 dark:text-slate-100">{value}</div>
        </div>
    );
}

export default function Show({ project, can }) {
    const { t } = useTrans();
    const [showSiteModal, setShowSiteModal] = useState(false);
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
        if (confirm(`Supprimer le chantier « ${site.name} » ?`)) {
            siteForm.delete(`/projects/${project.id}/sites/${site.id}`, { preserveScroll: true });
        }
    };

    const deleteProject = () => {
        router.delete(`/projects/${project.id}`);
    };

    const fmtDate = (d) => (d ? new Date(d).toLocaleDateString('fr-FR') : '—');

    return (
        <AppLayout header="Fiche projet">
            <Head title={project.name} />

            {/* En-tête */}
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                    <div className="flex items-center gap-2">
                        <Link href="/projects" className="text-slate-400 hover:text-orange-600">
                            <Icon name="arrow-left" className="h-5 w-5" />
                        </Link>
                        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">{project.name}</h2>
                        <StatusBadge map={PROJECT_STATUS} status={project.status} />
                    </div>
                    <p className="ml-7 text-sm text-slate-400">
                        {project.code} · {t(PROJECT_TYPE[project.type] ?? project.type)}
                        {project.client_name ? ` · ${project.client_name}` : ''}
                    </p>
                </div>
                <div className="flex gap-2">
                    {can.update && (
                        <Link
                            href={`/projects/${project.id}/edit`}
                            className="inline-flex items-center gap-2 rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                        >
                            <Icon name="pencil" className="h-4 w-4" /> {t('Modifier')}
                        </Link>
                    )}
                    {can.delete && (
                        <button
                            onClick={() => setConfirmDelete(true)}
                            className="inline-flex items-center gap-2 rounded-md border border-red-200 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:border-red-900/50"
                        >
                            <Icon name="trash-2" className="h-4 w-4" /> {t('Supprimer')}
                        </button>
                    )}
                </div>
            </div>

            {/* Tuiles d'info */}
            <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
                <InfoTile icon="wallet" label={t('Budget')} value={formatMoney(project.budget_amount, project.currency)} />
                <InfoTile icon="trending-up" label={t('Avancement')} value={`${project.progress} %`} />
                <InfoTile icon="calendar" label={t('Début → Fin')} value={`${fmtDate(project.start_date)} → ${fmtDate(project.end_date)}`} />
                <InfoTile icon="user" label={t('Directeur')} value={project.manager?.name ?? '—'} />
            </div>

            {project.description && (
                <div className="mb-6 rounded-xl border border-slate-200 bg-white p-5 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
                    {project.description}
                </div>
            )}

            {/* Chantiers */}
            <div className="rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
                <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 dark:border-slate-800">
                    <h3 className="flex items-center gap-2 font-semibold text-slate-800 dark:text-slate-100">
                        <Icon name="construction" className="h-5 w-5 text-orange-500" />
                        {t('Chantiers')} ({project.sites.length})
                    </h3>
                    {can.createSite && (
                        <button
                            onClick={() => setShowSiteModal(true)}
                            className="inline-flex items-center gap-2 rounded-md bg-orange-500 px-3 py-1.5 text-sm font-medium text-white hover:bg-orange-600"
                        >
                            <Icon name="plus" className="h-4 w-4" /> {t('Ajouter')}
                        </button>
                    )}
                </div>

                <ul className="divide-y divide-slate-100 dark:divide-slate-800">
                    {project.sites.map((site) => (
                        <li key={site.id} className="flex items-center justify-between px-5 py-3 text-sm">
                            <div>
                                <div className="font-medium text-slate-800 dark:text-slate-100">{site.name}</div>
                                <div className="text-xs text-slate-400">
                                    {site.code}{site.city ? ` · ${site.city}` : ''}
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <span className="text-xs text-slate-500">{site.progress}%</span>
                                <StatusBadge map={SITE_STATUS} status={site.status} />
                                {can.delete && (
                                    <button onClick={() => deleteSite(site)} className="text-slate-300 hover:text-red-600">
                                        <Icon name="trash-2" className="h-4 w-4" />
                                    </button>
                                )}
                            </div>
                        </li>
                    ))}
                    {project.sites.length === 0 && (
                        <li className="px-5 py-8 text-center text-sm text-slate-400">
                            {t('Aucun chantier. Ajoutez le premier chantier de ce projet.')}
                        </li>
                    )}
                </ul>
            </div>

            {/* Modal ajout chantier */}
            <Modal show={showSiteModal} onClose={() => setShowSiteModal(false)}>
                <form onSubmit={submitSite} className="p-6">
                    <h3 className="mb-4 text-lg font-semibold text-slate-800 dark:text-slate-100">{t('Nouveau chantier')}</h3>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div>
                            <InputLabel htmlFor="site_code" value={t('Code *')} />
                            <TextInput id="site_code" className="mt-1 block w-full" value={siteForm.data.code}
                                onChange={(e) => siteForm.setData('code', e.target.value)} />
                            <InputError message={siteForm.errors.code} className="mt-1" />
                        </div>
                        <div>
                            <InputLabel htmlFor="site_name" value={t('Nom *')} />
                            <TextInput id="site_name" className="mt-1 block w-full" value={siteForm.data.name}
                                onChange={(e) => siteForm.setData('name', e.target.value)} />
                            <InputError message={siteForm.errors.name} className="mt-1" />
                        </div>
                        <div>
                            <InputLabel htmlFor="site_status" value={t('Statut *')} />
                            <select id="site_status"
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
                                value={siteForm.data.status} onChange={(e) => siteForm.setData('status', e.target.value)}>
                                {Object.entries(SITE_STATUS).map(([k, v]) => <option key={k} value={k}>{t(v.label)}</option>)}
                            </select>
                        </div>
                        <div>
                            <InputLabel htmlFor="site_progress" value={t('Avancement (%)')} />
                            <TextInput id="site_progress" type="number" min={0} max={100} className="mt-1 block w-full"
                                value={siteForm.data.progress} onChange={(e) => siteForm.setData('progress', e.target.value)} />
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
                        <PrimaryButton disabled={siteForm.processing} className="bg-orange-500 hover:bg-orange-600 focus:bg-orange-600">
                            {t('Ajouter le chantier')}
                        </PrimaryButton>
                    </div>
                </form>
            </Modal>

            {/* Confirmation suppression projet */}
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
