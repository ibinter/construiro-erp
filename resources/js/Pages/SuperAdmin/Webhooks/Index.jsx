import { useState } from 'react';
import { router, useForm, usePage } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { PageHeader, Badge } from '@/Components/UI';

/* ── Helpers ─────────────────────────────────────────── */
function statusBadge(success) {
    return success
        ? <Badge variant="success">OK</Badge>
        : <Badge variant="danger">Échec</Badge>;
}

function eventLabel(e) {
    const labels = {
        'invoice.created':   'Facture créée',
        'invoice.paid':      'Facture payée',
        'invoice.overdue':   'Facture en retard',
        'project.created':   'Projet créé',
        'project.updated':   'Projet mis à jour',
        'project.completed': 'Projet terminé',
        'quote.accepted':    'Devis accepté',
        'quote.rejected':    'Devis rejeté',
        'payment.received':  'Paiement reçu',
        'employee.created':  'Employé créé',
        'employee.updated':  'Employé mis à jour',
    };
    return labels[e] ?? e;
}

/* ── Modal Webhook ───────────────────────────────────── */
function WebhookModal({ open, onClose, webhook, availableEvents, companies }) {
    const isEdit = !!webhook;

    const { data, setData, post, put, processing, errors, reset } = useForm({
        company_id: webhook?.company_id ?? '',
        name:       webhook?.name ?? '',
        url:        webhook?.url ?? '',
        events:     webhook?.events ?? [],
        is_active:  webhook?.is_active ?? true,
    });

    const toggleEvent = (e) => {
        setData('events', data.events.includes(e)
            ? data.events.filter(x => x !== e)
            : [...data.events, e]
        );
    };

    const handleSubmit = (ev) => {
        ev.preventDefault();
        if (isEdit) {
            put(`/superadmin/webhooks/${webhook.id}`, { onSuccess: () => { reset(); onClose(); } });
        } else {
            post('/superadmin/webhooks', { onSuccess: () => { reset(); onClose(); } });
        }
    };

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
            <div className="w-full max-w-lg rounded-xl bg-gray-900 border border-gray-700 shadow-2xl">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-gray-700 px-6 py-4">
                    <h2 className="text-base font-semibold text-white">
                        {isEdit ? 'Modifier le webhook' : 'Nouveau webhook'}
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white text-xl leading-none">&times;</button>
                </div>

                {/* Body */}
                <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
                    {/* Entreprise (création uniquement) */}
                    {!isEdit && (
                        <div>
                            <label className="block text-xs font-medium text-gray-400 mb-1">Entreprise *</label>
                            <select
                                value={data.company_id}
                                onChange={(e) => setData('company_id', e.target.value)}
                                className="form-input w-full bg-gray-800 border-gray-600 text-white"
                                required
                            >
                                <option value="">— Sélectionner —</option>
                                {companies.map(c => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                            </select>
                            {errors.company_id && <p className="mt-1 text-xs text-red-400">{errors.company_id}</p>}
                        </div>
                    )}

                    {/* Nom */}
                    <div>
                        <label className="block text-xs font-medium text-gray-400 mb-1">Nom *</label>
                        <input
                            type="text"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            placeholder="Ex : Notifier Slack projets"
                            className="form-input w-full bg-gray-800 border-gray-600 text-white placeholder-gray-500"
                            required
                        />
                        {errors.name && <p className="mt-1 text-xs text-red-400">{errors.name}</p>}
                    </div>

                    {/* URL */}
                    <div>
                        <label className="block text-xs font-medium text-gray-400 mb-1">URL de destination *</label>
                        <input
                            type="url"
                            value={data.url}
                            onChange={(e) => setData('url', e.target.value)}
                            placeholder="https://hooks.example.com/construiro"
                            className="form-input w-full bg-gray-800 border-gray-600 text-white placeholder-gray-500"
                            required
                        />
                        {errors.url && <p className="mt-1 text-xs text-red-400">{errors.url}</p>}
                    </div>

                    {/* Événements */}
                    <div>
                        <label className="block text-xs font-medium text-gray-400 mb-2">
                            Événements déclencheurs *
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                            {availableEvents.map(ev => (
                                <label key={ev} className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={data.events.includes(ev)}
                                        onChange={() => toggleEvent(ev)}
                                        className="accent-orange-500"
                                    />
                                    <span className="text-xs text-gray-300">{eventLabel(ev)}</span>
                                </label>
                            ))}
                        </div>
                        {errors.events && <p className="mt-1 text-xs text-red-400">{errors.events}</p>}
                    </div>

                    {/* Actif */}
                    <label className="flex items-center gap-3 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={data.is_active}
                            onChange={(e) => setData('is_active', e.target.checked)}
                            className="accent-orange-500"
                        />
                        <span className="text-sm text-gray-300">Webhook actif</span>
                    </label>

                    {/* Secret info (nouveau) */}
                    {!isEdit && (
                        <p className="text-xs text-gray-500 rounded bg-gray-800 px-3 py-2">
                            Un secret HMAC sera généré automatiquement et affiché après la création.
                        </p>
                    )}

                    {/* Actions */}
                    <div className="flex justify-end gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="btn btn-secondary"
                        >
                            Annuler
                        </button>
                        <button
                            type="submit"
                            disabled={processing}
                            className="btn btn-primary bg-orange-500 hover:bg-orange-600 border-orange-500"
                        >
                            {processing ? 'Enregistrement…' : isEdit ? 'Mettre à jour' : 'Créer'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

/* ── Page principale ─────────────────────────────────── */
export default function WebhooksIndex({
    webhooks,
    recent_deliveries,
    available_events,
    companies,
    filters,
}) {
    const { props } = usePage();
    const flash = props.flash ?? {};

    const [tab, setTab] = useState('webhooks'); // 'webhooks' | 'deliveries'
    const [modalOpen, setModalOpen] = useState(false);
    const [editTarget, setEditTarget] = useState(null);

    // Filtre recherche
    const [search, setSearch] = useState(filters.search ?? '');
    const [companyFilter, setCompanyFilter] = useState(filters.company_id ?? '');

    // Secret flash — affiché une seule fois
    const newSecret = flash.new_secret ?? null;

    const applyFilters = () => {
        router.get(
            '/superadmin/webhooks',
            { search: search || undefined, company_id: companyFilter || undefined },
            { preserveState: true, replace: true }
        );
    };

    const openCreate = () => { setEditTarget(null); setModalOpen(true); };
    const openEdit   = (w) => { setEditTarget(w);    setModalOpen(true); };

    const handleDelete = (webhook) => {
        if (!confirm(`Supprimer le webhook « ${webhook.name} » ?`)) return;
        router.delete(`/superadmin/webhooks/${webhook.id}`, { preserveScroll: true });
    };

    const handleRegenSecret = (webhook) => {
        if (!confirm(`Régénérer le secret de « ${webhook.name} » ? L'ancien secret sera invalidé.`)) return;
        router.post(`/superadmin/webhooks/${webhook.id}/regenerate-secret`, {}, { preserveScroll: true });
    };

    return (
        <AppLayout title="SuperAdmin — Webhooks sortants">
            <div className="mx-auto max-w-7xl px-4 py-6 space-y-6">
                <PageHeader
                    title="Webhooks sortants"
                    subtitle="Intégrations temps réel vers les outils externes des entreprises"
                    actions={
                        <button
                            onClick={openCreate}
                            className="btn btn-primary bg-orange-500 hover:bg-orange-600 border-orange-500"
                        >
                            + Nouveau webhook
                        </button>
                    }
                />

                {/* Flash success */}
                {flash.success && (
                    <div className="rounded-lg border border-green-700 bg-green-900/30 px-4 py-3 text-sm text-green-300">
                        {flash.success}
                    </div>
                )}

                {/* Secret flash — affiché une seule fois */}
                {newSecret && (
                    <div className="rounded-lg border border-yellow-600 bg-yellow-900/30 px-4 py-3 text-sm text-yellow-200 space-y-1">
                        <p className="font-semibold">Secret HMAC — notez-le maintenant, il ne sera plus affiché :</p>
                        <code className="block font-mono text-xs bg-gray-900 text-orange-300 rounded px-3 py-2 break-all">
                            {newSecret}
                        </code>
                        <p className="text-xs text-yellow-400">
                            Ajoutez ce secret dans la configuration de votre outil externe.
                            Chaque requête sera signée avec <code>X-Construiro-Signature: sha256=...</code>
                        </p>
                    </div>
                )}

                {/* Onglets */}
                <div className="flex gap-1 border-b border-gray-700">
                    {[
                        { key: 'webhooks',   label: `Webhooks (${webhooks.total})` },
                        { key: 'deliveries', label: `Livraisons récentes (${recent_deliveries.length})` },
                    ].map(({ key, label }) => (
                        <button
                            key={key}
                            onClick={() => setTab(key)}
                            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                                tab === key
                                    ? 'border-orange-500 text-orange-400'
                                    : 'border-transparent text-gray-400 hover:text-gray-200'
                            }`}
                        >
                            {label}
                        </button>
                    ))}
                </div>

                {/* ── Onglet Webhooks ───────────────────────────── */}
                {tab === 'webhooks' && (
                    <div className="space-y-4">
                        {/* Filtres */}
                        <div className="flex flex-wrap gap-3 items-end">
                            <div>
                                <label className="block text-xs font-medium text-gray-400 mb-1">Recherche</label>
                                <input
                                    type="text"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
                                    placeholder="Nom ou URL…"
                                    className="form-input bg-gray-800 border-gray-600 text-white placeholder-gray-500"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-400 mb-1">Entreprise</label>
                                <select
                                    value={companyFilter}
                                    onChange={(e) => setCompanyFilter(e.target.value)}
                                    className="form-input bg-gray-800 border-gray-600 text-white"
                                >
                                    <option value="">Toutes</option>
                                    {companies.map(c => (
                                        <option key={c.id} value={c.id}>{c.name}</option>
                                    ))}
                                </select>
                            </div>
                            <button onClick={applyFilters} className="btn btn-primary bg-orange-500 hover:bg-orange-600 border-orange-500">
                                Filtrer
                            </button>
                        </div>

                        {/* Tableau */}
                        <div className="card bg-gray-800 border-gray-700">
                            <div className="card-body overflow-x-auto">
                                <table className="table-construiro w-full">
                                    <thead>
                                        <tr>
                                            <th className="text-gray-300">Nom</th>
                                            <th className="text-gray-300">Entreprise</th>
                                            <th className="text-gray-300">URL</th>
                                            <th className="text-gray-300">Événements</th>
                                            <th className="text-gray-300">Statut</th>
                                            <th className="text-gray-300">Échecs</th>
                                            <th className="text-gray-300">Dernier déclench.</th>
                                            <th className="text-gray-300">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {webhooks.data.length === 0 && (
                                            <tr>
                                                <td colSpan={8} className="text-center text-gray-500 py-8">
                                                    Aucun webhook configuré.
                                                </td>
                                            </tr>
                                        )}
                                        {webhooks.data.map((w) => (
                                            <tr key={w.id} className="border-gray-700">
                                                <td className="text-white font-medium">{w.name}</td>
                                                <td className="text-gray-400 text-sm">{w.company_name}</td>
                                                <td className="max-w-[200px]">
                                                    <span
                                                        className="font-mono text-xs text-orange-400 truncate block"
                                                        title={w.url}
                                                    >
                                                        {w.url}
                                                    </span>
                                                </td>
                                                <td>
                                                    <div className="flex flex-wrap gap-1">
                                                        {(w.events ?? []).slice(0, 3).map(ev => (
                                                            <span
                                                                key={ev}
                                                                className="px-1.5 py-0.5 rounded text-[10px] bg-gray-700 text-gray-300"
                                                            >
                                                                {ev}
                                                            </span>
                                                        ))}
                                                        {(w.events ?? []).length > 3 && (
                                                            <span className="text-xs text-gray-500">
                                                                +{w.events.length - 3}
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td>
                                                    {w.is_active
                                                        ? <Badge variant="success">Actif</Badge>
                                                        : <Badge variant="secondary">Inactif</Badge>
                                                    }
                                                </td>
                                                <td className={`text-sm font-medium ${w.failure_count > 0 ? 'text-red-400' : 'text-gray-400'}`}>
                                                    {w.failure_count}
                                                </td>
                                                <td className="text-gray-500 text-sm">
                                                    {w.last_triggered_at ?? '—'}
                                                </td>
                                                <td>
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() => openEdit(w)}
                                                            className="text-xs text-orange-400 hover:text-orange-300 hover:underline"
                                                        >
                                                            Modifier
                                                        </button>
                                                        <button
                                                            onClick={() => handleRegenSecret(w)}
                                                            className="text-xs text-yellow-400 hover:text-yellow-300 hover:underline"
                                                        >
                                                            Secret
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(w)}
                                                            className="text-xs text-red-400 hover:text-red-300 hover:underline"
                                                        >
                                                            Supprimer
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Pagination */}
                        {webhooks.links && (
                            <div className="flex gap-1 flex-wrap">
                                {webhooks.links.map((link, i) => (
                                    <button
                                        key={i}
                                        disabled={!link.url}
                                        onClick={() => link.url && router.get(link.url, {}, { preserveState: true })}
                                        className={`px-3 py-1 rounded text-sm border ${
                                            link.active
                                                ? 'bg-orange-500 text-white border-orange-500'
                                                : 'border-gray-600 text-gray-400 hover:border-orange-400 disabled:opacity-40'
                                        }`}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* ── Onglet Livraisons ─────────────────────────── */}
                {tab === 'deliveries' && (
                    <div className="card bg-gray-800 border-gray-700">
                        <div className="card-body overflow-x-auto">
                            <table className="table-construiro w-full">
                                <thead>
                                    <tr>
                                        <th className="text-gray-300">Date</th>
                                        <th className="text-gray-300">Webhook</th>
                                        <th className="text-gray-300">Entreprise</th>
                                        <th className="text-gray-300">Événement</th>
                                        <th className="text-gray-300">HTTP</th>
                                        <th className="text-gray-300">Résultat</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {recent_deliveries.length === 0 && (
                                        <tr>
                                            <td colSpan={6} className="text-center text-gray-500 py-8">
                                                Aucune livraison enregistrée.
                                            </td>
                                        </tr>
                                    )}
                                    {recent_deliveries.map((d) => (
                                        <tr key={d.id} className="border-gray-700">
                                            <td className="text-gray-400 text-sm whitespace-nowrap">
                                                {d.delivered_at}
                                            </td>
                                            <td className="text-gray-300 text-sm">{d.webhook_name}</td>
                                            <td className="text-gray-400 text-sm">{d.company_name}</td>
                                            <td>
                                                <span className="px-2 py-0.5 rounded text-[11px] bg-gray-700 text-orange-300 font-mono">
                                                    {d.event_type}
                                                </span>
                                            </td>
                                            <td className="text-sm">
                                                {d.response_status
                                                    ? <span className={`font-mono font-semibold ${d.response_status < 300 ? 'text-green-400' : 'text-red-400'}`}>
                                                        {d.response_status}
                                                      </span>
                                                    : <span className="text-gray-500">—</span>
                                                }
                                            </td>
                                            <td>
                                                {statusBadge(d.success)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>

            {/* Modal création/édition */}
            <WebhookModal
                key={editTarget?.id ?? 'new'}
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                webhook={editTarget}
                availableEvents={available_events}
                companies={companies}
            />
        </AppLayout>
    );
}
