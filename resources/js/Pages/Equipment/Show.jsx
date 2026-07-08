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
import { formatMoney } from '@/constants';
import { EQUIPMENT_CATEGORY, EQUIPMENT_STATUS } from './Partials/EquipmentForm';

// Libellés des types d'entretien (FR) — locaux au module.
const MAINTENANCE_TYPE = {
    preventive: 'Préventif',
    curative:   'Curatif',
    revision:   'Révision',
};

function StatusBadge({ status }) {
    const s = EQUIPMENT_STATUS[status] ?? { label: status, color: 'bg-slate-100 text-slate-600' };
    return <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${s.color}`}>{s.label}</span>;
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

export default function Show({ equipment, types = [], can }) {
    const [showMaintenanceModal, setShowMaintenanceModal] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState(false);

    const maintenanceForm = useForm({
        type: 'preventive',
        description: '',
        cost: 0,
        performed_at: '',
        notes: '',
    });

    const submitMaintenance = (e) => {
        e.preventDefault();
        maintenanceForm.post(`/equipment/${equipment.id}/maintenance`, {
            onSuccess: () => { maintenanceForm.reset(); setShowMaintenanceModal(false); },
            preserveScroll: true,
        });
    };

    const deleteEquipment = () => {
        router.delete(`/equipment/${equipment.id}`);
    };

    const fmtDate = (d) => (d ? new Date(d).toLocaleDateString('fr-FR') : '—');

    const records = equipment.maintenance_records ?? [];
    const typeOptions = types.length ? types : Object.keys(MAINTENANCE_TYPE);

    return (
        <AppLayout header="Fiche équipement">
            <Head title={equipment.name} />

            {/* En-tête */}
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                    <div className="flex items-center gap-2">
                        <Link href="/equipment" className="text-slate-400 hover:text-orange-600">
                            <Icon name="arrow-left" className="h-5 w-5" />
                        </Link>
                        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">{equipment.name}</h2>
                        <StatusBadge status={equipment.status} />
                    </div>
                    <p className="ml-7 text-sm text-slate-400">
                        {equipment.code} · {EQUIPMENT_CATEGORY[equipment.category] ?? equipment.category}
                        {equipment.registration ? ` · ${equipment.registration}` : ''}
                    </p>
                </div>
                <div className="flex gap-2">
                    {can.update && (
                        <Link
                            href={`/equipment/${equipment.id}/edit`}
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
                <InfoTile icon="tag" label="Marque / Modèle" value={[equipment.brand, equipment.model].filter(Boolean).join(' ') || '—'} />
                <InfoTile icon="wallet" label="Valeur d'acquisition" value={formatMoney(equipment.acquisition_value, equipment.currency)} />
                <InfoTile icon="calendar" label="Acquis le" value={fmtDate(equipment.acquisition_date)} />
                <InfoTile icon="map-pin" label="Chantier affecté" value={equipment.current_site?.name ?? '—'} />
            </div>

            {equipment.notes && (
                <div className="mb-6 rounded-xl border border-slate-200 bg-white p-5 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
                    {equipment.notes}
                </div>
            )}

            {/* Historique de maintenance */}
            <div className="rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
                <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 dark:border-slate-800">
                    <h3 className="flex items-center gap-2 font-semibold text-slate-800 dark:text-slate-100">
                        <Icon name="wrench" className="h-5 w-5 text-orange-500" />
                        Historique de maintenance ({records.length})
                    </h3>
                    {can.update && (
                        <button
                            onClick={() => setShowMaintenanceModal(true)}
                            className="inline-flex items-center gap-2 rounded-md bg-orange-500 px-3 py-1.5 text-sm font-medium text-white hover:bg-orange-600"
                        >
                            <Icon name="plus" className="h-4 w-4" /> Ajouter un entretien
                        </button>
                    )}
                </div>

                <ul className="divide-y divide-slate-100 dark:divide-slate-800">
                    {records.map((record) => (
                        <li key={record.id} className="flex items-center justify-between px-5 py-3 text-sm">
                            <div>
                                <div className="font-medium text-slate-800 dark:text-slate-100">{record.description}</div>
                                <div className="text-xs text-slate-400">
                                    {MAINTENANCE_TYPE[record.type] ?? record.type} · {fmtDate(record.performed_at)}
                                </div>
                            </div>
                            <div className="text-slate-600 dark:text-slate-300">
                                {formatMoney(record.cost, equipment.currency)}
                            </div>
                        </li>
                    ))}
                    {records.length === 0 && (
                        <li className="px-5 py-8 text-center text-sm text-slate-400">
                            Aucun entretien enregistré pour cet équipement.
                        </li>
                    )}
                </ul>
            </div>

            {/* Modal ajout entretien */}
            <Modal show={showMaintenanceModal} onClose={() => setShowMaintenanceModal(false)}>
                <form onSubmit={submitMaintenance} className="p-6">
                    <h3 className="mb-4 text-lg font-semibold text-slate-800 dark:text-slate-100">Ajouter un entretien</h3>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div>
                            <InputLabel htmlFor="mt_type" value="Type *" />
                            <select id="mt_type"
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
                                value={maintenanceForm.data.type} onChange={(e) => maintenanceForm.setData('type', e.target.value)}>
                                {typeOptions.map((t) => <option key={t} value={t}>{MAINTENANCE_TYPE[t] ?? t}</option>)}
                            </select>
                            <InputError message={maintenanceForm.errors.type} className="mt-1" />
                        </div>
                        <div>
                            <InputLabel htmlFor="mt_performed_at" value="Date *" />
                            <TextInput id="mt_performed_at" type="date" className="mt-1 block w-full"
                                value={maintenanceForm.data.performed_at} onChange={(e) => maintenanceForm.setData('performed_at', e.target.value)} />
                            <InputError message={maintenanceForm.errors.performed_at} className="mt-1" />
                        </div>
                        <div className="sm:col-span-2">
                            <InputLabel htmlFor="mt_description" value="Description *" />
                            <TextInput id="mt_description" className="mt-1 block w-full"
                                value={maintenanceForm.data.description} onChange={(e) => maintenanceForm.setData('description', e.target.value)} />
                            <InputError message={maintenanceForm.errors.description} className="mt-1" />
                        </div>
                        <div>
                            <InputLabel htmlFor="mt_cost" value="Coût *" />
                            <TextInput id="mt_cost" type="number" min={0} step="0.01" className="mt-1 block w-full"
                                value={maintenanceForm.data.cost} onChange={(e) => maintenanceForm.setData('cost', e.target.value)} />
                            <InputError message={maintenanceForm.errors.cost} className="mt-1" />
                        </div>
                        <div className="sm:col-span-2">
                            <InputLabel htmlFor="mt_notes" value="Notes" />
                            <textarea id="mt_notes" rows={2}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
                                value={maintenanceForm.data.notes} onChange={(e) => maintenanceForm.setData('notes', e.target.value)} />
                        </div>
                    </div>
                    <div className="mt-6 flex justify-end gap-3">
                        <SecondaryButton type="button" onClick={() => setShowMaintenanceModal(false)}>Annuler</SecondaryButton>
                        <PrimaryButton disabled={maintenanceForm.processing} className="bg-orange-500 hover:bg-orange-600 focus:bg-orange-600">
                            Enregistrer l'entretien
                        </PrimaryButton>
                    </div>
                </form>
            </Modal>

            {/* Confirmation suppression équipement */}
            <Modal show={confirmDelete} onClose={() => setConfirmDelete(false)} maxWidth="md">
                <div className="p-6">
                    <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Supprimer cet équipement ?</h3>
                    <p className="mt-2 text-sm text-slate-500">
                        L'équipement « {equipment.name} » sera supprimé. Cette action est réversible (corbeille).
                    </p>
                    <div className="mt-6 flex justify-end gap-3">
                        <SecondaryButton type="button" onClick={() => setConfirmDelete(false)}>Annuler</SecondaryButton>
                        <DangerButton onClick={deleteEquipment}>Supprimer définitivement</DangerButton>
                    </div>
                </div>
            </Modal>
        </AppLayout>
    );
}
