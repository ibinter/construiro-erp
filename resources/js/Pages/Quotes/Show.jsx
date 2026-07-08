import { useState } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import Icon from '@/Components/Icon';
import Modal from '@/Components/Modal';
import SecondaryButton from '@/Components/SecondaryButton';
import DangerButton from '@/Components/DangerButton';
import { Head, Link, router } from '@inertiajs/react';
import { formatMoney } from '@/constants';

// Libellés et styles des statuts de devis (FR).
const QUOTE_STATUS = {
    draft:    { label: 'Brouillon', color: 'bg-slate-100 text-slate-600' },
    sent:     { label: 'Envoyé',    color: 'bg-blue-100 text-blue-700' },
    accepted: { label: 'Accepté',   color: 'bg-green-100 text-green-700' },
    rejected: { label: 'Rejeté',    color: 'bg-red-100 text-red-700' },
    expired:  { label: 'Expiré',    color: 'bg-amber-100 text-amber-700' },
};

function StatusBadge({ status }) {
    const s = QUOTE_STATUS[status] ?? { label: status, color: 'bg-slate-100 text-slate-600' };
    return <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${s.color}`}>{s.label}</span>;
}

export default function Show({ quote, can }) {
    const [confirmDelete, setConfirmDelete] = useState(false);

    const deleteQuote = () => {
        router.delete(`/quotes/${quote.id}`);
    };

    const fmtDate = (d) => (d ? new Date(d).toLocaleDateString('fr-FR') : '—');

    return (
        <AppLayout header="Fiche devis">
            <Head title={quote.title} />

            {/* En-tête */}
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                    <div className="flex items-center gap-2">
                        <Link href="/quotes" className="text-slate-400 hover:text-orange-600">
                            <Icon name="arrow-left" className="h-5 w-5" />
                        </Link>
                        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">{quote.title}</h2>
                        <StatusBadge status={quote.status} />
                    </div>
                    <p className="ml-7 text-sm text-slate-400">
                        {quote.code}
                        {quote.client_name ? ` · ${quote.client_name}` : ''}
                        {quote.project ? ` · ${quote.project.name}` : ''}
                    </p>
                </div>
                <div className="flex gap-2">
                    {can.update && (
                        <Link
                            href={`/quotes/${quote.id}/edit`}
                            className="inline-flex items-center gap-2 rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                        >
                            <Icon name="pencil" className="h-4 w-4" /> Modifier
                        </Link>
                    )}
                    {can.delete && (
                        <button
                            onClick={() => setConfirmDelete(true)}
                            className="inline-flex items-center gap-2 rounded-md border border-red-200 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:border-red-900/50"
                        >
                            <Icon name="trash-2" className="h-4 w-4" /> Supprimer
                        </button>
                    )}
                </div>
            </div>

            {/* Métadonnées */}
            <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
                <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
                    <div className="flex items-center gap-2 text-slate-400">
                        <Icon name="calendar" className="h-4 w-4" />
                        <span className="text-xs uppercase tracking-wider">Date</span>
                    </div>
                    <div className="mt-1 font-semibold text-slate-800 dark:text-slate-100">{fmtDate(quote.date)}</div>
                </div>
                <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
                    <div className="flex items-center gap-2 text-slate-400">
                        <Icon name="calendar-clock" className="h-4 w-4" />
                        <span className="text-xs uppercase tracking-wider">Valable jusqu'au</span>
                    </div>
                    <div className="mt-1 font-semibold text-slate-800 dark:text-slate-100">{fmtDate(quote.valid_until)}</div>
                </div>
                <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
                    <div className="flex items-center gap-2 text-slate-400">
                        <Icon name="percent" className="h-4 w-4" />
                        <span className="text-xs uppercase tracking-wider">TVA</span>
                    </div>
                    <div className="mt-1 font-semibold text-slate-800 dark:text-slate-100">{Number(quote.tax_rate)} %</div>
                </div>
                <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
                    <div className="flex items-center gap-2 text-slate-400">
                        <Icon name="wallet" className="h-4 w-4" />
                        <span className="text-xs uppercase tracking-wider">Total TTC</span>
                    </div>
                    <div className="mt-1 font-semibold text-orange-600">{formatMoney(quote.total, quote.currency)}</div>
                </div>
            </div>

            {/* Tableau des lignes */}
            <div className="rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
                <div className="flex items-center gap-2 border-b border-slate-100 px-5 py-4 dark:border-slate-800">
                    <Icon name="file-text" className="h-5 w-5 text-orange-500" />
                    <h3 className="font-semibold text-slate-800 dark:text-slate-100">Détail des prestations</h3>
                </div>

                <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
                    <thead className="bg-slate-50 dark:bg-slate-800/50">
                        <tr className="text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                            <th className="px-5 py-3">Désignation</th>
                            <th className="px-5 py-3">Unité</th>
                            <th className="px-5 py-3 text-right">Quantité</th>
                            <th className="px-5 py-3 text-right">P.U.</th>
                            <th className="px-5 py-3 text-right">Total</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {quote.lines.map((line) => (
                            <tr key={line.id} className="text-sm">
                                <td className="px-5 py-3 text-slate-800 dark:text-slate-100">{line.designation}</td>
                                <td className="px-5 py-3 text-slate-500">{line.unit ?? '—'}</td>
                                <td className="px-5 py-3 text-right text-slate-600 dark:text-slate-300">
                                    {Number(line.quantity)}
                                </td>
                                <td className="px-5 py-3 text-right text-slate-600 dark:text-slate-300">
                                    {formatMoney(line.unit_price, quote.currency)}
                                </td>
                                <td className="px-5 py-3 text-right font-medium text-slate-800 dark:text-slate-100">
                                    {formatMoney(line.line_total, quote.currency)}
                                </td>
                            </tr>
                        ))}
                        {quote.lines.length === 0 && (
                            <tr>
                                <td colSpan={5} className="px-5 py-8 text-center text-sm text-slate-400">
                                    Aucune ligne.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>

                {/* Totaux */}
                <div className="flex justify-end border-t border-slate-100 px-5 py-4 dark:border-slate-800">
                    <div className="w-full max-w-xs space-y-2 text-sm">
                        <div className="flex justify-between text-slate-600 dark:text-slate-300">
                            <span>Sous-total HT</span>
                            <span>{formatMoney(quote.subtotal, quote.currency)}</span>
                        </div>
                        <div className="flex justify-between text-slate-600 dark:text-slate-300">
                            <span>TVA ({Number(quote.tax_rate)} %)</span>
                            <span>{formatMoney(quote.tax_amount, quote.currency)}</span>
                        </div>
                        <div className="flex justify-between border-t border-slate-200 pt-2 text-base font-semibold text-slate-800 dark:border-slate-700 dark:text-slate-100">
                            <span>Total TTC</span>
                            <span>{formatMoney(quote.total, quote.currency)}</span>
                        </div>
                    </div>
                </div>
            </div>

            {quote.notes && (
                <div className="mt-6 rounded-xl border border-slate-200 bg-white p-5 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
                    <div className="mb-1 text-xs font-semibold uppercase tracking-wider text-slate-400">Notes</div>
                    {quote.notes}
                </div>
            )}

            {/* Confirmation suppression */}
            <Modal show={confirmDelete} onClose={() => setConfirmDelete(false)} maxWidth="md">
                <div className="p-6">
                    <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Supprimer ce devis ?</h3>
                    <p className="mt-2 text-sm text-slate-500">
                        Le devis « {quote.title} » sera supprimé. Cette action est réversible (corbeille).
                    </p>
                    <div className="mt-6 flex justify-end gap-3">
                        <SecondaryButton type="button" onClick={() => setConfirmDelete(false)}>Annuler</SecondaryButton>
                        <DangerButton onClick={deleteQuote}>Supprimer définitivement</DangerButton>
                    </div>
                </div>
            </Modal>
        </AppLayout>
    );
}
