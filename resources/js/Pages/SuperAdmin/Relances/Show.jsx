import { router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';

// ---------------------------------------------------------------------------
// Constantes
// ---------------------------------------------------------------------------
const STATUS_COLORS = {
    pending:      'bg-gray-700 text-gray-300',
    sent:         'bg-blue-900 text-blue-300',
    opened:       'bg-green-900 text-green-300',
    clicked:      'bg-indigo-900 text-indigo-300',
    unsubscribed: 'bg-yellow-900 text-yellow-300',
    bounced:      'bg-red-900 text-red-300',
};

const STATUS_LABELS = {
    pending:      'En attente',
    sent:         'Envoyé',
    opened:       'Ouvert',
    clicked:      'Cliqué',
    unsubscribed: 'Désabonné',
    bounced:      'Bounced',
};

const TYPE_LABELS = {
    trial_expiring:   'Trial expirant',
    demo_no_response: 'Démo sans réponse',
    offer_pending:    'Offre en attente',
    inactive_users:   'Utilisateurs inactifs',
    custom:           'Personnalisée',
};

// ---------------------------------------------------------------------------
// Stat tile
// ---------------------------------------------------------------------------
function StatTile({ label, value, pct }) {
    return (
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-4">
            <p className="text-xs text-gray-400 uppercase tracking-wide">{label}</p>
            <p className="text-2xl font-bold text-white mt-1">{value}</p>
            {pct !== undefined && (
                <p className="text-xs text-gray-500 mt-0.5">{pct}%</p>
            )}
        </div>
    );
}

// ---------------------------------------------------------------------------
// Badge destinataire
// ---------------------------------------------------------------------------
function RecipientBadge({ status }) {
    return (
        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[status] ?? STATUS_COLORS.pending}`}>
            {STATUS_LABELS[status] ?? status}
        </span>
    );
}

// ---------------------------------------------------------------------------
// Page Show
// ---------------------------------------------------------------------------
export default function RelancesShow({ campaign, recipients }) {
    const openRate  = campaign.sent_count > 0
        ? Math.round((campaign.opened_count / campaign.sent_count) * 100)
        : 0;
    const clickRate = campaign.sent_count > 0
        ? Math.round((campaign.clicked_count / campaign.sent_count) * 100)
        : 0;

    const handleRelancerNonOuverts = () => {
        if (!confirm('Créer une sous-campagne pour relancer les destinataires n\'ayant pas ouvert ?')) return;
        // Pré-remplir une nouvelle campagne en filtrant les non-ouverts
        // On redirige vers la liste avec un paramètre d'initiative
        router.get('/superadmin/relances', { resend_from: campaign.id });
    };

    return (
        <AppLayout>
            <div className="min-h-screen bg-gray-900 text-white px-4 py-6 md:px-8 space-y-8">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <a
                            href="/superadmin/relances"
                            className="text-sm text-gray-400 hover:text-orange-400 transition mb-2 inline-block"
                        >
                            ← Retour aux campagnes
                        </a>
                        <h1 className="text-xl font-bold text-white">{campaign.name}</h1>
                        <p className="text-gray-400 text-sm mt-1">
                            {TYPE_LABELS[campaign.type] ?? campaign.type}
                            {campaign.scheduled_at && ` · Planifiée le ${campaign.scheduled_at}`}
                            {campaign.completed_at && ` · Terminée le ${campaign.completed_at}`}
                        </p>
                    </div>
                    {campaign.sent_count > 0 && (
                        <button
                            onClick={handleRelancerNonOuverts}
                            className="px-5 py-2.5 text-sm font-semibold text-white rounded-xl hover:opacity-90 transition"
                            style={{ backgroundColor: '#F58220' }}
                        >
                            Relancer les non-ouverts
                        </button>
                    )}
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <StatTile label="Destinataires" value={campaign.target_count} />
                    <StatTile label="Envoyés" value={campaign.sent_count} />
                    <StatTile label="Ouverts" value={campaign.opened_count} pct={openRate} />
                    <StatTile label="Cliqués" value={campaign.clicked_count} pct={clickRate} />
                </div>

                {/* Sujet & aperçu corps */}
                <div className="bg-gray-800 border border-gray-700 rounded-2xl p-5 space-y-3">
                    <p className="text-xs text-gray-400 uppercase tracking-wide">Sujet</p>
                    <p className="text-white font-medium">{campaign.subject}</p>
                    <p className="text-xs text-gray-400 uppercase tracking-wide mt-3">Aperçu du corps</p>
                    <div
                        className="bg-gray-900 rounded-xl p-4 text-sm text-gray-300 max-h-48 overflow-y-auto"
                        dangerouslySetInnerHTML={{ __html: campaign.body_html }}
                    />
                </div>

                {/* Liste des destinataires */}
                <div className="bg-gray-800 border border-gray-700 rounded-2xl overflow-hidden">
                    <div className="px-4 py-3 border-b border-gray-700 flex items-center justify-between">
                        <h2 className="text-sm font-semibold text-white">
                            Destinataires
                            <span className="text-gray-400 font-normal ml-2">({recipients.total} total)</span>
                        </h2>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-gray-700 text-gray-400 text-xs uppercase tracking-wide">
                                    <th className="text-left px-4 py-3">Email</th>
                                    <th className="text-left px-4 py-3">Nom</th>
                                    <th className="text-left px-4 py-3">Entreprise</th>
                                    <th className="text-left px-4 py-3">Statut</th>
                                    <th className="text-left px-4 py-3">Envoyé le</th>
                                    <th className="text-left px-4 py-3">Ouvert le</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-700">
                                {recipients.data.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                                            Aucun destinataire enregistré.
                                        </td>
                                    </tr>
                                )}
                                {recipients.data.map((r) => (
                                    <tr key={r.id} className="hover:bg-gray-750 transition-colors">
                                        <td className="px-4 py-3 text-white font-mono text-xs">{r.email}</td>
                                        <td className="px-4 py-3 text-gray-300">{r.name ?? '—'}</td>
                                        <td className="px-4 py-3 text-gray-300">{r.company ?? '—'}</td>
                                        <td className="px-4 py-3"><RecipientBadge status={r.status} /></td>
                                        <td className="px-4 py-3 text-gray-400 text-xs">{r.sent_at ?? '—'}</td>
                                        <td className="px-4 py-3 text-gray-400 text-xs">{r.opened_at ?? '—'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {recipients.last_page > 1 && (
                        <div className="px-4 py-3 border-t border-gray-700 flex justify-between items-center text-xs text-gray-400">
                            <span>Page {recipients.current_page} / {recipients.last_page}</span>
                            <div className="flex gap-2">
                                {recipients.prev_page_url && (
                                    <a href={recipients.prev_page_url} className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded text-white">
                                        ← Précédent
                                    </a>
                                )}
                                {recipients.next_page_url && (
                                    <a href={recipients.next_page_url} className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded text-white">
                                        Suivant →
                                    </a>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
