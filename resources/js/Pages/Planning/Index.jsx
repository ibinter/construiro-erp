import { useMemo, useState } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import Icon from '@/Components/Icon';
import Modal from '@/Components/Modal';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import DangerButton from '@/Components/DangerButton';
import { Head, router, useForm } from '@inertiajs/react';
import { useTrans } from '@/i18n';

// Statuts de tâche (libellés + styles) locaux au module planning.
const TASK_STATUS = {
    todo:        { label: 'À faire',  color: 'bg-slate-100 text-slate-600', bar: 'bg-slate-400' },
    in_progress: { label: 'En cours', color: 'bg-blue-100 text-blue-700',   bar: 'bg-blue-500' },
    done:        { label: 'Terminée', color: 'bg-green-100 text-green-700', bar: 'bg-green-500' },
    blocked:     { label: 'Bloquée',  color: 'bg-red-100 text-red-700',     bar: 'bg-red-500' },
};

const MS_PER_DAY = 24 * 60 * 60 * 1000;

const fmtDate = (d) => (d ? new Date(d).toLocaleDateString('fr-FR') : '—');
const parseDate = (d) => (d ? new Date(`${String(d).slice(0, 10)}T00:00:00`) : null);

function StatusBadge({ status }) {
    const { t } = useTrans();
    const s = TASK_STATUS[status] ?? { label: status, color: 'bg-slate-100 text-slate-600' };
    return (
        <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${s.color}`}>
            {t(s.label)}
        </span>
    );
}

// Génère la liste des mois entre deux bornes, pour l'en-tête d'échelle du Gantt.
function monthsBetween(start, end) {
    if (!start || !end) return [];
    const months = [];
    const cursor = new Date(start.getFullYear(), start.getMonth(), 1);
    const total = (end - start) || MS_PER_DAY;
    while (cursor <= end) {
        const next = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1);
        const from = cursor < start ? start : cursor;
        const to = next > end ? end : next;
        const left = ((from - start) / total) * 100;
        const width = ((to - from) / total) * 100;
        months.push({
            key: `${cursor.getFullYear()}-${cursor.getMonth()}`,
            label: cursor.toLocaleDateString('fr-FR', { month: 'short', year: '2-digit' }),
            left,
            width,
        });
        cursor.setMonth(cursor.getMonth() + 1);
    }
    return months;
}

function GanttChart({ tasks, bounds }) {
    const { t } = useTrans();
    const start = parseDate(bounds.start);
    const end = parseDate(bounds.end);
    const months = useMemo(() => monthsBetween(start, end), [bounds.start, bounds.end]);

    const total = start && end ? (end - start) || MS_PER_DAY : 0;

    // Calcule la position (left%) et la largeur (width%) d'une barre selon ses dates.
    const barGeometry = (task) => {
        const ts = parseDate(task.start_date);
        const te = parseDate(task.end_date);
        if (!ts || !te || !start || !end || total <= 0) return null;
        const left = Math.max(0, ((ts - start) / total) * 100);
        const rawWidth = ((te - ts) / total) * 100;
        const width = Math.max(1.5, Math.min(100 - left, rawWidth));
        return { left, width };
    };

    if (!start || !end) {
        return (
            <div className="px-5 py-10 text-center text-sm text-slate-400">
                {t('Renseignez des dates de début et de fin sur les tâches pour afficher le diagramme de Gantt.')}
            </div>
        );
    }

    return (
        <div className="overflow-x-auto">
            <div className="min-w-[640px]">
                {/* En-tête d'échelle (mois) */}
                <div className="flex border-b border-slate-100 dark:border-slate-800">
                    <div className="w-56 shrink-0 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
                        {t('Tâche')}
                    </div>
                    <div className="relative h-8 flex-1">
                        {months.map((m) => (
                            <div
                                key={m.key}
                                className="absolute top-0 h-full border-l border-slate-100 px-1 text-[11px] leading-8 text-slate-400 dark:border-slate-800"
                                style={{ left: `${m.left}%`, width: `${m.width}%` }}
                            >
                                {m.label}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Lignes de tâches */}
                {tasks.map((task) => {
                    const geo = barGeometry(task);
                    const s = TASK_STATUS[task.status] ?? TASK_STATUS.todo;
                    return (
                        <div key={task.id} className="flex items-center border-b border-slate-50 dark:border-slate-800/50">
                            <div className="w-56 shrink-0 truncate px-4 py-2 text-sm text-slate-700 dark:text-slate-200" title={task.name}>
                                {task.name}
                            </div>
                            <div className="relative h-9 flex-1">
                                {geo ? (
                                    <div
                                        className={`absolute top-1.5 h-6 overflow-hidden rounded ${s.bar}`}
                                        style={{ left: `${geo.left}%`, width: `${geo.width}%` }}
                                        title={`${task.name} — ${task.progress}%`}
                                    >
                                        {/* Remplissage selon l'avancement */}
                                        <div className="h-full bg-black/20" style={{ width: `${task.progress}%` }} />
                                    </div>
                                ) : (
                                    <span className="absolute top-2 left-0 text-[11px] italic text-slate-300">{t('sans dates')}</span>
                                )}
                            </div>
                        </div>
                    );
                })}

                {tasks.length === 0 && (
                    <div className="px-5 py-10 text-center text-sm text-slate-400">
                        {t('Aucune tâche pour ce projet.')}
                    </div>
                )}
            </div>
        </div>
    );
}

const emptyTask = {
    project_id: '', site_id: '', parent_id: '', assignee_id: '',
    name: '', description: '', start_date: '', end_date: '',
    progress: 0, status: 'todo', position: 0,
};

export default function Index({ projects, selectedProject, tasks, bounds, members, statuses, can }) {
    const { t } = useTrans();
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState(null); // tâche en cours d'édition, ou null (création)
    const [confirmDelete, setConfirmDelete] = useState(null);

    const form = useForm(emptyTask);

    // Change le projet affiché (recharge la page avec ?project=ID).
    const selectProject = (id) => {
        router.get('/planning', id ? { project: id } : {}, { preserveState: false, replace: true });
    };

    const openCreate = () => {
        setEditing(null);
        form.clearErrors();
        form.setData({ ...emptyTask, project_id: selectedProject?.id ?? '' });
        setShowModal(true);
    };

    const openEdit = (task) => {
        setEditing(task);
        form.clearErrors();
        form.setData({
            project_id: task.project_id,
            site_id: task.site_id ?? '',
            parent_id: task.parent_id ?? '',
            assignee_id: task.assignee_id ?? '',
            name: task.name ?? '',
            description: task.description ?? '',
            start_date: task.start_date ? String(task.start_date).slice(0, 10) : '',
            end_date: task.end_date ? String(task.end_date).slice(0, 10) : '',
            progress: task.progress ?? 0,
            status: task.status ?? 'todo',
            position: task.position ?? 0,
        });
        setShowModal(true);
    };

    const submit = (e) => {
        e.preventDefault();
        const onSuccess = () => { setShowModal(false); form.reset(); };
        if (editing) {
            form.put(`/planning/${editing.id}`, { onSuccess, preserveScroll: true });
        } else {
            form.post('/planning', { onSuccess, preserveScroll: true });
        }
    };

    const doDelete = () => {
        if (!confirmDelete) return;
        router.delete(`/planning/${confirmDelete.id}`, {
            preserveScroll: true,
            onFinish: () => setConfirmDelete(null),
        });
    };

    return (
        <AppLayout header="Planning & Gantt">
            <Head title={t('Planning')} />

            {/* Sélecteur de projet */}
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-2">
                    <Icon name="calendar-range" className="h-5 w-5 text-orange-500" />
                    <select
                        value={selectedProject?.id ?? ''}
                        onChange={(e) => selectProject(e.target.value)}
                        className="w-72 rounded-md border-slate-300 text-sm focus:border-orange-500 focus:ring-orange-500 dark:border-slate-700 dark:bg-slate-900"
                    >
                        <option value="">{t('— Sélectionner un projet —')}</option>
                        {projects.map((p) => (
                            <option key={p.id} value={p.id}>{p.code} · {p.name}</option>
                        ))}
                    </select>
                </div>

                {selectedProject && can.create && (
                    <button
                        onClick={openCreate}
                        className="inline-flex items-center gap-2 rounded-md bg-orange-500 px-4 py-2 text-sm font-medium text-white hover:bg-orange-600"
                    >
                        <Icon name="plus" className="h-4 w-4" />
                        {t('Nouvelle tâche')}
                    </button>
                )}
            </div>

            {!selectedProject ? (
                <div className="rounded-xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center dark:border-slate-700 dark:bg-slate-900">
                    <Icon name="calendar-clock" className="mx-auto mb-3 h-10 w-10 text-slate-300" />
                    <p className="text-sm text-slate-500">
                        {t('Sélectionnez un projet ci-dessus pour afficher son planning et son diagramme de Gantt.')}
                    </p>
                </div>
            ) : (
                <div className="space-y-6">
                    {/* Vue Gantt */}
                    <div className="rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
                        <div className="flex items-center gap-2 border-b border-slate-100 px-5 py-4 dark:border-slate-800">
                            <Icon name="gantt-chart" className="h-5 w-5 text-orange-500" />
                            <h3 className="font-semibold text-slate-800 dark:text-slate-100">{t('Diagramme de Gantt')}</h3>
                        </div>
                        <GanttChart tasks={tasks} bounds={bounds} />
                    </div>

                    {/* Liste des tâches */}
                    <div className="rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
                        <div className="flex items-center gap-2 border-b border-slate-100 px-5 py-4 dark:border-slate-800">
                            <Icon name="list-checks" className="h-5 w-5 text-orange-500" />
                            <h3 className="font-semibold text-slate-800 dark:text-slate-100">{t('Tâches')} ({tasks.length})</h3>
                        </div>
                        <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
                            <thead className="bg-slate-50 dark:bg-slate-800/50">
                                <tr className="text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                                    <th className="px-4 py-3">{t('Tâche')}</th>
                                    <th className="px-4 py-3">{t('Responsable')}</th>
                                    <th className="px-4 py-3">{t('Début → Fin')}</th>
                                    <th className="px-4 py-3">{t('Avancement')}</th>
                                    <th className="px-4 py-3">{t('Statut')}</th>
                                    <th className="px-4 py-3"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {tasks.map((task) => (
                                    <tr key={task.id} className="text-sm hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                        <td className="px-4 py-3 font-medium text-slate-800 dark:text-slate-100">{task.name}</td>
                                        <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{task.assignee?.name ?? '—'}</td>
                                        <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                                            {fmtDate(task.start_date)} → {fmtDate(task.end_date)}
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2">
                                                <div className="h-2 w-24 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                                                    <div className="h-full rounded-full bg-orange-500" style={{ width: `${task.progress}%` }} />
                                                </div>
                                                <span className="text-xs text-slate-500">{task.progress}%</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3"><StatusBadge status={task.status} /></td>
                                        <td className="px-4 py-3 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                {can.update && (
                                                    <button onClick={() => openEdit(task)} className="text-slate-300 hover:text-orange-600">
                                                        <Icon name="pencil" className="h-4 w-4" />
                                                    </button>
                                                )}
                                                {can.delete && (
                                                    <button onClick={() => setConfirmDelete(task)} className="text-slate-300 hover:text-red-600">
                                                        <Icon name="trash-2" className="h-4 w-4" />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}

                                {tasks.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="px-4 py-12 text-center text-slate-400">
                                            <Icon name="list-plus" className="mx-auto mb-2 h-8 w-8" />
                                            {t('Aucune tâche. Créez la première tâche de ce projet.')}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal création / édition */}
            <Modal show={showModal} onClose={() => setShowModal(false)}>
                <form onSubmit={submit} className="p-6">
                    <h3 className="mb-4 text-lg font-semibold text-slate-800 dark:text-slate-100">
                        {editing ? t('Modifier la tâche') : t('Nouvelle tâche')}
                    </h3>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div className="sm:col-span-2">
                            <InputLabel htmlFor="task_name" value={t('Nom *')} />
                            <TextInput id="task_name" className="mt-1 block w-full" value={form.data.name}
                                onChange={(e) => form.setData('name', e.target.value)} />
                            <InputError message={form.errors.name} className="mt-1" />
                        </div>

                        <div>
                            <InputLabel htmlFor="task_assignee" value={t('Responsable')} />
                            <select id="task_assignee"
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
                                value={form.data.assignee_id ?? ''}
                                onChange={(e) => form.setData('assignee_id', e.target.value || '')}>
                                <option value="">{t('— Aucun —')}</option>
                                {members.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
                            </select>
                            <InputError message={form.errors.assignee_id} className="mt-1" />
                        </div>

                        <div>
                            <InputLabel htmlFor="task_status" value={t('Statut *')} />
                            <select id="task_status"
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
                                value={form.data.status}
                                onChange={(e) => form.setData('status', e.target.value)}>
                                {(statuses.length ? statuses : Object.keys(TASK_STATUS)).map((s) => (
                                    <option key={s} value={s}>{t(TASK_STATUS[s]?.label ?? s)}</option>
                                ))}
                            </select>
                            <InputError message={form.errors.status} className="mt-1" />
                        </div>

                        <div>
                            <InputLabel htmlFor="task_start" value={t('Date de début')} />
                            <TextInput id="task_start" type="date" className="mt-1 block w-full" value={form.data.start_date}
                                onChange={(e) => form.setData('start_date', e.target.value)} />
                            <InputError message={form.errors.start_date} className="mt-1" />
                        </div>

                        <div>
                            <InputLabel htmlFor="task_end" value={t('Date de fin')} />
                            <TextInput id="task_end" type="date" className="mt-1 block w-full" value={form.data.end_date}
                                onChange={(e) => form.setData('end_date', e.target.value)} />
                            <InputError message={form.errors.end_date} className="mt-1" />
                        </div>

                        <div>
                            <InputLabel htmlFor="task_progress" value={t('Avancement (%)')} />
                            <TextInput id="task_progress" type="number" min={0} max={100} className="mt-1 block w-full"
                                value={form.data.progress}
                                onChange={(e) => form.setData('progress', e.target.value)} />
                            <InputError message={form.errors.progress} className="mt-1" />
                        </div>

                        <div>
                            <InputLabel htmlFor="task_position" value={t('Ordre')} />
                            <TextInput id="task_position" type="number" min={0} className="mt-1 block w-full"
                                value={form.data.position}
                                onChange={(e) => form.setData('position', e.target.value)} />
                            <InputError message={form.errors.position} className="mt-1" />
                        </div>

                        <div className="sm:col-span-2">
                            <InputLabel htmlFor="task_description" value={t('Description')} />
                            <textarea id="task_description" rows={3}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
                                value={form.data.description ?? ''}
                                onChange={(e) => form.setData('description', e.target.value)} />
                            <InputError message={form.errors.description} className="mt-1" />
                        </div>
                    </div>
                    <div className="mt-6 flex justify-end gap-3">
                        <SecondaryButton type="button" onClick={() => setShowModal(false)}>{t('Annuler')}</SecondaryButton>
                        <PrimaryButton disabled={form.processing} className="bg-orange-500 hover:bg-orange-600 focus:bg-orange-600">
                            {editing ? t('Enregistrer') : t('Créer la tâche')}
                        </PrimaryButton>
                    </div>
                </form>
            </Modal>

            {/* Confirmation suppression */}
            <Modal show={!!confirmDelete} onClose={() => setConfirmDelete(null)} maxWidth="md">
                <div className="p-6">
                    <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">{t('Supprimer cette tâche ?')}</h3>
                    <p className="mt-2 text-sm text-slate-500">
                        {t('La tâche')} « {confirmDelete?.name} » {t('sera supprimée. Cette action est réversible (corbeille).')}
                    </p>
                    <div className="mt-6 flex justify-end gap-3">
                        <SecondaryButton type="button" onClick={() => setConfirmDelete(null)}>{t('Annuler')}</SecondaryButton>
                        <DangerButton onClick={doDelete}>{t('Supprimer')}</DangerButton>
                    </div>
                </div>
            </Modal>
        </AppLayout>
    );
}
