import { useState } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import Icon from '@/Components/Icon';
import Modal from '@/Components/Modal';
import SecondaryButton from '@/Components/SecondaryButton';
import DangerButton from '@/Components/DangerButton';
import PrimaryButton from '@/Components/PrimaryButton';
import SignatureBlock from '@/Components/SignatureBlock';
import { Head, Link, router } from '@inertiajs/react';
import { formatMoney } from '@/constants';
import { useTrans } from '@/i18n';

// ── Statuts ──────────────────────────────────────────────────────────────────
const QUOTE_STATUS = {
    draft:    { label: 'Brouillon', color: 'bg-slate-100 text-slate-600' },
    sent:     { label: 'Envoyé',    color: 'bg-blue-100 text-blue-700' },
    accepted: { label: 'Accepté',   color: 'bg-green-100 text-green-700' },
    rejected: { label: 'Rejeté',    color: 'bg-red-100 text-red-700' },
    expired:  { label: 'Expiré',    color: 'bg-amber-100 text-amber-700' },
};

function StatusBadge({ status }) {
    const { t } = useTrans();
    const s = QUOTE_STATUS[status] ?? { label: status, color: 'bg-slate-100 text-slate-600' };
    return (
        <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${s.color}`}>
            {t(s.label)}
        </span>
    );
}

// ── Composants locaux ─────────────────────────────────────────────────────────
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

// ── Page principale ───────────────────────────────────────────────────────────
export default function Show({ quote, can }) {
    const { t } = useTrans();

    const [confirmDelete, setConfirmDelete] = useState(false);
    const [confirmSend,   setConfirmSend]   = useState(false);
    const [confirmDup,    setConfirmDup]    = useState(false);

    const fmtDate = (d) => (d ? new Date(d).toLocaleDateString('fr-FR') : '—');

    const ht       = Number(quote.subtotal   ?? 0);
    const tva      = Number(quote.tax_amount ?? 0);
    const ttc      = Number(quote.total      ?? 0);
    const taxRate  = Number(quote.tax_rate   ?? 0);

    // ── Actions ───────────────────────────────────────────────────────────────

    /** Envoie le devis : PUT avec statut=sent (reconstruit le payload complet). */
    const doSend = () => {
        router.put(`/quotes/${quote.id}`, {
            code:        quote.code,
            title:       quote.title,
            client_id:   quote.client_id   ?? '',
            client_name: '',
            status:      'sent',
            currency:    quote.currency,
            tax_rate:    quote.tax_rate,
            project_id:  quote.project_id  ?? '',
            date:        quote.date        ? String(quote.date).slice(0, 10)        : '',
            valid_until: quote.valid_until ? String(quote.valid_until).slice(0, 10) : '',
            notes:       quote.notes ?? '',
            lines: (quote.lines ?? []).map((l) => ({
                designation: l.designation,
                unit:        l.unit ?? 'u',
                quantity:    l.quantity,
                unit_price:  l.unit_price,
            })),
        }, {
            onSuccess: () => setConfirmSend(false),
        });
    };

    /** Duplique : PUT vers /quotes/create avec l'id source (le serveur doit gérer) — fallback : page de création. */
    const doDuplicate = () => {
        router.get('/quotes/create', { duplicate_of: quote.id });
    };

    const doDelete = () => {
        router.delete(`/quotes/${quote.id}`);
    };

    const isDraft    = quote.status === 'draft';
    const isSent     = quote.status === 'sent';
    const isAccepted = quote.status === 'accepted';

    return (
        <AppLayout header={t('Fiche devis')}>
            <Head title={quote.title ?? quote.code} />

            {/* ─── En-tête ────────────────────────────────────────────────────── */}
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                    <div className="flex flex-wrap items-center gap-2">
                        <Link href="/quotes" className="text-slate-400 hover:text-orange-600">
                            <Icon name="arrow-left" className="h-5 w-5" />
                        </Link>
                        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
                            {quote.title}
                        </h2>
                        <StatusBadge status={quote.status} />
                    </div>
                    <p className="ml-7 text-sm text-slate-400">
                        <span className="font-mono text-slate-500">{quote.code}</span>
                        {quote.client_name ? ` · ${quote.client_name}` : ''}
                        {quote.project ? ` · ${quote.project.name}` : ''}
                    </p>
                </div>

                {/* ─── Boutons d'action ─────────────────────────────────────── */}
                <div className="flex flex-wrap gap-2">

                    {/* PDF */}
                    <a
                        href={`/quotes/${quote.id}/pdf`}
                        target="_blank"
                        rel="noopener"
                        className="inline-flex items-center gap-1.5 rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                    >
                        <Icon name="file-down" className="h-4 w-4" /> PDF
                    </a>

                    {/* Vérification */}
                    {quote.verify_token && (
                        <a
                            href={`/verify/${quote.verify_token}`}
                            target="_blank"
                            rel="noopener"
                            className="inline-flex items-center gap-1.5 rounded-md border border-green-300 px-3 py-2 text-sm font-medium text-green-700 hover:bg-green-50 dark:border-green-700 dark:text-green-300"
                        >
                            <Icon name="shield-check" className="h-4 w-4" /> {t('Vérifier')}
                        </a>
                    )}

                    {/* Excel */}
                    <a
                        href="/export/quotes"
                        target="_blank"
                        rel="noopener"
                        className="inline-flex items-center gap-1.5 rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                    >
                        <Icon name="table-2" className="h-4 w-4" /> Excel
                    </a>

                    {/* Envoyer (marquer comme envoyé) */}
                    {can.update && isDraft && (
                        <button
                            onClick={() => setConfirmSend(true)}
                            className="inline-flex items-center gap-1.5 rounded-md border border-blue-200 px-3 py-2 text-sm font-medium text-blue-700 hover:bg-blue-50 dark:border-blue-800 dark:text-blue-300 dark:hover:bg-blue-900/30"
                        >
                            <Icon name="send" className="h-4 w-4" /> {t('Envoyer')}
                        </button>
                    )}

                    {/* Convertir en facture */}
                    {can.update && (isDraft || isSent || isAccepted) && (
                        <Link
                            href={`/invoices/create?from_quote=${quote.id}`}
                            className="inline-flex items-center gap-1.5 rounded-md border border-amber-300 px-3 py-2 text-sm font-medium text-amber-700 hover:bg-amber-50 dark:border-amber-700 dark:text-amber-300 dark:hover:bg-amber-900/20"
                        >
                            <Icon name="file-check" className="h-4 w-4" /> {t('Convertir en facture')}
                        </Link>
                    )}

                    {/* Dupliquer */}
                    {can.create && (
                        <button
                            onClick={() => setConfirmDup(true)}
                            className="inline-flex items-center gap-1.5 rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                        >
                            <Icon name="copy" className="h-4 w-4" /> {t('Dupliquer')}
                        </button>
                    )}

                    {/* Modifier */}
                    {can.update && (
                        <Link
                            href={`/quotes/${quote.id}/edit`}
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
                <MetaCard icon="calendar" label={t('Date')}>
                    {fmtDate(quote.date)}
                </MetaCard>
                <MetaCard icon="calendar-clock" label={t('Valable jusqu\'au')}>
                    {fmtDate(quote.valid_until)}
                </MetaCard>
                <MetaCard icon="percent" label={t('TVA')}>
                    {taxRate} %
                </MetaCard>
                <MetaCard icon="wallet" label={t('Total TTC')}>
                    <span className="text-orange-600">
                        {formatMoney(ttc, quote.currency)}
                    </span>
                </MetaCard>
            </div>

            {/* ─── Tableau des lignes ─────────────────────────────────────────── */}
            <div className="rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
                <div className="flex items-center gap-2 border-b border-slate-100 px-5 py-4 dark:border-slate-800">
                    <Icon name="file-text" className="h-5 w-5 text-orange-500" />
                    <h3 className="font-semibold text-slate-800 dark:text-slate-100">
                        {t('Détail des prestations')}
                    </h3>
                    <span className="ml-auto text-xs text-slate-400">
                        {(quote.lines ?? []).length} {t('ligne(s)')}
                    </span>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
                        <thead className="bg-slate-50 dark:bg-slate-800/50">
                            <tr className="text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                                <th className="px-5 py-3">{t('Désignation')}</th>
                                <th className="px-5 py-3">{t('Unité')}</th>
                                <th className="px-5 py-3 text-right">{t('Quantité')}</th>
                                <th className="px-5 py-3 text-right">{t('P.U. HT')}</th>
                                <th className="px-5 py-3 text-right">{t('Total HT')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {(quote.lines ?? []).map((line) => (
                                <tr key={line.id} className="text-sm hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                                    <td className="px-5 py-3 font-medium text-slate-800 dark:text-slate-100">
                                        {line.designation}
                                    </td>
                                    <td className="px-5 py-3 text-slate-500">{line.unit ?? '—'}</td>
                                    <td className="px-5 py-3 text-right text-slate-600 dark:text-slate-300">
                                        {Number(line.quantity)}
                                    </td>
                                    <td className="px-5 py-3 text-right text-slate-600 dark:text-slate-300">
                                        {formatMoney(line.unit_price, quote.currency)}
                                    </td>
                                    <td className="px-5 py-3 text-right font-semibold text-slate-800 dark:text-slate-100">
                                        {formatMoney(line.line_total, quote.currency)}
                                    </td>
                                </tr>
                            ))}

                            {(quote.lines ?? []).length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-5 py-10 text-center text-sm text-slate-400">
                                        {t('Aucune ligne de devis.')}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* ── Récapitulatif des totaux ─────────────────────────────── */}
                <div className="flex justify-end border-t border-slate-100 px-5 py-5 dark:border-slate-800">
                    <div className="w-full max-w-sm space-y-2 text-sm">
                        <TotalRow label={t('Sous-total HT')}>
                            {formatMoney(ht, quote.currency)}
                        </TotalRow>
                        <TotalRow label={`${t('TVA')} (${taxRate} %)`}>
                            {formatMoney(tva, quote.currency)}
                        </TotalRow>
                        <div className="border-t border-slate-200 pt-2 dark:border-slate-700">
                            <TotalRow label={t('Total TTC')} bold orange>
                                {formatMoney(ttc, quote.currency)}
                            </TotalRow>
                        </div>
                    </div>
                </div>
            </div>

            {/* ─── Notes ──────────────────────────────────────────────────────── */}
            {quote.notes && (
                <div className="mt-6 rounded-xl border border-slate-200 bg-white p-5 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
                    <div className="mb-2 flex items-center gap-2">
                        <Icon name="message-square" className="h-4 w-4 text-slate-400" />
                        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                            {t('Conditions / Notes')}
                        </span>
                    </div>
                    <p className="whitespace-pre-line">{quote.notes}</p>
                </div>
            )}

            {/* ─── Signature électronique ──────────────────────────────────────── */}
            <SignatureBlock record={quote} model="quote" can={can} />

            {/* ─── QR Code d'authenticité ──────────────────────────────────────── */}
            {quote.verify_token && (
                <div className="mt-6 rounded-xl border border-green-200 bg-green-50 p-5 dark:border-green-800 dark:bg-green-900/10">
                    <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
                        <img
                            src={`https://chart.googleapis.com/chart?chs=100x100&cht=qr&chl=${encodeURIComponent(window.location.origin + '/verify/' + quote.verify_token)}`}
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
                                {t('Scannez ce QR code pour vérifier l\'authenticité de ce devis.')}{' '}
                                <a
                                    href={`/verify/${quote.verify_token}`}
                                    target="_blank"
                                    rel="noopener"
                                    className="font-medium text-green-700 underline dark:text-green-400"
                                >
                                    {t('Ouvrir la page de vérification')}
                                </a>
                            </p>
                            <p className="mt-2 font-mono text-xs text-slate-400">
                                {quote.verify_token}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* ═══ Modals ═══════════════════════════════════════════════════════ */}

            {/* Modal : marquer envoyé ────────────────────────────────────────── */}
            <Modal show={confirmSend} onClose={() => setConfirmSend(false)} maxWidth="md">
                <div className="p-6">
                    <div className="flex items-center gap-3">
                        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
                            <Icon name="send" className="h-5 w-5 text-blue-600" />
                        </span>
                        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
                            {t('Marquer ce devis comme envoyé ?')}
                        </h3>
                    </div>
                    <p className="mt-3 text-sm text-slate-500">
                        {t('Le statut du devis')}{' '}
                        <span className="font-semibold text-slate-700 dark:text-slate-200">
                            {quote.code}
                        </span>{' '}
                        {t('passera de « Brouillon » à « Envoyé ».')}
                    </p>
                    <div className="mt-6 flex justify-end gap-3">
                        <SecondaryButton type="button" onClick={() => setConfirmSend(false)}>
                            {t('Annuler')}
                        </SecondaryButton>
                        <button
                            onClick={doSend}
                            className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                        >
                            <Icon name="send" className="h-4 w-4" />
                            {t('Confirmer l\'envoi')}
                        </button>
                    </div>
                </div>
            </Modal>

            {/* Modal : dupliquer ─────────────────────────────────────────────── */}
            <Modal show={confirmDup} onClose={() => setConfirmDup(false)} maxWidth="md">
                <div className="p-6">
                    <div className="flex items-center gap-3">
                        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
                            <Icon name="copy" className="h-5 w-5 text-slate-600 dark:text-slate-300" />
                        </span>
                        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
                            {t('Dupliquer ce devis ?')}
                        </h3>
                    </div>
                    <p className="mt-3 text-sm text-slate-500">
                        {t('Vous allez créer un nouveau devis (brouillon) basé sur')}{' '}
                        <span className="font-semibold text-slate-700 dark:text-slate-200">{quote.code}</span>.
                        {' '}{t('Vous pourrez ensuite le modifier avant de l\'envoyer.')}
                    </p>
                    <div className="mt-6 flex justify-end gap-3">
                        <SecondaryButton type="button" onClick={() => setConfirmDup(false)}>
                            {t('Annuler')}
                        </SecondaryButton>
                        <PrimaryButton
                            onClick={doDuplicate}
                            className="bg-slate-600 hover:bg-slate-700 focus:bg-slate-700"
                        >
                            <Icon name="copy" className="mr-1.5 h-4 w-4" />
                            {t('Dupliquer')}
                        </PrimaryButton>
                    </div>
                </div>
            </Modal>

            {/* Modal : confirmer suppression ─────────────────────────────────── */}
            <Modal show={confirmDelete} onClose={() => setConfirmDelete(false)} maxWidth="md">
                <div className="p-6">
                    <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
                        {t('Supprimer ce devis ?')}
                    </h3>
                    <p className="mt-2 text-sm text-slate-500">
                        {t('Le devis «')} {quote.title} {t('» sera supprimé. Cette action est réversible (corbeille).')}
                    </p>
                    <div className="mt-6 flex justify-end gap-3">
                        <SecondaryButton type="button" onClick={() => setConfirmDelete(false)}>
                            {t('Annuler')}
                        </SecondaryButton>
                        <DangerButton onClick={doDelete}>
                            {t('Supprimer définitivement')}
                        </DangerButton>
                    </div>
                </div>
            </Modal>
        </AppLayout>
    );
}
