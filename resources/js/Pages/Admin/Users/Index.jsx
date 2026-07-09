import { useState } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import Icon from '@/Components/Icon';
import { Head, Link, router } from '@inertiajs/react';
import { useTrans } from '@/i18n';

export default function Index({ users, filters, roles, can }) {
    const { t } = useTrans();
    const [search, setSearch] = useState(filters.search ?? '');

    const applyFilters = (next = {}) => {
        router.get('/admin/users', { search, ...next }, {
            preserveState: true,
            replace: true,
        });
    };

    // Suppression avec confirmation simple.
    const destroy = (user) => {
        if (confirm(`Supprimer l'utilisateur « ${user.name} » ?`)) {
            router.delete(`/admin/users/${user.id}`, { preserveScroll: true });
        }
    };

    return (
        <AppLayout header="Administration — Utilisateurs">
            <Head title={t('Utilisateurs')} />

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
                            placeholder={t('Rechercher un utilisateur…')}
                            className="w-64 rounded-md border-slate-300 pl-9 text-sm focus:border-orange-500 focus:ring-orange-500 dark:border-slate-700 dark:bg-slate-900"
                        />
                    </div>
                </form>

                {can.create && (
                    <Link
                        href="/admin/users/create"
                        className="inline-flex items-center gap-2 rounded-md bg-orange-500 px-4 py-2 text-sm font-medium text-white hover:bg-orange-600"
                    >
                        <Icon name="plus" className="h-4 w-4" />
                        {t('Nouvel utilisateur')}
                    </Link>
                )}
            </div>

            {/* Tableau */}
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
                <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
                    <thead className="bg-slate-50 dark:bg-slate-800/50">
                        <tr className="text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                            <th className="px-4 py-3">{t('Utilisateur')}</th>
                            <th className="px-4 py-3">{t('Fonction')}</th>
                            <th className="px-4 py-3">{t('Rôle')}</th>
                            <th className="px-4 py-3">{t('Statut')}</th>
                            <th className="px-4 py-3"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {users.data.map((user) => (
                            <tr key={user.id} className="text-sm hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                <td className="px-4 py-3">
                                    {can.update ? (
                                        <Link href={`/admin/users/${user.id}/edit`} className="font-medium text-slate-800 hover:text-orange-600 dark:text-slate-100">
                                            {user.name}
                                        </Link>
                                    ) : (
                                        <span className="font-medium text-slate-800 dark:text-slate-100">{user.name}</span>
                                    )}
                                    <div className="text-xs text-slate-400">{user.email}</div>
                                </td>
                                <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                                    {user.job_title || '—'}
                                </td>
                                <td className="px-4 py-3">
                                    {user.roles.length > 0 ? (
                                        <span className="inline-flex rounded-full bg-orange-100 px-2.5 py-0.5 text-xs font-medium text-orange-700 dark:bg-orange-500/10 dark:text-orange-400">
                                            {roles[user.roles[0]] ?? user.roles[0]}
                                        </span>
                                    ) : (
                                        <span className="text-xs text-slate-400">—</span>
                                    )}
                                </td>
                                <td className="px-4 py-3">
                                    {user.is_active ? (
                                        <span className="inline-flex rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
                                            {t('Actif')}
                                        </span>
                                    ) : (
                                        <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-500 dark:bg-slate-700 dark:text-slate-300">
                                            {t('Inactif')}
                                        </span>
                                    )}
                                </td>
                                <td className="px-4 py-3 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        {can.update && (
                                            <Link href={`/admin/users/${user.id}/edit`} className="text-slate-400 hover:text-orange-600">
                                                <Icon name="pencil" className="h-4 w-4" />
                                            </Link>
                                        )}
                                        {can.delete && (
                                            <button onClick={() => destroy(user)} className="text-slate-300 hover:text-red-600">
                                                <Icon name="trash-2" className="h-4 w-4" />
                                            </button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}

                        {users.data.length === 0 && (
                            <tr>
                                <td colSpan={5} className="px-4 py-12 text-center text-slate-400">
                                    <Icon name="users" className="mx-auto mb-2 h-8 w-8" />
                                    {t('Aucun utilisateur trouvé.')}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {users.last_page > 1 && (
                <div className="mt-4 flex flex-wrap gap-1">
                    {users.links.map((link, i) => (
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
