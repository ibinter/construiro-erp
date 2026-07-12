import AppLayout from '@/Layouts/AppLayout';
import { PageHeader, Badge } from '@/Components/UI';

const STATUS_COLORS = {
    trial: 'info', active: 'success', grace: 'warning',
    expired: 'danger', cancelled: 'neutral', none: 'neutral',
};

function StatCard({ label, value, sub, color = 'brand' }) {
    return (
        <div className="kpi-card">
            <div className={`kpi-icon bg-${color === 'brand' ? 'orange' : color}-100 text-${color === 'brand' ? 'orange' : color}-600`}>
                📊
            </div>
            <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
                <p className="text-2xl font-bold text-slate-800 dark:text-slate-100">{value}</p>
                {sub && <p className="text-xs text-slate-400">{sub}</p>}
            </div>
        </div>
    );
}

function formatXOF(amount) {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF', maximumFractionDigits: 0 }).format(amount);
}

export default function SuperAdminDashboard({ stats, subscriptions_by_status, recent_companies }) {
    return (
        <AppLayout title="SuperAdmin — Tableau de bord IBIG Soft">
            <div className="mx-auto max-w-6xl px-4 py-6 space-y-8">
                <PageHeader
                    title="Console SuperAdmin IBIG Soft"
                    subtitle="Vue globale de l'écosystème CONSTRUIRO"
                />

                {/* KPIs */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <StatCard label="Entreprises clientes" value={stats.total_companies} />
                    <StatCard label="Abonnements actifs" value={stats.active_subscriptions} color="green" />
                    <StatCard label="Abonnements expirés" value={stats.expired_subscriptions} color="red" />
                    <StatCard label="MRR du mois" value={formatXOF(stats.mrr)} />
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
