import { useState } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import Icon from '@/Components/Icon';
import Modal from '@/Components/Modal';
import SecondaryButton from '@/Components/SecondaryButton';
import DangerButton from '@/Components/DangerButton';
import { Head, Link, router } from '@inertiajs/react';
import { formatMoney } from '@/constants';
import { useTrans } from '@/i18n';
import { MATERIAL_CATEGORY, MATERIAL_UNIT } from './Partials/MaterialForm';

const MOVEMENT_TYPE = {
    in:         { label: 'Entrée',     color: 'bg-green-100 text-green-700' },
    out:        { label: 'Sortie',     color: 'bg-red-100 text-red-700' },
    adjustment: { label: 'Ajustement', color: 'bg-amber-100 text-amber-700' },
};

const UNIT_SHORT = { u: 'u', kg: 'kg', m: 'm', m2: 'm²', m3: 'm³', ml: 'ml', sac: 'sac', tonne: 't' };

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

export default function Show({ material, can }) {
    const { t } = useTrans();
    const [confirmDelete, setConfirmDelete] = useState(false);

    const unit = UNIT_SHORT[material.unit] ?? material.unit;
    const belowMin = Number(material.current_stock) < Number(material.min_stock);
    const fmtDate = (d) => (d ? new Date(d).toLocaleDateString('fr-FR') : '—');

    const deleteMaterial = () => router.delete(`/materials/${material.id}`);

    return (
        <AppLayout header="Fiche matériau">
            <Head title={material.name} />

            {/* En-tête */}
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                    <div className="flex items-center gap-2">
                        <Link href="/materials" className="text-slate-400 hover:text-orange-600">
                            <Icon name="arrow-left" className="h-5 w-5" />
                        </Link>
                        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">{material.name}</h2>
                        {belowMin && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-700">
                                <span className="h-2 w-2 rounded-full bg-red-500" /> {t('Sous le seuil')}
                            </span>
                        )}
                    </div>
                    <p className="ml-7 text-sm text-slate-400">
                        {material.code} · {t(MATERIAL_CATEGORY[material.category] ?? material.category)}
                    </p>
                </div>
                <div className="flex gap-2">
                    {can.update && (
                        <Link
                            href={`/materials/${material.id}/edit`}
                            className="inline-flex items-center gap-2 rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                        >
                            <Icon name="pencil" className="h-4 w-4" /> {t('Modifier')}
                        </Link>
                    )}
                    {can.delete && (
                        <button
                            onClick={() => setConfirmDelete(true)}
                            className="inline-flex items-center gap-2 rounded-md border border-red-200 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:border-red-900/50"
                        >
                            <Icon name="trash-2" className="h-4 w-4" /> {t('Supprimer')}
                        </button>
                    )}
                </div>
            </div>

            {/* Tuiles d'info */}
            <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
                <InfoTile icon="boxes" label={t('Stock courant')} value={`${Number(material.current_stock).toLocaleString('fr-FR')} ${unit}`} />
                <InfoTile icon="triangle-alert" label={t("Seuil d'alerte")} value={`${Number(material.min_stock).toLocaleString('fr-FR')} ${unit}`} />
                <InfoTile icon="tag" label={t('Prix de référence')} value={formatMoney(material.unit_price)} />
                <InfoTile icon="ruler" label={t('Unité')} value={t(MATERIAL_UNIT[material.unit] ?? material.unit)} />
            </div>

            {material.description && (
                <div className="mb-6 rounded-xl border border-slate-200 bg-white p-5 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
                    {material.description}
                </div>
            )}

            {/* Derniers mouvements */}
            <div className="rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
                <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 dark:border-slate-800">
                    <h3 className="flex items-center gap-2 font-semibold text-slate-800 dark:text-slate-100">
                        <Icon name="arrow-left-right" className="h-5 w-5 text-orange-500" />
                        {t('Derniers mouvements')}
                    </h3>
                    <Link href="/stocks" className="text-sm text-orange-600 hover:underline">{t('Voir les stocks')}</Link>
                </div>

                <ul className="divide-y divide-slate-100 dark:divide-slate-800">
                    {material.movements.map((mv) => {
                        const mt = MOVEMENT_TYPE[mv.type] ?? { label: mv.type, color: 'bg-slate-100 text-slate-600' };
                        return (
                            <li key={mv.id} className="flex items-center justify-between px-5 py-3 text-sm">
                                <div>
                                    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${mt.color}`}>{t(mt.label)}</span>
                                    <span className="ml-2 text-slate-500">{mv.warehouse?.name}</span>
                                    {mv.reference && <span className="ml-2 text-xs text-slate-400">· {mv.reference}</span>}
                                </div>
                                <div className="flex items-center gap-4">
                                    <span className="font-medium text-slate-700 dark:text-slate-200">
                                        {Number(mv.quantity).toLocaleString('fr-FR')} {unit}
                                    </span>
                                    <span className="text-xs text-slate-400">{fmtDate(mv.moved_at)}</span>
                                </div>
                            </li>
                        );
                    })}
                    {material.movements.length === 0 && (
                        <li className="px-5 py-8 text-center text-sm text-slate-400">
                            {t('Aucun mouvement enregistré pour ce matériau.')}
                        </li>
                    )}
                </ul>
            </div>

            {/* Confirmation suppression */}
            <Modal show={confirmDelete} onClose={() => setConfirmDelete(false)} maxWidth="md">
                <div className="p-6">
                    <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">{t('Supprimer ce matériau ?')}</h3>
                    <p className="mt-2 text-sm text-slate-500">
                        {t('Le matériau « :name » sera supprimé. Cette action est réversible (corbeille).').replace(':name', material.name)}
                    </p>
                    <div className="mt-6 flex justify-end gap-3">
                        <SecondaryButton type="button" onClick={() => setConfirmDelete(false)}>{t('Annuler')}</SecondaryButton>
                        <DangerButton onClick={deleteMaterial}>{t('Supprimer définitivement')}</DangerButton>
                    </div>
                </div>
            </Modal>
        </AppLayout>
    );
}
