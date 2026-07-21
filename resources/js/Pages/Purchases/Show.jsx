import { useState } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import Icon from '@/Components/Icon';
import Modal from '@/Components/Modal';
import SecondaryButton from '@/Components/SecondaryButton';
import DangerButton from '@/Components/DangerButton';
import { Head, Link, router } from '@inertiajs/react';
import { formatMoney } from '@/constants';
import { useTrans } from '@/i18n';

// Libellés et styles des statuts de bon de commande (FR).
const PURCHASE_STATUS = {
    draft:     { label: 'Brouillon', color: 'bg-slate-100 text-slate-600',    icon: 'file'         },
    sent:      { label: 'Envoyé',    color: 'bg-blue-100 text-blue-700',      icon: 'send'          },
    confirmed: { label: 'Confirmé',  color: 'bg-indigo-100 text-indigo-700',  icon: 'check-circle'  },
    received:  { label: 'Reçu',      color: 'bg-green-100 text-green-700',    icon: 'package-check' },
    cancelled: { label: 'Annulé',    color: 'bg-red-100 text-red-700',        icon: 'x-circle'      },
};

// Étapes du workflow affichées dans la barre de progression.
const WORKFLOW_STEPS = [
    { key: 'draft',     label: 'Brouillon'  },
    { key: 'sent',      label: 'Envoyé'     },
    { key: 'confirmed', label: 'Confirmé'   },
    { key: 'received',  label: 'Reçu'       },
];

function StatusBadge({ status }) {
    const { t } = useTrans();
    const s = PURCHASE_STATUS[status] ?? { label: status, color: 'bg-slate-100 text-slate-600' };
    return (
        <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${s.color}`}>
            {t(s.label)}
        </span>
    );
}

export default function Show({ order, totals, can }) {
    const { t } = useTrans();
    const [confirmDelete,   setConfirmDelete]   = useState(false);
    const [confirmConfirm,  setConfirmConfirm]  = useState(false);
    const [confirmReceived, setConfirmReceived] = useState(false);

    // Utilise totals si disponible, sinon fallback sur les champs de order.
    const ht      = totals ? totals.subtotal   : Number(order.subtotal   ?? 0);
    const tva     = totals ? totals.tax_amount : Number(order.tax_amount ?? 0);
    const ttc     = totals ? totals.total      : Number(order.total      ?? 0);
    const taxRate = totals ? totals.tax_rate   : Number(order.tax_rate   ?? 0);

    const isDraft     = order.status === 'draft';
    const isSent      = order.status === 'sent';
    const isConfirmed = order.status === 'confirmed';
    const isReceived  = order.status === 'received';
    const isCancelled = order.status === 'cancelled';

    const canConfirm  = can.update && (isDraft || isSent);
    const canReceive  = can.update && isConfirmed;

    const doConfirm = () => {
        router.post(`/purchases/${order.id}/confirm`, {}, {
            onSuccess: () => setConfirmConfirm(false),
        });
    };

    const doMarkReceived = () => {
        router.post(`/purchases/${order.id}/mark-received`, {}, {
            onSuccess: () => setConfirmReceived(false),
        });
    };

    const deleteOrder = () => {
        router.delete(`/purchases/${order.id}`);
    };

    const fmtDate = (d) => (d ? new Date(d).toLocaleDateString('fr-FR') : '—');

    // Index de l'étape active dans le workflow (hors cancelled).
    const activeStepIdx = WORKFLOW_STEPS.findIndex((s) => s.key === order.status);

    return (
        <AppLayout header="Fiche bon de commande">
            <Head title={order.code} />

            {/* ─── En-tête ────────────────────────────────────────────────────── */}
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                    <div className="flex flex-wrap items-center gap-2">
                        <Link href="/purchases" className="text-slate-400 hover:text-orange-600">
                            <Icon name="arrow-left" className="h-5 w-5" />
                        </Link>
                        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
                            {order.code}
                        </h2>
                        <StatusBadge status={order.status} />
                    </div>
                    <p className="ml-7 text-sm text-slate-400">
                        {order.supplier?.name ?? '—'}
                        {order.project ? ` · ${order.project.name}` : ''}
                    </p>
                </div>

                {/* ─── Boutons d'action ─────────────────────────────────────── */}
                <div className="flex flex-wrap gap-2">

                    {/* PDF */}
                    <a
                        href={`/purchases/${order.id}/pdf`}
                        target="_blank"
                        rel="noopener"
                        className="inline-flex items-center gap-1.5 rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                    >
                        <Icon name="file-down" className="h-4 w-4" /> PDF
                    </a>

                    {/* Valider la commande */}
                    {canConfirm && (
                        <button
                            onClick={() => setConfirmConfirm(true)}
                            className="inline-flex items-center gap-1.5 rounded-md bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-700"
                        >
                            <Icon name="check-circle" className="h-4 w-4" />
                            {t('Valider la commande')}
                        </button>
                    )}

                    {/* Marquer reçu */}
                    {canReceive && (
                        <button
                            onClick={() => setConfirmReceived(true)}
                            className="inline-flex items-center gap-1.5 rounded-md bg-green-600 px-3 py-2 text-sm font-medium text-white hover:bg-green-700"
                        >
                            <Icon name="package-check" className="h-4 w-4" />
                            {t('Marquer reçu')}
                        </button>
                    )}

                    {/* Modifier */}
                    {can.update && !isReceived && !isCancelled && (
                        <Link
                            href={`/purchases/${order.id}/edit`}
                            className="inline-flex items-center gap-1.5 rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                        >
                            <Icon name="pencil" className="h-4 w-4" /> {t('Modifier')}
                        </Link>
                    )}

                    {/* Supprimer */}
                    {can.delete && (
                        <button
                            onClick={() => setConfirmDelete(true)}
                            className="inline-flex items-center gap-1.5 rounded-md border border-red-200 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:border-red-900/50"
                        >
                            <Icon name="trash-2" className="h-4 w-4" /> {t('Supprimer')}
                        </button>
                    )}
                </div>
            </div>

            {/* ─── Barre de progression du workflow ───────────────────────────── */}
            {!isCancelled && (
                <div className="mb-6 rounded-xl border border-slate-200 bg-white px-6 py-4 dark:border-slate-800 dark:bg-slate-900">
                    <div className="flex items-center justify-between">
                        {WORKFLOW_STEPS.map((step, idx) => {
                            const done    = activeStepIdx >= idx;
                            const current = activeStepIdx === idx;
                            return (
                                <div key={step.key} className="flex flex-1 items-center">
                                    <div className="flex flex-col items-center gap-1">
                                        <div
                                            className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-colors
                                                ${done
                                                    ? current
                                                        ? 'bg-orange-500 text-white ring-4 ring-orange-200 dark:ring-orange-900/40'
                                                        : 'bg-green-500 text-white'
                                                    : 'bg-slate-200 text-slate-400 dark:bg-slate-700'
                                                }`}
                                        >
                                            {done && !current
                                                ? <Icon name="check" className="h-4 w-4" />
                                                : idx + 1}
                                        </div>
                                        <span className={`text-xs ${current ? 'font-semibold text-orange-600' : done ? 'text-green-600' : 'text-slate-400'}`}>
                                            {t(step.label)}
                                        </span>
                                    </div>
                                    {idx < WORKFLOW_STEPS.length - 1 && (
                                        <div className={`h-0.5 flex-1 mx-2 ${activeStepIdx > idx ? 'bg-green-400' : 'bg-slate-200 dark:bg-slate-700'}`} />
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* ─── Cartes métadonnées ─────────────────────────────────────────── */}
            <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
                <MetaCard icon="calendar" label={t('Date commande')}>
                    {fmtDate(order.order_date)}
                </MetaCard>
                <MetaCard icon="truck" label={t('Livraison prévue')}>
                    {fmtDate(order.expected_date)}
                </MetaCard>
                <MetaCard icon="percent" label={t('TVA')}>
                    {taxRate} %
                </MetaCard>
                <MetaCard icon="wallet" label={t('Total TTC')}>
                    <span className="text-orange-600">{formatMoney(ttc, order.currency)}</span>
                </MetaCard>
            </div>

            {/* ─── Tableau des lignes ─────────────────────────────────────────── */}
            <div className="rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
                <div className="flex items-center gap-2 border-b border-slate-100 px-5 py-4 dark:border-slate-800">
                    <Icon name="shopping-cart" className="h-5 w-5 text-orange-500" />
                    <h3 className="font-semibold text-slate-800 dark:text-slate-100">
                        {t('Détail de la commande')}
                    </h3>
                    <span className="ml-auto text-xs text-slate-400">
                        {order.lines.length} {t('article(s)')}
                    </span>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
                        <thead className="bg-slate-50 dark:bg-slate-800/50">
                            <tr className="text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                                <th className="px-5 py-3">{t('Désignation')}</th>
                                <th className="px-5 py-3">{t('Unité')}</th>
                                <th className="px-5 py-3 text-right">{t('Quantité')}</th>
                                <th className="px-5 py-3 text-right">{t('P.U.')}</th>
                                <th className="px-5 py-3 text-right">{t('Total HT')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {order.lines.map((line) => (
                                <tr key={line.id} className="text-sm hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                                    <td className="px-5 py-3 font-medium text-slate-800 dark:text-slate-100">
                                        {line.designation}
                                    </td>
                                    <td className="px-5 py-3 text-slate-500">{line.unit ?? '—'}</td>
                                    <td className="px-5 py-3 text-right text-slate-600 dark:text-slate-300">
                                        {Number(line.quantity)}
                                    </td>
                                    <td className="px-5 py-3 text-right text-slate-600 dark:text-slate-300">
                                        {formatMoney(line.unit_price, order.currency)}
                                    </td>
                                    <td className="px-5 py-3 text-right font-semibold text-slate-800 dark:text-slate-100">
                                        {formatMoney(line.line_total, order.currency)}
                                    </td>
                                </tr>
                            ))}
                            {order.lines.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-5 py-10 text-center text-sm text-slate-400">
                                        {t('Aucune ligne de commande.')}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* ─── Récapitulatif des totaux ─────────────────────────────── */}
                <div className="flex justify-end border-t border-slate-100 px-5 py-5 dark:border-slate-800">
                    <div className="w-full max-w-sm space-y-2 text-sm">
                        <div className="flex justify-between text-slate-600 dark:text-slate-300">
                            <span>{t('Sous-total HT')}</span>
                            <span>{formatMoney(ht, order.currency)}</span>
                        </div>
                        <div className="flex justify-between text-slate-600 dark:text-slate-300">
                            <span>{t('TVA')} ({taxRate} %)</span>
                            <span>{formatMoney(tva, order.currency)}</span>
                        </div>
                        <div className="flex justify-between border-t border-slate-200 pt-2 text-base font-semibold text-orange-600 dark:border-slate-700">
                            <span>{t('Total TTC')}</span>
                            <span>{formatMoney(ttc, order.currency)}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* ─── Section livraisons reçues ──────────────────────────────────── */}
            <div className="mt-6 rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
                <div className="flex items-center gap-2 border-b border-slate-100 px-5 py-4 dark:border-slate-800">
                    <Icon name="package" className="h-5 w-5 text-orange-500" />
                    <h3 className="font-semibold text-slate-800 dark:text-slate-100">
                        {t('Livraisons')}
                    </h3>
                </div>

                {isReceived ? (
                    /* Commande reçue — confirmation visuelle */
                    <div className="flex items-start gap-4 p-5">
                        <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                            <Icon name="package-check" className="h-5 w-5 text-green-600" />
                        </span>
                        <div>
                            <p className="font-semibold text-green-700 dark:text-green-400">
                                {t('Livraison complète enregistrée')}
                            </p>
                            <p className="mt-0.5 text-sm text-slate-500">
                                {t('Toutes les marchandises ont été réceptionnées.')}
                                {order.updated_at
                                    ? ` ${t('Date de réception :')} ${new Date(order.updated_at).toLocaleDateString('fr-FR')}`
                                    : ''}
                            </p>
                            <div className="mt-3 grid grid-cols-2 gap-3 text-sm sm:grid-cols-3">
                                {order.lines.map((line) => (
                                    <div
                                        key={line.id}
                                        className="rounded-lg border border-green-100 bg-green-50 px-3 py-2 dark:border-green-900/30 dark:bg-green-900/10"
                                    >
                                        <div className="font-medium text-slate-800 dark:text-slate-100 truncate">
                                            {line.designation}
                                        </div>
                                        <div className="text-xs text-slate-500">
                                            {Number(line.quantity)} {line.unit ?? ''}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                ) : isConfirmed ? (
                    /* Commande confirmée — en attente de livraison */
                    <div className="flex items-center gap-4 p-5">
                        <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30">
                            <Icon name="truck" className="h-5 w-5 text-amber-600" />
                        </span>
                        <div>
                            <p className="font-semibold text-amber-700 dark:text-amber-400">
                                {t('En attente de livraison')}
                            </p>
                            <p className="mt-0.5 text-sm text-slate-500">
                                {order.expected_date
                                    ? `${t('Livraison prévue le')} ${fmtDate(order.expected_date)}.`
                                    : t('Date de livraison non définie.')}
                            </p>
                            {canReceive && (
                                <button
                                    onClick={() => setConfirmReceived(true)}
                                    className="mt-3 inline-flex items-center gap-1.5 rounded-md bg-green-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-green-700"
                                >
                                    <Icon name="package-check" className="h-3.5 w-3.5" />
                                    {t('Enregistrer la réception')}
                                </button>
                            )}
                        </div>
                    </div>
                ) : isCancelled ? (
                    /* Annulé */
                    <div className="flex items-center gap-3 p-5 text-slate-400">
                        <Icon name="x-circle" className="h-5 w-5" />
                        <span className="text-sm">{t('Bon de commande annulé — pas de livraison.')}</span>
                    </div>
                ) : (
                    /* Brouillon ou envoyé — pas encore confirmé */
                    <div className="flex items-center gap-3 p-5 text-slate-400">
                        <Icon name="clock" className="h-5 w-5" />
                        <span className="text-sm">
                            {t('La livraison sera suivie une fois la commande confirmée.')}
                        </span>
                    </div>
                )}
            </div>

            {/* ─── Notes ──────────────────────────────────────────────────────── */}
            {order.notes && (
                <div className="mt-6 rounded-xl border border-slate-200 bg-white p-5 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
                    <div className="mb-2 flex items-center gap-2">
                        <Icon name="message-square" className="h-4 w-4 text-slate-400" />
                        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                            {t('Notes')}
                        </span>
                    </div>
                    <p className="whitespace-pre-line">{order.notes}</p>
                </div>
            )}

            {/* ─── Modal : valider la commande ────────────────────────────────── */}
            <Modal show={confirmConfirm} onClose={() => setConfirmConfirm(false)} maxWidth="md">
                <div className="p-6">
                    <div className="flex items-center gap-3">
                        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900/30">
                            <Icon name="check-circle" className="h-5 w-5 text-indigo-600" />
                        </span>
                        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
                            {t('Valider ce bon de commande ?')}
                        </h3>
                    </div>
                    <p className="mt-3 text-sm text-slate-500">
                        {t('Le bon de commande «')} <span className="font-semibold">{order.code}</span> {t('» passera au statut « Confirmé ». Cette action signifie l\'engagement d\'achat auprès du fournisseur.')}
                    </p>
                    <div className="mt-6 flex justify-end gap-3">
                        <SecondaryButton type="button" onClick={() => setConfirmConfirm(false)}>
                            {t('Annuler')}
                        </SecondaryButton>
                        <button
                            onClick={doConfirm}
                            className="inline-flex items-center gap-2 rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
                        >
                            <Icon name="check" className="h-4 w-4" />
                            {t('Valider la commande')}
                        </button>
                    </div>
                </div>
            </Modal>

            {/* ─── Modal : marquer reçu ───────────────────────────────────────── */}
            <Modal show={confirmReceived} onClose={() => setConfirmReceived(false)} maxWidth="md">
                <div className="p-6">
                    <div className="flex items-center gap-3">
                        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                            <Icon name="package-check" className="h-5 w-5 text-green-600" />
                        </span>
                        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
                            {t('Enregistrer la réception ?')}
                        </h3>
                    </div>
                    <p className="mt-3 text-sm text-slate-500">
                        {t('Confirmer que toutes les marchandises du bon de commande «')}
                        {' '}<span className="font-semibold">{order.code}</span>{' '}
                        {t('ont bien été réceptionnées. Le statut passera à « Reçu ».')}
                    </p>
                    <div className="mt-6 flex justify-end gap-3">
                        <SecondaryButton type="button" onClick={() => setConfirmReceived(false)}>
                            {t('Annuler')}
                        </SecondaryButton>
                        <button
                            onClick={doMarkReceived}
                            className="inline-flex items-center gap-2 rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
                        >
                            <Icon name="package-check" className="h-4 w-4" />
                            {t('Confirmer la réception')}
                        </button>
                    </div>
                </div>
            </Modal>

            {/* ─── Modal : confirmation suppression ───────────────────────────── */}
            <Modal show={confirmDelete} onClose={() => setConfirmDelete(false)} maxWidth="md">
                <div className="p-6">
                    <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
                        {t('Supprimer ce bon de commande ?')}
                    </h3>
                    <p className="mt-2 text-sm text-slate-500">
                        {t('Le bon de commande «')} {order.code} {t('» sera supprimé. Cette action est réversible (corbeille).')}
                    </p>
                    <div className="mt-6 flex justify-end gap-3">
                        <SecondaryButton type="button" onClick={() => setConfirmDelete(false)}>
                            {t('Annuler')}
                        </SecondaryButton>
                        <DangerButton onClick={deleteOrder}>
                            {t('Supprimer définitivement')}
                        </DangerButton>
                    </div>
                </div>
            </Modal>
        </AppLayout>
    );
}

/* ─── Composants locaux ────────────────────────────────────────────────────── */

function MetaCard({ icon, label, children }) {
    return (
        <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center gap-2 text-slate-400">
                <Icon name={icon} className="h-4 w-4" />
                <span className="text-xs uppercase tracking-wider">{label}</span>
            </div>
            <div className="mt-1 font-semibold text-slate-800 dark:text-slate-100">{children}</div>
        </div>
    );
}
