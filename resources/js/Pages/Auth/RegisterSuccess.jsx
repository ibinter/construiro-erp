import { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import GuestLayout from '@/Layouts/GuestLayout';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import { useTrans } from '@/i18n';

const BRAND = '#F58220';

export default function RegisterSuccess({ email = '' }) {
    const { t } = useTrans();
    const [showForm, setShowForm] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        email: email,
        password: '',
        remember: false,
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('login'), { onFinish: () => reset('password') });
    };

    return (
        <GuestLayout>
            <Head title={t('Compte créé — CONSTRUIRO ERP')} />

            {/* Message de succès */}
            <div className="mb-5 rounded-xl bg-green-50 border border-green-200 p-4 dark:bg-green-900/20 dark:border-green-800">
                <p className="font-bold text-green-800 dark:text-green-300 mb-1">
                    ✅ {t('Votre compte a été créé avec succès !')}
                </p>
                <p className="text-sm text-green-700 dark:text-green-400">
                    {t('Un email de vérification a été envoyé à')} <strong>{email || t('votre adresse')}</strong>.{' '}
                    {t('Cliquez sur le lien dans cet email pour activer votre compte.')}
                </p>
            </div>

            {/* Bandeau "en attente" */}
            <div className="mb-5 rounded-lg bg-amber-50 border border-amber-200 p-3 text-xs text-amber-700 dark:bg-amber-900/20 dark:border-amber-700 dark:text-amber-300">
                ⚠️ <strong>{t('Compte en attente de validation.')}</strong> {t("Vous pouvez vous connecter maintenant et accéder à l'application. Votre compte sera pleinement activé après vérification de votre email.")}
            </div>

            {/* Bouton Se connecter → formulaire inline */}
            {!showForm ? (
                <button
                    type="button"
                    onClick={() => setShowForm(true)}
                    className="w-full py-3 rounded-xl font-bold text-white transition hover:opacity-90 mb-4"
                    style={{ background: BRAND }}
                >
                    {t('Se connecter')} →
                </button>
            ) : (
                <div className="mb-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-5 shadow-sm">
                    <h3 className="font-semibold text-slate-800 dark:text-slate-100 mb-4">
                        {t('Connexion à votre compte')}
                    </h3>

                    <form onSubmit={submit} className="space-y-4">
                        <div>
                            <InputLabel htmlFor="email" value={t('Adresse email')} />
                            <TextInput
                                id="email"
                                type="email"
                                name="email"
                                value={data.email}
                                className="mt-1 block w-full"
                                autoComplete="username"
                                autoFocus
                                onChange={(e) => setData('email', e.target.value)}
                                required
                            />
                            <InputError message={errors.email} className="mt-1" />
                        </div>

                        <div>
                            <InputLabel htmlFor="password" value={t('Mot de passe')} />
                            <TextInput
                                id="password"
                                type="password"
                                name="password"
                                value={data.password}
                                className="mt-1 block w-full"
                                autoComplete="current-password"
                                onChange={(e) => setData('password', e.target.value)}
                                required
                            />
                            <InputError message={errors.password} className="mt-1" />
                            <InputError message={errors.message} className="mt-1" />
                        </div>

                        <div className="flex gap-3">
                            <button
                                type="submit"
                                disabled={processing}
                                className="flex-1 py-3 rounded-xl font-bold text-white transition hover:opacity-90 disabled:opacity-60"
                                style={{ background: BRAND }}
                            >
                                {processing ? t('Connexion...') : t('Accéder à mon compte →')}
                            </button>
                            <button
                                type="button"
                                onClick={() => setShowForm(false)}
                                className="px-4 rounded-xl border border-slate-300 text-slate-600 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-400 dark:hover:bg-slate-800 text-sm"
                            >
                                {t('Annuler')}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Lien mot de passe oublié */}
            <p className="text-center text-sm text-slate-500">
                <Link href={route('password.request')} className="underline underline-offset-2 hover:text-orange-500">
                    {t('Mot de passe oublié ?')}
                </Link>
            </p>
        </GuestLayout>
    );
}
