import { useState } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import Icon from '@/Components/Icon';
import Modal from '@/Components/Modal';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { formatMoney } from '@/constants';
import { useTrans } from '@/i18n';
import { MATERIAL_CATEGORY } from '@/Pages/Materials/Partials/MaterialForm';

const MOVEMENT_TYPE = {
    in:         { label: 'Entrée',     color: 'bg-green-100 text-green-700' },
    out:        { label: 'Sortie',     color: 'bg-red-100 text-red-700' },
    adjustment: { label: 'Ajustement', color: 'bg-amber-100 text-amber-700' },
};

const UNIT_SHORT = { u: 'u', kg: 'kg', m: 'm', m2: 'm²', m3: 'm³', ml: 'ml', sac: 'sac', tonne: 't' };

const today = () => new Date().toISOString().slice(0, 10);

export default function Index({ stocks, warehouses, materials, filters, movements, types, can }) {
    const { t } = useTrans();
    const [showModal, setShowModal] = useState(false);

    const form = useForm({
        type: 'in',
        warehouse_id: warehouses[0]?.id ?? '',
        material_id: materials[0]?.id ?? '',
        quantity: 0,
        unit_price: 0,
        reference: '',
        moved_at: today(),
    });

    const applyWarehouse = (id) => {
        router.get('/stocks', { warehouse_id: id || undefined }, { preserveState: true, replace: true });
    };

    // Pré-remplit le prix avec le prix de référence du matériau sélectionné.
    const onMaterialChange = (id) => {
        form.setData('material_id', id);
        const mat = materials.find((m) => String(m.id) === String(id));
        if (mat) form.setData('unit_price', mat.unit_price);
    };

    const submit = (e) => {
        e.preventDefault();
        form.post('/stocks/movements', {
            preserveScroll: true,
            onSuccess: () => { form.reset(); form.setData('moved_at', today()); setShowModal(false); },
        });
    };

    const fmtDate = (d) => (d ? new Date(d).toLocaleDateString('fr-FR') : '—');

    return (
        <AppLayout header="Stocks">
            <Head title={t('Stocks')} />

            {/* Barre d'actions */}
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-2">
                    <select
                        value={filters.warehouse_id ?? ''}
                        onChange={(e) => applyWarehouse(e.target.value)}
                        className="rounded-md border-slate-300 text-sm focus:border-orange-500 focus:ring-orange-500 dark:border-slate-700 dark:bg-slate-900"
                    >
                        <option value="">{t('Tous les magasins')}</option>
                        {warehouses.map((w) => (
                            <option key={w.id} value={w.id}>{w.name}</option>
                        ))}
                    </select>
                    <Link href="/stocks/movements" className="text-sm text-orange-600 hover:underline">
                        {t('Historique des mouvements')}
                    </Link>
                </div>

                <div className="flex gap-2">
                    <a href="/export/stocks" target="_blank" rel="noopener"
                        className="inline-flex items-center gap-2 rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800">
                        <Icon name="file-spreadsheet" className="h-4 w-4" /> {t('Exporter')}
                    </a>
                    {can.create && (
                        <button
                            onClick={() => setShowModal(true)}
                            className="inline-flex items-center gap-2 rounded-md bg-orange-500 px-4 py-2 text-sm font-medium text-white hover:bg-orange-600"
                        >
                            <Icon name="plus" className="h-4 w-4" />
                            {t('Nouveau mouvement')}
                        </button>
                    )}
                </div>
            </div>

            {/* Niveaux de stock */}
            <div className="rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
                <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
                    <thead className="bg-slate-50 dark:bg-slate-800/50">
                        <tr className="text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                            <th className="px-4 py-3">{t('Matériau')}</th>
                            <th className="px-4 py-3">{t('Catégorie')}</th>
                            <th className="px-4 py-3">{t('Seuil')}</th>
                            <th className="px-4 py-3">{t('Stock courant')}</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {stocks.map((s) => {
                            const unit = UNIT_SHORT[s.unit] ?? s.unit;
                            return (
                                <tr key={s.id} className="text-sm hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                    <td className="px-4 py-3">
                                        <Link href={`/materials/${s.id}`} className="font-medium text-slate-800 hover:text-orange-600 dark:text-slate-100">
                                            {s.name}
                                        </Link>
                                        <div className="text-xs text-slate-400">{s.code}</div>
                                    </td>
                                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                                        {t(MATERIAL_CATEGORY[s.category] ?? s.category)}
                                    </td>
                                    <td className="px-4 py-3 text-slate-500">
                                        {Number(s.min_stock).toLocaleString('fr-FR')} {unit}
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className="inline-flex items-center gap-2">
                                            {s.below_min && (
                                                <span className="h-2 w-2 rounded-full bg-red-500" title={t("Sous le seuil d'alerte")} />
                                            )}
                                            <span className={s.below_min ? 'font-semibold text-red-600' : 'text-slate-700 dark:text-slate-200'}>
                                                {Number(s.stock).toLocaleString('fr-FR')} {unit}
                                            </span>
                                        </span>
                                    </td>
                                </tr>
                            );
                        })}

                        {stocks.length === 0 && (
                            <tr>
                                <td colSpan={4} className="px-4 py-12 text-center text-slate-400">
                                    <Icon name="boxes" className="mx-auto mb-2 h-8 w-8" />
                                    {t("Aucun matériau. Créez d'abord des matériaux.")}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
                </div>
            </div>

            {/* Derniers mouvements */}
            <div className="mt-6 rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
                <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 dark:border-slate-800">
                    <h3 className="flex items-center gap-2 font-semibold text-slate-800 dark:text-slate-100">
                        <Icon name="arrow-left-right" className="h-5 w-5 text-orange-500" />
                        {t('Derniers mouvements')}
                    </h3>
                    <Link href="/stocks/movements" className="text-sm text-orange-600 hover:underline">{t('Tout voir')}</Link>
                </div>
                <ul className="divide-y divide-slate-100 dark:divide-slate-800">
                    {movements.map((mv) => {
                        const mt = MOVEMENT_TYPE[mv.type] ?? { label: mv.type, color: 'bg-slate-100 text-slate-600' };
                        const unit = UNIT_SHORT[mv.material?.unit] ?? mv.material?.unit;
                        return (
                            <li key={mv.id} className="flex items-center justify-between px-5 py-3 text-sm">
                                <div>
                                    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${mt.color}`}>{t(mt.label)}</span>
                                    <span className="ml-2 font-medium text-slate-700 dark:text-slate-200">{mv.material?.name}</span>
                                    <span className="ml-2 text-slate-500">· {mv.warehouse?.name}</span>
                                </div>
                                <div className="flex items-center gap-4">
                                    <span className="text-slate-700 dark:text-slate-200">
                                        {Number(mv.quantity).toLocaleString('fr-FR')} {unit}
                                    </span>
                                    <span className="text-xs text-slate-400">{fmtDate(mv.moved_at)}</span>
                                </div>
                            </li>
                        );
                    })}
                    {movements.length === 0 && (
                        <li className="px-5 py-8 text-center text-sm text-slate-400">{t('Aucun mouvement enregistré.')}</li>
                    )}
                </ul>
            </div>

            {/* Modal nouveau mouvement */}
            <Modal show={showModal} onClose={() => setShowModal(false)}>
                <form onSubmit={submit} className="p-6">
                    <h3 className="mb-4 text-lg font-semibold text-slate-800 dark:text-slate-100">{t('Nouveau mouvement de stock')}</h3>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div>
                            <InputLabel htmlFor="mv_type" value={t('Type *')} />
                            <select
                                id="mv_type"
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
                                value={form.data.type}
                                onChange={(e) => form.setData('type', e.target.value)}
                            >
                                {types.map((ty) => (
                                    <option key={ty} value={ty}>{t(MOVEMENT_TYPE[ty]?.label ?? ty)}</option>
                                ))}
                            </select>
                            <InputError message={form.errors.type} className="mt-1" />
                        </div>
                        <div>
                            <InputLabel htmlFor="mv_warehouse" value={t('Magasin *')} />
                            <select
                                id="mv_warehouse"
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
                                value={form.data.warehouse_id}
                                onChange={(e) => form.setData('warehouse_id', e.target.value)}
                            >
                                {warehouses.map((w) => (
                                    <option key={w.id} value={w.id}>{w.name}</option>
                                ))}
                            </select>
                            <InputError message={form.errors.warehouse_id} className="mt-1" />
                        </div>
                        <div className="sm:col-span-2">
                            <InputLabel htmlFor="mv_material" value={t('Matériau *')} />
                            <select
                                id="mv_material"
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
                                value={form.data.material_id}
                                onChange={(e) => onMaterialChange(e.target.value)}
                            >
                                {materials.map((m) => (
                                    <option key={m.id} value={m.id}>{m.name}</option>
                                ))}
                            </select>
                            <InputError message={form.errors.material_id} className="mt-1" />
                        </div>
                        <div>
                            <InputLabel htmlFor="mv_quantity" value={t('Quantité *')} />
                            <TextInput id="mv_quantity" type="number" min={0} step="0.001" className="mt-1 block w-full"
                                value={form.data.quantity} onChange={(e) => form.setData('quantity', e.target.value)} />
                            <InputError message={form.errors.quantity} className="mt-1" />
                        </div>
                        <div>
                            <InputLabel htmlFor="mv_price" value={t('Prix unitaire *')} />
                            <TextInput id="mv_price" type="number" min={0} step="0.01" className="mt-1 block w-full"
                                value={form.data.unit_price} onChange={(e) => form.setData('unit_price', e.target.value)} />
                            <InputError message={form.errors.unit_price} className="mt-1" />
                        </div>
                        <div>
                            <InputLabel htmlFor="mv_reference" value={t('Référence')} />
                            <TextInput id="mv_reference" className="mt-1 block w-full" placeholder="BL-2026-001"
                                value={form.data.reference} onChange={(e) => form.setData('reference', e.target.value)} />
                            <InputError message={form.errors.reference} className="mt-1" />
                        </div>
                        <div>
                            <InputLabel htmlFor="mv_date" value={t('Date *')} />
                            <TextInput id="mv_date" type="date" className="mt-1 block w-full"
                                value={form.data.moved_at} onChange={(e) => form.setData('moved_at', e.target.value)} />
                            <InputError message={form.errors.moved_at} className="mt-1" />
                        </div>
                    </div>
                    <div className="mt-6 flex justify-end gap-3">
                        <SecondaryButton type="button" onClick={() => setShowModal(false)}>{t('Annuler')}</SecondaryButton>
                        <PrimaryButton disabled={form.processing} className="bg-orange-500 hover:bg-orange-600 focus:bg-orange-600">
                            {t('Enregistrer le mouvement')}
                        </PrimaryButton>
                    </div>
                </form>
            </Modal>
        </AppLayout>
    );
}
