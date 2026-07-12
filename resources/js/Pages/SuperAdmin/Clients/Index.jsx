import { useState } from 'react';
import { Link, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { PageHeader, Badge } from '@/Components/UI';

const STATUS_COLORS = {
    trial: 'info', active: 'success', grace: 'warning',
    expired: 'danger', cancelled: 'neutral', none: 'neutral',
};

export default function ClientsIndex({ companies, filters }) {
    const [search, setSearch] = useState(filters.search ?? '');

    const doSearch = (e) => {
        e.preventDefault();
        router.get('/superadmin/clients', { search }, { preserveState: true, replace: true });
    };

    return (
        <AppLayout title="SuperAdmin — Clients">
            <div className="mx-auto max-w-6xl px-4 py-6 space-y-6">
                <PageHeader title="Gestion des clients" subtitle="Toutes les entreprises CONSTRUIRO" />

                <form onSubmit={doSearch} className="flex gap-3">
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Rechercher par nom ou email…"
                        className="form-input flex-1"
                    />
                    <button type="submit" className="btn btn-primary">Rechercher</button>
                </form>

                <div className="card">
                    <div className="card-body overflow-x-auto">
                        <table className="table-construiro w-full">
                            <thead>
                                <tr>
                                    <th>Entreprise</th>
                                    <th>Pays</th>
                                    <th>Statut</th>
                                    <th>Plan</th>
                                    <th>Inscrite le</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {companies.data.map((c) => (
                                    <tr key={c.id}>
                                        <td>
                                            <Link href={`/superadmin/clients/${c.id}`} className="font-medium text-orange-500 hover:text-orange-600">
                                                {c.name}
                                            </Link>
                                            {c.email && <p className="text-xs text-slate-400">{c.email}</p>}
                                        </td>
                                        <td>{c.country} — {c.city}</td>
                                        <td>
                                            <Badge variant={STATUS_COLORS[c.subscription_status] ?? 'neutral'}>
                                                {c.subscription_status}
                                            </Badge>
                                            {!c.is_active && <Badge variant="danger" className="ml-1">Bloqué</Badge>}
                                        </td>
                                        <td>{c.plan_name}</td>
                                        <td className="text-slate-500">{c.created_at}</td>
                                        <td>
                                            <Link href={`/superadmin/clients/${c.id}`} className="text-sm text-orange-500 hover:underline">
                                                Voir →
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Pagination */}
                {companies.links && (
                    <div className="flex gap-1 flex-wrap">
                        {companies.links.map((link, i) => (
                            <Link
                                key={i}
                                href={link.url ?? '#'}
                                className={`px-3 py-1 rounded text-sm border ${link.active ? 'bg-orange-500 text-white border-orange-500' : 'border-slate-200 text-slate-600 hover:border-orange-300'}`}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        ))}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
