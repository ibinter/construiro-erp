import { useState } from 'react';
import { Link, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { PageHeader, Badge } from '@/Components/UI';

const STATUSES = [
    { value: '',               label: 'Tous' },
    { value: 'new',            label: 'Nouveau' },
    { value: 'contacted',      label: 'Contacté' },
    { value: 'demo_scheduled', label: 'Démo planifiée' },
    { value: 'converted',      label: 'Converti' },
    { value: 'lost',           label: 'Perdu' },
];

const STATUS_META = {
    new:            { label: 'Nouveau',         variant: 'info' },
    contacted:      { label: 'Contacté',        variant: 'warning' },
    demo_scheduled: { label: 'Démo planifiée',  variant: 'purple' },
    converted:      { label: 'Converti',        variant: 'success' },
    lost:           { label: 'Perdu',           variant: 'danger' },
};

export default function ProspectsIndex({ prospects, filters }) {
    const [search, setSearch]           = useState(filters.search ?? '');
    const [activeStatus, setActiveStatus] = useState(filters.status ?? '');
    const [loadingId, setLoadingId]     = useState(null);

    /* ── KPI counters from paginated data ── */
    const counts = (prospects.data ?? []).reduce((acc, p) => {
        acc[p.status] = (acc[p.status] ?? 0) + 1;
        return acc;
    }, {});

    /* ── Search / filter ── */
    const applyFilters = (overrides = {}) => {
        const params = {
            search:  overrides.search  ?? search,
            status:  overrides.status  ?? activeStatus,
        };
        // strip empty keys
        Object.keys(params).forEach((k) => !params[k] && delete params[k]);
        router.get('/superadmin/prospects', params, { preserveState: true, replace: true });
    };

    const handleSearch = (e) => {
        e.preventDefault();
        applyFilters();
    };

    const handleStatusFilter = (value) => {
        setActiveStatus(value);
        applyFilters({ status: value });
    };

    /* ── Inline status update ── */
    const handleStatusChange = (prospect, newStatus) => {
        setLoadingId(prospect.id);
        router.patch(
            `/superadmin/prospects/${prospect.id}/status`,
            { status: newStatus },
            {
                preserveState: true,
                onFinish: () => setLoadingId(null),
            },
        );
    };

    return (
        <AppLayout title="SuperAdmin — Prospects">
            <div className="mx-auto max-w-7xl px-4 py-6 space-y-6">
                <PageHeader
                    title="Prospects &amp; Demandes de démo"
                    subtitle="Suivi des entreprises intéressées par CONSTRUIRO"
                />

                {/* ── KPI cards ── */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                    {STATUSES.filter((s) => s.value).map((s) => (
                        <button
                            key={s.value}
                            onClick={() => handleStatusFilter(activeStatus === s.value ? '' : s.value)}
                            className={`card p-4 text-left transition-all hover:ring-2 hover:ring-orange-500 ${
                                activeStatus === s.value ? 'ring-2 ring-orange-500' : ''
                            }`}
                        >
                            <p className="text-2xl font-bold text-white">{counts[s.value] ?? 0}</p>
                            <p className="text-xs text-slate-400 mt-1">{s.label}</p>
                        </button>
                    ))}
                </div>

                {/* ── Search bar ── */}
                <form onSubmit={handleSearch} className="flex gap-3">
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Rechercher par nom, société ou email…"
                        className="form-input flex-1"
                    />
                    <button type="submit" className="btn btn-primary">Rechercher</button>
                    {(search || activeStatus) && (
                        <button
                            type="button"
                            onClick={() => {
                                setSearch('');
                                setActiveStatus('');
                                router.get('/superadmin/prospects', {}, { replace: true });
                            }}
                            className="btn btn-ghost"
                        >
                            Réinitialiser
                        </button>
                    )}
                </form>

                {/* ── Status pills ── */}
                <div className="flex flex-wrap gap-2">
                    {STATUSES.map((s) => (
                        <button
                            key={s.value}
                            onClick={() => handleStatusFilter(s.value)}
                            className={`px-3 py-1 rounded-full text-sm border transition-colors ${
                                activeStatus === s.value
                                    ? 'bg-orange-500 text-white border-orange-500'
                                    : 'border-slate-600 text-slate-300 hover:border-orange-400 hover:text-orange-400'
                            }`}
                        >
                            {s.label}
                        </button>
                    ))}
                </div>

                {/* ── Table ── */}
                <div className="card">
                    <div className="card-body overflow-x-auto">
                        <table className="table-construiro w-full">
                            <thead>
                                <tr>
                                    <th>Société</th>
                                    <th>Contact</th>
                                    <th>Email</th>
                                    <th>Téléphone</th>
                                    <th>Secteur</th>
                                    <th>Date</th>
                                    <th>Statut</th>
                                    <th>Changer statut</th>
                                </tr>
                            </thead>
                            <tbody>
                                {prospects.data.length === 0 && (
                                    <tr>
                                        <td colSpan={8} className="text-center text-slate-400 py-10">
                                            Aucun prospect trouvé.
                                        </td>
                                    </tr>
                                )}
                                {prospects.data.map((p) => {
                                    const meta = STATUS_META[p.status] ?? { label: p.status, variant: 'neutral' };
                                    return (
                                        <tr key={p.id} className={loadingId === p.id ? 'opacity-50' : ''}>
                                            <td className="font-medium text-white">
                                                {p.company || <span className="text-slate-500">—</span>}
                                            </td>
                                            <td>{p.name}</td>
                                            <td>
                                                <a
                                                    href={`mailto:${p.email}`}
                                                    className="text-orange-400 hover:underline text-sm"
                                                >
                                                    {p.email}
                                                </a>
                                            </td>
                                            <td className="text-slate-300 text-sm">
                                                {p.phone || <span className="text-slate-500">—</span>}
                                            </td>
                                            <td className="text-slate-300 text-sm">
                                                {p.sector || <span className="text-slate-500">—</span>}
                                            </td>
                                            <td className="text-slate-400 text-sm whitespace-nowrap">
                                                {p.created_at}
                                            </td>
                                            <td>
                                                <Badge variant={meta.variant}>{meta.label}</Badge>
                                                {p.notes && (
                                                    <p
                                                        className="text-xs text-slate-500 mt-1 max-w-[160px] truncate"
                                                        title={p.notes}
                                                    >
                                                        {p.notes}
                                                    </p>
                                                )}
                                            </td>
                                            <td>
                                                <select
                                                    value={p.status}
                                                    onChange={(e) => handleStatusChange(p, e.target.value)}
                                                    disabled={loadingId === p.id}
                                                    className="form-input text-sm py-1 px-2"
                                                >
                                                    {STATUSES.filter((s) => s.value).map((s) => (
                                                        <option key={s.value} value={s.value}>
                                                            {s.label}
                                                        </option>
                                                    ))}
                                                </select>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* ── Pagination ── */}
                {prospects.links && (
                    <div className="flex gap-1 flex-wrap">
                        {prospects.links.map((link, i) => (
                            <Link
                                key={i}
                                href={link.url ?? '#'}
                                className={`px-3 py-1 rounded text-sm border ${
                                    link.active
                                        ? 'bg-orange-500 text-white border-orange-500'
                                        : 'border-slate-600 text-slate-400 hover:border-orange-400'
                                }`}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        ))}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
