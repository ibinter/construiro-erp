import { useState } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import Icon from '@/Components/Icon';
import { Head, Link, router } from '@inertiajs/react';

// Libellés des types de client (FR) — local à ce module.
const CLIENT_TYPE = {
    particulier: 'Particulier',
    entreprise:  'Entreprise',
    public:      'Secteur public',
    promoteur:   'Promoteur immobilier',
};

const TYPE_COLOR = {
    particulier: 'bg-slate-100 text-slate-600',
    entreprise:  'bg-blue-100 text-blue-700',
    public:      'bg-purple-100 text-purple-700',
    promoteur:   'bg-orange-100 text-orange-700',
};

function TypeBadge({ type }) {
    const color = TYPE_COLOR[type] ?? 'bg-slate-100 text-slate-600';
    return (
        <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${color}`}>
            {CLIENT_TYPE[type] ?? type}
        </span>
    );
}

function ActiveBadge({ active }) {
    return active ? (
        <span className="inline-flex rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700">
            Actif
        </span>
    ) : (
        <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-500">
            Inactif
        </span>
    );
}

export default function Index({ clients, filters, types, can }) {
    const [search, setSearch] = useState(filters.search ?? '');

    const applyFilters = (next = {}) => {
        router.get('/clients', { search, type: filters.type, ...next }, {
            preserveState: true,
            replace: true,
        });
    };

    return (
        <AppLayout header="Clients">
            <Head title="Clients" />

            {/* Barre d'actions */}
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <form
                    onSubmit={(e) => { e.preventDefault(); applyFilters(); }}
                    className="flex items-center gap-2"
                >
                    <div className="relative">
                        <Icon name="search" className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Rechercher un client…"
                            className="w-64 rounded-md border-slate-300 pl-9 text-sm focus:border-orange-500 focus:ring-orange-500 dark:border-slate-700 dark:bg-slate-900"
                        />
                    </div>
                    <select
                        value={filters.type ?? ''}
                        onChange={(e) => applyFilters({ type: e.target.value })}
                        className="rounded-md border-slate-300 text-sm focus:border-orange-500 focus:ring-orange-500 dark:border-slate-700 dark:bg-slate-900"
                    >
                        <option value="">Tous les types</option>
                        {types.map((t) => (
                            <option key={t} value={t}>{CLIENT_TYPE[t] ?? t}</option>
                        ))}
                    </select>
                </form>

                <div className="flex gap-2">
                    <a href="/export/clients" target="_blank" rel="noopener"
                        className="inline-flex items-center gap-2 rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800">
                        <Icon name="file-spreadsheet" className="h-4 w-4" /> Exporter
                    </a>
                    {can.create && (
                        <Link
                            href="/clients/create"
                            className="inline-flex items-center gap-2 rounded-md bg-orange-500 px-4 py-2 text-sm font-medium text-white hover:bg-orange-600"
                        >
                            <Icon name="plus" className="h-4 w-4" />
                            Nouveau client
                        </Link>
                    )}
                </div>
            </div>

            {/* Tableau */}
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
                <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
                    <thead className="bg-slate-50 dark:bg-slate-800/50">
                        <tr className="text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                            <th className="px-4 py-3">Client</th>
                            <th className="px-4 py-3">Type</th>
                            <th className="px-4 py-3">Contact</th>
                            <th className="px-4 py-3">Ville</th>
                            <th className="px-4 py-3">Statut</th>
                            <th className="px-4 py-3"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {clients.data.map((client) => (
                            <tr key={client.id} className="text-sm hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                <td className="px-4 py-3">
                                    <Link href={`/clients/${client.id}`} className="font-medium text-slate-800 hover:text-orange-600 dark:text-slate-100">
                                        {client.name}
                                    </Link>
                                    <div className="text-xs text-slate-400">{client.code}</div>
                                </td>
                                <td className="px-4 py-3"><TypeBadge type={client.type} /></td>
                                <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                                    {client.contact_name || '—'}
                                    {client.phone ? <div className="text-xs text-slate-400">{client.phone}</div> : null}
                                </td>
                                <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                                    {client.city || '—'}
                                </td>
                                <td className="px-4 py-3"><ActiveBadge active={client.is_active} /></td>
                                <td className="px-4 py-3 text-right">
                                    <Link href={`/clients/${client.id}`} className="text-slate-400 hover:text-orange-600">
                                        <Icon name="chevron-right" className="h-4 w-4" />
                                    </Link>
                                </td>
                            </tr>
                        ))}

                        {clients.data.length === 0 && (
                            <tr>
                                <td colSpan={6} className="px-4 py-12 text-center text-slate-400">
                                    <Icon name="users" className="mx-auto mb-2 h-8 w-8" />
                                    Aucun client trouvé.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {clients.last_page > 1 && (
                <div className="mt-4 flex flex-wrap gap-1">
                    {clients.links.map((link, i) => (
                        <button
                            key={i}
                            disabled={!link.url}
                            onClick={() => link.url && router.get(link.url, {}, { preserveState: true })}
                            className={`rounded-md px-3 py-1.5 text-sm ${
                                link.active
                                    ? 'bg-orange-500 text-white'
                                    : 'text-slate-600 hover:bg-slate-100 disabled:opacity-40 dark:text-slate-300 dark:hover:bg-slate-800'
                            }`}
                            dangerouslySetInnerHTML={{ __html: link.label }}
                        />
                    ))}
                </div>
            )}
        </AppLayout>
    );
}
