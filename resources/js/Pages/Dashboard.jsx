import AppLayout from '@/Layouts/AppLayout';
import Icon from '@/Components/Icon';
import { Head, usePage } from '@inertiajs/react';

export default function Dashboard({ stats = [] }) {
    const { auth } = usePage().props;
    const portal = auth?.portal;
    const user = auth?.user;

    return (
        <AppLayout header="Tableau de bord">
            <Head title="Tableau de bord" />

            {/* Bandeau d'accueil */}
            <div className="mb-6 rounded-xl bg-gradient-to-r from-slate-900 to-slate-700 p-6 text-white">
                <div className="flex items-center gap-2 text-orange-400">
                    <Icon name={portal?.icon} className="h-5 w-5" />
                    <span className="text-xs font-semibold uppercase tracking-wider">
                        Portail {portal?.label}
                    </span>
                </div>
                <h2 className="mt-2 text-2xl font-bold">
                    Bonjour {user?.name} 👋
                </h2>
                <p className="mt-1 text-sm text-slate-300">
                    Voici la synthèse de vos chantiers et projets.
                </p>
            </div>

            {/* Cartes KPI */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat) => (
                    <div
                        key={stat.key}
                        className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900"
                    >
                        <div className="flex items-center justify-between">
                            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100 text-orange-600 dark:bg-orange-500/10">
                                <Icon name={stat.icon} className="h-5 w-5" />
                            </span>
                            <span className="text-xs font-medium text-slate-400">
                                {stat.trend}
                            </span>
                        </div>
                        <div className="mt-3 text-2xl font-bold text-slate-800 dark:text-slate-100">
                            {stat.value}
                        </div>
                        <div className="text-sm text-slate-500">{stat.label}</div>
                    </div>
                ))}
            </div>

            {/* Zone à venir */}
            <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
                <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 lg:col-span-2">
                    <h3 className="mb-1 font-semibold text-slate-800 dark:text-slate-100">
                        Avancement des chantiers
                    </h3>
                    <p className="text-sm text-slate-500">
                        Le graphique d'avancement s'affichera ici une fois le module
                        Chantiers connecté (Phase 1).
                    </p>
                    <div className="mt-4 flex h-40 items-center justify-center rounded-lg border-2 border-dashed border-slate-200 text-slate-400 dark:border-slate-700">
                        <Icon name="bar-chart-3" className="h-8 w-8" />
                    </div>
                </div>
                <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
                    <h3 className="mb-3 font-semibold text-slate-800 dark:text-slate-100">
                        Vos rôles
                    </h3>
                    <ul className="space-y-2">
                        {(user?.roles ?? []).map((role) => (
                            <li
                                key={role}
                                className="flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                            >
                                <Icon name="shield-check" className="h-4 w-4 text-orange-500" />
                                {role}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </AppLayout>
    );
}
