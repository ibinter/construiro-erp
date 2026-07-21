import { Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';

export default function ModuleNotIncluded({ module, planName }) {
    return (
        <AppLayout title="Module non disponible">
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
                <div className="text-6xl mb-6">🔒</div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                    Module non inclus dans votre plan
                </h1>
                <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md">
                    {planName
                        ? `Votre plan "${planName}" ne comprend pas ce module.`
                        : "Votre plan actuel ne comprend pas ce module."
                    } Passez à un plan supérieur pour y accéder.
                </p>
                <div className="flex gap-3">
                    <Link
                        href="/billing"
                        className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition"
                    >
                        Voir les plans
                    </Link>
                    <Link
                        href="/dashboard"
                        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
                    >
                        Tableau de bord
                    </Link>
                </div>
            </div>
        </AppLayout>
    );
}
