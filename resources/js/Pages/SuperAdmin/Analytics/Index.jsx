import { router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { PageHeader } from '@/Components/UI';

// ─── Icônes inline ────────────────────────────────────────────────────────────
const IconEye = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
        <circle cx="12" cy="12" r="3"/>
    </svg>
);
const IconForm = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
        <polyline points="14 2 14 8 20 8"/>
        <line x1="16" y1="13" x2="8" y2="13"/>
        <line x1="16" y1="17" x2="8" y2="17"/>
        <polyline points="10 9 9 9 8 9"/>
    </svg>
);
const IconUser = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
        <circle cx="12" cy="7" r="4"/>
    </svg>
);

// ─── KPI Card ─────────────────────────────────────────────────────────────────
function KpiCard({ label, value, icon, colorClass }) {
    return (
        <div className="kpi-card">
            <div className={`kpi-icon ${colorClass}`}>{icon}</div>
            <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
                <p className="text-2xl font-bold text-slate-800 dark:text-slate-100">
                    {Number(value).toLocaleString('fr-FR')}
                </p>
            </div>
        </div>
    );
}

// ─── Sparkline SVG (barres) ───────────────────────────────────────────────────
function Sparkline({ data }) {
    if (!data || data.length === 0) {
        return (
            <p className="text-slate-400 text-sm text-center py-8">Aucune donnée</p>
        );
    }

    const maxCount = Math.max(...data.map((d) => d.count), 1);
    const barW  = Math.max(6, Math.floor(560 / data.length) - 2);
    const gap   = 2;
    const height = 80;

    return (
        <svg
            viewBox={`0 0 ${data.length * (barW + gap)} ${height + 20}`}
            className="w-full"
            style={{ minHeight: 100 }}
        >
            {data.map((d, i) => {
                const barH = Math.max(2, Math.round((d.count / maxCount) * height));
                const x = i * (barW + gap);
                const y = height - barH;
                return (
                    <g key={d.date}>
                        <rect
                            x={x}
                            y={y}
                            width={barW}
                            height={barH}
                            rx="2"
                            fill="#F58220"
                            opacity="0.85"
                        />
                        {/* Label count si barres pas trop serrées */}
                        {barW >= 18 && (
                            <text
                                x={x + barW / 2}
                                y={y - 3}
                                textAnchor="middle"
                                fontSize="9"
                                fill="#94a3b8"
                            >
                                {d.count}
                            </text>
                        )}
                    </g>
                );
            })}
            {/* Axe X : affiche la date tous les N barres */}
            {data.map((d, i) => {
                const step = Math.ceil(data.length / 7);
                if (i % step !== 0) return null;
                const x = i * (barW + gap) + barW / 2;
                const label = d.date.slice(5); // MM-DD
                return (
                    <text
                        key={`lbl-${d.date}`}
                        x={x}
                        y={height + 16}
                        textAnchor="middle"
                        fontSize="9"
                        fill="#94a3b8"
                    >
                        {label}
                    </text>
                );
            })}
        </svg>
    );
}

// ─── Donut CSS/SVG pour les devices ──────────────────────────────────────────
const DEVICE_COLORS = {
    desktop: '#F58220',
    mobile:  '#3b82f6',
    tablet:  '#8b5cf6',
};
const DEVICE_LABELS = {
    desktop: 'Desktop',
    mobile:  'Mobile',
    tablet:  'Tablette',
};

function DeviceDonut({ devices }) {
    const total = devices.reduce((acc, d) => acc + Number(d.count), 0);
    if (total === 0) return <p className="text-slate-400 text-sm">Aucune donnée</p>;

    let cumAngle = -90; // start from top
    const r = 50;
    const cx = 70;
    const cy = 70;

    function polarToCartesian(angleDeg, radius) {
        const rad = (angleDeg * Math.PI) / 180;
        return {
            x: cx + radius * Math.cos(rad),
            y: cy + radius * Math.sin(rad),
        };
    }

    const slices = devices.map((d) => {
        const angle = (Number(d.count) / total) * 360;
        const start = polarToCartesian(cumAngle, r);
        const end   = polarToCartesian(cumAngle + angle, r);
        const large = angle > 180 ? 1 : 0;
        const path  = [
            `M ${cx} ${cy}`,
            `L ${start.x.toFixed(2)} ${start.y.toFixed(2)}`,
            `A ${r} ${r} 0 ${large} 1 ${end.x.toFixed(2)} ${end.y.toFixed(2)}`,
            'Z',
        ].join(' ');
        cumAngle += angle;
        return { ...d, path, color: DEVICE_COLORS[d.device] ?? '#64748b' };
    });

    return (
        <div className="flex flex-col sm:flex-row items-center gap-6">
            <svg viewBox="0 0 140 140" className="w-36 h-36 flex-shrink-0">
                {slices.map((s) => (
                    <path key={s.device} d={s.path} fill={s.color} opacity="0.9"/>
                ))}
                {/* Trou central */}
                <circle cx={cx} cy={cy} r={r * 0.55} fill="transparent"
                    className="fill-white dark:fill-gray-800"/>
            </svg>
            <ul className="space-y-2 text-sm">
                {slices.map((s) => (
                    <li key={s.device} className="flex items-center gap-2">
                        <span
                            className="inline-block w-3 h-3 rounded-sm flex-shrink-0"
                            style={{ backgroundColor: s.color }}
                        />
                        <span className="text-slate-600 dark:text-slate-300">
                            {DEVICE_LABELS[s.device] ?? s.device}
                        </span>
                        <span className="font-semibold text-slate-800 dark:text-slate-100 ml-auto pl-4">
                            {Number(s.count).toLocaleString('fr-FR')}
                            <span className="text-slate-400 font-normal ml-1">
                                ({Math.round((Number(s.count) / total) * 100)}%)
                            </span>
                        </span>
                    </li>
                ))}
            </ul>
        </div>
    );
}

// ─── Page principale ──────────────────────────────────────────────────────────
export default function AnalyticsIndex({
    totalVisits,
    demoRequests,
    signups,
    visitsByDay,
    topSources,
    topPages,
    devices,
    days,
}) {
    function changePeriod(d) {
        router.get('/superadmin/analytics', { days: d }, { preserveState: false });
    }

    const PERIODS = [
        { label: '7 jours',  value: 7  },
        { label: '30 jours', value: 30 },
        { label: '90 jours', value: 90 },
    ];

    return (
        <AppLayout title="SuperAdmin — Analytics">
            <div className="mx-auto max-w-7xl px-4 py-6 space-y-6">
                {/* En-tête */}
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <PageHeader
                        title="Dashboard Analytics Marketing"
                        subtitle="Trafic, sources et conversions sur la landing page"
                    />
                    {/* Sélecteur période */}
                    <div className="flex gap-2">
                        {PERIODS.map((p) => (
                            <button
                                key={p.value}
                                onClick={() => changePeriod(p.value)}
                                className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
                                    Number(days) === p.value
                                        ? 'bg-orange-500 text-white border-orange-500'
                                        : 'border-slate-200 text-slate-600 hover:border-orange-300 dark:border-slate-700 dark:text-slate-400 dark:hover:border-orange-500'
                                }`}
                            >
                                {p.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* KPIs */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <KpiCard
                        label="Visites (page vues)"
                        value={totalVisits}
                        icon={<IconEye />}
                        colorClass="bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400"
                    />
                    <KpiCard
                        label="Demandes de démo"
                        value={demoRequests}
                        icon={<IconForm />}
                        colorClass="bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
                    />
                    <KpiCard
                        label="Inscriptions"
                        value={signups}
                        icon={<IconUser />}
                        colorClass="bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400"
                    />
                </div>

                {/* Sparkline visites / jour */}
                <div className="card">
                    <div className="card-body">
                        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4">
                            Visites par jour — {days} derniers jours
                        </h3>
                        <Sparkline data={visitsByDay} />
                    </div>
                </div>

                {/* Ligne : Top sources + Devices */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {/* Top sources */}
                    <div className="card">
                        <div className="card-body">
                            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4">
                                Top sources UTM
                            </h3>
                            {topSources.length === 0 ? (
                                <p className="text-slate-400 text-sm">Aucune donnée UTM enregistrée.</p>
                            ) : (
                                <ul className="space-y-2">
                                    {topSources.map((s) => {
                                        const maxCount = topSources[0]?.count ?? 1;
                                        const pct = Math.round((s.count / maxCount) * 100);
                                        return (
                                            <li key={s.source} className="flex items-center gap-3">
                                                <span className="w-24 text-sm font-medium text-slate-700 dark:text-slate-200 truncate">
                                                    {s.source}
                                                </span>
                                                <div className="flex-1 bg-slate-100 dark:bg-slate-800 rounded-full h-2">
                                                    <div
                                                        className="h-2 rounded-full bg-orange-400"
                                                        style={{ width: `${pct}%` }}
                                                    />
                                                </div>
                                                <span className="text-sm text-slate-500 dark:text-slate-400 w-10 text-right tabular-nums">
                                                    {Number(s.count).toLocaleString('fr-FR')}
                                                </span>
                                            </li>
                                        );
                                    })}
                                </ul>
                            )}
                        </div>
                    </div>

                    {/* Devices */}
                    <div className="card">
                        <div className="card-body">
                            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4">
                                Répartition des appareils
                            </h3>
                            <DeviceDonut devices={devices} />
                        </div>
                    </div>
                </div>

                {/* Top pages */}
                <div className="card">
                    <div className="card-body overflow-x-auto">
                        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4">
                            Top pages visitées
                        </h3>
                        {topPages.length === 0 ? (
                            <p className="text-slate-400 text-sm">Aucune page enregistrée.</p>
                        ) : (
                            <table className="table-construiro w-full">
                                <thead>
                                    <tr>
                                        <th className="text-left">Page</th>
                                        <th className="text-right">Vues</th>
                                        <th className="text-right w-40">Proportion</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {topPages.map((p) => {
                                        const maxCount = topPages[0]?.count ?? 1;
                                        const pct = Math.round((p.count / maxCount) * 100);
                                        return (
                                            <tr key={p.page}>
                                                <td className="font-mono text-xs text-slate-600 dark:text-slate-300">
                                                    /{p.page === '' ? '' : p.page}
                                                </td>
                                                <td className="text-right tabular-nums font-semibold text-slate-800 dark:text-slate-100">
                                                    {Number(p.count).toLocaleString('fr-FR')}
                                                </td>
                                                <td className="text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <div className="w-24 bg-slate-100 dark:bg-slate-800 rounded-full h-1.5">
                                                            <div
                                                                className="h-1.5 rounded-full bg-orange-400"
                                                                style={{ width: `${pct}%` }}
                                                            />
                                                        </div>
                                                        <span className="text-xs text-slate-400 w-8 text-right">
                                                            {pct}%
                                                        </span>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>

                <p className="text-xs text-slate-400">
                    Les visites sont trackées via le middleware <code className="font-mono">TrackPageView</code> sur la route publique <code className="font-mono">/</code>.
                    Les events <em>demo_request</em> et <em>signup</em> sont enregistrés par les controllers correspondants via <code className="font-mono">AnalyticsEvent::create()</code>.
                </p>
            </div>
        </AppLayout>
    );
}
