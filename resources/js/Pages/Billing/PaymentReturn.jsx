import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { useTrans } from '@/i18n';

const BRAND = '#F58220';

export default function PaymentReturn({ order }) {
    const { t } = useTrans();
    const isConfirmed = order.status === 'confirmed';
    return (
        <AppLayout title={t('Retour de paiement')}>
            <Head title="Paiement — CONSTRUIRO" />
            <div className="max-w-md mx-auto px-4 py-16 text-center">
                <p className="text-6xl mb-4">{isConfirmed ? '✅' : '⏳'}</p>
                <h1 className="text-2xl font-black mb-3">{isConfirmed ? t('Paiement confirmé !') : t('Paiement en cours de vérification')}</h1>
                <p className="text-gray-500 text-sm mb-8">
                    {isConfirmed
                        ? t('Votre abonnement a été activé avec succès.')
                        : t('Votre paiement est en cours de traitement. Vous recevrez une confirmation par email dans les prochaines minutes.')}
                </p>
                <p className="text-xs text-gray-400 mb-6">{t('Référence')} : <strong>{order.reference}</strong></p>
                <Link href={route('billing.index')}
                    className="inline-block px-8 py-3 rounded-xl font-bold text-white"
                    style={{ background: BRAND }}>
                    {t('Voir mon abonnement →')}
                </Link>
            </div>
        </AppLayout>
    );
}
