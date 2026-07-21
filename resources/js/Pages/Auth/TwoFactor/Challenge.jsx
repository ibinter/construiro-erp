import { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import GuestLayout from '@/Layouts/GuestLayout';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';

const BRAND = '#F58220';

const ShieldIcon = ({ className }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round"
            d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
    </svg>
);

export default function Challenge() {
    const [useRecovery, setUseRecovery] = useState(false);

    /* Formulaire code TOTP */
    const totpForm = useForm({ code: '' });

    /* Formulaire code de récupération */
    const recoveryForm = useForm({ recovery_code: '' });

    const submitTotp = (e) => {
        e.preventDefault();
        totpForm.post(route('two-factor.challenge.store'), {
            preserveScroll: true,
            onError: () => totpForm.setData('code', ''),
        });
    };

    const submitRecovery = (e) => {
        e.preventDefault();
        recoveryForm.post(route('two-factor.challenge.store'), {
            preserveScroll: true,
            onError: () => recoveryForm.setData('recovery_code', ''),
        });
    };

    return (
        <GuestLayout>
            <Head title="Vérification en 2 étapes — CONSTRUIRO ERP" />

            {/* En-tête */}
            <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: '#FEF3E8' }}>
                    <ShieldIcon className="w-5 h-5" style={{ color: BRAND }} />
                </div>
                <div>
                    <h1 className="text-xl font-black text-gray-900">Vérification en 2 étapes</h1>
                    <p className="text-xs text-gray-500">Entrez le code généré par votre application</p>
                </div>
            </div>

            {!useRecovery ? (
                /* ── Mode TOTP ─────────────────────────────────────────────── */
                <form onSubmit={submitTotp} className="space-y-5">
                    <div>
                        <InputLabel htmlFor="code" value="Code à 6 chiffres" />
                        <TextInput
                            id="code"
                            type="text"
                            inputMode="numeric"
                            pattern="[0-9]{6}"
                            maxLength={6}
                            value={totpForm.data.code}
                            onChange={(e) => totpForm.setData('code', e.target.value.replace(/\D/g, ''))}
                            className="mt-1 block w-full text-center text-2xl tracking-[0.5em] font-mono"
                            placeholder="000000"
                            autoFocus
                            autoComplete="one-time-code"
                        />
                        <InputError message={totpForm.errors.code} className="mt-2" />
                        <p className="mt-2 text-xs text-gray-500 text-center">
                            Ouvrez Google Authenticator, Authy ou votre appli TOTP et entrez le code affiché.
                        </p>
                    </div>

                    <button
                        type="submit"
                        disabled={totpForm.processing || totpForm.data.code.length !== 6}
                        className="w-full py-3 rounded-xl font-bold text-white transition hover:opacity-90 disabled:opacity-60"
                        style={{ background: BRAND }}>
                        {totpForm.processing ? 'Vérification...' : 'Vérifier →'}
                    </button>

                    <p className="text-center text-sm text-gray-500">
                        Vous n'avez pas accès à votre appli ?{' '}
                        <button
                            type="button"
                            onClick={() => setUseRecovery(true)}
                            className="font-semibold hover:underline"
                            style={{ color: BRAND }}>
                            Utiliser un code de secours
                        </button>
                    </p>
                </form>
            ) : (
                /* ── Mode code de récupération ─────────────────────────────── */
                <form onSubmit={submitRecovery} className="space-y-5">
                    <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-700">
                        Les codes de secours sont à usage unique. Après utilisation, ce code sera invalide.
                    </div>

                    <div>
                        <InputLabel htmlFor="recovery_code" value="Code de secours" />
                        <TextInput
                            id="recovery_code"
                            type="text"
                            value={recoveryForm.data.recovery_code}
                            onChange={(e) => recoveryForm.setData('recovery_code', e.target.value)}
                            className="mt-1 block w-full font-mono tracking-wider"
                            placeholder="XXXX-XXXX-XXXX-XXXX"
                            autoFocus
                            autoComplete="off"
                        />
                        <InputError message={recoveryForm.errors.recovery_code} className="mt-2" />
                    </div>

                    <button
                        type="submit"
                        disabled={recoveryForm.processing || !recoveryForm.data.recovery_code.trim()}
                        className="w-full py-3 rounded-xl font-bold text-white transition hover:opacity-90 disabled:opacity-60"
                        style={{ background: BRAND }}>
                        {recoveryForm.processing ? 'Vérification...' : 'Valider le code de secours →'}
                    </button>

                    <p className="text-center text-sm text-gray-500">
                        <button
                            type="button"
                            onClick={() => setUseRecovery(false)}
                            className="font-semibold hover:underline"
                            style={{ color: BRAND }}>
                            ← Retour au code TOTP
                        </button>
                    </p>
                </form>
            )}
        </GuestLayout>
    );
}
