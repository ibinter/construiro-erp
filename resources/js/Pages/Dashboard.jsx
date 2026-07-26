import AppLayout from '@/Layouts/AppLayout';
import Icon from '@/Components/Icon';
import GuidedTour from '@/Components/GuidedTour';
import { Head, Link, usePage } from '@inertiajs/react';
import { PROJECT_STATUS, formatMoney } from '@/constants';
import { useTrans } from '@/i18n';

// ─── Couleur par statut de KPI ────────────────────────────────────────────────
const KPI_CFG = {
    emerald: { border: '#10b981', icon: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400' },
    red:     { border: '#ef4444', icon: 'bg-red-100 text-red-600 dark:bg-red-500/15 dark:text-red-400' },
    orange:  { border: '#f97316', icon: 'bg-orange-100 text-orange-600 dark:bg-orange-500/15 dark:text-orange-400' },
    blue:    { border: '#3b82f6', icon: 'bg-blue-100 text-blue-600 dark:bg-blue-500/15 dark:text-blue-400' },
    amber:   { border: '#f59e0b', icon: 'bg-amber-100 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400' },
    violet:  { border: '#8b5cf6', icon: 'bg-violet-100 text-violet-600 dark:bg-violet-500/15 dark:text-violet-400' },
    slate:   { border: '#94a3b8', icon: 'bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400' },
};

const INV_STATUS = {
    paid:      { label: 'Payées',     color: '#10b981' },
    sent:      { label: 'Envoyées',   color: '#3b82f6' },
    partial:   { label: 'Partielles', color: '#f59e0b' },
    overdue:   { label: 'En retard',  color: '#ef4444' },
    draft:     { label: 'Brouillons', color: '#94a3b8' },
    cancelled: { label: 'Annulées',   color: '#cbd5e1' },
};

const INV_BADGE = {
    paid:      'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400',
    sent:      'bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400',
    partial:   'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400',
    overdue:   'bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-400',
    draft:     'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400',
    cancelled: 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-500',
};

const INV_LABEL = {
    paid: 'Payée', sent: 'Envoyée', partial: 'Partielle',
    overdue: 'En retard', draft: 'Brouillon', cancelled: 'Annulée',
};

// ─── Utilitaire numérique ─────────────────────────────────────────────────────
function shortNum(v) {
    if (v >= 1e9) return (v / 1e9).toFixed(1).replace('.', ',') + ' Md';
    if (v >= 1e6) return (v / 1e6).toFixed(1).replace('.', ',') + ' M';
    if (v >= 1e3) return Math.round(v / 1e3) + ' k';
    return Math.round(v).toString();
}

// ─── Graphique courbe + aire (CA vs Dépenses 6 mois) ─────────────────────────
function AreaChart({ caData = [], expenseData = [] }) {
    const W = 440, H = 180;
    const P = { top: 20, right: 16, bottom: 34, left: 52 };
    const iW = W - P.left - P.right;
    const iH = H - P.top - P.bottom;

    const allVals = [...caData.map(d => d.value), ...expenseData.map(d => d.value), 1];
    const maxVal  = Math.max(...allVals);

    const xOf = (i) => P.left + (caData.length > 1 ? (i / (caData.length - 1)) * iW : iW / 2);
    const yOf = (v) => P.top + iH - (v / maxVal) * iH;

    function smooth(pts) {
        if (!pts.length) return '';
        let d = 'M ' + pts[0].x + ' ' + pts[0].y;
        for (let i = 1; i < pts.length; i++) {
            const dx = (pts[i].x - pts[i - 1].x) / 3;
            d += ' C ' + (pts[i-1].x + dx) + ' ' + pts[i-1].y
               + ', ' + (pts[i].x - dx)    + ' ' + pts[i].y
               + ', ' + pts[i].x + ' ' + pts[i].y;
        }
        return d;
    }

    const caPts  = caData.map((d, i) => ({ x: xOf(i), y: yOf(d.value) }));
    const expPts = expenseData.map((d, i) => ({ x: xOf(i), y: yOf(d.value) }));

    const caLine  = smooth(caPts);
    const expLine = smooth(expPts);
    const bot     = P.top + iH;
    const caArea  = caPts.length  ? caLine  + ' L ' + caPts[caPts.length-1].x   + ' ' + bot + ' L ' + P.left + ' ' + bot + ' Z' : '';
    const expArea = expPts.length ? expLine + ' L ' + expPts[expPts.length-1].x  + ' ' + bot + ' L ' + P.left + ' ' + bot + ' Z' : '';

    const hasExp = expenseData.some(d => d.value > 0);
    const yTicks = [0, 0.5, 1].map(f => ({ yPos: P.top + iH * (1 - f), v: maxVal * f }));

    return (
        <svg viewBox={'0 0 ' + W + ' ' + H} className="w-full" style={{ overflow: 'visible' }}>
            <defs>
                <linearGradient id="caGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%"   stopColor="#f97316" stopOpacity="0.28" />
                    <stop offset="100%" stopColor="#f97316" stopOpacity="0.02" />
                </linearGradient>
                <linearGradient id="expGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%"   stopColor="#8b5cf6" stopOpacity="0.18" />
                    <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.02" />
                </linearGradient>
            </defs>

            {yTicks.map((tick, i) => (
                <g key={i}>
                    <line x1={P.left} y1={tick.yPos} x2={P.left + iW} y2={tick.yPos}
                        stroke="currentColor" strokeOpacity="0.07" strokeWidth="1" />
                    <text x={P.left - 6} y={tick.yPos + 3.5} textAnchor="end"
                        fontSize={8.5} fill="currentColor" fillOpacity="0.45">
                        {shortNum(tick.v)}
                    </text>
                </g>
            ))}

            {hasExp && (
                <>
                    <path d={expArea} fill="url(#expGrad)" />
                    <path d={expLine} fill="none" stroke="#8b5cf6" strokeWidth="1.5"
                        strokeDasharray="4 2.5" strokeLinecap="round" />
                </>
            )}

            <path d={caArea} fill="url(#caGrad)" />
            <path d={caLine} fill="none" stroke="#f97316" strokeWidth="2"
                strokeLinecap="round" strokeLinejoin="round" />

            {caPts.map((pt, i) => (
                <g key={i}>
                    <circle cx={pt.x} cy={pt.y} r={4.5} fill="#f97316" fillOpacity="0.15" />
                    <circle cx={pt.x} cy={pt.y} r={2.5} fill="#f97316" />
                    <title>{(caData[i] || {}).label} : {shortNum((caData[i] || {}).value || 0)}</title>
                </g>
            ))}

            {caData.map((d, i) => (
                <text key={i} x={xOf(i)} y={H - 5} textAnchor="middle"
                    fontSize={9} fill="currentColor" fillOpacity="0.5">
                    {d.label}
                </text>
            ))}
        </svg>
    );
}

// ─── Donut — répartition des factures ────────────────────────────────────────
function DonutChart({ invoiceStats = {} }) {
    const R = 48, cx = 66, cy = 66, sw = 13;
    const KEYS = ['paid', 'sent', 'partial', 'overdue'];

    const segs = KEYS
        .map(k => ({ k, count: 0, amount: 0, ...(invoiceStats[k] || {}), ...(INV_STATUS[k] || {}) }))
        .filter(s => s.count > 0);

    const total = segs.reduce((s, x) => s + x.count, 0);

    if (!total) {
        return (
            <div className="flex h-32 items-center justify-center text-sm text-slate-400">
                Aucune facture
            </div>
        );
    }

    function pxy(angle, r) {
        const rad = ((angle - 90) * Math.PI) / 180;
        return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
    }

    function arc(a1, a2, r) {
        const s = pxy(a1, r), e = pxy(a2, r);
        const large = (a2 - a1) > 180 ? 1 : 0;
        return 'M ' + s.x + ' ' + s.y + ' A ' + r + ' ' + r + ' 0 ' + large + ' 1 ' + e.x + ' ' + e.y;
    }

    let cur = 0;
    const arcs = segs.map(seg => {
        const span = (seg.count / total) * 360;
        const a1 = cur, a2 = cur + span - 0.6;
        cur += span;
        return { ...seg, a1, a2 };
    });

    return (
        <div className="flex items-center gap-4">
            <svg viewBox="0 0 132 132" className="w-[112px] shrink-0">
                <circle cx={cx} cy={cy} r={R} fill="none"
                    stroke="currentColor" strokeOpacity="0.07" strokeWidth={sw} />
                {arcs.map((a, i) => (
                    <path key={i} d={arc(a.a1, a.a2, R)} fill="none"
                        stroke={a.color} strokeWidth={sw} strokeLinecap="butt" />
                ))}
                <text x={cx} y={cy - 4} textAnchor="middle" fontSize={20}
                    fontWeight="700" fill="currentColor">{total}</text>
                <text x={cx} y={cy + 12} textAnchor="middle" fontSize={8.5}
                    fill="currentColor" fillOpacity="0.5" letterSpacing="0.5">FACTURES</text>
            </svg>
            <div className="min-w-0 flex-1 space-y-2">
                {arcs.map((a, i) => (
                    <div key={i} className="flex items-center gap-2">
                        <span className="h-2.5 w-2.5 shrink-0 rounded-full"
                            style={{ backgroundColor: a.color }} />
                        <span className="min-w-0 flex-1 truncate text-xs text-slate-600 dark:text-slate-300">
                            {a.label}
                        </span>
                        <span className="text-xs font-semibold tabular-nums text-slate-700 dark:text-slate-200">
                            {a.count}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}

// ─── Barre de progression ─────────────────────────────────────────────────────
function Bar({ pct = 0, color = 'bg-emerald-500' }) {
    return (
        <div className="flex items-center gap-1.5">
            <div className="h-1.5 w-[72px] overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                <div className={'h-full rounded-full transition-all ' + color} style={{ width: pct + '%' }} />
            </div>
            <span className="w-7 text-right text-xs tabular-nums text-slate-400">{pct}%</span>
        </div>
    );
}

function BudgetBar({ pct = 0 }) {
    const color = pct >= 90 ? 'bg-red-500' : pct >= 70 ? 'bg-amber-500' : 'bg-emerald-500';
    return <Bar pct={pct} color={color} />;
}

// ─── Carte KPI ────────────────────────────────────────────────────────────────
function KpiCard({ kpi }) {
    const cfg = KPI_CFG[kpi.color] || KPI_CFG.slate;
    return (
        <div
            className="relative overflow-hidden rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"
            style={{ borderLeftColor: cfg.border, borderLeftWidth: '3px' }}
        >
            <span className={'inline-flex h-8 w-8 items-center justify-center rounded-lg ' + cfg.icon}>
                <Icon name={kpi.icon} className="h-4 w-4" />
            </span>
            <div className="mt-3 text-xl font-bold leading-tight tabular-nums text-slate-800 dark:text-slate-100">
                {kpi.value}
            </div>
            <div className="mt-0.5 text-xs font-medium text-slate-600 dark:text-slate-400">
                {kpi.label}
            </div>
            {kpi.trend && (
                <div className="mt-1 text-xs text-slate-400">{kpi.trend}</div>
            )}
        </div>
    );
}

// ─── Badge statut facture ─────────────────────────────────────────────────────
function InvoiceBadge({ status }) {
    return (
        <span className={'inline-flex rounded-full px-2 py-0.5 text-xs font-medium ' + (INV_BADGE[status] || INV_BADGE.draft)}>
            {INV_LABEL[status] || status}
        </span>
    );
}

// ─── Tableau de bord ──────────────────────────────────────────────────────────
export default function Dashboard({
    kpis = [], chartData = [], expenseData = [], projectsBudget = [],
    overdueAlert = 0, invoiceStats = {}, recentInvoices = [],
    isFirstLogin = false,
    // Compatibilité ascendante
    stats = [], recentProjects = [],
}) {
    const { auth } = usePage().props;
    const { t } = useTrans();
    const portal = auth?.portal;
    const user   = auth?.user;

    const displayKpis     = kpis.length          ? kpis          : stats;
    const displayProjects = projectsBudget.length ? projectsBudget : recentProjects;
    const hasExp          = expenseData.some(d => d.value > 0);

    return (
        <AppLayout header="Tableau de bord">
            <Head title={t('Tableau de bord')} />
            <GuidedTour autoStart={isFirstLogin} />

            {/* ── Bandeau d'accueil ─────────────────────────────────────────── */}
            <div className="mb-6 rounded-xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-700 p-6 text-white">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <div className="flex items-center gap-2 text-orange-400">
                            <Icon name={portal?.icon} className="h-5 w-5" />
                            <span className="text-xs font-semibold uppercase tracking-wider">
                                Portail {portal?.label}
                            </span>
                        </div>
                        <h2 className="mt-1 text-2xl font-bold">{t('Bonjour')}, {user?.name}</h2>
                        <p className="mt-0.5 text-sm text-slate-300">
                            {t('Voici la synthèse de vos chantiers et projets.')}
                        </p>
                    </div>
                    <div className="flex shrink-0 flex-wrap gap-2">
                        <Link
                            href="/invoices/create"
                            className="inline-flex items-center gap-1.5 rounded-lg bg-orange-500 px-3 py-2 text-xs font-semibold text-white shadow transition-colors hover:bg-orange-400"
                        >
                            <Icon name="plus" className="h-3.5 w-3.5" />
                            Nouvelle facture
                        </Link>
                        <Link
                            href="/projects/create"
                            className="inline-flex items-center gap-1.5 rounded-lg bg-white/10 px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-white/20"
                        >
                            <Icon name="folder-plus" className="h-3.5 w-3.5" />
                            Nouveau projet
                        </Link>
                    </div>
                </div>
            </div>

            {/* ── Alerte factures en retard ──────────────────────────────────── */}
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

            {/* ── 6 KPI cards ───────────────────────────────────────────────── */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
                {displayKpis.map(kpi => <KpiCard key={kpi.key} kpi={kpi} />)}
            </div>

            {/* ── Graphiques ────────────────────────────────────────────────── */}
            <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-3">

                {/* Courbe CA 6 mois */}
                <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 lg:col-span-2">
                    <div className="mb-3 flex items-start justify-between">
                        <div>
                            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                                Évolution du chiffre d'affaires
                            </h3>
                            <p className="mt-0.5 text-xs text-slate-400">6 derniers mois — factures émises hors brouillons</p>
                        </div>
                        <div className="flex items-center gap-4 text-[11px] text-slate-400">
                            <span className="flex items-center gap-1.5">
                                <span className="inline-block h-2 w-5 rounded-full bg-orange-500" />
                                CA
                            </span>
                            {hasExp && (
                                <span className="flex items-center gap-1.5">
                                    <span className="inline-block h-0 w-5 border-t-2 border-dashed border-violet-500" />
                                    Dépenses
                                </span>
                            )}
                        </div>
                    </div>
                    {chartData.length ? (
                        <AreaChart caData={chartData} expenseData={expenseData} />
                    ) : (
                        <p className="py-10 text-center text-xs text-slate-400">{t('Aucune donnée disponible.')}</p>
                    )}
                </div>

                {/* Donut statut factures */}
                <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
                    <div className="mb-4">
                        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                            Statut des factures
                        </h3>
                        <p className="mt-0.5 text-xs text-slate-400">Répartition globale</p>
                    </div>
                    <DonutChart invoiceStats={invoiceStats} />
                    <div className="mt-4 border-t border-slate-100 pt-3 dark:border-slate-800">
                        <Link
                            href="/invoices"
                            className="flex items-center justify-between text-xs font-medium text-orange-600 hover:underline"
                        >
                            <span>Toutes les factures</span>
                            <Icon name="arrow-right" className="h-3.5 w-3.5" />
                        </Link>
                    </div>
                </div>
            </div>

            {/* ── Projets + Dernières factures ──────────────────────────────── */}
            <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">

                {/* Tableau projets avec double barre */}
                <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 lg:col-span-2">
                    <div className="mb-3 flex items-center justify-between">
                        <div>
                            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                                Projets — Avancement &amp; Budget
                            </h3>
                            <p className="mt-0.5 text-xs text-slate-400">Projets actifs et en attente</p>
                        </div>
                        <Link href="/projects" className="text-xs font-medium text-orange-600 hover:underline">
                            Voir tout
                        </Link>
                    </div>

                    {displayProjects.length === 0 ? (
                        <p className="py-8 text-center text-sm text-slate-400">
                            {t('Aucun projet actif pour le moment.')}
                        </p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-slate-100 dark:border-slate-800">
                                        <th className="pb-2 text-left text-xs font-medium text-slate-400">Projet</th>
                                        <th className="pb-2 pl-3 text-left text-xs font-medium text-slate-400">
                                            <span className="flex items-center gap-1">
                                                <span className="inline-block h-1.5 w-1.5 rounded-full bg-blue-500" />
                                                Avancement
                                            </span>
                                        </th>
                                        <th className="pb-2 pl-3 text-left text-xs font-medium text-slate-400">
                                            <span className="flex items-center gap-1">
                                                <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                                Budget
                                            </span>
                                        </th>
                                        <th className="pb-2 pl-3 text-right text-xs font-medium text-slate-400">Statut</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                    {displayProjects.map(project => {
                                        const s       = PROJECT_STATUS[project.status] || { label: project.status, color: 'bg-slate-100 text-slate-600' };
                                        const budPct  = project.budget_pct ?? 0;
                                        const progPct = project.progress ?? 0;
                                        const budget  = project.budget ?? project.budget_amount ?? 0;
                                        return (
                                            <tr key={project.id}>
                                                <td className="py-3 pr-3">
                                                    <Link
                                                        href={'/projects/' + project.id}
                                                        className="block max-w-[180px] truncate font-medium text-slate-700 hover:text-orange-600 dark:text-slate-200"
                                                    >
                                                        {project.name}
                                                    </Link>
                                                    {budget > 0 && (
                                                        <div className="mt-0.5 text-xs tabular-nums text-slate-400">
                                                            {formatMoney(project.spent ?? 0, project.currency)} /{' '}
                                                            {formatMoney(budget, project.currency)}
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="py-3 pl-3 pr-3">
                                                    <Bar pct={progPct} color="bg-blue-500" />
                                                </td>
                                                <td className="py-3 pl-3 pr-3">
                                                    <BudgetBar pct={budPct} />
                                                </td>
                                                <td className="py-3 pl-3 text-right">
                                                    <span className={'inline-flex rounded-full px-2 py-0.5 text-xs font-medium ' + s.color}>
                                                        {t(s.label)}
                                                    </span>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Mini-liste dernières factures */}
                <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
                    <div className="mb-3 flex items-center justify-between">
                        <div>
                            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                                Dernières factures
                            </h3>
                            <p className="mt-0.5 text-xs text-slate-400">Activité récente</p>
                        </div>
                        <Link href="/invoices" className="text-xs font-medium text-orange-600 hover:underline">
                            Toutes
                        </Link>
                    </div>

                    {recentInvoices.length === 0 ? (
                        <p className="py-8 text-center text-xs text-slate-400">Aucune facture récente.</p>
                    ) : (
                        <ul className="divide-y divide-slate-100 dark:divide-slate-800">
                            {recentInvoices.map(inv => (
                                <li key={inv.id} className="py-2.5">
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="min-w-0 flex-1">
                                            <Link
                                                href={'/invoices/' + inv.id}
                                                className="block truncate text-xs font-semibold text-slate-700 hover:text-orange-600 dark:text-slate-200"
                                            >
                                                {inv.code}
                                            </Link>
                                            <div className="mt-0.5 truncate text-xs text-slate-400">{inv.client}</div>
                                        </div>
                                        <div className="shrink-0 text-right">
                                            <div className="text-xs font-semibold tabular-nums text-slate-700 dark:text-slate-200">
                                                {formatMoney(inv.total, inv.currency)}
                                            </div>
                                            <div className="mt-0.5">
                                                <InvoiceBadge status={inv.status} />
                                            </div>
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}

                    <div className="mt-3 border-t border-slate-100 pt-3 dark:border-slate-800">
                        <Link
                            href="/invoices/create"
                            className="flex items-center justify-between text-xs font-medium text-orange-600 hover:underline"
                        >
                            <span>Créer une facture</span>
                            <Icon name="plus-circle" className="h-3.5 w-3.5" />
                        </Link>
                    </div>
                </div>
            </div>

            {/* ── Rôles (compact) ───────────────────────────────────────────── */}
            <div className="mt-4">
                <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
                    <div className="flex flex-wrap items-center gap-3">
                        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                            {t('Vos rôles')} :
                        </span>
                        {(user?.roles ?? []).map(role => (
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
