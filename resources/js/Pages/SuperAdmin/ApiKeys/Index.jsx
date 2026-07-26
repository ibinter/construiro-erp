import { useState } from 'react';
import { router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { PageHeader, Badge } from '@/Components/UI';

const KeyIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
        <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/>
    </svg>
);

const CopyIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
    </svg>
);

const TrashIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
        <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
        <path d="M10 11v6"/><path d="M14 11v6"/>
        <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
    </svg>
);

const ChevronIcon = ({ open }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
         className={`h-4 w-4 transition-transform ${open ? 'rotate-180' : ''}`}>
        <polyline points="6 9 12 15 18 9"/>
    </svg>
);

function formatDate(dateStr) {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleString('fr-FR', {
        day: '2-digit', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
    });
}

function TokenRow({ token, onRevoke }) {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(token.token_preview ?? '');
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <tr className="border-b border-gray-700/50 hover:bg-gray-800/50 transition-colors">
            <td className="py-3 px-4">
                <span className="font-mono text-sm text-orange-400">{token.name}</span>
            </td>
            <td className="py-3 px-4 text-sm text-gray-300">{token.company_name ?? '—'}</td>
            <td className="py-3 px-4 text-sm text-gray-400">{formatDate(token.last_used_at)}</td>
            <td className="py-3 px-4 text-sm text-gray-400">{formatDate(token.created_at)}</td>
            <td className="py-3 px-4">
                <Badge color={token.expires_at && new Date(token.expires_at) < new Date() ? 'danger' : 'success'}>
                    {token.expires_at && new Date(token.expires_at) < new Date() ? 'Expiré' : 'Actif'}
                </Badge>
            </td>
            <td className="py-3 px-4">
                <button
                    onClick={() => onRevoke(token.id)}
                    className="inline-flex items-center gap-1 text-red-400 hover:text-red-300 text-xs transition-colors"
                    title="Révoquer ce token"
                >
                    <TrashIcon /> Révoquer
                </button>
            </td>
        </tr>
    );
}

function CompanySection({ company, onRevoke }) {
    const [open, setOpen] = useState(true);

    return (
        <div className="mb-4 rounded-lg bg-gray-800 border border-gray-700 overflow-hidden">
            {/* Header */}
            <button
                onClick={() => setOpen(v => !v)}
                className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-gray-700/50 transition-colors"
            >
                <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-500/20 text-orange-400">
                        <KeyIcon />
                    </div>
                    <div>
                        <p className="font-semibold text-white">{company.name}</p>
                        <p className="text-xs text-gray-400">{company.tokens.length} token{company.tokens.length !== 1 ? 's' : ''} actif{company.tokens.length !== 1 ? 's' : ''}</p>
                    </div>
                </div>
                <ChevronIcon open={open} />
            </button>

            {/* Table */}
            {open && (
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-gray-700 bg-gray-900/50">
                                <th className="py-2 px-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Nom du token</th>
                                <th className="py-2 px-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Entreprise</th>
                                <th className="py-2 px-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Dernière utilisation</th>
                                <th className="py-2 px-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Créé le</th>
                                <th className="py-2 px-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Statut</th>
                                <th className="py-2 px-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {company.tokens.map(token => (
                                <TokenRow key={token.id} token={token} onRevoke={onRevoke} />
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

/**
 * SuperAdmin — API Keys Management
 *
 * Props expected from the backend controller:
 *   companies: Array<{
 *     id: number,
 *     name: string,
 *     tokens: Array<{
 *       id: number,
 *       user_id: number,
 *       name: string,
 *       last_used_at: string|null,
 *       created_at: string,
 *       expires_at: string|null,
 *     }>
 *   }>
 *   stats: { total_tokens: number, active_tokens: number, companies_with_tokens: number }
 */
export default function ApiKeysIndex({ companies = [], stats = {} }) {
    const [localCompanies, setLocalCompanies] = useState(companies);
    const [revoking, setRevoking] = useState(null);
    const [notice, setNotice] = useState(null);

    const totalTokens        = stats.total_tokens             ?? localCompanies.reduce((s, c) => s + c.tokens.length, 0);
    const activeTokens       = stats.active_tokens            ?? totalTokens;
    const companiesWithTokens = stats.companies_with_tokens   ?? localCompanies.length;

    const handleRevoke = (tokenId) => {
        if (!confirm('Révoquer ce token API ? Cette action est irréversible.')) return;

        setRevoking(tokenId);
        router.delete(route('superadmin.api-tokens.destroy', tokenId), {
            preserveScroll: true,
            onSuccess: () => {
                setLocalCompanies(prev =>
                    prev
                        .map(c => ({ ...c, tokens: c.tokens.filter(t => t.id !== tokenId) }))
                        .filter(c => c.tokens.length > 0)
                );
                setNotice({ type: 'success', msg: 'Token révoqué avec succès.' });
            },
            onError: () => {
                setNotice({ type: 'error', msg: 'Erreur lors de la révocation.' });
            },
            onFinish: () => {
                setRevoking(null);
                setTimeout(() => setNotice(null), 4000);
            },
        });
    };

    return (
        <AppLayout title="Clés API">
            <div className="space-y-6 p-6">
                {/* Header */}
                <PageHeader
                    title="Gestion des clés API"
                    subtitle="Visualisez et révoquez les tokens Sanctum de toutes les entreprises"
                    icon={<KeyIcon />}
                />

                {/* Notice */}
                {notice && (
                    <div className={`rounded-lg px-4 py-3 text-sm font-medium ${
                        notice.type === 'success'
                            ? 'bg-green-900/40 text-green-300 border border-green-700'
                            : 'bg-red-900/40 text-red-300 border border-red-700'
                    }`}>
                        {notice.msg}
                    </div>
                )}

                {/* Stats */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    {[
                        { label: 'Tokens total', value: totalTokens, color: 'orange' },
                        { label: 'Tokens actifs', value: activeTokens, color: 'green' },
                        { label: 'Entreprises', value: companiesWithTokens, color: 'blue' },
                    ].map(({ label, value, color }) => (
                        <div key={label} className="rounded-lg bg-gray-800 border border-gray-700 px-5 py-4">
                            <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">{label}</p>
                            <p className={`mt-1 text-3xl font-bold ${
                                color === 'orange' ? 'text-orange-400'
                                : color === 'green'  ? 'text-green-400'
                                : 'text-blue-400'
                            }`}>{value}</p>
                        </div>
                    ))}
                </div>

                {/* API Reference */}
                <div className="rounded-lg bg-gray-800 border border-orange-500/30 px-5 py-4">
                    <p className="text-sm font-semibold text-orange-400 mb-2">Authentification API</p>
                    <p className="text-xs text-gray-400 mb-3">
                        Passez le token dans l'en-tête <code className="bg-gray-700 px-1 py-0.5 rounded text-orange-300">Authorization: Bearer &lt;token&gt;</code> pour tous les endpoints <code className="bg-gray-700 px-1 py-0.5 rounded text-orange-300">/api/v1/*</code>.
                    </p>
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 text-xs">
                        {[
                            { method: 'GET', path: '/api/v1/projects' },
                            { method: 'GET', path: '/api/v1/contacts' },
                            { method: 'GET', path: '/api/v1/invoices' },
                            { method: 'GET', path: '/api/v1/stock-items' },
                        ].map(({ method, path }) => (
                            <div key={path} className="flex items-center gap-2 rounded bg-gray-900/60 px-2 py-1.5">
                                <span className="font-bold text-green-400">{method}</span>
                                <span className="font-mono text-gray-300 truncate">{path}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Token list by company */}
                {localCompanies.length === 0 ? (
                    <div className="rounded-lg bg-gray-800 border border-gray-700 py-16 text-center">
                        <KeyIcon />
                        <p className="mt-3 text-gray-400">Aucune clé API active pour le moment.</p>
                        <p className="mt-1 text-xs text-gray-500">
                            Les entreprises peuvent générer leurs tokens via <code className="text-orange-400">POST /api/v1/tokens</code>.
                        </p>
                    </div>
                ) : (
                    localCompanies.map(company => (
                        <CompanySection
                            key={company.id}
                            company={company}
                            onRevoke={handleRevoke}
                        />
                    ))
                )}
            </div>
        </AppLayout>
    );
}
