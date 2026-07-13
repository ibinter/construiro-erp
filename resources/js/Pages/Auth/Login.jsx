import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';

const BRAND = '#F58220';

export default function Login({ status, canResetPassword }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('login'), { onFinish: () => reset('password') });
    };

    return (
        <GuestLayout>
            <Head title="Connexion — CONSTRUIRO ERP" />

            <h1 className="text-2xl font-black mb-1" style={{ color: '#1E1E1E' }}>Connexion</h1>
            <p className="text-sm text-gray-500 mb-6">Accédez à votre espace CONSTRUIRO ERP</p>

            {status && (
                <div className="mb-4 text-sm font-medium text-green-600 bg-green-50 rounded-lg px-4 py-2">
                    {status}
                </div>
            )}

            <form onSubmit={submit} className="space-y-5">
                <div>
                    <InputLabel htmlFor="email" value="Adresse email" />
                    <TextInput
                        id="email"
                        type="email"
                        name="email"
                        value={data.email}
                        className="mt-1 block w-full"
                        autoComplete="username"
                        isFocused={true}
                        onChange={(e) => setData('email', e.target.value)}
                    />
                    <InputError message={errors.email} className="mt-2" />
                </div>

                <div>
                    <InputLabel htmlFor="password" value="Mot de passe" />
                    <TextInput
                        id="password"
                        type="password"
                        name="password"
                        value={data.password}
                        className="mt-1 block w-full"
                        autoComplete="current-password"
                        onChange={(e) => setData('password', e.target.value)}
                    />
                    <InputError message={errors.password} className="mt-2" />
                </div>

                <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 text-sm text-gray-600">
                        <input
                            type="checkbox"
                            name="remember"
                            checked={data.remember}
                            onChange={(e) => setData('remember', e.target.checked)}
                            className="rounded border-gray-300"
                        />
                        Se souvenir de moi
                    </label>
                    {canResetPassword && (
                        <Link href={route('password.request')}
                            className="text-sm hover:underline" style={{ color: BRAND }}>
                            Mot de passe oublié ?
                        </Link>
                    )}
                </div>

                <button
                    type="submit"
                    disabled={processing}
                    className="w-full py-3 rounded-xl font-bold text-white transition hover:opacity-90 disabled:opacity-60"
                    style={{ background: BRAND }}>
                    {processing ? 'Connexion...' : 'Se connecter →'}
                </button>

                <p className="text-center text-sm text-gray-500">
                    Pas encore de compte ?{' '}
                    <Link href={route('register')} className="font-semibold hover:underline" style={{ color: BRAND }}>
                        Essai gratuit 14 jours
                    </Link>
                </p>
            </form>
        </GuestLayout>
    );
}
