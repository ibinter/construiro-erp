import { Head, useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { useTrans } from '@/i18n';

const BRAND = '#F58220';

export default function VoucherPayment({ plan_id, cycle }) {
    const { t } = useTrans();
    const { data, setData, post, processing, errors } = useForm({ code: '', plan_id: plan_id ?? '', billing_cycle: cycle ?? 'monthly' });
    return (
        <AppLayout title={t('Code voucher')}>
            <Head title="Voucher — CONSTRUIRO" />
            <div className="max-w-md mx-auto px-4 py-12 text-center">
                <p className="text-5xl mb-4">🎟️</p>
                <h1 className="text-2xl font-black mb-2">{t('Activer avec un code prépayé')}</h1>
                <p className="text-gray-500 mb-8 text-sm">{t('Saisissez votre code pour activer immédiatement votre abonnement CONSTRUIRO.')}</p>
                <form onSubmit={e => { e.preventDefault(); post(route('billing.payment.voucher.redeem')); }}>
                    <input type="text" value={data.code} onChange={e => setData('code', e.target.value.toUpperCase())}
                        placeholder="XXXX-XXXX-XXXX" maxLength={20}
                        className="w-full text-center text-xl font-mono font-black py-4 px-6 rounded-xl border-2 border-gray-200 focus:border-orange-400 focus:outline-none mb-2"
                        style={{ letterSpacing: '0.1em' }} />
                    {errors.code && <p className="text-red-500 text-sm mb-3">{errors.code}</p>}
                    <button type="submit" disabled={!data.code || processing}
                        className="w-full py-4 rounded-xl font-bold text-white transition hover:opacity-90 disabled:opacity-40 mt-2"
                        style={{ background: BRAND }}>
                        {processing ? t('Vérification…') : t('Activer le code →')}
                    </button>
                </form>
            </div>
        </AppLayout>
    );
}
