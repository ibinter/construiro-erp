import { Link } from '@inertiajs/react';

export default function Expired({ subscription }) {
    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center space-y-6">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
                    <span className="text-3xl">🔒</span>
                </div>
                <h1 className="text-2xl font-bold text-slate-800">Accès suspendu</h1>
                <p className="text-slate-500">
                    {subscription?.plan
                        ? <>Votre abonnement <strong>{subscription.plan}</strong> a expiré le <strong>{subscription.ends_at}</strong>.</>
                        : <>Votre accès CONSTRUIRO a expiré.</>
                    }
                </p>
                <p className="text-sm text-slate-400">
                    Vos données sont conservées et seront accessibles dès la réactivation de votre abonnement.
                </p>
                <div className="space-y-3">
                    <Link
                        href="/billing"
                        className="block w-full rounded-lg bg-orange-500 px-6 py-3 text-center font-semibold text-white hover:bg-orange-600 transition"
                    >
                        Réactiver mon abonnement →
                    </Link>
                    <a
                        href="mailto:support@construiro.com"
                        className="block text-sm text-slate-400 hover:text-orange-500"
                    >
                        Contacter le support
                    </a>
                </div>
            </div>
        </div>
    );
}
