import { useState } from 'react';
import { router, Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { PageHeader, Badge } from '@/Components/UI';

const CONTEXT_LABELS = {
    public:   'Public',
    internal: 'Interne',
    support:  'Support',
};

const CONTEXT_COLORS = {
    public:   'info',
    internal: 'success',
    support:  'warning',
};

const PROVIDER_COLORS = {
    groq:      'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
    openai:    'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
    anthropic: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
    google:    'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
    mistral:   'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300',
    grok:      'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
};

const ICONS = {
    calls: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
        </svg>
    ),
    tokens: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
            <circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>
        </svg>
    ),
    provider: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
            <rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/>
        </svg>
    ),
    time: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
            <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
        </svg>
    ),
};

function StatCard({ label, value, sub, icon, color = 'purple' }) {
    const colorMap = {
        purple: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400',
        blue:   'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
        orange: 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400',
        green:  'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400',
    };
    return (
        <div className="kpi-card">
            <div className={`kpi-icon ${colorMap[color] ?? colorMap.purple}`}>
                {icon}
            </div>
            <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
                <p className="text-2xl font-bold text-slate-800 dark:text-slate-100">{value}</p>
                {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
            </div>
        </div>
    );
}

function formatTokens(n) {
    if (!n) return '0';
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
    return String(n);
}

export default function AiUsageIndex({ logs, month_stats, month_totals, companies, filters }) {
    const [companyId, setCompanyId] = useState(filters?.company_id ?? '');

    function applyFilter(e) {
        e.preventDefault();
        router.get('/superadmin/ai-usage', { company_id: companyId || undefined }, { preserveState: true });
    }

    function resetFilter() {
        setCompanyId('');
        router.get('/superadmin/ai-usage', {}, { preserveState: true });
    }

    // Provider le plus utilisé ce mois
    const topProvider = month_stats?.length
        ? [...month_stats].sort((a, b) => b.calls - a.calls)[0]?.provider ?? '—'
        : '—';

    const totalCalls  = month_totals?.total_calls  ?? 0;
    const totalTokens = month_totals?.total_tokens ?? 0;
    const avgMs       = month_totals?.avg_ms       ?? 0;

    return (
        <AppLayout title="SuperAdmin — Utilisation IA">
            <div className="mx-auto max-w-7xl px-4 py-6 space-y-6">
                <PageHeader
                    title="Journal d'utilisation IA — SARA"
                    subtitle={`Statistiques du mois de ${new Date().toLocaleString('fr-FR', { month: 'long', year: 'numeric' })}`}
                />

                {/* KPI du mois */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard
                        label="Appels ce mois"
                        value={totalCalls.toLocaleString('fr-FR')}
                        sub="tous fournisseurs"
                        icon={ICONS.calls}
                        color="blue"
                    />
                    <StatCard
                        label="Tokens consommés"
                        value={formatTokens(totalTokens)}
                        sub="estimation (4 chars = 1 token)"
                        icon={ICONS.tokens}
                        color="purple"
                    />
                    <StatCard
                        label="Fournisseur actif"
                        value={topProvider.toUpperCase()}
                        sub="le plus sollicité"
                        icon={ICONS.provider}
                        color="orange"
                    />
                    <StatCard
                        label="Temps moyen"
                        value={avgMs ? `${Math.round(avgMs)} ms` : '—'}
                        sub="par requête IA"
                        icon={ICONS.time}
                        color="green"
                    />
                </div>

                {/* Stats par fournisseur */}
                {month_stats?.length > 0 && (
                    <div className="card">
                        <div className="card-body">
                            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
                                Répartition par fournisseur (mois courant)
                            </h3>
                            <div className="flex flex-wrap gap-3">
                                {month_stats.map((s) => (
                                    <div
                                        key={s.provider}
                                        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium ${PROVIDER_COLORS[s.provider] ?? 'bg-slate-100 text-slate-700'}`}
                                    >
                                        <span className="capitalize font-bold">{s.provider}</span>
                                        <span className="opacity-70">·</span>
                                        <span>{Number(s.calls).toLocaleString('fr-FR')} appels</span>
                                        <span className="opacity-70">·</span>
                                        <span>{formatTokens(s.tokens)} tokens</span>
                                        <span className="opacity-70">·</span>
                                        <span>{s.avg_ms ? `${Math.round(s.avg_ms)} ms` : '—'} moy.</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Filtre société */}
                <form onSubmit={applyFilter} className="flex flex-wrap items-end gap-3">
                    <div>
                        <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">
                            Filtrer par société
                        </label>
                        <select
                            value={companyId}
                            onChange={(e) => setCompanyId(e.target.value)}
                            className="input-construiro w-56"
                        >
                            <option value="">Toutes les sociétés</option>
                            {companies?.map((c) => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                        </select>
                    </div>
                    <button type="submit" className="btn btn-primary">
                        Filtrer
                    </button>
                    {filters?.company_id && (
                        <button type="button" onClick={resetFilter} className="btn btn-secondary">
                            Réinitialiser
                        </button>
                    )}
                </form>

                {/* Tableau des logs */}
                <div className="card">
                    <div className="card-body overflow-x-auto">
                        <table className="table-construiro w-full">
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Société</th>
                                    <th>Utilisateur</th>
                                    <th>Contexte</th>
                                    <th>Fournisseur</th>
                                    <th>Modèle</th>
                                    <th className="text-right">Tokens</th>
                                    <th className="text-right">Temps</th>
                                    <th>Statut</th>
                                </tr>
                            </thead>
                            <tbody>
                                {logs.data.length === 0 && (
                                    <tr>
                                        <td colSpan={9} className="text-center text-slate-400 py-8">
                                            Aucun appel enregistré pour ces critères.
                                        </td>
                                    </tr>
                                )}
                                {logs.data.map((l) => (
                                    <tr key={l.id}>
                                        <td className="text-slate-500 text-sm whitespace-nowrap">
                                            {l.created_at}
                                        </td>
                                        <td className="font-medium text-slate-700 dark:text-slate-200">
                                            {l.company}
                                        </td>
                                        <td className="text-slate-600 dark:text-slate-300">
                                            {l.user}
                                        </td>
                                        <td>
                                            <Badge variant={CONTEXT_COLORS[l.context] ?? 'neutral'}>
                                                {CONTEXT_LABELS[l.context] ?? l.context}
                                            </Badge>
                                        </td>
                                        <td>
                                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold capitalize ${PROVIDER_COLORS[l.provider] ?? 'bg-slate-100 text-slate-700'}`}>
                                                {l.provider}
                                            </span>
                                        </td>
                                        <td className="font-mono text-xs text-slate-500 max-w-[160px] truncate" title={l.model}>
                                            {l.model}
                                        </td>
                                        <td className="text-right tabular-nums text-slate-700 dark:text-slate-200">
                                            {l.tokens.toLocaleString('fr-FR')}
                                        </td>
                                        <td className="text-right tabular-nums text-slate-500 text-sm">
                                            {l.ms !== null ? `${l.ms} ms` : '—'}
                                        </td>
                                        <td>
                                            {l.success ? (
                                                <Badge variant="success">OK</Badge>
                                            ) : (
                                                <span title={l.error ?? ''}>
                                                    <Badge variant="danger">Erreur</Badge>
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Pagination */}
                {logs.links && logs.links.length > 3 && (
                    <div className="flex gap-1 flex-wrap">
                        {logs.links.map((link, i) => (
                            <Link
                                key={i}
                                href={link.url ?? '#'}
                                className={`px-3 py-1 rounded text-sm border ${
                                    link.active
                                        ? 'bg-orange-500 text-white border-orange-500'
                                        : 'border-slate-200 text-slate-600 hover:border-orange-300 dark:border-slate-700 dark:text-slate-400'
                                }`}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        ))}
                    </div>
                )}

                <p className="text-xs text-slate-400">
                    Les tokens affichés sont une estimation (4 caractères = 1 token). Le comptage exact
                    dépend du tokeniseur de chaque fournisseur. Les logs sont conservés indéfiniment.
                </p>
            </div>
        </AppLayout>
    );
}
