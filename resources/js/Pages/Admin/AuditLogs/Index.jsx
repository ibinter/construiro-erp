import { Head, Link, router, usePage } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { useTrans } from '@/i18n';

const ACTION_COLORS = {
    created: 'badge-success',
    updated: 'badge-info',
    deleted: 'badge-danger',
    login:   'badge-neutral',
    export:  'badge-brand',
};

export default function AuditLogsIndex({ logs, modules, filters }) {
    const { t } = useTrans();

    const search = (key, value) => {
        router.get(route('admin.audit-logs.index'), { ...filters, [key]: value || undefined }, {
            preserveState: true, replace: true,
        });
    };

    return (
        <AppLayout header="Journal d'audit">
            <Head title="Journal d'audit" />

            <div className="page-header">
                <div>
                    <h1 className="page-title">{t("Journal d'audit")}</h1>
                    <p className="page-subtitle">{t('Historique de toutes les actions sensibles')}</p>
                </div>
            </div>

            {/* Filtres */}
            <div className="card mb-6">
                <div className="card-body">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                        <input
                            type="text"
                            placeholder={t('Rechercher…')}
                            defaultValue={filters.search}
                            className="form-input lg:col-span-2"
                            onKeyDown={e => e.key === 'Enter' && search('search', e.target.value)}
                            onBlur={e => search('search', e.target.value)}
                        />
                        <select className="form-select" defaultValue={filters.action}
                            onChange={e => search('action', e.target.value)}>
                            <option value="">{t('Toutes les actions')}</option>
                            {['created','updated','deleted','login','export','payment'].map(a => (
                                <option key={a} value={a}>{a}</option>
                            ))}
                        </select>
                        <select className="form-select" defaultValue={filters.module}
                            onChange={e => search('module', e.target.value)}>
                            <option value="">{t('Tous les modules')}</option>
                            {modules.map(m => <option key={m} value={m}>{m}</option>)}
                        </select>
                        <input type="date" className="form-input" defaultValue={filters.from}
                            onChange={e => search('from', e.target.value)} />
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="table-construiro">
                        <thead>
                            <tr>
                                <th>{t('Date')}</th>
                                <th>{t('Utilisateur')}</th>
                                <th>{t('Action')}</th>
                                <th>{t('Module')}</th>
                                <th>{t('Description')}</th>
                                <th>{t('IP')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {logs.data.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="text-center py-10 text-text-muted">
                                        {t('Aucun journal trouvé.')}
                                    </td>
                                </tr>
                            ) : logs.data.map(log => (
                                <tr key={log.id}>
                                    <td className="text-xs text-text-muted whitespace-nowrap">
                                        {new Date(log.created_at).toLocaleString('fr')}
                                    </td>
                                    <td>
                                        <div className="text-sm font-medium">{log.user_name ?? '—'}</div>
                                        <div className="text-xs text-text-muted">{log.user_email}</div>
                                    </td>
                                    <td>
                                        <span className={`badge ${ACTION_COLORS[log.action] ?? 'badge-neutral'}`}>
                                            {log.action}
                                        </span>
                                    </td>
                                    <td className="text-sm">{log.module ?? '—'}</td>
                                    <td className="text-sm max-w-xs truncate">{log.description}</td>
                                    <td className="text-xs text-text-muted">{log.ip_address}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {logs.last_page > 1 && (
                    <div className="card-footer flex items-center justify-between text-sm">
                        <span className="text-text-muted">
                            {logs.from}–{logs.to} {t('sur')} {logs.total}
                        </span>
                        <div className="flex gap-1">
                            {logs.links.map((link, i) => (
                                link.url ? (
                                    <Link key={i} href={link.url}
                                        className={`px-3 py-1 rounded text-sm ${link.active ? 'bg-brand text-white' : 'bg-surface-muted hover:bg-surface-border'}`}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                ) : (
                                    <span key={i} className="px-3 py-1 rounded text-sm text-text-muted opacity-50"
                                        dangerouslySetInnerHTML={{ __html: link.label }} />
                                )
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
