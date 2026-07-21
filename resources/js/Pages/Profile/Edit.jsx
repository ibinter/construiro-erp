import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import DeleteUserForm from './Partials/DeleteUserForm';
import UpdatePasswordForm from './Partials/UpdatePasswordForm';
import UpdateProfileInformationForm from './Partials/UpdateProfileInformationForm';

const BRAND = '#F58220';

function TwoFactorSection({ twoFactorEnabled }) {
    return (
        <section>
            <header>
                <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                    Authentification à deux facteurs
                </h2>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                    Ajoutez une couche de sécurité supplémentaire à votre compte en activant le 2FA.
                </p>
            </header>

            <div className="mt-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    {twoFactorEnabled ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                            Activé
                        </span>
                    ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400">
                            <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                            Non activé
                        </span>
                    )}
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                        {twoFactorEnabled
                            ? 'Votre compte est protégé par le 2FA.'
                            : 'Votre compte n\'est pas encore protégé par le 2FA.'}
                    </span>
                </div>

                <Link
                    href={route('two-factor.show')}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white transition hover:opacity-90"
                    style={{ background: BRAND }}>
                    {twoFactorEnabled ? 'Gérer le 2FA' : 'Activer le 2FA'}
                </Link>
            </div>
        </section>
    );
}

export default function Edit({ mustVerifyEmail, status, twoFactorEnabled }) {
    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
                    Profil
                </h2>
            }
        >
            <Head title="Profil" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl space-y-6 sm:px-6 lg:px-8">
                    <div className="bg-white p-4 shadow sm:rounded-lg sm:p-8 dark:bg-gray-800">
                        <UpdateProfileInformationForm
                            mustVerifyEmail={mustVerifyEmail}
                            status={status}
                            className="max-w-xl"
                        />
                    </div>

                    <div className="bg-white p-4 shadow sm:rounded-lg sm:p-8 dark:bg-gray-800">
                        <UpdatePasswordForm className="max-w-xl" />
                    </div>

                    <div className="bg-white p-4 shadow sm:rounded-lg sm:p-8 dark:bg-gray-800">
                        <TwoFactorSection twoFactorEnabled={twoFactorEnabled ?? false} />
                    </div>

                    <div className="bg-white p-4 shadow sm:rounded-lg sm:p-8 dark:bg-gray-800">
                        <DeleteUserForm className="max-w-xl" />
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
