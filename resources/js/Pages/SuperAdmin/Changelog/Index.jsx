import { Link, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { PageHeader, Badge } from '@/Components/UI';

const TYPE_CONFIG = {
    feature:     { label: 'Fonctionnalité', variant: 'success' },
    fix:         { label: 'Correction',     variant: 'info'    },
    improvement: { label: 'Amélioration',   variant: 'warning' },
    security:    { label: 'Sécurité',       variant: 'danger'  },
};

function TypeBadge({ type }) {
    const cfg = TYPE_CONFIG[type] ?? { label: type, variant: 'neutral' };
    return <Badge variant={cfg.variant}>{cfg.label}</Badge>;
}

export default function ChangelogIndex({ entries }) {
    function handleDestroy(id, version) {
        if (!confirm(`Supprimer la version ${version} ?`)) return;
        router.delete(route('superadmin.changelogs.destroy', id));
    }

    function handlePublish(id) {
        router.post(route('superadmin.changelogs.publish', id));
    }

    return (
        <AppLayout title="SuperAdmin — Gestion Changelog">
            <div className="mx-auto max-w-5xl px-4 py-6 space-y-6">
                <div className="flex items-center justify-between flex-wrap gap-3">
                    <PageHeader
                        title="Gestion du Changelog"
                        subtitle="Publiez les notes de version de CONSTRUIRO ERP"
                    />
                    <Link href={route('superadmin.changelogs.create')} className="btn btn-primary shrink-0">
                        + Nouvelle version
                    </Link>
                </div>

                <div className="card">
                    <div className="card-body overflow-x-auto">
                        <table className="table-construiro w-full">
                            <thead>
                                <tr>
                                    <th>Version</th>
                                    <th>Titre</th>
                                    <th>Type</th>
                                    <th>Statut</th>
                                    <th>Date publication</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {entries.data?.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="text-center text-slate-400 py-8">
                                            Aucune entrée de changelog. Commencez par en créer une.
                                        </td>
                                    </tr>
                                )}
                                {entries.data?.map(entry => (
                                    <tr key={entry.id}>
                                        <td>
                                            <span className="font-mono font-bold text-orange-500">
                                                {entry.version}
                                            </span>
                                        </td>
                                        <td className="font-medium text-slate-800 dark:text-slate-100 max-w-xs truncate">
                                            {entry.title}
                                        </td>
                                        <td><TypeBadge type={entry.type} /></td>
                                        <td>
                                            {entry.is_published
                                                ? <Badge variant="success">Publié</Badge>
                                                : <Badge variant="neutral">Brouillon</Badge>
                                            }
                                        </td>
                                        <td className="text-slate-500 text-sm">
                                            {entry.published_at
                                                ? new Date(entry.published_at).toLocaleDateString('fr-FR')
                                                : '—'
                                            }
                                        </td>
                                        <td>
                                            <div className="flex items-center gap-2">
                                                <Link
                                                    href={route('superadmin.changelogs.edit', entry.id)}
                                                    className="text-sm text-orange-500 hover:text-orange-600"
                                                >
                                                    Éditer
                                                </Link>
                                                {!entry.is_published && (
                                                    <button
                                                        onClick={() => handlePublish(entry.id)}
                                                        className="text-sm text-green-600 hover:text-green-700"
                                                    >
                                                        Publier
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => handleDestroy(entry.id, entry.version)}
                                                    className="text-sm text-red-500 hover:text-red-600"
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
                {entries.links && entries.links.length > 3 && (
                    <div className="flex gap-1 flex-wrap">
                        {entries.links.map((link, i) => (
                            <Link
                                key={i}
                                href={link.url ?? '#'}
                                className={`px-3 py-1 rounded text-sm border ${
                                    link.active
                                        ? 'bg-orange-500 text-white border-orange-500'
                                        : 'border-slate-200 text-slate-600 hover:border-orange-300 dark:border-slate-700 dark:text-slate-400'
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
