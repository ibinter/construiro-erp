import { Head, useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { useTrans } from '@/i18n';
import { useState } from 'react';

const BRAND = '#F58220';
const NAVY  = '#1E1E1E';

const STATUS_COLORS = { pending: '#f59e0b', submitted: '#3b82f6', confirmed: '#22c55e', rejected: '#ef4444', expired: '#6b7280', cancelled: '#6b7280' };
const STATUS_LABELS = { pending: 'En attente', submitted: 'Preuve soumise', confirmed: 'Confirmé ✓', rejected: 'Rejeté', expired: 'Expiré', cancelled: 'Annulé' };

export default function PaymentOrder({ order }) {
    const { t } = useTrans();
    const { data, setData, post, processing, errors, wasSuccessful } = useForm({ proof: null });
    const [dragOver, setDragOver] = useState(false);

    const handleFile = (file) => setData('proof', file);

    const submit = (e) => {
        e.preventDefault();
        post(route('billing.payment.proof', order.reference), { forceFormData: true });
    };

    const canUpload = ['pending','submitted'].includes(order.status);

    return (
        <AppLayout title={t('Paiement') + ' — ' + order.reference}>
            <Head title={`Paiement ${order.reference}`} />
            <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">

                {/* Référence + statut */}
                <div className="rounded-2xl p-6 border border-gray-100 bg-white shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <p className="text-xs text-gray-400 font-semibold uppercase">{t('Référence')}</p>
                            <p className="text-xl font-black" style={{ color: NAVY }}>{order.reference}</p>
                        </div>
                        <span className="text-sm font-bold px-3 py-1.5 rounded-full"
                            style={{ background: `${STATUS_COLORS[order.status]}15`, color: STATUS_COLORS[order.status] }}>
                            {STATUS_LABELS[order.status] ?? order.status}
                        </span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div><p className="text-gray-400">{t('Plan')}</p><p className="font-semibold">{order.plan_name}</p></div>
                        <div><p className="text-gray-400">{t('Montant')}</p><p className="font-black text-lg" style={{ color: BRAND }}>{new Intl.NumberFormat('fr-FR').format(order.amount)} {order.currency}</p></div>
                        <div><p className="text-gray-400">{t('Méthode')}</p><p className="font-semibold">{order.method_name}</p></div>
                        {order.expires_at && <div><p className="text-gray-400">{t('Expire le')}</p><p className="font-semibold">{order.expires_at}</p></div>}
                    </div>
                </div>

                {/* Instructions */}
                {order.instructions && (
                    <div className="rounded-2xl p-6 border border-orange-100" style={{ background: 'rgba(245,130,32,0.04)' }}>
                        <h3 className="font-bold text-base mb-3" style={{ color: NAVY }}>📋 {t('Instructions de paiement')}</h3>
                        <pre className="whitespace-pre-wrap text-sm text-gray-700 font-sans leading-relaxed">{order.instructions}</pre>
                    </div>
                )}

                {/* Upload preuve */}
                {canUpload && (
                    <form onSubmit={submit}>
                        <div
                            onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                            onDragLeave={() => setDragOver(false)}
                            onDrop={e => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files[0]); }}
                            className="rounded-2xl border-2 border-dashed p-8 text-center transition-all cursor-pointer"
                            style={dragOver ? { borderColor: BRAND, background: 'rgba(245,130,32,0.05)' } : { borderColor: '#d1d5db' }}
                            onClick={() => document.getElementById('proof-input').click()}>
                            <input id="proof-input" type="file" accept=".jpg,.jpeg,.png,.gif,.webp,.pdf" className="hidden"
                                onChange={e => handleFile(e.target.files[0])} />
                            <p className="text-4xl mb-3">📎</p>
                            <p className="font-semibold text-gray-700">{data.proof ? data.proof.name : t('Déposez votre preuve ici ou cliquez pour sélectionner')}</p>
                            <p className="text-xs text-gray-400 mt-1">{t('JPG, PNG, PDF · max 10 Mo')}</p>
                        </div>
                        {errors.proof && <p className="text-red-500 text-sm mt-2">{errors.proof}</p>}
                        {wasSuccessful && <p className="text-green-600 font-semibold mt-2">✓ {t('Preuve soumise avec succès.')}</p>}
                        <button type="submit" disabled={!data.proof || processing}
                            className="mt-4 w-full py-4 rounded-xl font-bold text-white transition hover:opacity-90 disabled:opacity-40"
                            style={{ background: BRAND }}>
                            {processing ? t('Envoi…') : t('Soumettre ma preuve de paiement')}
                        </button>
                        <p className="text-center text-xs text-gray-400 mt-3">
                            ⚠️ {t('Nous ne vous demanderons jamais votre code secret ou mot de passe.')}
                        </p>
                    </form>
                )}

                {order.status === 'confirmed' && (
                    <div className="rounded-2xl p-6 text-center" style={{ background: 'rgba(34,197,94,0.08)', border: '2px solid #22c55e' }}>
                        <p className="text-4xl mb-2">✅</p>
                        <p className="font-black text-lg text-green-700">{t('Paiement confirmé — Abonnement activé !')}</p>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
