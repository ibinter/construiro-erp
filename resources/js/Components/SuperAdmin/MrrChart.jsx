import { useEffect, useState, useRef } from 'react';

const CHART_W = 700;
const CHART_H = 220;
const PAD     = { top: 24, right: 16, bottom: 48, left: 64 };
const BAR_GAP = 6;

function formatXOF(n) {
    return new Intl.NumberFormat('fr-FR', {
        style: 'currency', currency: 'XOF', maximumFractionDigits: 0,
    }).format(n);
}

function pct(value, max) {
    if (!max) return 0;
    return value / max;
}

export default function MrrChart() {
    const [data,    setData]    = useState([]);
    const [loading, setLoading] = useState(true);
    const [tooltip, setTooltip] = useState(null); // { x, y, label, mrr }
    const svgRef = useRef(null);

    useEffect(() => {
        fetch(route('superadmin.mrr.history'))
            .then(r => r.json())
            .then(rows => { setData(rows); setLoading(false); })
            .catch(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <div className="card">
                <div className="card-header">
                    <h3 className="font-semibold text-slate-800 dark:text-slate-100">MRR — 12 derniers mois</h3>
                </div>
                <div className="card-body flex items-center justify-center h-48">
                    <span className="text-sm text-slate-400">Chargement…</span>
                </div>
            </div>
        );
    }

    if (!data.length) return null;

    const maxMrr     = Math.max(...data.map(d => d.mrr), 1);
    const currentMrr = data[data.length - 1]?.mrr ?? 0;
    const prevMrr    = data[data.length - 2]?.mrr ?? 0;
    const trend      = prevMrr ? ((currentMrr - prevMrr) / prevMrr) * 100 : null;
    const trendUp    = trend !== null && trend >= 0;

    // Dimensions internes
    const innerW = CHART_W - PAD.left - PAD.right;
    const innerH = CHART_H - PAD.top  - PAD.bottom;
    const n      = data.length;
    const barW   = (innerW - BAR_GAP * (n - 1)) / n;

    // Niveaux de grille Y (4 lignes)
    const yTicks = [0, 0.25, 0.5, 0.75, 1].map(f => ({
        y:   PAD.top + innerH - f * innerH,
        val: Math.round(maxMrr * f),
    }));

    function barX(i) {
        return PAD.left + i * (barW + BAR_GAP);
    }
    function barY(mrr) {
        return PAD.top + innerH - pct(mrr, maxMrr) * innerH;
    }
    function barH(mrr) {
        return pct(mrr, maxMrr) * innerH;
    }

    function handleMouseEnter(e, d, i) {
        if (!svgRef.current) return;
        const rect = svgRef.current.getBoundingClientRect();
        const svgX  = barX(i) + barW / 2;
        const svgY  = barY(d.mrr) - 8;
        // Convert SVG coords to screen coords
        const scaleX = rect.width  / CHART_W;
        const scaleY = rect.height / CHART_H;
        setTooltip({
            x:   rect.left + svgX * scaleX,
            y:   rect.top  + svgY * scaleY,
            label: d.month,
            mrr:   d.mrr,
        });
    }

    return (
        <div className="card">
            <div className="card-header flex flex-wrap items-center gap-4">
                <div>
                    <h3 className="font-semibold text-slate-800 dark:text-slate-100">MRR — 12 derniers mois</h3>
                    <p className="text-xs text-slate-400 mt-0.5">Revenu Mensuel Récurrent (abonnements actifs)</p>
                </div>
                <div className="ml-auto text-right">
                    <p className="text-2xl font-black text-orange-500">{formatXOF(currentMrr)}</p>
                    {trend !== null && (
                        <p className={`text-xs font-semibold ${trendUp ? 'text-green-500' : 'text-red-500'}`}>
                            {trendUp ? '▲' : '▼'} {Math.abs(trend).toFixed(1)}% vs mois précédent
                        </p>
                    )}
                </div>
            </div>

            <div className="card-body overflow-x-auto">
                <div className="relative">
                    <svg
                        ref={svgRef}
                        viewBox={`0 0 ${CHART_W} ${CHART_H}`}
                        className="w-full"
                        style={{ minWidth: 320, maxHeight: 260 }}
                        onMouseLeave={() => setTooltip(null)}
                    >
                        {/* Grille Y */}
                        {yTicks.map((t, i) => (
                            <g key={i}>
                                <line
                                    x1={PAD.left} y1={t.y}
                                    x2={CHART_W - PAD.right} y2={t.y}
                                    stroke="currentColor"
                                    strokeOpacity={0.08}
                                    strokeWidth={1}
                                />
                                <text
                                    x={PAD.left - 8} y={t.y + 4}
                                    textAnchor="end"
                                    fontSize={9}
                                    fill="currentColor"
                                    opacity={0.45}
                                >
                                    {t.val >= 1000 ? `${(t.val / 1000).toFixed(0)}k` : t.val}
                                </text>
                            </g>
                        ))}

                        {/* Barres */}
                        {data.map((d, i) => {
                            const isLast = i === n - 1;
                            const h = Math.max(barH(d.mrr), d.mrr > 0 ? 3 : 0);
                            const y = barY(d.mrr);
                            return (
                                <g key={i}>
                                    {/* Barre fond (toujours visible) */}
                                    <rect
                                        x={barX(i)} y={PAD.top}
                                        width={barW} height={innerH}
                                        rx={3}
                                        fill="currentColor"
                                        opacity={0.03}
                                    />
                                    {/* Barre valeur */}
                                    {d.mrr > 0 && (
                                        <rect
                                            x={barX(i)} y={y}
                                            width={barW} height={h}
                                            rx={3}
                                            fill={isLast ? '#f97316' : '#fdba74'}
                                            className="transition-opacity"
                                        />
                                    )}
                                    {/* Hitbox invisible pour tooltip */}
                                    <rect
                                        x={barX(i)} y={PAD.top}
                                        width={barW} height={innerH}
                                        fill="transparent"
                                        onMouseEnter={e => handleMouseEnter(e, d, i)}
                                        style={{ cursor: 'default' }}
                                    />
                                    {/* Label mois */}
                                    <text
                                        x={barX(i) + barW / 2}
                                        y={PAD.top + innerH + 16}
                                        textAnchor="middle"
                                        fontSize={9}
                                        fill="currentColor"
                                        opacity={0.55}
                                        fontWeight={isLast ? 700 : 400}
                                    >
                                        {d.month_short}
                                    </text>
                                    {isLast && (
                                        <text
                                            x={barX(i) + barW / 2}
                                            y={PAD.top + innerH + 28}
                                            textAnchor="middle"
                                            fontSize={8}
                                            fill="#f97316"
                                            fontWeight={700}
                                        >
                                            {d.year}
                                        </text>
                                    )}
                                </g>
                            );
                        })}
                    </svg>

                    {/* Tooltip flottant */}
                    {tooltip && (
                        <div
                            className="pointer-events-none fixed z-50 rounded-lg bg-slate-900 text-white px-3 py-2 text-xs shadow-xl"
                            style={{
                                left: tooltip.x,
                                top:  tooltip.y,
                                transform: 'translate(-50%, -100%)',
                            }}
                        >
                            <p className="font-semibold mb-0.5">{tooltip.label}</p>
                            <p className="text-orange-300">{formatXOF(tooltip.mrr)}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
