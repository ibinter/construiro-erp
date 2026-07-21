import AppLayout from '@/Layouts/AppLayout';
import Icon from '@/Components/Icon';
import GuidedTour from '@/Components/GuidedTour';
import { Head, Link, usePage } from '@inertiajs/react';
import { PROJECT_STATUS, formatMoney } from '@/constants';
import { useTrans } from '@/i18n';

// ── Correspondance couleur → classes Tailwind ────────────────────────────────
const COLOR_MAP = {
    emerald: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/10',
    red:     'bg-red-100 text-red-600 dark:bg-red-500/10',
    orange:  'bg-orange-100 text-orange-600 dark:bg-orange-500/10',
    blue:    'bg-blue-100 text-blue-600 dark:bg-blue-500/10',
    amber:   'bg-amber-100 text-amber-600 dark:bg-amber-500/10',
    violet:  'bg-violet-100 text-violet-600 dark:bg-violet-500/10',
    slate:   'bg-slate-100 text-slate-500 dark:bg-slate-700',
};

// ── Mini graphique SVG inline ────────────────────────────────────────────────
function BarChart({ data = [] }) {
    if (!data.length) return null;

    const W = 280, H = 80, PADDING = { left: 4, right: 4, top: 8, bottom: 20 };
    const innerW = W - PADDING.left - PADDING.right;
    const innerH = H - PADDING.top - PADDING.bottom;
    const maxVal = Math.max(...data.map((d) => d.value), 1);
    const barW = innerW / data.length;

    return (
        <svg
            viewBox={`0 0 ${W} ${H}`}
            className="w-full"
            aria-label="CA des 6 derniers mois"
        >
            {data.map((d, i) => {
                const barH = Math.max(2, (d.value / maxVal) * innerH);
                const x = PADDING.left + i * barW + barW * 0.15;
                const y = PADDING.top + innerH - barH;
                const w = barW * 0.7;
                return (
                    <g key={i}>
                        <rect
                            x={x}
                            y={y}
                            width={w}
                            height={barH}
                            rx={2}
                            className="fill-orange-500 opacity-80 hover:opacity-100 transition-opacity"
                        />
                        <text
                            x={x + w / 2}
                            y={H - 4}
                            textAnchor="middle"
                            fontSize={9}
                            className="fill-slate-400"
                        >
                            {d.label}
                        </text>
                    </g>
                );
            })}
        </svg>
    );
}

// ── Barre de progression budget ───────────────────────────────────────────────
function BudgetBar({ pct = 0 }) {
    const color = pct >= 90 ? 'bg-red-500' : pct >= 70 ? 'bg-amber-500' : 'bg-emerald-500';
    return (
        <div className="flex items-center gap-2">
            <div className="h-1.5 w-24 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
            </div>
            <span className="text-xs text-slate-400">{pct}%</span>
        </div>
    );
}

// ── Page principale ───────────────────────────────────────────────────────────
export default function Dashboard({
    kpis = [],
    chartData = [],
    projectsBudget = [],
    overdueAlert = 0,
    isFirstLogin = false,
    // Compatibilité ascendante
    stats = [],
    recentProjects = [],
}) {
    const { auth } = usePage().props;
    const { t } = useTrans();
    const portal = auth?.portal;
    const user   = auth?.user;

    // Priorité aux nouvelles props, repli sur les anciennes.
    const displayKpis     = kpis.length     ? kpis     : stats;
    const displayProjects = projectsBudget.length ? projectsBudget : recentProjects;

    return (
        <AppLayout header="Tableau de bord">
            <Head title={t('Tableau de bord')} />
            <GuidedTour autoStart={isFirstLogin} />

            {/* ── Bandeau d'accueil ─────────────────────────────────────── */}
            <div className="mb-6 rounded-xl bg-gradient-to-r from-slate-900 to-slate-700 p-6 text-white">
                <div className="flex items-center gap-2 text-orange-400">
                    <Icon name={portal?.icon} className="h-5 w-5" />
                    <span className="text-xs font-semibold uppercase tracking-wider">
                        Portail {portal?.label}
                    </span>
                </div>
                <h2 className="mt-2 text-2xl font-bold">
                    {t('Bonjour')} {user?.name}
                </h2>
                <p className="mt-1 text-sm text-slate-300">
                    {t('Voici la synthèse de vos chantiers et projets.')}
                </p>
            </div>

            {/* ── Alerte factures en retard ─────────────────────────────── */}
            {overdueAlert > 0 && (
                <div className="mb-4 flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 dark:border-red-800/50 dark:bg-red-950/30">
                    <Icon name="alert-triangle" className="h-5 w-5 shrink-0 text-red-500" />
                    <p className="text-sm font-medium text-red-700 dark:text-red-400">
                        {overdueAlert} facture{overdueAlert > 1 ? 's' : ''} en retard de paiement depuis plus de 30 jours.{' '}
                        <Link href="/invoices" className="underline hover:no-underline">
                            {t('Voir les factures')}
                        </Link>
                    </p>
                </div>
            )}

            {/* ── 6 KPI cards ───────────────────────────────────────────── */}
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
                {displayKpis.map((kpi) => {
                    const iconBg = COLOR_MAP[kpi.color] ?? COLOR_MAP.slate;
                    return (
                        <div
                            key={kpi.key}
                            className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"
                        >
                            <span className={`inline-flex h-9 w-9 items-center justify-center rounded-lg ${iconBg}`}>
                                <Icon name={kpi.icon} className="h-4 w-4" />
                            </span>
                            <div className="mt-3 text-xl font-bold leading-tight text-slate-800 dark:text-slate-100">
                                {kpi.value}
                            </div>
                            <div className="mt-0.5 text-xs font-medium text-slate-600 dark:text-slate-400">
                                {t(kpi.label)}
                            </div>
                            {kpi.trend && (
                                <div className="mt-1 text-xs text-slate-400">{kpi.trend}</div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* ── Graphique CA 6 mois + projets budget ─────────────────── */}
            <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">

                {/* Graphique en barres */}
                <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
                    <div className="mb-3 flex items-center justify-between">
                        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                            {t('CA — 6 derniers mois')}
                        </h3>
                        <Link
                            href="/invoices"
                            className="text-xs font-medium text-orange-600 hover:underline"
                        >
                            {t('Toutes les factures')}
                        </Link>
                    </div>
                    {chartData.length ? (
                        <BarChart data={chartData} />
                    ) : (
                        <p className="py-6 text-center text-xs text-slate-400">
                            {t('Aucune donnée disponible.')}
                        </p>
                    )}
                    {chartData.length > 0 && (
                        <p className="mt-1 text-center text-xs text-slate-400">
                            {t('Montants hors draft et annulées')}
                        </p>
                    )}
                </div>

                {/* Projets avec barre de progression budget */}
                <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 lg:col-span-2">
                    <div className="mb-3 flex items-center justify-between">
                        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                            {t('Projets — consommation budgétaire')}
                        </h3>
                        <Link
                            href="/projects"
                            className="text-xs font-medium text-orange-600 hover:underline"
                        >
                            {t('Voir tout')}
                        </Link>
                    </div>

                    <ul className="divide-y divide-slate-100 dark:divide-slate-800">
                        {displayProjects.map((project) => {
                            const statusKey = project.status ?? '';
                            const s = PROJECT_STATUS[statusKey] ?? { label: statusKey, color: 'bg-slate-100 text-slate-600' };
                            const pct = project.budget_pct ?? project.progress ?? 0;
                            return (
                                <li key={project.id} className="flex items-center gap-3 py-2.5">
                                    <div className="min-w-0 flex-1">
                                        <Link
                                            href={`/projects/${project.id}`}
                                            className="block truncate text-sm font-medium text-slate-700 hover:text-orange-600 dark:text-slate-200"
                                        >
                                            {project.name}
                                        </Link>
                                        <div className="mt-0.5 flex items-center gap-2">
                                            <BudgetBar pct={pct} />
                                            {'budget' in project && project.budget > 0 ? (
                                                <span className="text-xs text-slate-400">
                                                    {formatMoney(project.spent ?? 0, project.currency)} /&nbsp;
                                                    {formatMoney(project.budget, project.currency)}
                                                </span>
                                            ) : (
                                                <span className="text-xs text-slate-400">
                                                    {formatMoney(project.budget_amount ?? 0, project.currency)}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <span className={`shrink-0 inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${s.color}`}>
                                        {t(s.label)}
                                    </span>
                                </li>
                            );
                        })}
                        {displayProjects.length === 0 && (
                            <li className="py-8 text-center text-sm text-slate-400">
                                {t('Aucun projet actif pour le moment.')}
                            </li>
                        )}
                    </ul>
                </div>
            </div>

            {/* ── Rôles utilisateur ─────────────────────────────────────── */}
            <div className="mt-4">
                <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
                    <h3 className="mb-3 text-sm font-semibold text-slate-700 dark:text-slate-200">
                        {t('Vos rôles')}
                    </h3>
                    <div className="flex flex-wrap gap-2">
                        {(user?.roles ?? []).map((role) => (
                            <span
                                key={role}
                                className="flex items-center gap-1.5 rounded-lg bg-slate-50 px-3 py-1.5 text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                            >
                                <Icon name="shield-check" className="h-3.5 w-3.5 text-orange-500" />
                                {role}
                            </span>
                        ))}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
