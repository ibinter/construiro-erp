import { Head, Link, useForm } from '@inertiajs/react';
import GuestLayout from '@/Layouts/GuestLayout';
import { useTrans } from '@/i18n';

const BRAND = '#F58220';

export default function VerifyEmail({ status }) {
    const { t } = useTrans();
    const { post, processing } = useForm({});

    const submit = (e) => {
        e.preventDefault();
        post(route('verification.send'));
    };

    return (
        <GuestLayout>
            <Head title={t('Vérification email — CONSTRUIRO ERP')} />

            <div className="mb-4 rounded-xl bg-amber-50 border border-amber-200 p-4 text-sm text-amber-800 dark:bg-amber-900/20 dark:border-amber-800 dark:text-amber-300">
                <p className="font-semibold mb-1">⚠️ {t('Compte en attente de validation email')}</p>
                <p>
                    {t("Vérifiez votre boîte de réception et cliquez sur le lien de vérification. Si vous ne l'avez pas reçu, vous pouvez en demander un nouveau.")}
                </p>
            </div>

            {status === 'verification-link-sent' && (
                <div className="mb-4 rounded-lg bg-blue-50 border border-blue-200 p-3 text-sm text-blue-700 dark:bg-blue-900/20 dark:text-blue-300">
                    ✉️ {t('Un nouveau lien de vérification a été envoyé. Vérifiez votre boîte de réception et vos spams.')}
                </div>
            )}

            {/* Accéder quand même au dashboard */}
            <Link
                href={route('dashboard')}
                className="mb-4 flex w-full items-center justify-center rounded-xl py-3 font-bold text-white transition hover:opacity-90"
                style={{ background: BRAND }}
            >
                {t("Accéder à l'application")} →
            </Link>

            <form onSubmit={submit} className="flex items-center justify-between text-sm">
                <button
                    type="submit"
                    disabled={processing}
                    className="text-slate-500 hover:text-orange-500 underline underline-offset-2 disabled:opacity-60"
                >
                    {processing ? t('Envoi...') : t("Renvoyer l'email de vérification")}
                </button>

                <Link
                    href={route('logout')}
                    method="post"
                    as="button"
                    className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 underline underline-offset-2"
                >
                    {t('Se déconnecter')}
                </Link>
            </form>
        </GuestLayout>
    );
}
