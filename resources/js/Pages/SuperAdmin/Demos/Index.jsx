import { useState } from 'react';
import { Link, router, useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { PageHeader, Badge } from '@/Components/UI';

/* ─────────────────────────── constants ─────────────────────────── */
const STATUS_META = {
    to_schedule: { label: 'À planifier',  variant: 'warning',  tab: 'to_schedule' },
    scheduled:   { label: 'Planifiée',    variant: 'info',     tab: 'scheduled' },
    done:        { label: 'Terminée',     variant: 'success',  tab: 'done' },
    cancelled:   { label: 'Annulée',      variant: 'danger',   tab: 'cancelled' },
    no_show:     { label: 'No-show',      variant: 'neutral',  tab: 'no_show' },
};

const TABS = [
    { value: '',           label: 'Toutes' },
    { value: 'to_schedule',label: 'À planifier' },
    { value: 'scheduled',  label: 'Planifiées' },
    { value: 'done',       label: 'Terminées' },
    { value: 'cancelled',  label: 'Annulées / No-show' },
];

const DURATIONS = [15, 30, 45, 60, 90, 120];

/* ─────────────────────────── badge helper ───────────────────────── */
function StatusBadge({ status }) {
    const meta = STATUS_META[status] ?? { label: status, variant: 'neutral' };
    return <Badge variant={meta.variant}>{meta.label}</Badge>;
}

/* ─────────────────────────── modal ─────────────────────────── */
function DemoModal({ open, onClose, prefill = null, onSubmit, loading }) {
    const { data, setData, reset, errors } = useForm({
        prospect_name:    prefill?.name    ?? '',
        prospect_email:   prefill?.email   ?? '',
        prospect_company: prefill?.company ?? '',
        demo_request_id:  prefill?.id      ?? '',
        assigned_to:      '',
        scheduled_at:     '',
        duration_minutes: 45,
        meeting_url:      '',
        notes:            '',
    });

    if (!open) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(data, reset);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
            <div className="bg-gray-900 border border-gray-700 rounded-xl w-full max-w-lg shadow-2xl">
                <div className="flex items-center justify-between p-5 border-b border-gray-700">
                    <h3 className="text-lg font-semibold text-white">
                        {prefill ? 'Planifier une démo depuis une demande' : 'Nouvelle démo'}
                    </h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-white text-xl leading-none">&times;</button>
                </div>

                <form onSubmit={handleSubmit} className="p-5 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="form-label">Nom prospect *</label>
                            <input
                                className={`form-input ${errors.prospect_name ? 'border-red-500' : ''}`}
                                value={data.prospect_name}
                                onChange={e => setData('prospect_name', e.target.value)}
                                placeholder="Kouassi Mathieu"
                            />
                            {errors.prospect_name && <p className="text-red-400 text-xs mt-1">{errors.prospect_name}</p>}
                        </div>
                        <div>
                            <label className="form-label">Email *</label>
                            <input
                                type="email"
                                className={`form-input ${errors.prospect_email ? 'border-red-500' : ''}`}
                                value={data.prospect_email}
                                onChange={e => setData('prospect_email', e.target.value)}
                                placeholder="contact@entreprise.ci"
                            />
                            {errors.prospect_email && <p className="text-red-400 text-xs mt-1">{errors.prospect_email}</p>}
                        </div>
                    </div>

                    <div>
                        <label className="form-label">Société</label>
                        <input
                            className="form-input"
                            value={data.prospect_company}
                            onChange={e => setData('prospect_company', e.target.value)}
                            placeholder="BTP Côte d'Ivoire SA"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="form-label">Date &amp; heure</label>
                            <input
                                type="datetime-local"
                                className="form-input"
                                value={data.scheduled_at}
                                onChange={e => setData('scheduled_at', e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="form-label">Durée</label>
                            <select
                                className="form-input"
                                value={data.duration_minutes}
                                onChange={e => setData('duration_minutes', Number(e.target.value))}
                            >
                                {DURATIONS.map(d => (
                                    <option key={d} value={d}>{d} min</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="form-label">Responsable IBIG (email)</label>
                        <input
                            type="email"
                            className="form-input"
                            value={data.assigned_to}
                            onChange={e => setData('assigned_to', e.target.value)}
                            placeholder="responsable@ibigsoft.com"
                        />
                    </div>

                    <div>
                        <label className="form-label">Lien meeting (Zoom / Meet)</label>
                        <input
                            type="url"
                            className="form-input"
                            value={data.meeting_url}
                            onChange={e => setData('meeting_url', e.target.value)}
                            placeholder="https://meet.google.com/xxx-yyy-zzz"
                        />
                        {errors.meeting_url && <p className="text-red-400 text-xs mt-1">{errors.meeting_url}</p>}
                    </div>

                    <div>
                        <label className="form-label">Notes internes</label>
                        <textarea
                            className="form-input"
                            rows={3}
                            value={data.notes}
                            onChange={e => setData('notes', e.target.value)}
                            placeholder="Besoins spécifiques, modules à montrer…"
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-2">
                        <button type="button" onClick={onClose} className="btn btn-ghost">
                            Annuler
                        </button>
                        <button type="submit" disabled={loading} className="btn btn-primary">
                            {loading ? 'Enregistrement…' : 'Créer la démo'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

/* ─────────────────────────── edit modal ─────────────────────────── */
function EditModal({ open, demo, onClose, onSubmit, loading }) {
    const { data, setData, errors } = useForm({
        status:           demo?.status           ?? 'to_schedule',
        scheduled_at:     demo?.scheduled_at     ?? '',
        duration_minutes: demo?.duration_minutes ?? 45,
        assigned_to:      demo?.assigned_to      ?? '',
        meeting_url:      demo?.meeting_url      ?? '',
        notes:            demo?.notes            ?? '',
    });

    if (!open || !demo) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(demo.id, data);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
            <div className="bg-gray-900 border border-gray-700 rounded-xl w-full max-w-lg shadow-2xl">
                <div className="flex items-center justify-between p-5 border-b border-gray-700">
                    <h3 className="text-lg font-semibold text-white">
                        Modifier — {demo.prospect_name}
                    </h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-white text-xl leading-none">&times;</button>
                </div>

                <form onSubmit={handleSubmit} className="p-5 space-y-4">
                    <div>
                        <label className="form-label">Statut</label>
                        <select
                            className="form-input"
                            value={data.status}
                            onChange={e => setData('status', e.target.value)}
                        >
                            {Object.entries(STATUS_META).map(([v, m]) => (
                                <option key={v} value={v}>{m.label}</option>
                            ))}
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="form-label">Date &amp; heure</label>
                            <input
                                type="datetime-local"
                                className="form-input"
                                value={data.scheduled_at}
                                onChange={e => setData('scheduled_at', e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="form-label">Durée</label>
                            <select
                                className="form-input"
                                value={data.duration_minutes}
                                onChange={e => setData('duration_minutes', Number(e.target.value))}
                            >
                                {DURATIONS.map(d => (
                                    <option key={d} value={d}>{d} min</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="form-label">Responsable IBIG</label>
                        <input
                            type="email"
                            className="form-input"
                            value={data.assigned_to}
                            onChange={e => setData('assigned_to', e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="form-label">Lien meeting</label>
                        <input
                            type="url"
                            className="form-input"
                            value={data.meeting_url}
                            onChange={e => setData('meeting_url', e.target.value)}
                        />
                        {errors.meeting_url && <p className="text-red-400 text-xs mt-1">{errors.meeting_url}</p>}
                    </div>

                    <div>
                        <label className="form-label">Notes</label>
                        <textarea
                            className="form-input"
                            rows={3}
                            value={data.notes}
                            onChange={e => setData('notes', e.target.value)}
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-2">
                        <button type="button" onClick={onClose} className="btn btn-ghost">Annuler</button>
                        <button type="submit" disabled={loading} className="btn btn-primary">
                            {loading ? 'Enregistrement…' : 'Sauvegarder'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

/* ─────────────────────────── main page ─────────────────────────── */
export default function DemosIndex({ demos, counts, pendingRequests, filters }) {
    const [activeTab,    setActiveTab]    = useState(filters.status ?? '');
    const [createOpen,   setCreateOpen]   = useState(false);
    const [prefillData,  setPrefillData]  = useState(null);   // from pendingRequests
    const [editTarget,   setEditTarget]   = useState(null);
    const [editOpen,     setEditOpen]     = useState(false);
    const [saving,       setSaving]       = useState(false);

    /* ── KPIs ── */
    const total          = Object.values(counts).reduce((a, b) => a + b, 0);
    const toScheduleCount = counts.to_schedule ?? 0;
    const scheduledCount  = counts.scheduled   ?? 0;
    const doneCount       = counts.done        ?? 0;

    /* ── Tab filter ── */
    const handleTab = (value) => {
        setActiveTab(value);
        const params = value ? { status: value } : {};
        router.get('/superadmin/demos', params, { preserveState: true, replace: true });
    };

    /* ── Create ── */
    const openCreateFromRequest = (req) => {
        setPrefillData(req);
        setCreateOpen(true);
    };

    const handleCreate = (data, reset) => {
        setSaving(true);
        router.post('/superadmin/demos', data, {
            preserveState: false,
            onSuccess: () => { reset(); setCreateOpen(false); setPrefillData(null); },
            onFinish: () => setSaving(false),
        });
    };

    /* ── Update ── */
    const openEdit = (demo) => {
        setEditTarget(demo);
        setEditOpen(true);
    };

    const handleUpdate = (id, data) => {
        setSaving(true);
        router.patch(`/superadmin/demos/${id}`, data, {
            preserveState: false,
            onSuccess: () => setEditOpen(false),
            onFinish: () => setSaving(false),
        });
    };

    /* ── Delete ── */
    const handleDelete = (id) => {
        if (!confirm('Supprimer cette démo ?')) return;
        router.delete(`/superadmin/demos/${id}`, { preserveState: false });
    };

    return (
        <AppLayout title="SuperAdmin — Démos planifiées">
            <div className="mx-auto max-w-7xl px-4 py-6 space-y-6">
                <div className="flex items-center justify-between flex-wrap gap-3">
                    <PageHeader
                        title="Gestion des démonstrations"
                        subtitle="Planifiez, suivez et finalisez les démos CONSTRUIRO"
                    />
                    <button
                        onClick={() => { setPrefillData(null); setCreateOpen(true); }}
                        className="btn btn-primary whitespace-nowrap"
                    >
                        + Nouvelle démo
                    </button>
                </div>

                {/* ── KPI cards ── */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="card p-4">
                        <p className="text-2xl font-bold text-white">{total}</p>
                        <p className="text-xs text-slate-400 mt-1">Total démos</p>
                    </div>
                    <div className="card p-4">
                        <p className="text-2xl font-bold text-orange-400">{toScheduleCount}</p>
                        <p className="text-xs text-slate-400 mt-1">À planifier</p>
                    </div>
                    <div className="card p-4">
                        <p className="text-2xl font-bold text-blue-400">{scheduledCount}</p>
                        <p className="text-xs text-slate-400 mt-1">Planifiées</p>
                    </div>
                    <div className="card p-4">
                        <p className="text-2xl font-bold text-green-400">{doneCount}</p>
                        <p className="text-xs text-slate-400 mt-1">Terminées</p>
                    </div>
                </div>

                {/* ── Tabs ── */}
                <div className="flex flex-wrap gap-2 border-b border-gray-700 pb-1">
                    {TABS.map((t) => (
                        <button
                            key={t.value}
                            onClick={() => handleTab(t.value)}
                            className={`px-4 py-2 text-sm font-medium rounded-t transition-colors ${
                                activeTab === t.value
                                    ? 'bg-orange-500 text-white'
                                    : 'text-slate-400 hover:text-orange-400'
                            }`}
                        >
                            {t.label}
                            {t.value && counts[t.value] ? (
                                <span className="ml-2 bg-gray-700 text-slate-300 text-xs rounded-full px-2 py-0.5">
                                    {counts[t.value]}
                                </span>
                            ) : null}
                        </button>
                    ))}
                </div>

                {/* ── Demos table ── */}
                <div className="card">
                    <div className="card-body overflow-x-auto">
                        <table className="table-construiro w-full text-sm">
                            <thead>
                                <tr>
                                    <th>Prospect</th>
                                    <th>Société</th>
                                    <th>Date planifiée</th>
                                    <th>Durée</th>
                                    <th>Responsable</th>
                                    <th>Meeting</th>
                                    <th>Statut</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {demos.data.length === 0 && (
                                    <tr>
                                        <td colSpan={8} className="text-center text-slate-400 py-10">
                                            Aucune démo dans cette catégorie.
                                        </td>
                                    </tr>
                                )}
                                {demos.data.map((d) => (
                                    <tr key={d.id}>
                                        <td>
                                            <p className="font-medium text-white">{d.prospect_name}</p>
                                            <a
                                                href={`mailto:${d.prospect_email}`}
                                                className="text-orange-400 hover:underline text-xs"
                                            >
                                                {d.prospect_email}
                                            </a>
                                        </td>
                                        <td className="text-slate-300">
                                            {d.prospect_company || <span className="text-slate-500">—</span>}
                                        </td>
                                        <td className="whitespace-nowrap">
                                            {d.scheduled_at ? (
                                                <span className="text-white">{d.scheduled_at}</span>
                                            ) : (
                                                <span className="text-slate-500 italic">Non planifiée</span>
                                            )}
                                        </td>
                                        <td className="text-slate-300 text-center">
                                            {d.duration_minutes} min
                                        </td>
                                        <td className="text-slate-300 text-xs">
                                            {d.assigned_to ? (
                                                <a href={`mailto:${d.assigned_to}`} className="hover:text-orange-400">
                                                    {d.assigned_to}
                                                </a>
                                            ) : (
                                                <span className="text-slate-500">—</span>
                                            )}
                                        </td>
                                        <td>
                                            {d.meeting_url ? (
                                                <a
                                                    href={d.meeting_url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-blue-400 hover:underline text-xs truncate block max-w-[120px]"
                                                    title={d.meeting_url}
                                                >
                                                    Rejoindre
                                                </a>
                                            ) : (
                                                <span className="text-slate-500 text-xs">—</span>
                                            )}
                                        </td>
                                        <td>
                                            <StatusBadge status={d.status} />
                                        </td>
                                        <td>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => openEdit(d)}
                                                    className="btn btn-ghost text-xs py-1 px-2"
                                                    title="Modifier"
                                                >
                                                    Modifier
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(d.id)}
                                                    className="btn btn-ghost text-xs py-1 px-2 text-red-400 hover:text-red-300"
                                                    title="Supprimer"
                                                >
                                                    &times;
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* ── Pagination ── */}
                {demos.links && demos.links.length > 3 && (
                    <div className="flex gap-1 flex-wrap">
                        {demos.links.map((link, i) => (
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

                {/* ── Demandes en attente (sans démo planifiée) ── */}
                {pendingRequests.length > 0 && (
                    <div className="card">
                        <div className="card-body">
                            <h3 className="text-base font-semibold text-white mb-4">
                                Demandes sans démo planifiée
                                <span className="ml-2 bg-orange-500/20 text-orange-400 text-xs rounded-full px-2 py-0.5">
                                    {pendingRequests.length}
                                </span>
                            </h3>
                            <div className="overflow-x-auto">
                                <table className="table-construiro w-full text-sm">
                                    <thead>
                                        <tr>
                                            <th>Prospect</th>
                                            <th>Société</th>
                                            <th>Email</th>
                                            <th>Secteur</th>
                                            <th>Reçu le</th>
                                            <th>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {pendingRequests.map((r) => (
                                            <tr key={r.id}>
                                                <td className="font-medium text-white">{r.name}</td>
                                                <td className="text-slate-300">
                                                    {r.company || <span className="text-slate-500">—</span>}
                                                </td>
                                                <td>
                                                    <a
                                                        href={`mailto:${r.email}`}
                                                        className="text-orange-400 hover:underline text-xs"
                                                    >
                                                        {r.email}
                                                    </a>
                                                </td>
                                                <td className="text-slate-300 text-xs">
                                                    {r.sector || <span className="text-slate-500">—</span>}
                                                </td>
                                                <td className="text-slate-400 text-xs whitespace-nowrap">
                                                    {r.created_at}
                                                </td>
                                                <td>
                                                    <button
                                                        onClick={() => openCreateFromRequest(r)}
                                                        className="btn btn-primary text-xs py-1 px-3 whitespace-nowrap"
                                                    >
                                                        Planifier
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* ── Modals ── */}
            <DemoModal
                open={createOpen}
                onClose={() => { setCreateOpen(false); setPrefillData(null); }}
                prefill={prefillData}
                onSubmit={handleCreate}
                loading={saving}
            />
            <EditModal
                open={editOpen}
                demo={editTarget}
                onClose={() => setEditOpen(false)}
                onSubmit={handleUpdate}
                loading={saving}
            />
        </AppLayout>
    );
}
