import AppLayout from '@/Layouts/AppLayout';
import { PageHeader, Badge } from '@/Components/UI';
import MrrChart from '@/Components/SuperAdmin/MrrChart';

const STATUS_COLORS = {
    trial: 'info', active: 'success', grace: 'warning',
    expired: 'danger', cancelled: 'neutral', none: 'neutral',
};

const ICONS = {
    companies: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
            <path d="M3 21h18M3 7l9-4 9 4M4 7v14M20 7v14M9 21V9h6v12"/>
        </svg>
    ),
    subscriptions: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
            <rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/>
        </svg>
    ),
    expired: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
            <circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/>
        </svg>
    ),
    mrr: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
            <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/>
        </svg>
    ),
    conversion: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
        </svg>
    ),
    arr: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
            <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
        </svg>
    ),
    tickets: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.15 12 19.79 19.79 0 0 1 1.08 3.18 2 2 0 0 1 3.05 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.09 8.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21 16.92z"/>
        </svg>
    ),
    users: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
        </svg>
    ),
};

function StatCard({ label, value, sub, color = 'orange', icon = 'mrr' }) {
    const colorMap = {
        orange: 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400',
        green:  'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400',
        red:    'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400',
        blue:   'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
        purple: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400',
        amber:  'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400',
        rose:   'bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400',
    };
    return (
        <div className="kpi-card">
            <div className={`kpi-icon ${colorMap[color] ?? colorMap.orange}`}>
                {ICONS[icon] ?? ICONS.mrr}
            </div>
            <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
                <p className="text-2xl font-bold text-slate-800 dark:text-slate-100">{value}</p>
                {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
            </div>
        </div>
    );
}

function formatXOF(amount) {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF', maximumFractionDigits: 0 }).format(amount);
}

export default function SuperAdminDashboard({ stats, subscriptions_by_status, recent_companies }) {
    // stats inclut : total_companies, active_subscriptions, expired_subscriptions,
    //                mrr, total_users, conversion_rate, arr, overdue_tickets
    return (
        <AppLayout title="SuperAdmin — Tableau de bord IBIG Soft">
            <div className="mx-auto max-w-6xl px-4 py-6 space-y-8">
                <PageHeader
                    title="Console SuperAdmin IBIG Soft"
                    subtitle="Vue globale de l'écosystème CONSTRUIRO"
                />

                {/* KPIs — ligne 1 : métriques de base */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <StatCard
                        label="Entreprises clientes"
                        value={stats.total_companies}
                        icon="companies"
                        color="orange"
                        sub={`${stats.total_users} utilisateurs au total`}
                    />
                    <StatCard
                        label="Abonnements actifs"
                        value={stats.active_subscriptions}
                        icon="subscriptions"
                        color="green"
                    />
                    <StatCard
                        label="Abonnements expirés"
                        value={stats.expired_subscriptions}
                        icon="expired"
                        color="red"
                    />
                    <StatCard
                        label="MRR du mois"
                        value={formatXOF(stats.mrr)}
                        icon="mrr"
                        color="blue"
                    />
                </div>

                {/* KPIs — ligne 2 : conversion, ARR, tickets */}
                <div className="grid gap-4 sm:grid-cols-3">
                    <StatCard
                        label="Taux conversion trial → payant"
                        value={`${stats.conversion_rate ?? 0} %`}
                        icon="conversion"
                        color="purple"
                        sub="Abonnements actifs issus d'un essai"
                    />
                    <StatCard
                        label="ARR (revenu annuel récurrent)"
                        value={formatXOF(stats.arr ?? 0)}
                        icon="arr"
                        color="amber"
                        sub="Projection annuelle des abonnements actifs"
                    />
                    <StatCard
                        label="Tickets en attente > 24h"
                        value={stats.overdue_tickets ?? 0}
                        icon="tickets"
                        color={stats.overdue_tickets > 0 ? 'rose' : 'green'}
                        sub="Statuts : new · open · waiting_tech"
                    />
                </div>

                {/* Statut abonnements */}
                <div className="card">
                    <div className="card-header">
                        <h3 className="font-semibold text-slate-800 dark:text-slate-100">Répartition des abonnements</h3>
                    </div>
                    <div className="card-body flex flex-wrap gap-3">
                        {Object.entries(subscriptions_by_status).map(([status, count]) => (
                            <div key={status} className="flex items-center gap-2 rounded-lg bg-slate-50 dark:bg-slate-800 px-3 py-2">
                                <Badge variant={STATUS_COLORS[status] ?? 'neutral'}>{status}</Badge>
                                <span className="font-bold text-slate-800 dark:text-slate-100">{count}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Graphique MRR 12 mois */}
                <MrrChart />

                {/* Dernières entreprises */}
                <div className="card">
                    <div className="card-header">
                        <h3 className="font-semibold text-slate-800 dark:text-slate-100">Dernières entreprises inscrites</h3>
                        <a href="/superadmin/clients" className="text-sm text-orange-500 hover:text-orange-600">Voir tout →</a>
                    </div>
                    <div className="card-body overflow-x-auto">
                        <table className="table-construiro w-full">
                            <thead>
                                <tr>
                                    <th>Entreprise</th>
                                    <th>Pays</th>
                                    <th>Abonnement</th>
                                    <th>Plan</th>
                                    <th>Inscrite le</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recent_companies.map((c) => (
                                    <tr key={c.id}>
                                        <td>
                                            <a href={`/superadmin/clients/${c.id}`} className="font-medium text-orange-500 hover:text-orange-600">
                                                {c.name}
                                            </a>
                                        </td>
                                        <td>{c.country}</td>
                                        <td><Badge variant={STATUS_COLORS[c.subscription_status] ?? 'neutral'}>{c.subscription_status}</Badge></td>
                                        <td className="text-slate-500">{c.plan_name ?? '—'}</td>
                                        <td className="text-slate-500">{c.created_at}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
