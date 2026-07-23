import { useState } from 'react';
import { Link, router, useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { PageHeader, Badge } from '@/Components/UI';

const STATUS_COLORS = {
    pending:   'warning',
    submitted: 'info',
    confirmed: 'success',
    rejected:  'danger',
};

const STATUS_LABELS = {
    pending:   'En attente',
    submitted: 'Preuve soumise',
    confirmed: 'Confirmé',
    rejected:  'Rejeté',
};

const METHOD_LABELS = {
    orange_money:  'Orange Money',
    mtn_momo:      'MTN MoMo',
    wave:          'Wave',
    moov_money:    'Moov Money',
    airtel_money:  'Airtel Money',
    free_money:    'Free Money',
    paypal:        'PayPal',
    stripe:        'Stripe',
    bank_transfer: 'Virement',
    cash:          'Espèces',
    cheque:        'Chèque',
};

/** Modale de confirmation */
function ConfirmModal({ order, onClose }) {
    const { data, setData, post, processing, errors } = useForm({ notes: '' });

    const submit = (e) => {
        e.preventDefault();
        post(`/superadmin/payment-orders/${order.id}/confirm`, {
            onSuccess: onClose,
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl w-full max-w-md p-6 space-y-5">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
                        Confirmer le paiement
                    </h3>
                    <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-600 text-xl leading-none">
                        &times;
                    </button>
                </div>

                <div className="rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 px-4 py-3 text-sm text-green-700 dark:text-green-300">
                    <p className="font-medium">Référence : {order.reference}</p>
                    <p>{order.company_name} — {order.plan_name}</p>
                    <p className="font-semibold mt-1">{order.amount_formatted}</p>
                </div>

                <form onSubmit={submit} className="space-y-4">
                    <div>
                        <label className="form-label">Notes admin (optionnel)</label>
                        <textarea
                            className="form-input w-full text-sm"
                            rows={3}
                            placeholder="Notes internes sur cette confirmation…"
                            value={data.notes}
                            onChange={(e) => setData('notes', e.target.value)}
                        />
                        {errors.notes && <p className="text-xs text-red-500 mt-1">{errors.notes}</p>}
                    </div>

                    <div className="flex gap-3 justify-end pt-2">
                        <button type="button" onClick={onClose} className="btn btn-secondary" disabled={processing}>
                            Annuler
                        </button>
                        <button type="submit" className="btn btn-primary" disabled={processing}>
                            {processing ? 'Confirmation…' : '✓ Confirmer le paiement'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

/** Modale de rejet */
function RejectModal({ order, onClose }) {
    const { data, setData, post, processing, errors } = useForm({ reason: '' });

    const submit = (e) => {
        e.preventDefault();
        post(`/superadmin/payment-orders/${order.id}/reject`, {
            onSuccess: onClose,
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl w-full max-w-md p-6 space-y-5">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
                        Rejeter le paiement
                    </h3>
                    <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-600 text-xl leading-none">
                        &times;
                    </button>
                </div>

                <div className="rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 px-4 py-3 text-sm text-red-700 dark:text-red-300">
                    <p className="font-medium">Référence : {order.reference}</p>
                    <p>{order.company_name} — {order.plan_name}</p>
                    <p className="font-semibold mt-1">{order.amount_formatted}</p>
                </div>

                <form onSubmit={submit} className="space-y-4">
                    <div>
                        <label className="form-label">Motif de rejet <span className="text-red-500">*</span></label>
                        <textarea
                            className="form-input w-full text-sm"
                            rows={3}
                            placeholder="Expliquez pourquoi ce paiement est rejeté…"
                            value={data.reason}
                            onChange={(e) => setData('reason', e.target.value)}
                            required
                        />
                        {errors.reason && <p className="text-xs text-red-500 mt-1">{errors.reason}</p>}
                    </div>

                    <div className="flex gap-3 justify-end pt-2">
                        <button type="button" onClick={onClose} className="btn btn-secondary" disabled={processing}>
                            Annuler
                        </button>
                        <button type="submit" className="btn bg-red-500 text-white hover:bg-red-600" disabled={processing}>
                            {processing ? 'Rejet…' : '✗ Rejeter le paiement'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default function PaymentOrdersIndex({ orders, filters }) {
    const [statusFilter, setStatusFilter] = useState(filters?.status ?? '');
    const [confirmOrder, setConfirmOrder] = useState(null);
    const [rejectOrder, setRejectOrder]   = useState(null);

    const handleStatusChange = (val) => {
        setStatusFilter(val);
        router.get(
            '/superadmin/payment-orders',
            { status: val || undefined },
            { preserveState: true, replace: true }
        );
    };

    const viewProof = (orderId) => {
        window.open(`/superadmin/payment-orders/${orderId}/proof`, '_blank', 'noopener');
    };

    const pendingCount = orders?.data?.filter((o) => ['pending', 'submitted'].includes(o.status)).length ?? 0;

    return (
        <AppLayout title="SuperAdmin — Ordres de paiement">
            {/* Modales */}
            {confirmOrder && (
                <ConfirmModal order={confirmOrder} onClose={() => setConfirmOrder(null)} />
            )}
            {rejectOrder && (
                <RejectModal order={rejectOrder} onClose={() => setRejectOrder(null)} />
            )}

            <div className="mx-auto max-w-7xl px-4 py-6 space-y-6">
                <PageHeader
                    title="Ordres de paiement"
                    subtitle={pendingCount > 0
                        ? `${pendingCount} ordre${pendingCount > 1 ? 's' : ''} en attente de validation`
                        : "Validation des paiements clients"}
                />

                {/* Alerte si des ordres attendent */}
                {pendingCount > 0 && (
                    <div className="rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 px-4 py-3 text-sm text-amber-700 dark:text-amber-300 flex items-center gap-2">
                        <span className="text-lg">⚠️</span>
                        <span>
                            <strong>{pendingCount} ordre{pendingCount > 1 ? 's' : ''}</strong> nécessite{pendingCount > 1 ? 'nt' : ''} votre validation.
                        </span>
                    </div>
                )}

                {/* Filtres par statut */}
                <div className="flex flex-wrap gap-2 items-center">
                    {['', 'pending', 'submitted', 'confirmed', 'rejected'].map((s) => (
                        <button
                            key={s}
                            type="button"
                            onClick={() => handleStatusChange(s)}
                            className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                                statusFilter === s
                                    ? 'bg-orange-500 text-white border-orange-500'
                                    : 'border-slate-200 text-slate-600 dark:border-slate-600 dark:text-slate-300 hover:border-orange-300'
                            }`}
                        >
                            {s === '' ? 'Tous' : STATUS_LABELS[s] ?? s}
                        </button>
                    ))}
                </div>

                {/* Tableau */}
                <div className="card">
                    <div className="card-body overflow-x-auto p-0">
                        <table className="table-construiro w-full">
                            <thead>
                                <tr>
                                    <th>Référence</th>
                                    <th>Société</th>
                                    <th>Plan</th>
                                    <th className="text-right">Montant</th>
                                    <th>Méthode</th>
                                    <th>Statut</th>
                                    <th className="text-center">Preuve</th>
                                    <th>Date</th>
                                    <th className="text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {(orders?.data ?? []).length === 0 ? (
                                    <tr>
                                        <td colSpan={9} className="text-center text-slate-400 py-12">
                                            Aucun ordre de paiement{statusFilter ? ` avec le statut "${STATUS_LABELS[statusFilter] ?? statusFilter}"` : ''}.
                                        </td>
                                    </tr>
                                ) : (
                                    (orders?.data ?? []).map((order) => (
                                        <tr key={order.id} className={['pending', 'submitted'].includes(order.status) ? 'bg-amber-50/30 dark:bg-amber-900/10' : ''}>
                                            {/* Référence */}
                                            <td>
                                                <span className="font-mono text-sm font-medium text-slate-700 dark:text-slate-200">
                                                    {order.reference}
                                                </span>
                                            </td>

                                            {/* Société */}
                                            <td>
                                                <p className="font-medium text-slate-700 dark:text-slate-200 truncate max-w-[140px]">
                                                    {order.company_name}
                                                </p>
                                                {order.company_email && (
                                                    <p className="text-xs text-slate-400 truncate max-w-[140px]">{order.company_email}</p>
                                                )}
                                            </td>

                                            {/* Plan */}
                                            <td>
                                                <span className="text-sm text-slate-600 dark:text-slate-300">
                                                    {order.plan_name ?? '—'}
                                                </span>
                                            </td>

                                            {/* Montant */}
                                            <td className="text-right">
                                                <span className="font-semibold text-slate-800 dark:text-slate-100">
                                                    {order.amount_formatted ?? `${order.amount} XOF`}
                                                </span>
                                            </td>

                                            {/* Méthode */}
                                            <td>
                                                <span className="text-sm text-slate-600 dark:text-slate-300">
                                                    {METHOD_LABELS[order.payment_method] ?? order.payment_method ?? '—'}
                                                </span>
                                            </td>

                                            {/* Statut */}
                                            <td>
                                                <Badge variant={STATUS_COLORS[order.status] ?? 'neutral'}>
                                                    {STATUS_LABELS[order.status] ?? order.status}
                                                </Badge>
                                            </td>

                                            {/* Preuve */}
                                            <td className="text-center">
                                                {order.proof_url || order.has_proof ? (
                                                    <button
                                                        type="button"
                                                        onClick={() => viewProof(order.id)}
                                                        className="text-xs text-blue-500 hover:text-blue-700 hover:underline font-medium"
                                                        title="Voir la preuve de paiement"
                                                    >
                                                        📎 Voir
                                                    </button>
                                                ) : (
                                                    <span className="text-xs text-slate-300">—</span>
                                                )}
                                            </td>

                                            {/* Date */}
                                            <td className="text-sm text-slate-500 dark:text-slate-400 whitespace-nowrap">
                                                {order.created_at ?? '—'}
                                            </td>

                                            {/* Actions */}
                                            <td>
                                                <div className="flex items-center justify-center gap-2">
                                                    {['pending', 'submitted'].includes(order.status) ? (
                                                        <>
                                                            <button
                                                                type="button"
                                                                onClick={() => setConfirmOrder(order)}
                                                                className="px-2.5 py-1 rounded text-xs font-medium bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/40 dark:text-green-400 dark:hover:bg-green-900/60 transition-colors"
                                                            >
                                                                ✓ Confirmer
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() => setRejectOrder(order)}
                                                                className="px-2.5 py-1 rounded text-xs font-medium bg-red-100 text-red-600 hover:bg-red-200 dark:bg-red-900/40 dark:text-red-400 dark:hover:bg-red-900/60 transition-colors"
                                                            >
                                                                ✗ Rejeter
                                                            </button>
                                                        </>
                                                    ) : (
                                                        <span className="text-xs text-slate-300 dark:text-slate-600">—</span>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Pagination */}
                {orders?.links && orders.links.length > 3 && (
                    <div className="flex gap-1 flex-wrap">
                        {orders.links.map((link, i) => (
                            <Link
                                key={i}
                                href={link.url ?? '#'}
                                className={`px-3 py-1 rounded text-sm border ${
                                    link.active
                                        ? 'bg-orange-500 text-white border-orange-500'
                                        : 'border-slate-200 text-slate-600 dark:border-slate-600 dark:text-slate-300 hover:border-orange-300'
                                }`}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        ))}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
