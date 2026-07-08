import { useState } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import Icon from '@/Components/Icon';
import Modal from '@/Components/Modal';
import SecondaryButton from '@/Components/SecondaryButton';
import DangerButton from '@/Components/DangerButton';
import { Head, Link, router } from '@inertiajs/react';
import { SAMPLE_TYPE, RESULT } from './Partials/LabTestForm';

const RESULT_COLOR = {
    conforme:     'bg-green-100 text-green-700',
    non_conforme: 'bg-red-100 text-red-700',
    en_attente:   'bg-amber-100 text-amber-700',
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

export default function Show({ test, can }) {
    const [confirmDelete, setConfirmDelete] = useState(false);

    const deleteTest = () => {
        router.delete(`/laboratory/${test.id}`);
    };

    const fmtDate = (d) => (d ? new Date(d).toLocaleDateString('fr-FR') : '—');
    const resultColor = RESULT_COLOR[test.result] ?? 'bg-slate-100 text-slate-600';

    return (
        <AppLayout header="Fiche essai">
            <Head title={test.test_name} />

            {/* En-tête */}
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                    <div className="flex items-center gap-2">
                        <Link href="/laboratory" className="text-slate-400 hover:text-orange-600">
                            <Icon name="arrow-left" className="h-5 w-5" />
                        </Link>
                        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">{test.test_name}</h2>
                        <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${resultColor}`}>
                            {RESULT[test.result] ?? test.result}
                        </span>
                    </div>
                    <p className="ml-7 text-sm text-slate-400">
                        {test.code} · {SAMPLE_TYPE[test.sample_type] ?? test.sample_type}
                    </p>
                </div>
                <div className="flex gap-2">
                    {can.update && (
                        <Link
                            href={`/laboratory/${test.id}/edit`}
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
                <InfoTile
                    icon="gauge"
                    label="Valeur mesurée"
                    value={test.result_value != null ? `${test.result_value}${test.unit ? ` ${test.unit}` : ''}` : '—'}
                />
                <InfoTile
                    icon="target"
                    label="Seuil requis"
                    value={test.threshold != null ? `${test.threshold}${test.unit ? ` ${test.unit}` : ''}` : '—'}
                />
                <InfoTile icon="calendar" label="Prélèvement → Essai" value={`${fmtDate(test.sample_date)} → ${fmtDate(test.test_date)}`} />
                <InfoTile icon="user" label="Technicien" value={test.technician || '—'} />
            </div>

            {/* Détails & rattachement */}
            <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
                <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
                    <h3 className="mb-3 flex items-center gap-2 font-semibold text-slate-800 dark:text-slate-100">
                        <Icon name="flask-conical" className="h-5 w-5 text-orange-500" /> Essai
                    </h3>
                    <dl className="space-y-2 text-sm">
                        <div className="flex justify-between">
                            <dt className="text-slate-400">Type d'échantillon</dt>
                            <dd className="text-slate-700 dark:text-slate-200">{SAMPLE_TYPE[test.sample_type] ?? test.sample_type}</dd>
                        </div>
                        <div className="flex justify-between">
                            <dt className="text-slate-400">Unité</dt>
                            <dd className="text-slate-700 dark:text-slate-200">{test.unit || '—'}</dd>
                        </div>
                        <div className="flex justify-between">
                            <dt className="text-slate-400">Résultat</dt>
                            <dd className="text-slate-700 dark:text-slate-200">{RESULT[test.result] ?? test.result}</dd>
                        </div>
                    </dl>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
                    <h3 className="mb-3 flex items-center gap-2 font-semibold text-slate-800 dark:text-slate-100">
                        <Icon name="folder-kanban" className="h-5 w-5 text-orange-500" /> Rattachement
                    </h3>
                    <dl className="space-y-2 text-sm">
                        <div className="flex justify-between">
                            <dt className="text-slate-400">Projet</dt>
                            <dd className="text-slate-700 dark:text-slate-200">{test.project?.name ?? '—'}</dd>
                        </div>
                        <div className="flex justify-between">
                            <dt className="text-slate-400">Chantier</dt>
                            <dd className="text-slate-700 dark:text-slate-200">{test.site?.name ?? '—'}</dd>
                        </div>
                    </dl>
                </div>
            </div>

            {test.observations && (
                <div className="mb-6 rounded-xl border border-slate-200 bg-white p-5 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
                    {test.observations}
                </div>
            )}

            {/* Confirmation suppression */}
            <Modal show={confirmDelete} onClose={() => setConfirmDelete(false)} maxWidth="md">
                <div className="p-6">
                    <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Supprimer cet essai ?</h3>
                    <p className="mt-2 text-sm text-slate-500">
                        L'essai « {test.test_name} » sera supprimé. Cette action est réversible (corbeille).
                    </p>
                    <div className="mt-6 flex justify-end gap-3">
                        <SecondaryButton type="button" onClick={() => setConfirmDelete(false)}>Annuler</SecondaryButton>
                        <DangerButton onClick={deleteTest}>Supprimer définitivement</DangerButton>
                    </div>
                </div>
            </Modal>
        </AppLayout>
    );
}
