import AppLayout from '@/Layouts/AppLayout';
import Icon from '@/Components/Icon';
import GuidedTour from '@/Components/GuidedTour';
import { Head, Link, usePage } from '@inertiajs/react';
import { PROJECT_STATUS, formatMoney } from '@/constants';
import { useTrans } from '@/i18n';

export default function Dashboard({ stats = [], recentProjects = [], isFirstLogin = false }) {
    const { auth } = usePage().props;
    const { t } = useTrans();
    const portal = auth?.portal;
    const user = auth?.user;

    return (
        <AppLayout header="Tableau de bord">
            <Head title={t('Tableau de bord')} />
            <GuidedTour autoStart={isFirstLogin} />

            {/* Bandeau d'accueil */}
            <div className="mb-6 rounded-xl bg-gradient-to-r from-slate-900 to-slate-700 p-6 text-white">
                <div className="flex items-center gap-2 text-orange-400">
                    <Icon name={portal?.icon} className="h-5 w-5" />
                    <span className="text-xs font-semibold uppercase tracking-wider">
                        Portail {portal?.label}
                    </span>
                </div>
                <h2 className="mt-2 text-2xl font-bold">
                    {t('Bonjour')} {user?.name} 👋
                </h2>
                <p className="mt-1 text-sm text-slate-300">
                    {t('Voici la synthèse de vos chantiers et projets.')}
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

            {/* Projets récents + rôles */}
            <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
                <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 lg:col-span-2">
                    <div className="mb-3 flex items-center justify-between">
                        <h3 className="font-semibold text-slate-800 dark:text-slate-100">
                            {t('Projets récents')}
                        </h3>
                        <Link href="/projects" className="text-sm font-medium text-orange-600 hover:underline">
                            {t('Voir tout')}
                        </Link>
                    </div>
                    <ul className="divide-y divide-slate-100 dark:divide-slate-800">
                        {recentProjects.map((project) => {
                            const s = PROJECT_STATUS[project.status] ?? { label: project.status, color: 'bg-slate-100 text-slate-600' };
                            return (
                                <li key={project.id} className="flex items-center justify-between py-3">
                                    <div className="min-w-0">
                                        <Link href={`/projects/${project.id}`} className="font-medium text-slate-700 hover:text-orange-600 dark:text-slate-200">
                                            {project.name}
                                        </Link>
                                        <div className="text-xs text-slate-400">
                                            {project.code} · {formatMoney(project.budget_amount, project.currency)}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="hidden h-1.5 w-20 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700 sm:block">
                                            <div className="h-full rounded-full bg-orange-500" style={{ width: `${project.progress}%` }} />
                                        </div>
                                        <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${s.color}`}>
                                            {t(s.label)}
                                        </span>
                                    </div>
                                </li>
                            );
                        })}
                        {recentProjects.length === 0 && (
                            <li className="py-8 text-center text-sm text-slate-400">
                                {t('Aucun projet pour le moment.')}
                            </li>
                        )}
                    </ul>
                </div>
                <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
                    <h3 className="mb-3 font-semibold text-slate-800 dark:text-slate-100">
                        {t('Vos rôles')}
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
