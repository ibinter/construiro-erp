import { useState } from 'react';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';

const BRAND = '#F58220';

/* ─── Icônes inline SVG ──────────────────────────────────────────────────── */
const ShieldIcon = ({ className }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round"
            d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
    </svg>
);

const EyeIcon = ({ className }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round"
            d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
);

const EyeSlashIcon = ({ className }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round"
            d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
    </svg>
);

/* ─── Section : pas encore activé ───────────────────────────────────────── */
function NotEnabled({ onEnable }) {
    return (
        <div className="text-center py-8">
            <div className="mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4"
                style={{ background: '#FEF3E8' }}>
                <ShieldIcon className="w-8 h-8" style={{ color: BRAND }} />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                2FA non activé
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 max-w-sm mx-auto">
                Protégez votre compte avec l'authentification à deux facteurs. Après activation,
                vous aurez besoin de votre téléphone à chaque connexion.
            </p>
            <button
                onClick={onEnable}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold text-white transition hover:opacity-90"
                style={{ background: BRAND }}>
                <ShieldIcon className="w-4 h-4" />
                Activer le 2FA
            </button>
        </div>
    );
}

/* ─── Section : QR code à scanner (non encore confirmé) ─────────────────── */
function QrSetup({ qrCodeUrl, onConfirm, status }) {
    const { data, setData, post, processing, errors } = useForm({ code: '' });

    const submit = (e) => {
        e.preventDefault();
        post(route('two-factor.confirm'), { preserveScroll: true, onSuccess: onConfirm });
    };

    return (
        <div className="space-y-6">
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4">
                <p className="text-sm text-amber-800 dark:text-amber-200 font-medium">
                    Scannez le QR code avec Google Authenticator, Authy ou toute appli compatible TOTP.
                </p>
            </div>

            <div className="flex justify-center">
                <div className="p-3 bg-white rounded-xl shadow-sm border border-gray-200">
                    <img src={qrCodeUrl} alt="QR Code 2FA" className="w-48 h-48" />
                </div>
            </div>

            <form onSubmit={submit} className="space-y-4">
                <div>
                    <InputLabel htmlFor="code" value="Code de vérification (6 chiffres)" />
                    <TextInput
                        id="code"
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]{6}"
                        maxLength={6}
                        value={data.code}
                        onChange={(e) => setData('code', e.target.value.replace(/\D/g, ''))}
                        className="mt-1 block w-full text-center text-2xl tracking-widest"
                        placeholder="000000"
                        autoFocus
                    />
                    <InputError message={errors.code} className="mt-2" />
                    <p className="mt-1 text-xs text-gray-500">
                        Entrez le code affiché dans votre appli d'authentification pour confirmer l'activation.
                    </p>
                </div>

                <button
                    type="submit"
                    disabled={processing || data.code.length !== 6}
                    className="w-full py-2.5 rounded-xl font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
                    style={{ background: BRAND }}>
                    {processing ? 'Vérification...' : 'Confirmer l\'activation'}
                </button>
            </form>
        </div>
    );
}

/* ─── Section : 2FA actif — codes de secours ────────────────────────────── */
function ActiveSection({ recoveryCodes, status }) {
    const [showCodes, setShowCodes] = useState(false);
    const [showDisableForm, setShowDisableForm] = useState(false);
    const [showRegenForm, setShowRegenForm] = useState(false);

    const disableForm = useForm({ password: '' });
    const regenForm = useForm({ password: '' });

    const handleDisable = (e) => {
        e.preventDefault();
        disableForm.delete(route('two-factor.disable'), {
            preserveScroll: true,
            onSuccess: () => setShowDisableForm(false),
        });
    };

    const handleRegen = (e) => {
        e.preventDefault();
        regenForm.post(route('two-factor.recovery-codes'), {
            preserveScroll: true,
            onSuccess: () => {
                setShowRegenForm(false);
                regenForm.reset();
            },
        });
    };

    return (
        <div className="space-y-6">
            {/* Badge actif */}
            <div className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800">
                <span className="flex-shrink-0 w-8 h-8 rounded-full bg-green-100 dark:bg-green-800 flex items-center justify-center">
                    <svg className="w-4 h-4 text-green-600 dark:text-green-300" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                </span>
                <div>
                    <p className="font-semibold text-green-800 dark:text-green-200 text-sm">2FA activé</p>
                    <p className="text-xs text-green-600 dark:text-green-400">Votre compte est protégé par l'authentification à deux facteurs.</p>
                </div>
            </div>

            {/* Codes de secours */}
            <div>
                <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-gray-900 dark:text-gray-100 text-sm">Codes de secours</h4>
                    <button
                        onClick={() => setShowCodes(!showCodes)}
                        className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
                        {showCodes ? <EyeSlashIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
                        {showCodes ? 'Masquer' : 'Afficher'}
                    </button>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                    Conservez ces codes dans un endroit sûr. Chaque code ne peut être utilisé qu'une seule fois.
                </p>
                {showCodes && (
                    <div className="grid grid-cols-2 gap-2 p-4 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 font-mono text-sm">
                        {(recoveryCodes || []).map((code, i) => (
                            <span key={i} className="text-gray-700 dark:text-gray-300 select-all">{code}</span>
                        ))}
                        {(!recoveryCodes || recoveryCodes.length === 0) && (
                            <p className="col-span-2 text-gray-400 text-center py-2">Aucun code disponible — régénérez-en.</p>
                        )}
                    </div>
                )}
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2 border-t border-gray-100 dark:border-gray-700">
                <button
                    onClick={() => { setShowRegenForm(!showRegenForm); setShowDisableForm(false); }}
                    className="flex-1 py-2 px-4 rounded-xl border border-gray-300 dark:border-gray-600 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                    Régénérer les codes
                </button>
                <button
                    onClick={() => { setShowDisableForm(!showDisableForm); setShowRegenForm(false); }}
                    className="flex-1 py-2 px-4 rounded-xl border border-red-300 dark:border-red-700 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition">
                    Désactiver le 2FA
                </button>
            </div>

            {/* Formulaire régénération */}
            {showRegenForm && (
                <form onSubmit={handleRegen} className="space-y-3 p-4 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Confirmez votre mot de passe pour régénérer les codes :</p>
                    <TextInput
                        type="password"
                        value={regenForm.data.password}
                        onChange={(e) => regenForm.setData('password', e.target.value)}
                        className="block w-full"
                        placeholder="Mot de passe actuel"
                        autoComplete="current-password"
                    />
                    <InputError message={regenForm.errors.password} />
                    <div className="flex gap-2">
                        <button type="submit"
                            disabled={regenForm.processing}
                            className="px-4 py-2 rounded-lg text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-60"
                            style={{ background: BRAND }}>
                            {regenForm.processing ? 'Traitement...' : 'Confirmer'}
                        </button>
                        <button type="button" onClick={() => setShowRegenForm(false)}
                            className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition">
                            Annuler
                        </button>
                    </div>
                </form>
            )}

            {/* Formulaire désactivation */}
            {showDisableForm && (
                <form onSubmit={handleDisable} className="space-y-3 p-4 bg-red-50 dark:bg-red-900/10 rounded-xl border border-red-200 dark:border-red-800">
                    <p className="text-sm font-medium text-red-700 dark:text-red-400">
                        La désactivation retirera la protection 2FA de votre compte. Confirmez votre mot de passe :
                    </p>
                    <TextInput
                        type="password"
                        value={disableForm.data.password}
                        onChange={(e) => disableForm.setData('password', e.target.value)}
                        className="block w-full"
                        placeholder="Mot de passe actuel"
                        autoComplete="current-password"
                    />
                    <InputError message={disableForm.errors.password} />
                    <div className="flex gap-2">
                        <button type="submit"
                            disabled={disableForm.processing}
                            className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-red-600 hover:bg-red-700 transition disabled:opacity-60">
                            {disableForm.processing ? 'Traitement...' : 'Désactiver'}
                        </button>
                        <button type="button" onClick={() => setShowDisableForm(false)}
                            className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition">
                            Annuler
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
}

/* ─── Page principale ────────────────────────────────────────────────────── */
export default function Setup({ enabled, confirmed, qr_code_url, recovery_codes }) {
    const { props } = usePage();
    const flashStatus = props.flash?.status ?? props.status ?? null;

    const handleEnable = () => {
        router.post(route('two-factor.enable'), {}, { preserveScroll: true });
    };

    const renderBody = () => {
        if (confirmed) {
            return <ActiveSection recoveryCodes={recovery_codes} status={flashStatus} />;
        }
        if (enabled && qr_code_url) {
            return <QrSetup qrCodeUrl={qr_code_url} onConfirm={() => {}} status={flashStatus} />;
        }
        return <NotEnabled onEnable={handleEnable} />;
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
                    Authentification à deux facteurs
                </h2>
            }
        >
            <Head title="Sécurité — 2FA" />

            <div className="py-12">
                <div className="mx-auto max-w-xl sm:px-6 lg:px-8">

                    {/* Notification flash */}
                    {flashStatus === 'two-factor-enabled' && (
                        <div className="mb-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-xl text-sm text-green-700 dark:text-green-300 font-medium">
                            2FA activé avec succes. Votre compte est maintenant protege.
                        </div>
                    )}
                    {flashStatus === 'two-factor-disabled' && (
                        <div className="mb-4 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-xl text-sm text-amber-700 dark:text-amber-300 font-medium">
                            2FA desactive. Pensez a le reactiver pour proteger votre compte.
                        </div>
                    )}
                    {flashStatus === 'recovery-codes-regenerated' && (
                        <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-xl text-sm text-blue-700 dark:text-blue-300 font-medium">
                            Nouveaux codes de secours generes. Conservez-les en lieu sur.
                        </div>
                    )}

                    <div className="bg-white dark:bg-gray-800 shadow sm:rounded-lg p-6 sm:p-8">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                                style={{ background: '#FEF3E8' }}>
                                <ShieldIcon className="w-5 h-5" style={{ color: BRAND }} />
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                                    Authentification en 2 etapes (2FA)
                                </h3>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    Compatible Google Authenticator, Authy, Microsoft Authenticator
                                </p>
                            </div>
                        </div>

                        {renderBody()}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
