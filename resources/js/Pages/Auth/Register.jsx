import { useEffect, useState } from 'react';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { useTrans } from '@/i18n';

const BRAND = '#F58220';

function formatPrice(amount, currency) {
    if (!amount) return 'Gratuit';
    return new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: currency || 'XOF',
        maximumFractionDigits: 0,
    }).format(amount);
}

export default function Register({ plans = [], selectedPlan = null }) {
    const { t } = useTrans();

    // Pré-sélection depuis le landing (slug) ou premier plan disponible
    const initialPlan = plans.find(p => p.slug === selectedPlan)?.id
        ?? plans[0]?.id
        ?? null;

    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        plan_id: initialPlan ? String(initialPlan) : '',
    });

    const chosenPlan = plans.find(p => String(p.id) === String(data.plan_id));

    const submit = (e) => {
        e.preventDefault();
        post(route('register'), { onFinish: () => reset('password', 'password_confirmation') });
    };

    return (
        <GuestLayout>
            <Head title="Créer un compte — CONSTRUIRO ERP" />

            <h1 className="text-2xl font-black mb-1" style={{ color: '#1E1E1E' }}>
                {t('Créer votre compte')}
            </h1>
            <p className="text-sm text-gray-500 mb-6">
                {t('Essai gratuit 30 jours · Sans carte bancaire')}
            </p>

            <form onSubmit={submit} className="space-y-5">
                {/* ── Nom complet ── */}
                <div>
                    <InputLabel htmlFor="name" value={t('Nom complet')} />
                    <TextInput
                        id="name"
                        name="name"
                        value={data.name}
                        className="mt-1 block w-full"
                        autoComplete="name"
                        isFocused={true}
                        onChange={(e) => setData('name', e.target.value)}
                        required
                    />
                    <InputError message={errors.name} className="mt-2" />
                </div>

                {/* ── Email ── */}
                <div>
                    <InputLabel htmlFor="email" value={t('Adresse email professionnelle')} />
                    <TextInput
                        id="email"
                        type="email"
                        name="email"
                        value={data.email}
                        className="mt-1 block w-full"
                        autoComplete="username"
                        onChange={(e) => setData('email', e.target.value)}
                        required
                    />
                    <InputError message={errors.email} className="mt-2" />
                </div>

                {/* ── Mot de passe ── */}
                <div>
                    <InputLabel htmlFor="password" value={t('Mot de passe')} />
                    <TextInput
                        id="password"
                        type="password"
                        name="password"
                        value={data.password}
                        className="mt-1 block w-full"
                        autoComplete="new-password"
                        onChange={(e) => setData('password', e.target.value)}
                        required
                    />
                    <InputError message={errors.password} className="mt-2" />
                </div>

                <div>
                    <InputLabel htmlFor="password_confirmation" value={t('Confirmer le mot de passe')} />
                    <TextInput
                        id="password_confirmation"
                        type="password"
                        name="password_confirmation"
                        value={data.password_confirmation}
                        className="mt-1 block w-full"
                        autoComplete="new-password"
                        onChange={(e) => setData('password_confirmation', e.target.value)}
                        required
                    />
                    <InputError message={errors.password_confirmation} className="mt-2" />
                </div>

                {/* ── Sélection du plan (OBLIGATOIRE) ── */}
                {plans.length > 0 && (
                    <div>
                        <InputLabel value={t('Choisissez votre formule')} className="mb-2" />
                        <p className="text-xs text-gray-500 mb-3">
                            {t('Essai gratuit inclus · Aucune carte requise · Annulable à tout moment')}
                        </p>

                        <div className="grid gap-3">
                            {plans.map((plan) => {
                                const selected = String(data.plan_id) === String(plan.id);
                                return (
                                    <label
                                        key={plan.id}
                                        className={`flex cursor-pointer items-start gap-3 rounded-xl border-2 p-3 transition-all ${
                                            selected
                                                ? 'border-orange-400 bg-orange-50 dark:bg-orange-900/10'
                                                : 'border-slate-200 hover:border-orange-200 dark:border-slate-700 dark:hover:border-orange-700'
                                        }`}
                                    >
                                        <input
                                            type="radio"
                                            name="plan_id"
                                            value={String(plan.id)}
                                            checked={selected}
                                            onChange={(e) => setData('plan_id', e.target.value)}
                                            className="mt-1 shrink-0 accent-orange-500"
                                        />
                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <span className="font-semibold text-slate-800 dark:text-slate-100 text-sm">
                                                    {plan.name}
                                                </span>
                                                <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-300">
                                                    {plan.trial_days || 14}j gratuits
                                                </span>
                                            </div>
                                            {plan.description && (
                                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">
                                                    {plan.description}
                                                </p>
                                            )}
                                            <p className="text-xs font-medium mt-1" style={{ color: BRAND }}>
                                                {formatPrice(plan.price_monthly, plan.currency)}/mois
                                                {plan.price_yearly > 0 && (
                                                    <span className="text-slate-400 font-normal">
                                                        {' '}· {formatPrice(plan.price_yearly, plan.currency)}/an
                                                    </span>
                                                )}
                                            </p>
                                        </div>
                                    </label>
                                );
                            })}
                        </div>
                        <InputError message={errors.plan_id} className="mt-2" />
                    </div>
                )}

                {/* ── Bouton submit ── */}
                <button
                    type="submit"
                    disabled={processing || !data.plan_id}
                    className="w-full py-3 rounded-xl font-bold text-white transition hover:opacity-90 disabled:opacity-60"
                    style={{ background: BRAND }}
                >
                    {processing ? t('Création...') : t('Créer mon compte gratuit →')}
                </button>

                {!data.plan_id && (
                    <p className="text-center text-xs text-red-500">
                        {t('Veuillez choisir une formule pour continuer.')}
                    </p>
                )}

                <p className="text-center text-sm text-gray-500">
                    {t('Déjà inscrit ?')}{' '}
                    <Link href={route('login')} className="font-semibold hover:underline" style={{ color: BRAND }}>
                        {t('Se connecter')}
                    </Link>
                </p>

                <p className="text-center text-xs text-gray-400">
                    {t('En créant un compte, vous acceptez nos')}{' '}
                    <a href="/legal/cgu" className="hover:underline" style={{ color: BRAND }}>CGU</a>
                    {' '}{t('et notre')}{' '}
                    <a href="/legal/confidentialite" className="hover:underline" style={{ color: BRAND }}>
                        {t('politique de confidentialité')}
                    </a>.
                </p>
            </form>
        </GuestLayout>
    );
}
