import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';

const BRAND = '#F58220';

export default function Register() {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('register'), { onFinish: () => reset('password', 'password_confirmation') });
    };

    return (
        <GuestLayout>
            <Head title="Créer un compte — CONSTRUIRO ERP" />

            <h1 className="text-2xl font-black mb-1" style={{ color: '#1E1E1E' }}>Créer votre compte</h1>
            <p className="text-sm text-gray-500 mb-6">Essai gratuit 14 jours · Sans carte bancaire</p>

            <form onSubmit={submit} className="space-y-5">
                <div>
                    <InputLabel htmlFor="name" value="Nom complet" />
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

                <div>
                    <InputLabel htmlFor="email" value="Adresse email professionnelle" />
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

                <div>
                    <InputLabel htmlFor="password" value="Mot de passe" />
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
                    <InputLabel htmlFor="password_confirmation" value="Confirmer le mot de passe" />
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

                <button
                    type="submit"
                    disabled={processing}
                    className="w-full py-3 rounded-xl font-bold text-white transition hover:opacity-90 disabled:opacity-60"
                    style={{ background: BRAND }}>
                    {processing ? 'Création...' : 'Créer mon compte gratuit →'}
                </button>

                <p className="text-center text-sm text-gray-500">
                    Déjà inscrit ?{' '}
                    <Link href={route('login')} className="font-semibold hover:underline" style={{ color: BRAND }}>
                        Se connecter
                    </Link>
                </p>

                <p className="text-center text-xs text-gray-400">
                    En créant un compte, vous acceptez nos{' '}
                    <a href="/legal/cgu" className="hover:underline" style={{ color: BRAND }}>CGU</a>
                    {' '}et notre{' '}
                    <a href="/legal/confidentialite" className="hover:underline" style={{ color: BRAND }}>politique de confidentialité</a>.
                </p>
            </form>
        </GuestLayout>
    );
}
