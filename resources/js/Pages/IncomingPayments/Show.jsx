import { useState } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import Icon from '@/Components/Icon';
import Modal from '@/Components/Modal';
import SecondaryButton from '@/Components/SecondaryButton';
import DangerButton from '@/Components/DangerButton';
import { Head, Link, router } from '@inertiajs/react';
import { formatMoney } from '@/constants';
import { METHOD_LABELS } from './Partials/PaymentForm';

export default function Show({ payment, can }) {
    const [confirmDelete, setConfirmDelete] = useState(false);

    const deletePayment = () => {
        router.delete(`/incoming-payments/${payment.id}`);
    };

    const fmtDate = (d) => (d ? new Date(d).toLocaleDateString('fr-FR') : '—');

    return (
        <AppLayout header="Fiche encaissement">
            <Head title={payment.code} />

            {/* En-tête */}
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                    <div className="flex items-center gap-2">
                        <Link href="/incoming-payments" className="text-slate-400 hover:text-orange-600">
                            <Icon name="arrow-left" className="h-5 w-5" />
                        </Link>
                        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">{payment.code}</h2>
                    </div>
                    <p className="ml-7 text-sm text-slate-400">
                        {payment.client?.name ?? payment.payer_name ?? 'Sans payeur'}
                        {payment.project ? ` · ${payment.project.name}` : ''}
                    </p>
                </div>
                <div className="flex gap-2">
                    {can.update && (
                        <Link
                            href={`/incoming-payments/${payment.id}/edit`}
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

            {/* Montant à la une */}
            <div className="mb-6 rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
                <div className="text-xs uppercase tracking-wider text-slate-400">Montant encaissé</div>
                <div className="mt-1 text-3xl font-bold text-green-600">
                    {formatMoney(payment.amount, payment.currency)}
                </div>
            </div>

            {/* Métadonnées */}
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
                    <div className="flex items-center gap-2 text-slate-400">
                        <Icon name="calendar" className="h-4 w-4" />
                        <span className="text-xs uppercase tracking-wider">Date</span>
                    </div>
                    <div className="mt-1 font-semibold text-slate-800 dark:text-slate-100">{fmtDate(payment.date)}</div>
                </div>
                <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
                    <div className="flex items-center gap-2 text-slate-400">
                        <Icon name="wallet" className="h-4 w-4" />
                        <span className="text-xs uppercase tracking-wider">Mode</span>
                    </div>
                    <div className="mt-1 font-semibold text-slate-800 dark:text-slate-100">
                        {METHOD_LABELS[payment.method] ?? payment.method}
                    </div>
                </div>
                <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
                    <div className="flex items-center gap-2 text-slate-400">
                        <Icon name="receipt" className="h-4 w-4" />
                        <span className="text-xs uppercase tracking-wider">Facture</span>
                    </div>
                    <div className="mt-1 font-semibold text-slate-800 dark:text-slate-100">
                        {payment.invoice?.code ?? '—'}
                    </div>
                </div>
                <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
                    <div className="flex items-center gap-2 text-slate-400">
                        <Icon name="hash" className="h-4 w-4" />
                        <span className="text-xs uppercase tracking-wider">Référence</span>
                    </div>
                    <div className="mt-1 font-semibold text-slate-800 dark:text-slate-100">
                        {payment.reference ?? '—'}
                    </div>
                </div>
            </div>

            {payment.notes && (
                <div className="mt-6 rounded-xl border border-slate-200 bg-white p-5 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
                    <div className="mb-1 text-xs font-semibold uppercase tracking-wider text-slate-400">Notes</div>
                    {payment.notes}
                </div>
            )}

            {/* Confirmation suppression */}
            <Modal show={confirmDelete} onClose={() => setConfirmDelete(false)} maxWidth="md">
                <div className="p-6">
                    <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Supprimer cet encaissement ?</h3>
                    <p className="mt-2 text-sm text-slate-500">
                        L'encaissement « {payment.code} » sera supprimé. Cette action est réversible (corbeille).
                    </p>
                    <div className="mt-6 flex justify-end gap-3">
                        <SecondaryButton type="button" onClick={() => setConfirmDelete(false)}>Annuler</SecondaryButton>
                        <DangerButton onClick={deletePayment}>Supprimer définitivement</DangerButton>
                    </div>
                </div>
            </Modal>
        </AppLayout>
    );
}
