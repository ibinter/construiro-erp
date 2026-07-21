import { useState } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import Icon from '@/Components/Icon';
import Modal from '@/Components/Modal';
import SecondaryButton from '@/Components/SecondaryButton';
import DangerButton from '@/Components/DangerButton';
import { Head, Link, router } from '@inertiajs/react';
import { formatMoney } from '@/constants';
import { useTrans } from '@/i18n';

// Libellés et couleurs des statuts de DPGF.
const BOQ_STATUS = {
    draft:     { label: 'Brouillon', color: 'bg-slate-100 text-slate-600' },
    validated: { label: 'Validé',    color: 'bg-green-100 text-green-700' },
};

function StatusBadge({ status }) {
    const { t } = useTrans();
    const s = BOQ_STATUS[status] ?? { label: status, color: 'bg-slate-100 text-slate-600' };
    return (
        <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${s.color}`}>
            {t(s.label)}
        </span>
    );
}

/**
 * Groupe les lignes du DPGF par lot si le DPGF a un champ lot renseigné.
 * Ici le lot est un attribut de l'en-tête, donc toutes les lignes appartiennent
 * au même lot. La fonction retourne un tableau de { lot, lines }.
 */
function groupLinesByLot(boq) {
    const lotLabel = boq.lot || null;
    return [{ lot: lotLabel, lines: boq.lines ?? [] }];
}

export default function Show({ boq, can }) {
    const { t } = useTrans();
    const [confirmDelete, setConfirmDelete] = useState(false);

    // TVA locale pour l'affichage (non stockée en base).
    const [tvaTaux, setTvaTaux] = useState(18);

    const totalHT    = Number(boq.total) || 0;
    const montantTVA = totalHT * (Number(tvaTaux) || 0) / 100;
    const totalTTC   = totalHT + montantTVA;

    const deleteBoq = () => router.delete(`/boq/${boq.id}`);

    const groups = groupLinesByLot(boq);

    return (
        <AppLayout header={t('Fiche DPGF')}>
            <Head title={boq.title} />

            {/* ── En-tête ───────────────────────────────────────────────── */}
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                    <div className="flex flex-wrap items-center gap-2">
                        <Link href="/boq" className="text-slate-400 hover:text-orange-600">
                            <Icon name="arrow-left" className="h-5 w-5" />
                        </Link>
                        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
                            {boq.title}
                        </h2>
                        <StatusBadge status={boq.status} />
                    </div>
                    <p className="ml-7 text-sm text-slate-400">
                        {boq.code}
                        {boq.lot     ? ` · ${boq.lot}`          : ''}
                        {boq.project ? ` · ${boq.project.name}` : ''}
                    </p>
                </div>

                {/* Boutons d'action */}
                <div className="flex flex-wrap gap-2">
                    {/* Export PDF */}
                    <a
                        href={`/boq/${boq.id}/pdf`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                    >
                        <Icon name="file-down" className="h-4 w-4" />
                        PDF
                    </a>

                    {/* Dupliquer — redirige vers la création (pré-saisie manuelle) */}
                    {can.update && (
                        <Link
                            href="/boq/create"
                            className="inline-flex items-center gap-2 rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                            title={t('Créer un nouveau DPGF (duplication manuelle)')}
                        >
                            <Icon name="copy" className="h-4 w-4" />
                            {t('Dupliquer')}
                        </Link>
                    )}

                    {/* Modifier */}
                    {can.update && (
                        <Link
                            href={`/boq/${boq.id}/edit`}
                            className="inline-flex items-center gap-2 rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                        >
                            <Icon name="pencil" className="h-4 w-4" />
                            {t('Modifier')}
                        </Link>
                    )}

                    {/* Supprimer */}
                    {can.delete && (
                        <button
                            onClick={() => setConfirmDelete(true)}
                            className="inline-flex items-center gap-2 rounded-md border border-red-200 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:border-red-900/50"
                        >
                            <Icon name="trash-2" className="h-4 w-4" />
                            {t('Supprimer')}
                        </button>
                    )}
                </div>
            </div>

            {/* ── Cartes d'information ──────────────────────────────────── */}
            <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
                {/* Projet */}
                <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
                    <div className="flex items-center gap-2 text-slate-400">
                        <Icon name="folder-kanban" className="h-4 w-4" />
                        <span className="text-xs uppercase tracking-wider">{t('Projet')}</span>
                    </div>
                    <div className="mt-1 font-semibold text-slate-800 dark:text-slate-100 truncate">
                        {boq.project ? boq.project.name : '—'}
                    </div>
                </div>

                {/* Lot */}
                <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
                    <div className="flex items-center gap-2 text-slate-400">
                        <Icon name="layers" className="h-4 w-4" />
                        <span className="text-xs uppercase tracking-wider">{t('Lot')}</span>
                    </div>
                    <div className="mt-1 font-semibold text-slate-800 dark:text-slate-100 truncate">
                        {boq.lot || '—'}
                    </div>
                </div>

                {/* Nombre de postes */}
                <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
                    <div className="flex items-center gap-2 text-slate-400">
                        <Icon name="list-checks" className="h-4 w-4" />
                        <span className="text-xs uppercase tracking-wider">{t('Postes')}</span>
                    </div>
                    <div className="mt-1 font-semibold text-slate-800 dark:text-slate-100">
                        {(boq.lines ?? []).length}
                    </div>
                </div>

                {/* Total HT */}
                <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
                    <div className="flex items-center gap-2 text-slate-400">
                        <Icon name="wallet" className="h-4 w-4" />
                        <span className="text-xs uppercase tracking-wider">{t('Total HT')}</span>
                    </div>
                    <div className="mt-1 font-semibold text-orange-600 tabular-nums">
                        {formatMoney(boq.total, boq.currency)}
                    </div>
                </div>
            </div>

            {/* ── Tableau des postes ────────────────────────────────────── */}
            <div className="rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
                <div className="flex items-center gap-2 border-b border-slate-100 px-5 py-4 dark:border-slate-800">
                    <Icon name="list-checks" className="h-5 w-5 text-orange-500" />
                    <h3 className="font-semibold text-slate-800 dark:text-slate-100">
                        {t('Décomposition des postes')}
                    </h3>
                </div>

                {groups.map((group, gi) => (
                    <div key={gi}>
                        {/* En-tête de groupe (lot) — affiché si renseigné */}
                        {group.lot && (
                            <div className="bg-orange-50 px-5 py-2 text-sm font-semibold text-orange-800 dark:bg-orange-900/20 dark:text-orange-300 border-b border-orange-100 dark:border-orange-900/30">
                                {group.lot}
                            </div>
                        )}

                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-slate-100 dark:divide-slate-800">
                                <thead className="bg-slate-50 dark:bg-slate-800/50">
                                    <tr className="text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                                        <th className="px-5 py-3 w-10 text-center">{t('N°')}</th>
                                        <th className="px-5 py-3">{t('Désignation')}</th>
                                        <th className="px-5 py-3 w-20">{t('Unité')}</th>
                                        <th className="px-5 py-3 text-right w-28">{t('Quantité')}</th>
                                        <th className="px-5 py-3 text-right w-36">{t('P.U. HT')}</th>
                                        <th className="px-5 py-3 text-right w-36">{t('Montant HT')}</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                    {group.lines.map((line, li) => (
                                        <tr key={line.id ?? li} className="text-sm hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                                            <td className="px-5 py-3 text-center font-mono text-xs text-slate-400">
                                                {String(li + 1).padStart(2, '0')}
                                            </td>
                                            <td className="px-5 py-3 text-slate-800 dark:text-slate-100">
                                                {line.designation}
                                            </td>
                                            <td className="px-5 py-3 text-slate-500">
                                                {line.unit ?? '—'}
                                            </td>
                                            <td className="px-5 py-3 text-right text-slate-600 dark:text-slate-300 tabular-nums">
                                                {Number(line.quantity).toLocaleString('fr-FR')}
                                            </td>
                                            <td className="px-5 py-3 text-right text-slate-600 dark:text-slate-300 tabular-nums">
                                                {formatMoney(line.unit_price, boq.currency)}
                                            </td>
                                            <td className="px-5 py-3 text-right font-medium text-slate-800 dark:text-slate-100 tabular-nums">
                                                {formatMoney(line.line_total, boq.currency)}
                                            </td>
                                        </tr>
                                    ))}

                                    {group.lines.length === 0 && (
                                        <tr>
                                            <td colSpan={6} className="px-5 py-10 text-center text-sm text-slate-400">
                                                <Icon name="list-checks" className="mx-auto mb-2 h-7 w-7" />
                                                {t('Aucun poste.')}
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ))}

                {/* ── Bloc Totaux ────────────────────────────────────────── */}
                <div className="flex justify-end border-t border-slate-100 px-5 py-5 dark:border-slate-800">
                    <div className="w-full max-w-xs space-y-2 text-sm">
                        {/* Total HT */}
                        <div className="flex justify-between text-slate-600 dark:text-slate-300">
                            <span>{t('Total HT')}</span>
                            <span className="tabular-nums">{formatMoney(totalHT, boq.currency)}</span>
                        </div>

                        {/* TVA avec taux ajustable en affichage */}
                        <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                            <span className="flex items-center gap-1">
                                {t('TVA')}
                                <span className="inline-flex items-center">
                                    <input
                                        type="number"
                                        min="0"
                                        max="100"
                                        step="0.5"
                                        value={tvaTaux}
                                        onChange={(e) => setTvaTaux(Math.min(100, Math.max(0, Number(e.target.value))))}
                                        className="mx-1 w-14 rounded border border-slate-300 px-1 py-0.5 text-right text-xs focus:border-orange-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800"
                                        title={t('Taux TVA pour simulation')}
                                    />
                                    %
                                </span>
                            </span>
                            <span className="tabular-nums">{formatMoney(montantTVA, boq.currency)}</span>
                        </div>

                        {/* Total TTC */}
                        <div className="flex justify-between border-t border-slate-200 pt-2 text-base font-semibold text-slate-800 dark:border-slate-700 dark:text-slate-100">
                            <span>{t('Total TTC')}</span>
                            <span className="text-orange-600 tabular-nums">{formatMoney(totalTTC, boq.currency)}</span>
                        </div>

                        <p className="text-right text-xs italic text-slate-400">
                            {t('TVA simulée pour affichage uniquement.')}
                        </p>
                    </div>
                </div>
            </div>

            {/* ── Notes ─────────────────────────────────────────────────── */}
            {boq.notes && (
                <div className="mt-6 rounded-xl border border-slate-200 bg-white p-5 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
                    <div className="mb-1 text-xs font-semibold uppercase tracking-wider text-slate-400">
                        {t('Notes / Conditions particulières')}
                    </div>
                    <p className="whitespace-pre-wrap">{boq.notes}</p>
                </div>
            )}

            {/* ── Modal suppression ─────────────────────────────────────── */}
            <Modal show={confirmDelete} onClose={() => setConfirmDelete(false)} maxWidth="md">
                <div className="p-6">
                    <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
                        {t('Supprimer ce DPGF ?')}
                    </h3>
                    <p className="mt-2 text-sm text-slate-500">
                        {t('Le DPGF')} «&nbsp;{boq.title}&nbsp;» {t('sera supprimé. Cette action est réversible (corbeille).')}
                    </p>
                    <div className="mt-6 flex justify-end gap-3">
                        <SecondaryButton type="button" onClick={() => setConfirmDelete(false)}>
                            {t('Annuler')}
                        </SecondaryButton>
                        <DangerButton onClick={deleteBoq}>
                            {t('Supprimer définitivement')}
                        </DangerButton>
                    </div>
                </div>
            </Modal>
        </AppLayout>
    );
}
