import AppLayout from '@/Layouts/AppLayout';
import Icon from '@/Components/Icon';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import { Head, Link, useForm } from '@inertiajs/react';
import { formatMoney } from '@/constants';
import { useTrans } from '@/i18n';

// Page d'édition d'un plein de carburant.

export default function Edit({ fuelLog, equipments }) {
    const { t } = useTrans();

    const form = useForm({
        equipment_id: fuelLog.equipment_id ?? '',
        date:         fuelLog.date ? fuelLog.date.substring(0, 10) : '',
        quantity:     fuelLog.quantity ?? '',
        unit_price:   fuelLog.unit_price ?? '',
        odometer:     fuelLog.odometer ?? '',
        station:      fuelLog.station ?? '',
        notes:        fuelLog.notes ?? '',
    });

    const submit = (e) => {
        e.preventDefault();
        form.put(`/fuel/${fuelLog.id}`);
    };

    // Aperçu du coût total dans le formulaire (quantité × prix unitaire).
    const previewCost = Number(form.data.quantity || 0) * Number(form.data.unit_price || 0);

    return (
        <AppLayout header={t('Modifier le plein')}>
            <Head title={t('Modifier le plein')} />

            <div className="mx-auto max-w-2xl">
                {/* En-tête avec breadcrumb */}
                <div className="mb-6 flex items-center gap-2 text-sm text-slate-500">
                    <Link href="/fuel" className="hover:text-orange-500">
                        {t('Carburant')}
                    </Link>
                    <Icon name="chevron-right" className="h-3 w-3" />
                    <span className="text-slate-700 dark:text-slate-300">{t('Modifier le plein')}</span>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
                    <h2 className="mb-6 text-xl font-semibold text-slate-800 dark:text-slate-100">
                        {t('Modifier le plein')}
                    </h2>

                    <form onSubmit={submit} className="space-y-5">
                        {/* Équipement */}
                        <div>
                            <InputLabel htmlFor="fl_equipment" value={t('Équipement *')} />
                            <select
                                id="fl_equipment"
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
                            {/* Date */}
                            <div>
                                <InputLabel htmlFor="fl_date" value={t('Date *')} />
                                <TextInput
                                    id="fl_date"
                                    type="date"
                                    className="mt-1 block w-full"
                                    value={form.data.date}
                                    onChange={(e) => form.setData('date', e.target.value)}
                                />
                                <InputError message={form.errors.date} className="mt-1" />
                            </div>

                            {/* Station */}
                            <div>
                                <InputLabel htmlFor="fl_station" value={t('Station / Chauffeur')} />
                                <TextInput
                                    id="fl_station"
                                    className="mt-1 block w-full"
                                    placeholder="Total Marcory"
                                    value={form.data.station}
                                    onChange={(e) => form.setData('station', e.target.value)}
                                />
                                <InputError message={form.errors.station} className="mt-1" />
                            </div>

                            {/* Quantité */}
                            <div>
                                <InputLabel htmlFor="fl_quantity" value={t('Quantité (L) *')} />
                                <TextInput
                                    id="fl_quantity"
                                    type="number"
                                    min={0}
                                    step="0.01"
                                    className="mt-1 block w-full"
                                    value={form.data.quantity}
                                    onChange={(e) => form.setData('quantity', e.target.value)}
                                />
                                <InputError message={form.errors.quantity} className="mt-1" />
                            </div>

                            {/* Prix / litre */}
                            <div>
                                <InputLabel htmlFor="fl_unit_price" value={t('Prix au litre *')} />
                                <TextInput
                                    id="fl_unit_price"
                                    type="number"
                                    min={0}
                                    step="0.01"
                                    className="mt-1 block w-full"
                                    value={form.data.unit_price}
                                    onChange={(e) => form.setData('unit_price', e.target.value)}
                                />
                                <InputError message={form.errors.unit_price} className="mt-1" />
                            </div>

                            {/* Kilométrage */}
                            <div>
                                <InputLabel htmlFor="fl_odometer" value={t('Kilométrage (km/h)')} />
                                <TextInput
                                    id="fl_odometer"
                                    type="number"
                                    min={0}
                                    step="0.1"
                                    className="mt-1 block w-full"
                                    value={form.data.odometer}
                                    onChange={(e) => form.setData('odometer', e.target.value)}
                                />
                                <InputError message={form.errors.odometer} className="mt-1" />
                            </div>

                            {/* Aperçu coût total */}
                            <div className="flex items-end">
                                <div className="w-full rounded-md bg-slate-50 px-3 py-2.5 text-sm dark:bg-slate-800">
                                    <span className="text-slate-400">{t('Montant total :')}&nbsp;</span>
                                    <span className="font-semibold text-slate-800 dark:text-slate-100">
                                        {formatMoney(previewCost, 'XOF')}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Notes */}
                        <div>
                            <InputLabel htmlFor="fl_notes" value={t('Notes')} />
                            <textarea
                                id="fl_notes"
                                rows={3}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
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
