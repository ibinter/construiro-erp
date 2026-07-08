import { useState } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import Icon from '@/Components/Icon';
import Modal from '@/Components/Modal';
import SecondaryButton from '@/Components/SecondaryButton';
import DangerButton from '@/Components/DangerButton';
import { Head, Link, router } from '@inertiajs/react';

// Libellés et styles des statuts / types (FR).
const STUDY_STATUS = {
    en_cours: { label: 'En cours', color: 'bg-blue-100 text-blue-700' },
    valide:   { label: 'Validée',  color: 'bg-green-100 text-green-700' },
    rejete:   { label: 'Rejetée',  color: 'bg-red-100 text-red-700' },
};

const STUDY_TYPE = {
    plan:        'Plan',
    note_calcul: 'Note de calcul',
    etude_sol:   'Étude de sol',
    autre:       'Autre',
};

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

export default function Show({ study, can }) {
    const [confirmDelete, setConfirmDelete] = useState(false);

    const deleteStudy = () => {
        router.delete(`/design-office/${study.id}`);
    };

    const s = STUDY_STATUS[study.status] ?? { label: study.status, color: 'bg-slate-100 text-slate-600' };

    return (
        <AppLayout header="Fiche étude">
            <Head title={study.title} />

            {/* En-tête */}
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                    <div className="flex items-center gap-2">
                        <Link href="/design-office" className="text-slate-400 hover:text-orange-600">
                            <Icon name="arrow-left" className="h-5 w-5" />
                        </Link>
                        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">{study.title}</h2>
                        <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${s.color}`}>{s.label}</span>
                    </div>
                    <p className="ml-7 text-sm text-slate-400">
                        {study.code}{study.project ? ` · ${study.project.name}` : ''}
                    </p>
                </div>
                <div className="flex gap-2">
                    {can.update && (
                        <Link
                            href={`/design-office/${study.id}/edit`}
                            className="inline-flex items-center gap-2 rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                        >
                            <Icon name="pencil" className="h-4 w-4" /> Modifier
                        </Link>
                    )}
                    {can.delete && (
                        <button
                            onClick={() => setConfirmDelete(true)}
                            className="inline-flex items-center gap-2 rounded-md border border-red-200 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:border-red-900/50"
                        >
                            <Icon name="trash-2" className="h-4 w-4" /> Supprimer
                        </button>
                    )}
                </div>
            </div>

            {/* Tuiles d'info */}
            <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
                <InfoTile icon="ruler" label="Type" value={STUDY_TYPE[study.type] ?? study.type} />
                <InfoTile icon="user" label="Auteur" value={study.author || '—'} />
                <InfoTile icon="folder-kanban" label="Projet" value={study.project ? study.project.name : '—'} />
                <InfoTile icon="check-circle" label="Statut" value={s.label} />
            </div>

            {study.notes && (
                <div className="mb-6 rounded-xl border border-slate-200 bg-white p-5 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
                    <div className="mb-1 text-xs font-semibold uppercase tracking-wider text-slate-400">Notes</div>
                    {study.notes}
                </div>
            )}

            {/* Confirmation suppression */}
            <Modal show={confirmDelete} onClose={() => setConfirmDelete(false)} maxWidth="md">
                <div className="p-6">
                    <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Supprimer cette étude ?</h3>
                    <p className="mt-2 text-sm text-slate-500">
                        L'étude « {study.title} » sera supprimée. Cette action est réversible (corbeille).
                    </p>
                    <div className="mt-6 flex justify-end gap-3">
                        <SecondaryButton type="button" onClick={() => setConfirmDelete(false)}>Annuler</SecondaryButton>
                        <DangerButton onClick={deleteStudy}>Supprimer définitivement</DangerButton>
                    </div>
                </div>
            </Modal>
        </AppLayout>
    );
}
