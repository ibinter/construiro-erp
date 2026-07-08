import { useState } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import Icon from '@/Components/Icon';
import Modal from '@/Components/Modal';
import SecondaryButton from '@/Components/SecondaryButton';
import DangerButton from '@/Components/DangerButton';
import { Head, Link, router } from '@inertiajs/react';
import { CATEGORY, CATEGORY_ICON } from './Partials/DocumentForm';

function InfoTile({ icon, label, value }) {
    return (
        <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center gap-2 text-slate-400">
                <Icon name={icon} className="h-4 w-4" />
                <span className="text-xs uppercase tracking-wider">{label}</span>
            </div>
            <div className="mt-1 truncate font-semibold text-slate-800 dark:text-slate-100">{value}</div>
        </div>
    );
}

export default function Show({ document, can }) {
    const [confirmDelete, setConfirmDelete] = useState(false);

    const deleteDocument = () => {
        router.delete(`/documents/${document.id}`);
    };

    return (
        <AppLayout header="Fiche document">
            <Head title={document.title} />

            {/* En-tête */}
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                    <div className="flex items-center gap-2">
                        <Link href="/documents" className="text-slate-400 hover:text-orange-600">
                            <Icon name="arrow-left" className="h-5 w-5" />
                        </Link>
                        <Icon name={CATEGORY_ICON[document.category] ?? 'file'} className="h-6 w-6 text-orange-500" />
                        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">{document.title}</h2>
                        <span className="inline-flex rounded-full bg-orange-100 px-2.5 py-0.5 text-xs font-medium text-orange-700">
                            {CATEGORY[document.category] ?? document.category}
                        </span>
                    </div>
                    <p className="ml-7 text-sm text-slate-400">{document.code} · v{document.version}</p>
                </div>
                <div className="flex gap-2">
                    {can.update && (
                        <Link
                            href={`/documents/${document.id}/edit`}
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
                <InfoTile icon="file" label="Fichier" value={document.file_name || '—'} />
                <InfoTile icon="hard-drive" label="Taille" value={document.size_kb != null ? `${document.size_kb} Ko` : '—'} />
                <InfoTile icon="folder-kanban" label="Projet" value={document.project?.name || '—'} />
                <InfoTile icon="user" label="Déposé par" value={document.uploaded_by || '—'} />
            </div>

            {/* Détails */}
            <div className="mb-6 rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
                <h3 className="mb-3 flex items-center gap-2 font-semibold text-slate-800 dark:text-slate-100">
                    <Icon name="info" className="h-5 w-5 text-orange-500" /> Métadonnées du fichier
                </h3>
                <dl className="space-y-2 text-sm">
                    <div className="flex justify-between gap-4">
                        <dt className="text-slate-400">Chemin / URL</dt>
                        <dd className="break-all text-right text-slate-700 dark:text-slate-200">{document.file_path || '—'}</dd>
                    </div>
                    <div className="flex justify-between">
                        <dt className="text-slate-400">Type MIME</dt>
                        <dd className="text-slate-700 dark:text-slate-200">{document.mime_type || '—'}</dd>
                    </div>
                    <div className="flex justify-between">
                        <dt className="text-slate-400">Version</dt>
                        <dd className="text-slate-700 dark:text-slate-200">{document.version}</dd>
                    </div>
                </dl>
            </div>

            {document.description && (
                <div className="mb-6 rounded-xl border border-slate-200 bg-white p-5 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
                    {document.description}
                </div>
            )}

            {/* Confirmation suppression */}
            <Modal show={confirmDelete} onClose={() => setConfirmDelete(false)} maxWidth="md">
                <div className="p-6">
                    <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Supprimer ce document ?</h3>
                    <p className="mt-2 text-sm text-slate-500">
                        Le document « {document.title} » sera supprimé. Cette action est réversible (corbeille).
                    </p>
                    <div className="mt-6 flex justify-end gap-3">
                        <SecondaryButton type="button" onClick={() => setConfirmDelete(false)}>Annuler</SecondaryButton>
                        <DangerButton onClick={deleteDocument}>Supprimer définitivement</DangerButton>
                    </div>
                </div>
            </Modal>
        </AppLayout>
    );
}
