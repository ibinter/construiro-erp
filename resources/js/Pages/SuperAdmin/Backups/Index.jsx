import { router } from '@inertiajs/react';
import { Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { PageHeader, Badge } from '@/Components/UI';

const STATUS_COLORS = {
    completed: 'success',
    failed:    'danger',
    running:   'warning',
    pending:   'neutral',
};

const STATUS_LABELS = {
    completed: 'Terminé',
    failed:    'Échoué',
    running:   'En cours',
    pending:   'En attente',
};

const TYPE_LABELS = {
    full:     'Complète',
    database: 'Base de données',
    files:    'Fichiers',
};

function runBackup(type) {
    if (!confirm(`Lancer une sauvegarde "${type === 'full' ? 'complète' : 'BDD'}" maintenant ?`)) return;
    router.post('/superadmin/backups/run', { type }, { preserveScroll: true });
}

function deleteBackup(id) {
    if (!confirm('Supprimer cette sauvegarde définitivement ?')) return;
    router.delete(`/superadmin/backups/${id}`, { preserveScroll: true });
}

export default function BackupsIndex({ backups }) {
    return (
        <AppLayout title="SuperAdmin — Sauvegardes">
            <div className="mx-auto max-w-6xl px-4 py-6 space-y-6">
                <PageHeader
                    title="Sauvegardes & Restauration"
                    subtitle="Sauvegardes quotidiennes BDD à 02h00 — Sauvegardes complètes le dimanche à 03h00"
                />

                {/* Actions manuelles */}
                <div className="flex flex-wrap gap-3">
                    <button
                        type="button"
                        onClick={() => runBackup('database')}
                        className="btn btn-primary"
                    >
                        Sauvegarder BDD maintenant
                    </button>
                    <button
                        type="button"
                        onClick={() => runBackup('full')}
                        className="btn btn-secondary"
                    >
                        Sauvegarde complète maintenant
                    </button>
                </div>

                {/* Tableau */}
                <div className="card">
                    <div className="card-body overflow-x-auto">
                        <table className="table-construiro w-full">
                            <thead>
                                <tr>
                                    <th>Fichier</th>
                                    <th>Type</th>
                                    <th>Statut</th>
                                    <th>Taille</th>
                                    <th>Initié par</th>
                                    <th>Démarré</th>
                                    <th>Terminé</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {backups.data.length === 0 && (
                                    <tr>
                                        <td colSpan={8} className="text-center text-slate-400 py-8">
                                            Aucune sauvegarde trouvée.
                                        </td>
                                    </tr>
                                )}
                                {backups.data.map((b) => (
                                    <tr key={b.id}>
                                        <td className="font-mono text-xs max-w-xs truncate" title={b.filename}>
                                            {b.filename}
                                            {b.error_message && (
                                                <p className="text-red-500 text-xs mt-0.5 truncate" title={b.error_message}>
                                                    {b.error_message}
                                                </p>
                                            )}
                                        </td>
                                        <td>{TYPE_LABELS[b.type] ?? b.type}</td>
                                        <td>
                                            <Badge variant={STATUS_COLORS[b.status] ?? 'neutral'}>
                                                {STATUS_LABELS[b.status] ?? b.status}
                                            </Badge>
                                        </td>
                                        <td className="text-slate-500">
                                            {b.size_mb !== null ? `${b.size_mb} Mo` : '—'}
                                        </td>
                                        <td className="capitalize">{b.initiated_by}</td>
                                        <td className="text-slate-500 text-sm">{b.started_at ?? '—'}</td>
                                        <td className="text-slate-500 text-sm">{b.completed_at ?? '—'}</td>
                                        <td>
                                            <div className="flex gap-2">
                                                {b.status === 'completed' && (
                                                    <a
                                                        href={`/superadmin/backups/${b.id}/download`}
                                                        className="text-sm text-orange-500 hover:underline"
                                                    >
                                                        Télécharger
                                                    </a>
                                                )}
                                                <button
                                                    type="button"
                                                    onClick={() => deleteBackup(b.id)}
                                                    className="text-sm text-red-500 hover:underline"
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
                {backups.links && (
                    <div className="flex gap-1 flex-wrap">
                        {backups.links.map((link, i) => (
                            <Link
                                key={i}
                                href={link.url ?? '#'}
                                className={`px-3 py-1 rounded text-sm border ${
                                    link.active
                                        ? 'bg-orange-500 text-white border-orange-500'
                                        : 'border-slate-200 text-slate-600 hover:border-orange-300'
                                }`}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        ))}
                    </div>
                )}

                {/* Note planification */}
                <p className="text-xs text-slate-400">
                    Les sauvegardes sont stockées dans <code>storage/app/private/backups</code> (hors /public).
                    Les 30 dernières sauvegardes complètes sont conservées automatiquement.
                </p>
            </div>
        </AppLayout>
    );
}
