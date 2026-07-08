import { useState } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import Icon from '@/Components/Icon';
import Modal from '@/Components/Modal';
import SecondaryButton from '@/Components/SecondaryButton';
import DangerButton from '@/Components/DangerButton';
import { Head, Link, router } from '@inertiajs/react';

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

export default function Show({ warehouse, can }) {
    const [confirmDelete, setConfirmDelete] = useState(false);

    const deleteWarehouse = () => router.delete(`/warehouses/${warehouse.id}`);

    return (
        <AppLayout header="Fiche magasin">
            <Head title={warehouse.name} />

            {/* En-tête */}
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                    <div className="flex items-center gap-2">
                        <Link href="/warehouses" className="text-slate-400 hover:text-orange-600">
                            <Icon name="arrow-left" className="h-5 w-5" />
                        </Link>
                        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">{warehouse.name}</h2>
                        {warehouse.is_active ? (
                            <span className="inline-flex rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700">Actif</span>
                        ) : (
                            <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">Inactif</span>
                        )}
                    </div>
                    <p className="ml-7 text-sm text-slate-400">{warehouse.code}</p>
                </div>
                <div className="flex gap-2">
                    {can.update && (
                        <Link
                            href={`/warehouses/${warehouse.id}/edit`}
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
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
                <InfoTile icon="map-pin" label="Ville" value={warehouse.city ?? '—'} />
                <InfoTile icon="user" label="Responsable" value={warehouse.manager_name ?? '—'} />
                <InfoTile icon="map" label="Adresse" value={warehouse.address ?? '—'} />
            </div>

            {/* Confirmation suppression */}
            <Modal show={confirmDelete} onClose={() => setConfirmDelete(false)} maxWidth="md">
                <div className="p-6">
                    <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Supprimer ce magasin ?</h3>
                    <p className="mt-2 text-sm text-slate-500">
                        Le magasin « {warehouse.name} » sera supprimé. Cette action est réversible (corbeille).
                    </p>
                    <div className="mt-6 flex justify-end gap-3">
                        <SecondaryButton type="button" onClick={() => setConfirmDelete(false)}>Annuler</SecondaryButton>
                        <DangerButton onClick={deleteWarehouse}>Supprimer définitivement</DangerButton>
                    </div>
                </div>
            </Modal>
        </AppLayout>
    );
}
