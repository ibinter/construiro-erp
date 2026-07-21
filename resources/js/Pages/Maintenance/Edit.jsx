import AppLayout from '@/Layouts/AppLayout';
import Icon from '@/Components/Icon';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import { Head, Link, useForm } from '@inertiajs/react';
import { useTrans } from '@/i18n';

// Page d'édition d'un enregistrement de maintenance.

const MAINTENANCE_TYPE = {
    preventive: 'Préventif',
    curative:   'Curatif',
    revision:   'Révision',
};

export default function Edit({ record, equipments, types }) {
    const { t } = useTrans();

    const form = useForm({
        equipment_id: record.equipment_id ?? '',
        type:         record.type ?? 'preventive',
        description:  record.description ?? '',
        cost:         record.cost ?? '',
        performed_at: record.performed_at ? record.performed_at.substring(0, 10) : '',
        notes:        record.notes ?? '',
    });

    const submit = (e) => {
        e.preventDefault();
        form.put(`/maintenance/${record.id}`);
    };

    const typeOptions = (types && types.length) ? types : Object.keys(MAINTENANCE_TYPE);

    return (
        <AppLayout header={t('Modifier l\'entretien')}>
            <Head title={t('Modifier l\'entretien')} />

            <div className="mx-auto max-w-2xl">
                {/* Breadcrumb */}
                <div className="mb-6 flex items-center gap-2 text-sm text-slate-500">
                    <Link href="/maintenance" className="hover:text-orange-500">
                        {t('Maintenance')}
                    </Link>
                    <Icon name="chevron-right" className="h-3 w-3" />
                    <Link href={`/maintenance/${record.id}`} className="hover:text-orange-500">
                        {record.description}
                    </Link>
                    <Icon name="chevron-right" className="h-3 w-3" />
                    <span className="text-slate-700 dark:text-slate-300">{t('Modifier')}</span>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
                    <h2 className="mb-6 text-xl font-semibold text-slate-800 dark:text-slate-100">
                        {t('Modifier l\'entretien')}
                    </h2>

                    <form onSubmit={submit} className="space-y-5">
                        {/* Équipement */}
                        <div>
                            <InputLabel htmlFor="mt_equipment" value={t('Équipement *')} />
                            <select
                                id="mt_equipment"
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
                                value={form.data.equipment_id}
                                onChange={(e) => form.setData('equipment_id', e.target.value)}
                            >
                                <option value="">{t('— Sélectionner —')}</option>
                                {equipments.map((eq) => (
                                    <option key={eq.id} value={eq.id}>
                                        {eq.name} ({eq.code})
                                    </option>
                                ))}
                            </select>
                            <InputError message={form.errors.equipment_id} className="mt-1" />
                        </div>

                        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                            {/* Type */}
                            <div>
                                <InputLabel htmlFor="mt_type" value={t('Type *')} />
                                <select
                                    id="mt_type"
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
                                    value={form.data.type}
                                    onChange={(e) => form.setData('type', e.target.value)}
                                >
                                    {typeOptions.map((ty) => (
                                        <option key={ty} value={ty}>
                                            {t(MAINTENANCE_TYPE[ty] ?? ty)}
                                        </option>
                                    ))}
                                </select>
                                <InputError message={form.errors.type} className="mt-1" />
                            </div>

                            {/* Date de réalisation */}
                            <div>
                                <InputLabel htmlFor="mt_performed_at" value={t('Date d\'entretien *')} />
                                <TextInput
                                    id="mt_performed_at"
                                    type="date"
                                    className="mt-1 block w-full"
                                    value={form.data.performed_at}
                                    onChange={(e) => form.setData('performed_at', e.target.value)}
                                />
                                <InputError message={form.errors.performed_at} className="mt-1" />
                            </div>
                        </div>

                        {/* Description */}
                        <div>
                            <InputLabel htmlFor="mt_description" value={t('Description *')} />
                            <TextInput
                                id="mt_description"
                                className="mt-1 block w-full"
                                value={form.data.description}
                                onChange={(e) => form.setData('description', e.target.value)}
                            />
                            <InputError message={form.errors.description} className="mt-1" />
                        </div>

                        {/* Coût */}
                        <div>
                            <InputLabel htmlFor="mt_cost" value={t('Coût (XOF) *')} />
                            <TextInput
                                id="mt_cost"
                                type="number"
                                min={0}
                                step="0.01"
                                className="mt-1 block w-full"
                                value={form.data.cost}
                                onChange={(e) => form.setData('cost', e.target.value)}
                            />
                            <InputError message={form.errors.cost} className="mt-1" />
                        </div>

                        {/* Notes */}
                        <div>
                            <InputLabel htmlFor="mt_notes" value={t('Notes / Prestataire')} />
                            <textarea
                                id="mt_notes"
                                rows={3}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
                                placeholder={t('Prestataire, observations, pièces remplacées…')}
                                value={form.data.notes}
                                onChange={(e) => form.setData('notes', e.target.value)}
                            />
                            <InputError message={form.errors.notes} className="mt-1" />
                        </div>

                        {/* Actions */}
                        <div className="flex justify-end gap-3 pt-2">
                            <SecondaryButton type="button" onClick={() => window.history.back()}>
                                {t('Annuler')}
                            </SecondaryButton>
                            <PrimaryButton
                                disabled={form.processing}
                                className="bg-orange-500 hover:bg-orange-600 focus:bg-orange-600"
                            >
                                {t('Enregistrer')}
                            </PrimaryButton>
                        </div>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}
