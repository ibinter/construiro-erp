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
    const s = INVOICE_STATUS[status] ?? { label: status, color: 'bg-slate-100 text-slate-600' };
    return <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${s.color}`}>{s.label}</span>;
}

export default function Show({ invoice, can }) {
    const [confirmDelete, setConfirmDelete] = useState(false);
    const [showPayment, setShowPayment] = useState(false);

    const balance = Number(invoice.balance ?? 0);

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

    const deleteInvoice = () => {
        router.delete(`/invoices/${invoice.id}`);
    };

    const fmtDate = (d) => (d ? new Date(d).toLocaleDateString('fr-FR') : '—');

    return (
        <AppLayout header="Fiche facture">
            <Head title={invoice.code} />

            {/* En-tête */}
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                    <div className="flex items-center gap-2">
                        <Link href="/invoices" className="text-slate-400 hover:text-orange-600">
                            <Icon name="arrow-left" className="h-5 w-5" />
                        </Link>
                        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">{invoice.code}</h2>
                        <StatusBadge status={invoice.status} />
                    </div>
                    <p className="ml-7 text-sm text-slate-400">
                        {invoice.client?.name ? invoice.client.name : 'Sans client'}
                        {invoice.project ? ` · ${invoice.project.name}` : ''}
                    </p>
                </div>
                <div className="flex gap-2">
                    {can.update && balance > 0 && (
                        <button
                            onClick={() => setShowPayment(true)}
                            className="inline-flex items-center gap-2 rounded-md bg-orange-500 px-3 py-2 text-sm font-medium text-white hover:bg-orange-600"
                        >
                            <Icon name="banknote" className="h-4 w-4" /> Enregistrer un paiement
                        </button>
                    )}
                    {can.update && (
                        <Link
                            href={`/invoices/${invoice.id}/edit`}
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
                        <span className="text-xs uppercase tracking-wider">Émission</span>
                    </div>
                    <div className="mt-1 font-semibold text-slate-800 dark:text-slate-100">{fmtDate(invoice.issue_date)}</div>
                </div>
                <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
                    <div className="flex items-center gap-2 text-slate-400">
                        <Icon name="calendar-clock" className="h-4 w-4" />
                        <span className="text-xs uppercase tracking-wider">Échéance</span>
                    </div>
                    <div className="mt-1 font-semibold text-slate-800 dark:text-slate-100">{fmtDate(invoice.due_date)}</div>
                </div>
                <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
                    <div className="flex items-center gap-2 text-slate-400">
                        <Icon name="percent" className="h-4 w-4" />
                        <span className="text-xs uppercase tracking-wider">TVA</span>
                    </div>
                    <div className="mt-1 font-semibold text-slate-800 dark:text-slate-100">{Number(invoice.tax_rate)} %</div>
                </div>
                <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
                    <div className="flex items-center gap-2 text-slate-400">
                        <Icon name="wallet" className="h-4 w-4" />
                        <span className="text-xs uppercase tracking-wider">Total TTC</span>
                    </div>
                    <div className="mt-1 font-semibold text-orange-600">{formatMoney(invoice.total, invoice.currency)}</div>
                </div>
            </div>

            {/* Tableau des lignes */}
            <div className="rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
                <div className="flex items-center gap-2 border-b border-slate-100 px-5 py-4 dark:border-slate-800">
                    <Icon name="receipt" className="h-5 w-5 text-orange-500" />
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
                        {invoice.lines.map((line) => (
                            <tr key={line.id} className="text-sm">
                                <td className="px-5 py-3 text-slate-800 dark:text-slate-100">{line.designation}</td>
                                <td className="px-5 py-3 text-slate-500">{line.unit ?? '—'}</td>
                                <td className="px-5 py-3 text-right text-slate-600 dark:text-slate-300">
                                    {Number(line.quantity)}
                                </td>
                                <td className="px-5 py-3 text-right text-slate-600 dark:text-slate-300">
                                    {formatMoney(line.unit_price, invoice.currency)}
                                </td>
                                <td className="px-5 py-3 text-right font-medium text-slate-800 dark:text-slate-100">
                                    {formatMoney(line.line_total, invoice.currency)}
                                </td>
                            </tr>
                        ))}
                        {invoice.lines.length === 0 && (
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
                            <span>{formatMoney(invoice.subtotal, invoice.currency)}</span>
                        </div>
                        <div className="flex justify-between text-slate-600 dark:text-slate-300">
                            <span>TVA ({Number(invoice.tax_rate)} %)</span>
                            <span>{formatMoney(invoice.tax_amount, invoice.currency)}</span>
                        </div>
                        <div className="flex justify-between border-t border-slate-200 pt-2 text-base font-semibold text-slate-800 dark:border-slate-700 dark:text-slate-100">
                            <span>Total TTC</span>
                            <span>{formatMoney(invoice.total, invoice.currency)}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bloc suivi de paiement */}
            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
                    <div className="text-xs uppercase tracking-wider text-slate-400">Total TTC</div>
                    <div className="mt-1 text-lg font-semibold text-slate-800 dark:text-slate-100">
                        {formatMoney(invoice.total, invoice.currency)}
                    </div>
                </div>
                <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
                    <div className="text-xs uppercase tracking-wider text-slate-400">Montant payé</div>
                    <div className="mt-1 text-lg font-semibold text-green-600">
                        {formatMoney(invoice.amount_paid, invoice.currency)}
                    </div>
                </div>
                <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
                    <div className="text-xs uppercase tracking-wider text-slate-400">Reste à payer</div>
                    <div className={`mt-1 text-lg font-semibold ${balance > 0 ? 'text-orange-600' : 'text-slate-800 dark:text-slate-100'}`}>
                        {formatMoney(balance, invoice.currency)}
                    </div>
                </div>
            </div>

            {invoice.notes && (
                <div className="mt-6 rounded-xl border border-slate-200 bg-white p-5 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
                    <div className="mb-1 text-xs font-semibold uppercase tracking-wider text-slate-400">Notes</div>
                    {invoice.notes}
                </div>
            )}

            {/* Enregistrer un paiement */}
            <Modal show={showPayment} onClose={() => setShowPayment(false)} maxWidth="md">
                <form onSubmit={submitPayment} className="p-6">
                    <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Enregistrer un paiement</h3>
                    <p className="mt-2 text-sm text-slate-500">
                        Reste à payer : <span className="font-medium text-orange-600">{formatMoney(balance, invoice.currency)}</span>
                    </p>
                    <div className="mt-4">
                        <InputLabel htmlFor="amount" value="Montant reçu *" />
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
                        <SecondaryButton type="button" onClick={() => setShowPayment(false)}>Annuler</SecondaryButton>
                        <PrimaryButton disabled={payment.processing} className="bg-orange-500 hover:bg-orange-600 focus:bg-orange-600">
                            Valider le paiement
                        </PrimaryButton>
                    </div>
                </form>
            </Modal>

            {/* Confirmation suppression */}
            <Modal show={confirmDelete} onClose={() => setConfirmDelete(false)} maxWidth="md">
                <div className="p-6">
                    <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Supprimer cette facture ?</h3>
                    <p className="mt-2 text-sm text-slate-500">
                        La facture « {invoice.code} » sera supprimée. Cette action est réversible (corbeille).
                    </p>
                    <div className="mt-6 flex justify-end gap-3">
                        <SecondaryButton type="button" onClick={() => setConfirmDelete(false)}>Annuler</SecondaryButton>
                        <DangerButton onClick={deleteInvoice}>Supprimer définitivement</DangerButton>
                    </div>
                </div>
            </Modal>
        </AppLayout>
    );
}
