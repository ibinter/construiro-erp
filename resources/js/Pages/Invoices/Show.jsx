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
import { useTrans } from '@/i18n';
import MobileMoneyButton from '@/Components/MobileMoneyButton';

// Libellés et styles des statuts de facture (FR).
const INVOICE_STATUS = {
    draft:     { label: 'Brouillon', color: 'bg-slate-100 text-slate-600' },
    sent:      { label: 'Envoyée',   color: 'bg-blue-100 text-blue-700' },
    partial:   { label: 'Partiel',   color: 'bg-amber-100 text-amber-700' },
    paid:      { label: 'Payée',     color: 'bg-green-100 text-green-700' },
    overdue:   { label: 'En retard', color: 'bg-red-100 text-red-700' },
    cancelled: { label: 'Annulée',   color: 'bg-slate-200 text-slate-500' },
};

function StatusBadge({ status }) {
    const { t } = useTrans();
    const s = INVOICE_STATUS[status] ?? { label: status, color: 'bg-slate-100 text-slate-600' };
    return (
        <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${s.color}`}>
            {t(s.label)}
        </span>
    );
}

export default function Show({ invoice, totals, can }) {
    const { t } = useTrans();
    const [confirmDelete, setConfirmDelete]   = useState(false);
    const [showPayment, setShowPayment]       = useState(false);
    const [confirmMarkPaid, setConfirmMarkPaid] = useState(false);
    const [confirmEmail, setConfirmEmail]     = useState(false);

    // Utilise totals si disponible, sinon fallback sur les champs de invoice.
    const ht       = totals ? totals.subtotal    : Number(invoice.subtotal    ?? 0);
    const tva      = totals ? totals.tax_amount  : Number(invoice.tax_amount  ?? 0);
    const ttc      = totals ? totals.total       : Number(invoice.total       ?? 0);
    const paid     = totals ? totals.amount_paid : Number(invoice.amount_paid ?? 0);
    const balance  = totals ? totals.balance     : Number(invoice.balance     ?? 0);
    const taxRate  = totals ? totals.tax_rate    : Number(invoice.tax_rate    ?? 0);

    const payment = useForm({ amount: '' });

    const submitPayment = (e) => {
        e.preventDefault();
        payment.post(`/invoices/${invoice.id}/payment`, {
            onSuccess: () => {
                setShowPayment(false);
                payment.reset();
            },
        });
    };

    const doMarkPaid = () => {
        router.post(`/invoices/${invoice.id}/mark-paid`, {}, {
            onSuccess: () => setConfirmMarkPaid(false),
        });
    };

    const doSendEmail = () => {
        router.post(`/invoices/${invoice.id}/send-email`, {}, {
            onSuccess: () => setConfirmEmail(false),
        });
    };

    const deleteInvoice = () => {
        router.delete(`/invoices/${invoice.id}`);
    };

    const fmtDate = (d) => (d ? new Date(d).toLocaleDateString('fr-FR') : '—');

    const isPaid      = invoice.status === 'paid';
    const isCancelled = invoice.status === 'cancelled';

    return (
        <AppLayout header="Fiche facture">
            <Head title={invoice.code} />

            {/* ─── En-tête ────────────────────────────────────────────────────── */}
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                    <div className="flex flex-wrap items-center gap-2">
                        <Link href="/invoices" className="text-slate-400 hover:text-orange-600">
                            <Icon name="arrow-left" className="h-5 w-5" />
                        </Link>
                        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
                            {invoice.code}
                        </h2>
                        <StatusBadge status={invoice.status} />
                    </div>
                    <p className="ml-7 text-sm text-slate-400">
                        {invoice.client?.name ? invoice.client.name : t('Sans client')}
                        {invoice.project ? ` · ${invoice.project.name}` : ''}
                        {invoice.client?.email ? (
                            <span className="ml-2 text-slate-300">{invoice.client.email}</span>
                        ) : null}
                    </p>
                </div>

                {/* ─── Boutons d'action ─────────────────────────────────────── */}
                <div className="flex flex-wrap gap-2">

                    {/* PDF */}
                    <a
                        href={`/invoices/${invoice.id}/pdf`}
                        target="_blank"
                        rel="noopener"
                        className="inline-flex items-center gap-1.5 rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                    >
                        <Icon name="file-down" className="h-4 w-4" /> PDF
                    </a>

                    {/* Envoyer par email */}
                    {can.update && !isCancelled && (
                        <button
                            onClick={() => setConfirmEmail(true)}
                            className="inline-flex items-center gap-1.5 rounded-md border border-blue-200 px-3 py-2 text-sm font-medium text-blue-700 hover:bg-blue-50 dark:border-blue-800 dark:text-blue-300 dark:hover:bg-blue-900/30"
                        >
                            <Icon name="send" className="h-4 w-4" /> {t('Envoyer par email')}
                        </button>
                    )}

                    {/* Vérification QR */}
                    {invoice.verify_token && (
                        <a
                            href={`/verify/${invoice.verify_token}`}
                            target="_blank"
                            rel="noopener"
                            className="inline-flex items-center gap-1.5 rounded-md border border-green-300 px-3 py-2 text-sm font-medium text-green-700 hover:bg-green-50 dark:border-green-700 dark:text-green-300"
                        >
                            <Icon name="shield-check" className="h-4 w-4" /> {t('Vérifier')}
                        </a>
                    )}

                    {/* Excel */}
                    <a
                        href="/export/invoices"
                        target="_blank"
                        rel="noopener"
                        className="inline-flex items-center gap-1.5 rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                    >
                        <Icon name="table-2" className="h-4 w-4" /> Excel
                    </a>

                    {/* Enregistrer un paiement partiel */}
                    {can.update && balance > 0 && (
                        <button
                            onClick={() => setShowPayment(true)}
                            className="inline-flex items-center gap-1.5 rounded-md bg-orange-500 px-3 py-2 text-sm font-medium text-white hover:bg-orange-600"
                        >
                            <Icon name="banknote" className="h-4 w-4" /> {t('Enregistrer un paiement')}
                        </button>
                    )}

                    {/* Marquer payée (solde intégral) */}
                    {can.update && !isPaid && !isCancelled && (
                        <button
                            onClick={() => setConfirmMarkPaid(true)}
                            className="inline-flex items-center gap-1.5 rounded-md bg-green-600 px-3 py-2 text-sm font-medium text-white hover:bg-green-700"
                        >
                            <Icon name="check-circle" className="h-4 w-4" /> {t('Marquer payée')}
                        </button>
                    )}

                    {/* Mobile Money */}
                    <MobileMoneyButton invoice={invoice} can={can} />

                    {/* Créer avoir (lien vers création) */}
                    {can.update && !isCancelled && (
                        <Link
                            href={`/invoices/create?avoir_of=${invoice.id}`}
                            className="inline-flex items-center gap-1.5 rounded-md border border-amber-300 px-3 py-2 text-sm font-medium text-amber-700 hover:bg-amber-50 dark:border-amber-700 dark:text-amber-300 dark:hover:bg-amber-900/20"
                        >
                            <Icon name="file-minus" className="h-4 w-4" /> {t('Créer avoir')}
                        </Link>
                    )}

                    {/* Modifier */}
                    {can.update && (
                        <Link
                            href={`/invoices/${invoice.id}/edit`}
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

            {/* ─── Cartes métadonnées ─────────────────────────────────────────── */}
            <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
                <MetaCard icon="calendar" label={t('Émission')}>
                    {fmtDate(invoice.issue_date)}
                </MetaCard>
                <MetaCard icon="calendar-clock" label={t('Échéance')}>
                    <span className={invoice.status === 'overdue' ? 'text-red-600' : ''}>
                        {fmtDate(invoice.due_date)}
                    </span>
                </MetaCard>
                <MetaCard icon="percent" label={t('TVA')}>
                    {taxRate} %
                </MetaCard>
                <MetaCard icon="wallet" label={t('Total TTC')}>
                    <span className="text-orange-600 font-semibold">
                        {formatMoney(ttc, invoice.currency)}
                    </span>
                </MetaCard>
            </div>

            {/* ─── Tableau des lignes ─────────────────────────────────────────── */}
            <div className="rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
                <div className="flex items-center gap-2 border-b border-slate-100 px-5 py-4 dark:border-slate-800">
                    <Icon name="receipt" className="h-5 w-5 text-orange-500" />
                    <h3 className="font-semibold text-slate-800 dark:text-slate-100">
                        {t('Détail des prestations')}
                    </h3>
                    <span className="ml-auto text-xs text-slate-400">
                        {invoice.lines.length} {t('ligne(s)')}
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
                            {invoice.lines.map((line) => (
                                <tr key={line.id} className="text-sm hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                                    <td className="px-5 py-3 font-medium text-slate-800 dark:text-slate-100">
                                        {line.designation}
                                    </td>
                                    <td className="px-5 py-3 text-slate-500">{line.unit ?? '—'}</td>
                                    <td className="px-5 py-3 text-right text-slate-600 dark:text-slate-300">
                                        {Number(line.quantity)}
                                    </td>
                                    <td className="px-5 py-3 text-right text-slate-600 dark:text-slate-300">
                                        {formatMoney(line.unit_price, invoice.currency)}
                                    </td>
                                    <td className="px-5 py-3 text-right font-semibold text-slate-800 dark:text-slate-100">
                                        {formatMoney(line.line_total, invoice.currency)}
                                    </td>
                                </tr>
                            ))}
                            {invoice.lines.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-5 py-10 text-center text-sm text-slate-400">
                                        {t('Aucune ligne de facturation.')}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* ─── Récapitulatif des totaux ─────────────────────────────── */}
                <div className="flex justify-end border-t border-slate-100 px-5 py-5 dark:border-slate-800">
                    <div className="w-full max-w-sm space-y-2 text-sm">
                        <TotalRow label={t('Sous-total HT')}>
                            {formatMoney(ht, invoice.currency)}
                        </TotalRow>
                        <TotalRow label={`${t('TVA')} (${taxRate} %)`}>
                            {formatMoney(tva, invoice.currency)}
                        </TotalRow>
                        <div className="border-t border-slate-200 pt-2 dark:border-slate-700">
                            <TotalRow label={t('Total TTC')} bold orange>
                                {formatMoney(ttc, invoice.currency)}
                            </TotalRow>
                        </div>
                        <div className="border-t border-dashed border-slate-200 pt-2 dark:border-slate-700">
                            <TotalRow label={t('Déjà payé')} bold>
                                <span className="text-green-600">{formatMoney(paid, invoice.currency)}</span>
                            </TotalRow>
                            <TotalRow label={t('Reste à payer')} bold>
                                <span className={balance > 0 ? 'text-orange-600' : 'text-slate-500'}>
                                    {formatMoney(balance, invoice.currency)}
                                </span>
                            </TotalRow>
                        </div>
                    </div>
                </div>
            </div>

            {/* ─── Section suivi de paiement ──────────────────────────────────── */}
            <div className="mt-6">
                <div className="mb-3 flex items-center gap-2">
                    <Icon name="credit-card" className="h-4 w-4 text-orange-500" />
                    <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        {t('Suivi des paiements')}
                    </h3>
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <PaymentCard
                        label={t('Total TTC')}
                        value={formatMoney(ttc, invoice.currency)}
                        icon="file-text"
                        color="text-slate-800 dark:text-slate-100"
                    />
                    <PaymentCard
                        label={t('Montant payé')}
                        value={formatMoney(paid, invoice.currency)}
                        icon="check-circle"
                        color="text-green-600"
                    />
                    <PaymentCard
                        label={t('Reste à payer')}
                        value={formatMoney(balance, invoice.currency)}
                        icon={balance > 0 ? 'alert-circle' : 'check-circle-2'}
                        color={balance > 0 ? 'text-orange-600' : 'text-slate-400'}
                        subtext={isPaid ? t('Soldée') : balance > 0 ? t('En attente') : ''}
                    />
                </div>

                {/* Barre de progression du paiement */}
                {ttc > 0 && (
                    <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
                        <div className="mb-2 flex justify-between text-xs text-slate-500">
                            <span>{t('Progression du paiement')}</span>
                            <span className="font-semibold">
                                {Math.min(100, Math.round((paid / ttc) * 100))} %
                            </span>
                        </div>
                        <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                            <div
                                className={`h-full rounded-full transition-all ${isPaid ? 'bg-green-500' : 'bg-orange-500'}`}
                                style={{ width: `${Math.min(100, (paid / ttc) * 100)}%` }}
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* ─── Notes ──────────────────────────────────────────────────────── */}
            {invoice.notes && (
                <div className="mt-6 rounded-xl border border-slate-200 bg-white p-5 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
                    <div className="mb-2 flex items-center gap-2">
                        <Icon name="message-square" className="h-4 w-4 text-slate-400" />
                        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                            {t('Notes')}
                        </span>
                    </div>
                    <p className="whitespace-pre-line">{invoice.notes}</p>
                </div>
            )}

            {/* ─── QR Code d'authenticité ──────────────────────────────────────── */}
            {invoice.verify_token && (
                <div className="mt-6 rounded-xl border border-green-200 bg-green-50 p-5 dark:border-green-800 dark:bg-green-900/10">
                    <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
                        <img
                            src={`https://chart.googleapis.com/chart?chs=100x100&cht=qr&chl=${encodeURIComponent(window.location.origin + '/verify/' + invoice.verify_token)}`}
                            width={100}
                            height={100}
                            alt="QR code de vérification"
                            className="shrink-0 rounded-lg border border-green-200 bg-white p-1"
                        />
                        <div>
                            <div className="flex items-center gap-1.5 text-green-700 dark:text-green-400">
                                <Icon name="shield-check" className="h-4 w-4" />
                                <span className="text-sm font-semibold">{t('Document vérifiable')}</span>
                            </div>
                            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                                {t('Scannez ce QR code pour vérifier l\'authenticité de cette facture.')}{' '}
                                <a
                                    href={`/verify/${invoice.verify_token}`}
                                    target="_blank"
                                    rel="noopener"
                                    className="font-medium text-green-700 underline dark:text-green-400"
                                >
                                    {t('Ouvrir la page de vérification')}
                                </a>
                            </p>
                            <p className="mt-2 font-mono text-xs text-slate-400">
                                {invoice.verify_token}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* ─── Modal : enregistrer un paiement partiel ────────────────────── */}
            <Modal show={showPayment} onClose={() => setShowPayment(false)} maxWidth="md">
                <form onSubmit={submitPayment} className="p-6">
                    <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
                        {t('Enregistrer un paiement')}
                    </h3>
                    <p className="mt-2 text-sm text-slate-500">
                        {t('Reste à payer')} :{' '}
                        <span className="font-semibold text-orange-600">
                            {formatMoney(balance, invoice.currency)}
                        </span>
                    </p>
                    <div className="mt-4">
                        <InputLabel htmlFor="amount" value={`${t('Montant reçu')} *`} />
                        <TextInput
                            id="amount"
                            type="number"
                            min="0.01"
                            step="0.01"
                            max={balance}
                            className="mt-1 block w-full"
                            value={payment.data.amount}
                            onChange={(e) => payment.setData('amount', e.target.value)}
                            autoFocus
                        />
                        <InputError message={payment.errors.amount} className="mt-1" />
                    </div>
                    <div className="mt-6 flex justify-end gap-3">
                        <SecondaryButton type="button" onClick={() => setShowPayment(false)}>
                            {t('Annuler')}
                        </SecondaryButton>
                        <PrimaryButton
                            disabled={payment.processing}
                            className="bg-orange-500 hover:bg-orange-600 focus:bg-orange-600"
                        >
                            {t('Valider le paiement')}
                        </PrimaryButton>
                    </div>
                </form>
            </Modal>

            {/* ─── Modal : marquer payée ───────────────────────────────────────── */}
            <Modal show={confirmMarkPaid} onClose={() => setConfirmMarkPaid(false)} maxWidth="md">
                <div className="p-6">
                    <div className="flex items-center gap-3">
                        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                            <Icon name="check-circle" className="h-5 w-5 text-green-600" />
                        </span>
                        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
                            {t('Marquer comme payée ?')}
                        </h3>
                    </div>
                    <p className="mt-3 text-sm text-slate-500">
                        {t('Le montant total')}{' '}
                        <span className="font-semibold text-slate-700 dark:text-slate-200">
                            {formatMoney(ttc, invoice.currency)}
                        </span>{' '}
                        {t('sera enregistré comme payé et le statut passera à « Payée ».')}
                    </p>
                    <div className="mt-6 flex justify-end gap-3">
                        <SecondaryButton type="button" onClick={() => setConfirmMarkPaid(false)}>
                            {t('Annuler')}
                        </SecondaryButton>
                        <button
                            onClick={doMarkPaid}
                            className="inline-flex items-center gap-2 rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
                        >
                            <Icon name="check" className="h-4 w-4" />
                            {t('Confirmer le paiement intégral')}
                        </button>
                    </div>
                </div>
            </Modal>

            {/* ─── Modal : envoyer par email ───────────────────────────────────── */}
            <Modal show={confirmEmail} onClose={() => setConfirmEmail(false)} maxWidth="md">
                <div className="p-6">
                    <div className="flex items-center gap-3">
                        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
                            <Icon name="send" className="h-5 w-5 text-blue-600" />
                        </span>
                        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
                            {t('Envoyer la facture par email ?')}
                        </h3>
                    </div>
                    <p className="mt-3 text-sm text-slate-500">
                        {invoice.client?.email
                            ? <>
                                {t('La facture sera envoyée à')}{' '}
                                <span className="font-semibold text-slate-700 dark:text-slate-200">
                                    {invoice.client.email}
                                </span>.
                              </>
                            : t('Aucune adresse email client. Configurez-la dans la fiche client.')}
                    </p>
                    {invoice.status === 'draft' && (
                        <p className="mt-2 text-xs text-blue-600 dark:text-blue-400">
                            {t('Le statut passera automatiquement de « Brouillon » à « Envoyée ».')}
                        </p>
                    )}
                    <div className="mt-6 flex justify-end gap-3">
                        <SecondaryButton type="button" onClick={() => setConfirmEmail(false)}>
                            {t('Annuler')}
                        </SecondaryButton>
                        <button
                            onClick={doSendEmail}
                            disabled={!invoice.client?.email}
                            className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            <Icon name="send" className="h-4 w-4" />
                            {t('Envoyer')}
                        </button>
                    </div>
                </div>
            </Modal>

            {/* ─── Modal : confirmation suppression ───────────────────────────── */}
            <Modal show={confirmDelete} onClose={() => setConfirmDelete(false)} maxWidth="md">
                <div className="p-6">
                    <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
                        {t('Supprimer cette facture ?')}
                    </h3>
                    <p className="mt-2 text-sm text-slate-500">
                        {t('La facture «')} {invoice.code} {t('» sera supprimée. Cette action est réversible (corbeille).')}
                    </p>
                    <div className="mt-6 flex justify-end gap-3">
                        <SecondaryButton type="button" onClick={() => setConfirmDelete(false)}>
                            {t('Annuler')}
                        </SecondaryButton>
                        <DangerButton onClick={deleteInvoice}>
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

function TotalRow({ label, children, bold, orange }) {
    return (
        <div className={`flex justify-between ${bold ? 'font-semibold' : ''} ${orange ? 'text-base text-orange-600' : 'text-slate-600 dark:text-slate-300'}`}>
            <span>{label}</span>
            <span>{children}</span>
        </div>
    );
}

function PaymentCard({ label, value, icon, color, subtext }) {
    return (
        <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center gap-2 text-slate-400">
                <Icon name={icon} className="h-4 w-4" />
                <span className="text-xs uppercase tracking-wider">{label}</span>
            </div>
            <div className={`mt-1 text-lg font-semibold ${color}`}>{value}</div>
            {subtext && (
                <div className="mt-0.5 text-xs text-slate-400">{subtext}</div>
            )}
        </div>
    );
}
