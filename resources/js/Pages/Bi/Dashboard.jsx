import AppLayout from '@/Layouts/AppLayout';
import { Head } from '@inertiajs/react';
import { useTrans } from '@/i18n';
import { formatMoney, PROJECT_STATUS } from '@/constants';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    PieChart,
    Pie,
    Cell,
    ResponsiveContainer,
} from 'recharts';

/* ─── Couleurs statuts projet ─── */
const STATUS_COLORS = {
    draft:       '#94a3b8', // slate-400
    in_progress: '#f97316', // orange-500
    on_hold:     '#f59e0b', // amber-400
    completed:   '#22c55e', // green-500
    cancelled:   '#ef4444', // red-500
};

/* ─── Formateur rapide ─── */
const fmt = (v) => new Intl.NumberFormat('fr-FR').format(Math.round(v || 0)) + ' FCFA';

/* ─── Tooltip personnalisé ─── */
function MoneyTooltip({ active, payload, label }) {
    if (!active || !payload?.length) return null;
    return (
        <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-lg dark:border-slate-700 dark:bg-slate-800">
            <p className="mb-1 text-xs font-semibold text-slate-500 dark:text-slate-400">{label}</p>
            {payload.map((entry) => (
                <p key={entry.dataKey} className="text-sm font-medium" style={{ color: entry.color }}>
                    {entry.name} : {fmt(entry.value)}
                </p>
            ))}
        </div>
    );
}

/* ─── Tile KPI ─── */
function KpiTile({ label, value, sub }) {
    return (
        <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
            <div className="text-xs font-medium uppercase tracking-wide text-slate-400">{label}</div>
            <div className="mt-2 text-2xl font-bold text-slate-800 dark:text-slate-100">{value}</div>
            {sub && <div className="mt-0.5 text-sm text-slate-500">{sub}</div>}
        </div>
    );
}

/* ─── Composant principal ─── */
export default function BiDashboard({
    caByMonth = [],
    depensesByMonth = [],
    projetsByStatus = [],
    projetsAvancement = [],
    kpis = {},
}) {
    const { t } = useTrans();

    /* Fusionner CA + Dépenses par mois pour le BarChart */
    const allMonths = [...new Set([
        ...caByMonth.map((r) => r.month),
        ...depensesByMonth.map((r) => r.month),
    ])].sort();

    const barData = allMonths.map((month) => ({
        month,
        ca:       caByMonth.find((r) => r.month === month)?.total ?? 0,
        depenses: depensesByMonth.find((r) => r.month === month)?.total ?? 0,
    }));

    /* Formatter l'axe X : '2025-08' → 'Août 25' */
    const shortMonth = (m) => {
        const [y, mo] = m.split('-');
        const d = new Date(Number(y), Number(mo) - 1, 1);
        return d.toLocaleDateString('fr-FR', { month: 'short', year: '2-digit' });
    };

    /* Pie data */
    const pieData = projetsByStatus.map((r) => ({
        name:  PROJECT_STATUS[r.status]?.label ?? r.status,
        value: r.count,
        color: STATUS_COLORS[r.status] ?? '#94a3b8',
    }));

    /* Top 10 projets pour l'avancement */
    const top10 = projetsAvancement.slice(0, 10);

    return (
        <AppLayout header={t('Tableau de bord BI')}>
            <Head title={t('Tableau de bord BI')} />

            {/* ── KPI tiles ── */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <KpiTile
                    label={t('CA Total')}
                    value={formatMoney(kpis.ca_total)}
                />
                <KpiTile
                    label={t('CA Encaissé')}
                    value={formatMoney(kpis.ca_encaisse)}
                />
                <KpiTile
                    label={t('Dépenses')}
                    value={formatMoney(kpis.depenses_total)}
                />
                <KpiTile
                    label={t('Projets actifs')}
                    value={kpis.projets_actifs ?? 0}
                    sub={
                        kpis.factures_impayees
                            ? `${kpis.factures_impayees} ${t('facture(s) impayée(s)')}`
                            : undefined
                    }
                />
            </div>

            {/* ── Graphiques ligne 1 : CA vs Dépenses + Donut statuts ── */}
            <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">

                {/* Bar chart CA vs Dépenses */}
                <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
                    <h3 className="mb-4 font-semibold text-slate-800 dark:text-slate-100">
                        {t('CA vs Dépenses (12 mois)')}
                    </h3>
                    <ResponsiveContainer width="100%" height={260}>
                        <BarChart data={barData} barGap={4} barCategoryGap="30%">
                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                            <XAxis
                                dataKey="month"
                                tickFormatter={shortMonth}
                                tick={{ fontSize: 11, fill: '#94a3b8' }}
                                axisLine={false}
                                tickLine={false}
                            />
                            <YAxis
                                tickFormatter={(v) =>
                                    v >= 1_000_000
                                        ? `${(v / 1_000_000).toFixed(1)}M`
                                        : v >= 1_000
                                        ? `${(v / 1_000).toFixed(0)}k`
                                        : v
                                }
                                tick={{ fontSize: 11, fill: '#94a3b8' }}
                                axisLine={false}
                                tickLine={false}
                            />
                            <Tooltip content={<MoneyTooltip />} />
                            <Legend
                                formatter={(value) => (
                                    <span className="text-xs text-slate-600 dark:text-slate-400">
                                        {value === 'ca' ? t('Chiffre d\'affaires') : t('Dépenses')}
                                    </span>
                                )}
                            />
                            <Bar dataKey="ca"       name={t('Chiffre d\'affaires')} fill="#f97316" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="depenses" name={t('Dépenses')}            fill="#94a3b8" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Donut répartition par statut */}
                <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
                    <h3 className="mb-4 font-semibold text-slate-800 dark:text-slate-100">
                        {t('Répartition projets par statut')}
                    </h3>
                    {pieData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={260}>
                            <PieChart>
                                <Pie
                                    data={pieData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={70}
                                    outerRadius={110}
                                    paddingAngle={3}
                                    dataKey="value"
                                    label={({ name, value }) => `${name} (${value})`}
                                    labelLine={false}
                                >
                                    {pieData.map((entry, i) => (
                                        <Cell key={i} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    formatter={(value, name) => [value, name]}
                                />
                                <Legend
                                    formatter={(value) => (
                                        <span className="text-xs text-slate-600 dark:text-slate-400">{value}</span>
                                    )}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="flex h-[260px] items-center justify-center text-sm text-slate-400">
                            {t('Aucune donnée disponible.')}
                        </div>
                    )}
                </div>
            </div>

            {/* ── Avancement des projets (barres horizontales) ── */}
            <div className="mt-6 rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
                <h3 className="mb-4 font-semibold text-slate-800 dark:text-slate-100">
                    {t('Avancement des projets actifs')}
                </h3>
                {top10.length > 0 ? (
                    <ul className="space-y-3">
                        {top10.map((projet) => {
                            const pct = Math.min(100, Math.max(0, Number(projet.progress) || 0));
                            return (
                                <li key={projet.id}>
                                    <div className="mb-1 flex items-center justify-between">
                                        <span className="max-w-[70%] truncate text-sm font-medium text-slate-700 dark:text-slate-200">
                                            {projet.name}
                                        </span>
                                        <span className="text-xs font-semibold text-orange-500">
                                            {pct} %
                                        </span>
                                    </div>
                                    <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                                        <div
                                            className="h-full rounded-full bg-orange-500 transition-all duration-500"
                                            style={{ width: `${pct}%` }}
                                        />
                                    </div>
                                    <div className="mt-0.5 text-xs text-slate-400">
                                        {t('Budget')} : {formatMoney(projet.budget_amount, projet.currency)}
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                ) : (
                    <p className="py-8 text-center text-sm text-slate-400">
                        {t('Aucun projet actif à afficher.')}
                    </p>
                )}
            </div>
        </AppLayout>
    );
}
