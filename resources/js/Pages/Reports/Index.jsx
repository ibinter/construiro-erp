import AppLayout from '@/Layouts/AppLayout';
import Icon from '@/Components/Icon';
import { Head } from '@inertiajs/react';
import { PROJECT_STATUS, SITE_STATUS, formatMoney } from '@/constants';

// Palette des statuts pour les graphiques SVG (couleurs hex, pas de dépendance).
const STATUS_COLORS = {
    draft:       '#94a3b8', // slate-400
    in_progress: '#3b82f6', // blue-500
    on_hold:     '#f59e0b', // amber-500
    completed:   '#22c55e', // green-500
    cancelled:   '#ef4444', // red-500
    preparation: '#94a3b8',
    suspended:   '#f59e0b',
};

const statusLabel = (status) =>
    PROJECT_STATUS[status]?.label ?? SITE_STATUS[status]?.label ?? status;

/* ------------------------------------------------------------------ */
/*  Donut SVG fait main — répartition par statut                       */
/* ------------------------------------------------------------------ */
function DonutChart({ data, title }) {
    const total = data.reduce((sum, d) => sum + d.total, 0);
    const size = 180;
    const stroke = 26;
    const radius = (size - stroke) / 2;
    const circumference = 2 * Math.PI * radius;

    let offset = 0;
    const segments = data
        .filter((d) => d.total > 0)
        .map((d) => {
            const fraction = total > 0 ? d.total / total : 0;
            const seg = {
                status: d.status,
                color: STATUS_COLORS[d.status] ?? '#cbd5e1',
                dash: fraction * circumference,
                offset,
            };
            offset += fraction * circumference;
            return seg;
        });

    return (
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-center">
            <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="shrink-0">
                <g transform={`rotate(-90 ${size / 2} ${size / 2})`}>
                    <circle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={stroke}
                        className="text-slate-100 dark:text-slate-800"
                    />
                    {segments.map((s) => (
                        <circle
                            key={s.status}
                            cx={size / 2}
                            cy={size / 2}
                            r={radius}
                            fill="none"
                            stroke={s.color}
                            strokeWidth={stroke}
                            strokeDasharray={`${s.dash} ${circumference - s.dash}`}
                            strokeDashoffset={-s.offset}
                        />
                    ))}
                </g>
                <text
                    x="50%"
                    y="47%"
                    textAnchor="middle"
                    className="fill-slate-800 text-2xl font-bold dark:fill-slate-100"
                >
                    {total}
                </text>
                <text
                    x="50%"
                    y="60%"
                    textAnchor="middle"
                    className="fill-slate-400 text-[10px] uppercase tracking-wide"
                >
                    {title}
                </text>
            </svg>

            {/* Légende */}
            <ul className="w-full space-y-1.5">
                {data.map((d) => (
                    <li key={d.status} className="flex items-center justify-between text-sm">
                        <span className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                            <span
                                className="inline-block h-3 w-3 rounded-sm"
                                style={{ backgroundColor: STATUS_COLORS[d.status] ?? '#cbd5e1' }}
                            />
                            {statusLabel(d.status)}
                        </span>
                        <span className="font-semibold text-slate-700 dark:text-slate-200">
                            {d.total}
                        </span>
                    </li>
                ))}
            </ul>
        </div>
    );
}

/* ------------------------------------------------------------------ */
/*  Barres horizontales SVG — top projets par budget                   */
/* ------------------------------------------------------------------ */
function BudgetBars({ projects, currency }) {
    if (!projects.length) {
        return (
            <p className="py-8 text-center text-sm text-slate-400">
                Aucun projet à afficher.
            </p>
        );
    }

    const max = Math.max(...projects.map((p) => p.budget_amount), 1);
    const rowH = 44;
    const height = projects.length * rowH;
    const labelW = 120;
    const width = 520;
    const barMax = width - labelW - 8;

    return (
        <svg
            viewBox={`0 0 ${width} ${height}`}
            className="w-full"
            style={{ minHeight: height }}
            preserveAspectRatio="xMinYMin meet"
        >
            {projects.map((p, i) => {
                const w = Math.max((p.budget_amount / max) * barMax, 2);
                const y = i * rowH;
                const color = STATUS_COLORS[p.status] ?? '#f97316';
                return (
                    <g key={p.id} transform={`translate(0 ${y})`}>
                        <text
                            x="0"
                            y={rowH / 2}
                            dominantBaseline="middle"
                            className="fill-slate-600 text-[11px] dark:fill-slate-300"
                        >
                            {(p.code || p.name).slice(0, 16)}
                        </text>
                        <rect
                            x={labelW}
                            y={rowH / 2 - 11}
                            width={barMax}
                            height={22}
                            rx={5}
                            className="fill-slate-100 dark:fill-slate-800"
                        />
                        <rect
                            x={labelW}
                            y={rowH / 2 - 11}
                            width={w}
                            height={22}
                            rx={5}
                            fill="#f97316"
                        />
                        <text
                            x={labelW + Math.min(w + 8, barMax)}
                            y={rowH / 2}
                            dominantBaseline="middle"
                            textAnchor={w > barMax - 90 ? 'end' : 'start'}
                            className="fill-slate-700 text-[10px] font-semibold dark:fill-slate-200"
                        >
                            {formatMoney(p.budget_amount, p.currency || currency)}
                        </text>
                        {/* Point de couleur du statut */}
                        <circle cx={labelW - 6} cy={rowH / 2} r={3} fill={color} />
                    </g>
                );
            })}
        </svg>
    );
}

/* ------------------------------------------------------------------ */
/*  Barres verticales SVG — finances                                   */
/* ------------------------------------------------------------------ */
function FinanceBars({ finance, currency }) {
    const bars = [];
    if (finance.has_invoices) {
        bars.push({ label: 'Facturé', value: finance.invoiced, color: '#3b82f6' });
        bars.push({ label: 'Encaissé', value: finance.collected, color: '#22c55e' });
        bars.push({ label: 'À recouvrer', value: finance.outstanding, color: '#f59e0b' });
    }
    if (finance.has_purchases) {
        bars.push({ label: 'Achats', value: finance.purchases, color: '#ef4444' });
    }

    if (!bars.length) {
        return (
            <p className="py-8 text-center text-sm text-slate-400">
                Modules financiers non disponibles.
            </p>
        );
    }

    const max = Math.max(...bars.map((b) => b.value), 1);
    const width = 520;
    const height = 220;
    const padBottom = 40;
    const padTop = 10;
    const chartH = height - padBottom - padTop;
    const slot = width / bars.length;
    const barW = Math.min(slot * 0.5, 70);

    return (
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full" preserveAspectRatio="xMinYMin meet">
            {/* Ligne de base */}
            <line
                x1="0"
                y1={height - padBottom}
                x2={width}
                y2={height - padBottom}
                className="stroke-slate-200 dark:stroke-slate-700"
                strokeWidth="1"
            />
            {bars.map((b, i) => {
                const h = (b.value / max) * chartH;
                const x = i * slot + (slot - barW) / 2;
                const y = height - padBottom - h;
                return (
                    <g key={b.label}>
                        <rect x={x} y={y} width={barW} height={h} rx={5} fill={b.color} />
                        <text
                            x={x + barW / 2}
                            y={y - 5}
                            textAnchor="middle"
                            className="fill-slate-600 text-[10px] font-semibold dark:fill-slate-300"
                        >
                            {formatMoney(b.value, currency)}
                        </text>
                        <text
                            x={x + barW / 2}
                            y={height - padBottom + 16}
                            textAnchor="middle"
                            className="fill-slate-500 text-[11px] dark:fill-slate-400"
                        >
                            {b.label}
                        </text>
                    </g>
                );
            })}
        </svg>
    );
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */
export default function ReportsIndex({
    currency = 'XOF',
    kpis = [],
    projectsByStatus = [],
    sitesByStatus = [],
    topProjects = [],
    totals = {},
    finance = {},
    hr = {},
}) {
    const handlePrint = () => window.print();

    return (
        <AppLayout header="Rapports & BI">
            <Head title="Rapports & BI" />

            {/* En-tête + actions */}
            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h2 className="flex items-center gap-2 text-xl font-bold text-slate-800 dark:text-slate-100">
                        <Icon name="bar-chart-3" className="h-6 w-6 text-orange-500" />
                        Tableau de bord analytique
                    </h2>
                    <p className="mt-1 text-sm text-slate-500">
                        Synthèse transverse de l'activité de l'entreprise.
                    </p>
                </div>
                <div className="flex gap-2 print:hidden">
                    <button
                        onClick={handlePrint}
                        className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
                    >
                        <Icon name="printer" className="h-4 w-4" />
                        Imprimer
                    </button>
                    <button
                        onClick={handlePrint}
                        className="inline-flex items-center gap-2 rounded-lg bg-orange-500 px-4 py-2 text-sm font-medium text-white hover:bg-orange-600"
                    >
                        <Icon name="download" className="h-4 w-4" />
                        Exporter
                    </button>
                </div>
            </div>

            {/* Cartes KPI */}
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                {kpis.map((kpi) => (
                    <div
                        key={kpi.key}
                        className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900"
                    >
                        <div className="flex items-center justify-between">
                            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100 text-orange-600 dark:bg-orange-500/10">
                                <Icon name={kpi.icon} className="h-5 w-5" />
                            </span>
                            <span className="text-xs font-medium text-slate-400">{kpi.hint}</span>
                        </div>
                        <div className="mt-3 text-2xl font-bold text-slate-800 dark:text-slate-100">
                            {kpi.value}
                        </div>
                        <div className="text-sm text-slate-500">{kpi.label}</div>
                    </div>
                ))}
            </div>

            {/* Répartitions par statut (donuts) */}
            <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
                <section className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
                    <h3 className="mb-4 font-semibold text-slate-800 dark:text-slate-100">
                        Projets par statut
                    </h3>
                    <DonutChart data={projectsByStatus} title="Projets" />
                </section>

                <section className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
                    <h3 className="mb-4 font-semibold text-slate-800 dark:text-slate-100">
                        Chantiers par statut
                    </h3>
                    <DonutChart data={sitesByStatus} title="Chantiers" />
                </section>
            </div>

            {/* Budget par projet + Finances */}
            <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
                <section className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
                    <div className="mb-4 flex items-center justify-between">
                        <h3 className="font-semibold text-slate-800 dark:text-slate-100">
                            Top 5 projets par budget
                        </h3>
                        <span className="text-xs text-slate-400">
                            Total : {formatMoney(totals.totalBudget, currency)}
                        </span>
                    </div>
                    <BudgetBars projects={topProjects} currency={currency} />
                </section>

                <section className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
                    <h3 className="mb-4 font-semibold text-slate-800 dark:text-slate-100">
                        Finances
                    </h3>
                    <FinanceBars finance={finance} currency={currency} />
                    {hr.available && (
                        <div className="mt-4 flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                            <Icon name="users" className="h-4 w-4 text-orange-500" />
                            Effectif actif : <strong>{hr.headcount}</strong> employé(s)
                        </div>
                    )}
                </section>
            </div>
        </AppLayout>
    );
}
