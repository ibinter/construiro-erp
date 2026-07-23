import { Head, useForm, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { useTrans } from '@/i18n';
import { useState } from 'react';

const BRAND = '#F58220';
const NAVY  = '#1E1E1E';

function formatAmount(amount, currency = 'XOF') {
    return new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(amount) + ' ' + currency;
}

const METHOD_ICONS = {
    mobile_money: '📱', bank_transfer_national: '🏦', bank_transfer_international: '🌍',
    electronic: '💳', money_transfer: '💸', cash_agency: '🏪',
    check: '📋', crypto: '₿', voucher: '🎟️', cash_on_delivery: '🚚', wire_transfer: '💰',
};

export default function Payment({ plans = [], methods = [] }) {
    const { t } = useTrans();
    const [selectedPlan, setSelectedPlan] = useState(null);
    const [billingCycle, setBillingCycle] = useState('monthly');
    const [selectedMethod, setSelectedMethod] = useState(null);
    const { post, processing } = useForm({});

    const handleSubmit = () => {
        if (!selectedPlan || !selectedMethod) return;
        router.post(route('billing.payment.initiate'), {
            plan_id: selectedPlan.id,
            billing_cycle: billingCycle,
            method_type: selectedMethod.type,
        });
    };

    const currentAmount = selectedPlan
        ? (billingCycle === 'yearly' ? selectedPlan.price_yearly : selectedPlan.price_monthly)
        : null;

    return (
        <AppLayout title={t('Choisir un abonnement')}>
            <Head title={t('Paiement — CONSTRUIRO')} />
            <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">

                {/* Étape 1 — Plan */}
                <div>
                    <h2 className="text-xl font-black mb-2" style={{ color: NAVY }}>1. {t('Choisissez votre plan')}</h2>
                    <div className="flex gap-3 mb-4">
                        {['monthly','yearly'].map(c => (
                            <button key={c} onClick={() => setBillingCycle(c)}
                                className="px-4 py-2 rounded-lg text-sm font-semibold border-2 transition"
                                style={billingCycle === c ? { background: BRAND, color: '#fff', borderColor: BRAND } : { borderColor: '#e5e7eb', color: '#6b7280' }}>
                                {c === 'monthly' ? t('Mensuel') : t('Annuel (-20%)')}
                            </button>
                        ))}
                    </div>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {plans.map(plan => {
                            const price = billingCycle === 'yearly' ? plan.price_yearly : plan.price_monthly;
                            const isSelected = selectedPlan?.id === plan.id;
                            return (
                                <button key={plan.id} onClick={() => setSelectedPlan(plan)}
                                    className="text-left p-5 rounded-2xl border-2 transition-all"
                                    style={isSelected ? { borderColor: BRAND, background: 'rgba(245,130,32,0.05)' } : { borderColor: '#e5e7eb' }}>
                                    <p className="font-bold text-sm mb-1" style={{ color: NAVY }}>{plan.name}</p>
                                    <p className="text-2xl font-black" style={{ color: isSelected ? BRAND : NAVY }}>
                                        {formatAmount(price, plan.currency)}
                                    </p>
                                    <p className="text-xs text-gray-400 mt-0.5">/{billingCycle === 'yearly' ? t('an') : t('mois')}</p>
                                    {plan.max_users && <p className="text-xs text-gray-500 mt-2">{plan.max_users} {t('utilisateurs max')}</p>}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Étape 2 — Méthode */}
                {selectedPlan && (
                    <div>
                        <h2 className="text-xl font-black mb-4" style={{ color: NAVY }}>2. {t('Choisissez votre méthode de paiement')}</h2>
                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {methods.map(m => {
                                const isSelected = selectedMethod?.type === m.type;
                                return (
                                    <button key={m.type} onClick={() => setSelectedMethod(m)}
                                        className="text-left p-4 rounded-xl border-2 flex items-center gap-3 transition-all"
                                        style={isSelected ? { borderColor: BRAND, background: 'rgba(245,130,32,0.05)' } : { borderColor: '#e5e7eb' }}>
                                        <span className="text-2xl">{METHOD_ICONS[m.type] ?? '💳'}</span>
                                        <div>
                                            <p className="font-semibold text-sm" style={{ color: NAVY }}>{m.name}</p>
                                            {m.min_amount && <p className="text-xs text-gray-400">Min : {formatAmount(m.min_amount, m.currency ?? 'XOF')}</p>}
                                        </div>
                                        {isSelected && <span className="ml-auto text-lg" style={{ color: BRAND }}>✓</span>}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Récap + bouton */}
                {selectedPlan && selectedMethod && (
                    <div className="rounded-2xl p-6 border-2" style={{ borderColor: BRAND, background: 'rgba(245,130,32,0.04)' }}>
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <p className="font-black text-lg" style={{ color: NAVY }}>{selectedPlan.name} — {billingCycle === 'yearly' ? t('Annuel') : t('Mensuel')}</p>
                                <p className="text-sm text-gray-500">{selectedMethod.name}</p>
                            </div>
                            <p className="text-2xl font-black" style={{ color: BRAND }}>{formatAmount(currentAmount, selectedPlan.currency)}</p>
                        </div>
                        <p className="text-xs text-gray-400 mb-4">
                            ⚠️ {t('Nous ne vous demanderons jamais votre code secret ou mot de passe.')}
                        </p>
                        <button onClick={handleSubmit} disabled={processing}
                            className="w-full py-4 rounded-xl font-bold text-white transition hover:opacity-90 disabled:opacity-60"
                            style={{ background: BRAND }}>
                            {processing ? t('Traitement…') : t('Procéder au paiement →')}
                        </button>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
