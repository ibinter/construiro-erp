import { useState } from 'react';
import { router, useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { PageHeader, Badge } from '@/Components/UI';

// ---------------------------------------------------------------------------
// Constantes
// ---------------------------------------------------------------------------
const TYPE_LABELS = {
    trial_expiring:   'Trial expirant',
    demo_no_response: 'Démo sans réponse',
    offer_pending:    'Offre en attente',
    inactive_users:   'Utilisateurs inactifs',
    custom:           'Personnalisée',
};

const STATUS_COLORS = {
    draft:     'neutral',
    scheduled: 'info',
    running:   'success',
    completed: 'primary',
    paused:    'warning',
};

const STATUS_LABELS = {
    draft:     'Brouillon',
    scheduled: 'Planifiée',
    running:   'En cours',
    completed: 'Terminée',
    paused:    'En pause',
};

// ---------------------------------------------------------------------------
// KPI Card
// ---------------------------------------------------------------------------
function KpiCard({ label, value, sub }) {
    return (
        <div className="bg-gray-800 rounded-xl p-5 flex flex-col gap-1 border border-gray-700">
            <span className="text-gray-400 text-xs uppercase tracking-wide">{label}</span>
            <span className="text-2xl font-bold text-white">{value}</span>
            {sub && <span className="text-xs text-gray-500">{sub}</span>}
        </div>
    );
}

// ---------------------------------------------------------------------------
// Progress bar
// ---------------------------------------------------------------------------
function ProgressBar({ value, max }) {
    const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;
    return (
        <div className="w-full bg-gray-700 rounded-full h-2 mt-1">
            <div
                className="h-2 rounded-full transition-all"
                style={{ width: `${pct}%`, backgroundColor: '#F58220' }}
            />
        </div>
    );
}

// ---------------------------------------------------------------------------
// Modal de création
// ---------------------------------------------------------------------------
function CreateCampaignModal({ onClose }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        name:         '',
        type:         'demo_no_response',
        subject:      '',
        body_html:    '',
        scheduled_at: '',
        filters:      {},
    });

    const submit = (e) => {
        e.preventDefault();
        post('/superadmin/relances', {
            onSuccess: () => { reset(); onClose(); },
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
            <div className="bg-gray-800 border border-gray-700 rounded-2xl shadow-2xl w-full max-w-2xl p-6 space-y-5 max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-white">Nouvelle campagne de relance</h3>
                    <button type="button" onClick={onClose} className="text-gray-400 hover:text-white text-2xl leading-none">&times;</button>
                </div>

                <form onSubmit={submit} className="space-y-4">
                    {/* Nom */}
                    <div>
                        <label className="block text-sm text-gray-400 mb-1">Nom de la campagne *</label>
                        <input
                            type="text"
                            className="w-full bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:border-orange-500 focus:outline-none"
                            placeholder="Ex : Relance prospects sans réponse — Juillet 2026"
                            value={data.name}
                            onChange={e => setData('name', e.target.value)}
                            required
                        />
                        {errors.name && <p className="text-xs text-red-400 mt-1">{errors.name}</p>}
                    </div>

                    {/* Type */}
                    <div>
                        <label className="block text-sm text-gray-400 mb-1">Type de ciblage *</label>
                        <select
                            className="w-full bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:border-orange-500 focus:outline-none"
                            value={data.type}
                            onChange={e => setData('type', e.target.value)}
                        >
                            {Object.entries(TYPE_LABELS).map(([k, v]) => (
                                <option key={k} value={k}>{v}</option>
                            ))}
                        </select>
                        {errors.type && <p className="text-xs text-red-400 mt-1">{errors.type}</p>}
                    </div>

                    {/* Sujet */}
                    <div>
                        <label className="block text-sm text-gray-400 mb-1">Sujet de l'email *</label>
                        <input
                            type="text"
                            className="w-full bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:border-orange-500 focus:outline-none"
                            placeholder="Ex : Votre période d'essai CONSTRUIRO se termine bientôt"
                            value={data.subject}
                            onChange={e => setData('subject', e.target.value)}
                            required
                        />
                        {errors.subject && <p className="text-xs text-red-400 mt-1">{errors.subject}</p>}
                    </div>

                    {/* Corps HTML */}
                    <div>
                        <label className="block text-sm text-gray-400 mb-1">Corps de l'email (HTML) *</label>
                        <textarea
                            className="w-full bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:border-orange-500 focus:outline-none font-mono"
                            rows={8}
                            placeholder="<p>Bonjour {{name}},</p><p>...</p>"
                            value={data.body_html}
                            onChange={e => setData('body_html', e.target.value)}
                            required
                        />
                        {errors.body_html && <p className="text-xs text-red-400 mt-1">{errors.body_html}</p>}
                    </div>

                    {/* Planification */}
                    <div>
                        <label className="block text-sm text-gray-400 mb-1">Planifier l'envoi (optionnel)</label>
                        <input
                            type="datetime-local"
                            className="w-full bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:border-orange-500 focus:outline-none"
                            value={data.scheduled_at}
                            onChange={e => setData('scheduled_at', e.target.value)}
                        />
                        {errors.scheduled_at && <p className="text-xs text-red-400 mt-1">{errors.scheduled_at}</p>}
                    </div>

                    {/* Custom emails */}
                    {data.type === 'custom' && (
                        <div>
                            <label className="block text-sm text-gray-400 mb-1">Emails personnalisés (séparés par virgule)</label>
                            <textarea
                                className="w-full bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:border-orange-500 focus:outline-none"
                                rows={3}
                                placeholder="email1@exemple.com, email2@exemple.com"
                                onChange={e => {
                                    const emails = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
                                    setData('filters', { emails });
                                }}
                            />
                        </div>
                    )}

                    <div className="flex justify-end gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-sm text-gray-400 hover:text-white border border-gray-600 rounded-lg"
                        >
                            Annuler
                        </button>
                        <button
                            type="submit"
                            disabled={processing}
                            className="px-5 py-2 text-sm font-semibold text-white rounded-lg disabled:opacity-50"
                            style={{ backgroundColor: '#F58220' }}
                        >
                            {processing ? 'Création…' : 'Créer la campagne'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// ---------------------------------------------------------------------------
// Page principale
// ---------------------------------------------------------------------------
export default function RelancesIndex({ campaigns, kpis }) {
    const [showCreate, setShowCreate] = useState(false);

    const handleLaunch = (id) => {
        if (!confirm('Lancer la campagne ? Les emails seront envoyés immédiatement.')) return;
        router.post(`/superadmin/relances/${id}/launch`);
    };

    const handlePause = (id) => {
        router.post(`/superadmin/relances/${id}/pause`);
    };

    const handleDelete = (id, name) => {
        if (!confirm(`Supprimer la campagne « ${name} » ?`)) return;
        router.delete(`/superadmin/relances/${id}`);
    };

    return (
        <AppLayout>
            <div className="min-h-screen bg-gray-900 text-white px-4 py-6 md:px-8 space-y-8">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-white">Relances &amp; Campagnes</h1>
                        <p className="text-gray-400 text-sm mt-1">Gérez vos campagnes d'emailing commercial</p>
                    </div>
                    <button
                        onClick={() => setShowCreate(true)}
                        className="px-5 py-2.5 text-sm font-semibold text-white rounded-xl hover:opacity-90 transition"
                        style={{ backgroundColor: '#F58220' }}
                    >
                        + Nouvelle campagne
                    </button>
                </div>

                {/* KPI cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <KpiCard label="Campagnes actives" value={kpis.active_count} />
                    <KpiCard label="Emails envoyés ce mois" value={kpis.sent_this_month.toLocaleString('fr-FR')} />
                    <KpiCard label="Taux d'ouverture moyen" value={`${kpis.avg_open_rate}%`} />
                </div>

                {/* Table campagnes */}
                <div className="bg-gray-800 border border-gray-700 rounded-2xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-gray-700 text-gray-400 text-xs uppercase tracking-wide">
                                    <th className="text-left px-4 py-3">Campagne</th>
                                    <th className="text-left px-4 py-3">Type</th>
                                    <th className="text-left px-4 py-3">Statut</th>
                                    <th className="text-right px-4 py-3">Envoyés</th>
                                    <th className="text-right px-4 py-3">Ouverture</th>
                                    <th className="text-right px-4 py-3">Clic</th>
                                    <th className="text-right px-4 py-3">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-700">
                                {campaigns.data.length === 0 && (
                                    <tr>
                                        <td colSpan={7} className="px-4 py-12 text-center text-gray-500">
                                            Aucune campagne pour l'instant. Créez votre première campagne !
                                        </td>
                                    </tr>
                                )}
                                {campaigns.data.map((c) => (
                                    <tr key={c.id} className="hover:bg-gray-750 transition-colors">
                                        <td className="px-4 py-3">
                                            <a
                                                href={`/superadmin/relances/${c.id}`}
                                                className="font-medium text-white hover:text-orange-400 transition"
                                            >
                                                {c.name}
                                            </a>
                                            <p className="text-xs text-gray-500 mt-0.5">{c.created_at} · {c.created_by}</p>
                                            {/* Barre de progression si running */}
                                            {c.status === 'running' && c.target_count > 0 && (
                                                <div className="mt-1">
                                                    <p className="text-xs text-gray-400">
                                                        {c.sent_count} / {c.target_count} envoyés
                                                    </p>
                                                    <ProgressBar value={c.sent_count} max={c.target_count} />
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-gray-300 text-xs">
                                            {TYPE_LABELS[c.type] ?? c.type}
                                        </td>
                                        <td className="px-4 py-3">
                                            <StatusBadge status={c.status} />
                                        </td>
                                        <td className="px-4 py-3 text-right text-gray-300">
                                            {c.sent_count.toLocaleString('fr-FR')}
                                            <span className="text-gray-600"> / {c.target_count.toLocaleString('fr-FR')}</span>
                                        </td>
                                        <td className="px-4 py-3 text-right text-gray-300">{c.open_rate}%</td>
                                        <td className="px-4 py-3 text-right text-gray-300">{c.click_rate}%</td>
                                        <td className="px-4 py-3 text-right">
                                            <div className="flex items-center justify-end gap-2 flex-wrap">
                                                <a
                                                    href={`/superadmin/relances/${c.id}`}
                                                    className="px-3 py-1 text-xs bg-gray-700 hover:bg-gray-600 rounded-lg text-white transition"
                                                >
                                                    Détail
                                                </a>
                                                {['draft', 'paused', 'scheduled'].includes(c.status) && (
                                                    <button
                                                        onClick={() => handleLaunch(c.id)}
                                                        className="px-3 py-1 text-xs rounded-lg text-white transition"
                                                        style={{ backgroundColor: '#F58220' }}
                                                    >
                                                        Lancer
                                                    </button>
                                                )}
                                                {c.status === 'running' && (
                                                    <button
                                                        onClick={() => handlePause(c.id)}
                                                        className="px-3 py-1 text-xs bg-yellow-600 hover:bg-yellow-500 rounded-lg text-white transition"
                                                    >
                                                        Pause
                                                    </button>
                                                )}
                                                {['draft', 'paused', 'scheduled'].includes(c.status) && (
                                                    <button
                                                        onClick={() => handleDelete(c.id, c.name)}
                                                        className="px-3 py-1 text-xs bg-red-700 hover:bg-red-600 rounded-lg text-white transition"
                                                    >
                                                        Supprimer
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {campaigns.last_page > 1 && (
                        <div className="px-4 py-3 border-t border-gray-700 flex justify-between items-center text-xs text-gray-400">
                            <span>Page {campaigns.current_page} / {campaigns.last_page}</span>
                            <div className="flex gap-2">
                                {campaigns.prev_page_url && (
                                    <a href={campaigns.prev_page_url} className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded text-white">
                                        ← Précédent
                                    </a>
                                )}
                                {campaigns.next_page_url && (
                                    <a href={campaigns.next_page_url} className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded text-white">
                                        Suivant →
                                    </a>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {showCreate && <CreateCampaignModal onClose={() => setShowCreate(false)} />}
        </AppLayout>
    );
}

// ---------------------------------------------------------------------------
// Badge de statut
// ---------------------------------------------------------------------------
function StatusBadge({ status }) {
    const MAP = {
        draft:     'bg-gray-700 text-gray-300',
        scheduled: 'bg-blue-900 text-blue-300',
        running:   'bg-green-900 text-green-300',
        completed: 'bg-indigo-900 text-indigo-300',
        paused:    'bg-yellow-900 text-yellow-300',
    };

    return (
        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${MAP[status] ?? MAP.draft}`}>
            {STATUS_LABELS[status] ?? status}
        </span>
    );
}
