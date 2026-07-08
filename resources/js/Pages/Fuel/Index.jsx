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

// Journal des pleins de carburant du parc roulant.

const fmtDate = (d) => (d ? new Date(d).toLocaleDateString('fr-FR') : '—');
const fmtLitres = (v) => `${Number(v || 0).toLocaleString('fr-FR', { maximumFractionDigits: 2 })} L`;

function StatCard({ icon, label, value }) {
    return (
        <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center gap-2 text-slate-400">
                <Icon name={icon} className="h-4 w-4" />
                <span className="text-xs uppercase tracking-wider">{label}</span>
            </div>
            <div className="mt-1 text-2xl font-bold text-slate-800 dark:text-slate-100">{value}</div>
        </div>
    );
}

export default function Index({ logs, filters, equipments, totals, can }) {
    const [showModal, setShowModal] = useState(false);

    const form = useForm({
        equipment_id: '',
        date: '',
        quantity: '',
        unit_price: '',
        odometer: '',
        station: '',
        notes: '',
    });

    const applyFilter = (equipmentId) => {
        router.get('/fuel', { equipment_id: equipmentId || undefined }, { preserveState: true, replace: true });
    };

    const submit = (e) => {
        e.preventDefault();
        form.post('/fuel', {
            onSuccess: () => { form.reset(); setShowModal(false); },
            preserveScroll: true,
        });
    };

    // Aperçu du coût total dans le formulaire (quantité × prix unitaire).
    const previewCost = Number(form.data.quantity || 0) * Number(form.data.unit_price || 0);

    return (
        <AppLayout header="Carburant">
            <Head title="Carburant" />

            {/* Cartes de synthèse */}
            <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <StatCard icon="fuel" label="Total consommé" value={fmtLitres(totals.quantity)} />
                <StatCard icon="wallet" label="Coût total" value={formatMoney(totals.cost, 'XOF')} />
            </div>

            {/* Barre d'actions */}
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <select
                    value={filters.equipment_id ?? ''}
                    onChange={(e) => applyFilter(e.target.value)}
                    className="rounded-md border-slate-300 text-sm focus:border-orange-500 focus:ring-orange-500 dark:border-slate-700 dark:bg-slate-900"
                >
                    <option value="">Tous les équipements</option>
                    {equipments.map((eq) => (
                        <option key={eq.id} value={eq.id}>{eq.name} ({eq.code})</option>
                    ))}
                </select>

                {can.create && (
                    <button
                        onClick={() => setShowModal(true)}
                        className="inline-flex items-center gap-2 rounded-md bg-orange-500 px-4 py-2 text-sm font-medium text-white hover:bg-orange-600"
                    >
                        <Icon name="plus" className="h-4 w-4" />
                        Nouveau plein
                    </button>
                )}
            </div>

            {/* Tableau */}
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
                <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
                    <thead className="bg-slate-50 dark:bg-slate-800/50">
                        <tr className="text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                            <th className="px-4 py-3">Date</th>
                            <th className="px-4 py-3">Équipement</th>
                            <th className="px-4 py-3">Quantité</th>
                            <th className="px-4 py-3">Prix / L</th>
                            <th className="px-4 py-3">Coût total</th>
                            <th className="px-4 py-3">Compteur</th>
                            <th className="px-4 py-3">Station</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {logs.data.map((log) => (
                            <tr key={log.id} className="text-sm hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{fmtDate(log.date)}</td>
                                <td className="px-4 py-3">
                                    <div className="font-medium text-slate-800 dark:text-slate-100">
                                        {log.equipment?.name ?? '—'}
                                    </div>
                                    <div className="text-xs text-slate-400">{log.equipment?.code}</div>
                                </td>
                                <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{fmtLitres(log.quantity)}</td>
                                <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{formatMoney(log.unit_price, 'XOF')}</td>
                                <td className="px-4 py-3 font-medium text-slate-800 dark:text-slate-100">{formatMoney(log.total_cost, 'XOF')}</td>
                                <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                                    {log.odometer != null ? Number(log.odometer).toLocaleString('fr-FR') : '—'}
                                </td>
                                <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{log.station ?? '—'}</td>
                            </tr>
                        ))}

                        {logs.data.length === 0 && (
                            <tr>
                                <td colSpan={7} className="px-4 py-12 text-center text-slate-400">
                                    <Icon name="fuel" className="mx-auto mb-2 h-8 w-8" />
                                    Aucun plein enregistré.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {logs.last_page > 1 && (
                <div className="mt-4 flex flex-wrap gap-1">
                    {logs.links.map((link, i) => (
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

            {/* Modal nouveau plein */}
            <Modal show={showModal} onClose={() => setShowModal(false)}>
                <form onSubmit={submit} className="p-6">
                    <h3 className="mb-4 text-lg font-semibold text-slate-800 dark:text-slate-100">Nouveau plein</h3>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div className="sm:col-span-2">
                            <InputLabel htmlFor="fl_equipment" value="Équipement *" />
                            <select id="fl_equipment"
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
                                value={form.data.equipment_id} onChange={(e) => form.setData('equipment_id', e.target.value)}>
                                <option value="">— Sélectionner —</option>
                                {equipments.map((eq) => (
                                    <option key={eq.id} value={eq.id}>{eq.name} ({eq.code})</option>
                                ))}
                            </select>
                            <InputError message={form.errors.equipment_id} className="mt-1" />
                        </div>
                        <div>
                            <InputLabel htmlFor="fl_date" value="Date *" />
                            <TextInput id="fl_date" type="date" className="mt-1 block w-full"
                                value={form.data.date} onChange={(e) => form.setData('date', e.target.value)} />
                            <InputError message={form.errors.date} className="mt-1" />
                        </div>
                        <div>
                            <InputLabel htmlFor="fl_station" value="Station" />
                            <TextInput id="fl_station" className="mt-1 block w-full" placeholder="Total Marcory"
                                value={form.data.station} onChange={(e) => form.setData('station', e.target.value)} />
                            <InputError message={form.errors.station} className="mt-1" />
                        </div>
                        <div>
                            <InputLabel htmlFor="fl_quantity" value="Quantité (L) *" />
                            <TextInput id="fl_quantity" type="number" min={0} step="0.01" className="mt-1 block w-full"
                                value={form.data.quantity} onChange={(e) => form.setData('quantity', e.target.value)} />
                            <InputError message={form.errors.quantity} className="mt-1" />
                        </div>
                        <div>
                            <InputLabel htmlFor="fl_unit_price" value="Prix au litre *" />
                            <TextInput id="fl_unit_price" type="number" min={0} step="0.01" className="mt-1 block w-full"
                                value={form.data.unit_price} onChange={(e) => form.setData('unit_price', e.target.value)} />
                            <InputError message={form.errors.unit_price} className="mt-1" />
                        </div>
                        <div>
                            <InputLabel htmlFor="fl_odometer" value="Compteur (km/h)" />
                            <TextInput id="fl_odometer" type="number" min={0} step="0.1" className="mt-1 block w-full"
                                value={form.data.odometer} onChange={(e) => form.setData('odometer', e.target.value)} />
                            <InputError message={form.errors.odometer} className="mt-1" />
                        </div>
                        <div className="flex items-end">
                            <div className="w-full rounded-md bg-slate-50 px-3 py-2 text-sm dark:bg-slate-800">
                                <span className="text-slate-400">Coût total : </span>
                                <span className="font-semibold text-slate-800 dark:text-slate-100">{formatMoney(previewCost, 'XOF')}</span>
                            </div>
                        </div>
                        <div className="sm:col-span-2">
                            <InputLabel htmlFor="fl_notes" value="Notes" />
                            <textarea id="fl_notes" rows={2}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
                                value={form.data.notes} onChange={(e) => form.setData('notes', e.target.value)} />
                        </div>
                    </div>
                    <div className="mt-6 flex justify-end gap-3">
                        <SecondaryButton type="button" onClick={() => setShowModal(false)}>Annuler</SecondaryButton>
                        <PrimaryButton disabled={form.processing} className="bg-orange-500 hover:bg-orange-600 focus:bg-orange-600">
                            Enregistrer le plein
                        </PrimaryButton>
                    </div>
                </form>
            </Modal>
        </AppLayout>
    );
}
