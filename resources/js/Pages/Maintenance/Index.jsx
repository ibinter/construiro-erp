import { useState } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import Icon from '@/Components/Icon';
import Modal from '@/Components/Modal';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import { Head, router, useForm } from '@inertiajs/react';
import { formatMoney } from '@/constants';
import { useTrans } from '@/i18n';

// Interface transversale de maintenance : tous les entretiens du parc.

const MAINTENANCE_TYPE = {
    preventive: 'Préventif',
    curative:   'Curatif',
    revision:   'Révision',
};

const TYPE_COLOR = {
    preventive: 'bg-green-100 text-green-700',
    curative:   'bg-amber-100 text-amber-700',
    revision:   'bg-blue-100 text-blue-700',
};

const fmtDate = (d) => (d ? new Date(d).toLocaleDateString('fr-FR') : '—');

function TypeBadge({ type }) {
    const { t } = useTrans();
    return (
        <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${TYPE_COLOR[type] ?? 'bg-slate-100 text-slate-600'}`}>
            {t(MAINTENANCE_TYPE[type] ?? type)}
        </span>
    );
}

export default function Index({ records, filters, types, equipments, totalCost, can }) {
    const { t } = useTrans();
    const [showModal, setShowModal] = useState(false);

    const form = useForm({
        equipment_id: '',
        type: 'preventive',
        description: '',
        cost: '',
        performed_at: '',
        notes: '',
    });

    const applyFilter = (type) => {
        router.get('/maintenance', { type: type || undefined }, { preserveState: true, replace: true });
    };

    const submit = (e) => {
        e.preventDefault();
        form.post('/maintenance', {
            onSuccess: () => { form.reset(); setShowModal(false); },
            preserveScroll: true,
        });
    };

    const typeOptions = types.length ? types : Object.keys(MAINTENANCE_TYPE);

    return (
        <AppLayout header="Maintenance">
            <Head title={t('Maintenance')} />

            {/* Carte de synthèse */}
            <div className="mb-6 rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
                <div className="flex items-center gap-2 text-slate-400">
                    <Icon name="wallet" className="h-4 w-4" />
                    <span className="text-xs uppercase tracking-wider">{t('Coût total des entretiens')}</span>
                </div>
                <div className="mt-1 text-2xl font-bold text-slate-800 dark:text-slate-100">{formatMoney(totalCost, 'XOF')}</div>
            </div>

            {/* Barre d'actions */}
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <select
                    value={filters.type ?? ''}
                    onChange={(e) => applyFilter(e.target.value)}
                    className="rounded-md border-slate-300 text-sm focus:border-orange-500 focus:ring-orange-500 dark:border-slate-700 dark:bg-slate-900"
                >
                    <option value="">{t('Tous les types')}</option>
                    {typeOptions.map((ty) => (
                        <option key={ty} value={ty}>{t(MAINTENANCE_TYPE[ty] ?? ty)}</option>
                    ))}
                </select>

                {can.create && (
                    <button
                        onClick={() => setShowModal(true)}
                        className="inline-flex items-center gap-2 rounded-md bg-orange-500 px-4 py-2 text-sm font-medium text-white hover:bg-orange-600"
                    >
                        <Icon name="plus" className="h-4 w-4" />
                        {t('Nouvel entretien')}
                    </button>
                )}
            </div>

            {/* Tableau */}
            <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
                <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
                    <thead className="bg-slate-50 dark:bg-slate-800/50">
                        <tr className="text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                            <th className="px-4 py-3">{t('Date')}</th>
                            <th className="px-4 py-3">{t('Équipement')}</th>
                            <th className="px-4 py-3">{t('Type')}</th>
                            <th className="px-4 py-3">{t('Description')}</th>
                            <th className="px-4 py-3">{t('Coût')}</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {records.data.map((record) => (
                            <tr key={record.id} className="text-sm hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{fmtDate(record.performed_at)}</td>
                                <td className="px-4 py-3">
                                    <div className="font-medium text-slate-800 dark:text-slate-100">
                                        {record.equipment?.name ?? '—'}
                                    </div>
                                    <div className="text-xs text-slate-400">{record.equipment?.code}</div>
                                </td>
                                <td className="px-4 py-3"><TypeBadge type={record.type} /></td>
                                <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{record.description}</td>
                                <td className="px-4 py-3 font-medium text-slate-800 dark:text-slate-100">
                                    {formatMoney(record.cost, record.equipment?.currency ?? 'XOF')}
                                </td>
                            </tr>
                        ))}

                        {records.data.length === 0 && (
                            <tr>
                                <td colSpan={5} className="px-4 py-12 text-center text-slate-400">
                                    <Icon name="wrench" className="mx-auto mb-2 h-8 w-8" />
                                    {t('Aucun entretien enregistré.')}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {records.last_page > 1 && (
                <div className="mt-4 flex flex-wrap gap-1">
                    {records.links.map((link, i) => (
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

            {/* Modal nouvel entretien */}
            <Modal show={showModal} onClose={() => setShowModal(false)}>
                <form onSubmit={submit} className="p-6">
                    <h3 className="mb-4 text-lg font-semibold text-slate-800 dark:text-slate-100">{t('Nouvel entretien')}</h3>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div className="sm:col-span-2">
                            <InputLabel htmlFor="mt_equipment" value={t('Équipement *')} />
                            <select id="mt_equipment"
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
                                value={form.data.equipment_id} onChange={(e) => form.setData('equipment_id', e.target.value)}>
                                <option value="">{t('— Sélectionner —')}</option>
                                {equipments.map((eq) => (
                                    <option key={eq.id} value={eq.id}>{eq.name} ({eq.code})</option>
                                ))}
                            </select>
                            <InputError message={form.errors.equipment_id} className="mt-1" />
                        </div>
                        <div>
                            <InputLabel htmlFor="mt_type" value={t('Type *')} />
                            <select id="mt_type"
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
                                value={form.data.type} onChange={(e) => form.setData('type', e.target.value)}>
                                {typeOptions.map((ty) => <option key={ty} value={ty}>{t(MAINTENANCE_TYPE[ty] ?? ty)}</option>)}
                            </select>
                            <InputError message={form.errors.type} className="mt-1" />
                        </div>
                        <div>
                            <InputLabel htmlFor="mt_performed_at" value={t('Date *')} />
                            <TextInput id="mt_performed_at" type="date" className="mt-1 block w-full"
                                value={form.data.performed_at} onChange={(e) => form.setData('performed_at', e.target.value)} />
                            <InputError message={form.errors.performed_at} className="mt-1" />
                        </div>
                        <div className="sm:col-span-2">
                            <InputLabel htmlFor="mt_description" value={t('Description *')} />
                            <TextInput id="mt_description" className="mt-1 block w-full"
                                value={form.data.description} onChange={(e) => form.setData('description', e.target.value)} />
                            <InputError message={form.errors.description} className="mt-1" />
                        </div>
                        <div>
                            <InputLabel htmlFor="mt_cost" value={t('Coût *')} />
                            <TextInput id="mt_cost" type="number" min={0} step="0.01" className="mt-1 block w-full"
                                value={form.data.cost} onChange={(e) => form.setData('cost', e.target.value)} />
                            <InputError message={form.errors.cost} className="mt-1" />
                        </div>
                        <div className="sm:col-span-2">
                            <InputLabel htmlFor="mt_notes" value={t('Notes')} />
                            <textarea id="mt_notes" rows={2}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
                                value={form.data.notes} onChange={(e) => form.setData('notes', e.target.value)} />
                        </div>
                    </div>
                    <div className="mt-6 flex justify-end gap-3">
                        <SecondaryButton type="button" onClick={() => setShowModal(false)}>{t('Annuler')}</SecondaryButton>
                        <PrimaryButton disabled={form.processing} className="bg-orange-500 hover:bg-orange-600 focus:bg-orange-600">
                            {t("Enregistrer l'entretien")}
                        </PrimaryButton>
                    </div>
                </form>
            </Modal>
        </AppLayout>
    );
}
