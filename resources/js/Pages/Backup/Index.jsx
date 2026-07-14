import { router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import Icon from '@/Components/Icon';
import { useTrans } from '@/i18n';
import { useState } from 'react';

export default function BackupIndex({ backups = [], can = {} }) {
    const { t } = useTrans();
    const [restoring, setRestoring] = useState(null);

    const handleCreate = () => {
        if (confirm(t('Lancer un backup complet de la base de données ?'))) {
            router.post(route('backup.store'));
        }
    };

    const handleDelete = (filename) => {
        if (confirm(t('Supprimer ce backup ? Cette action est irréversible.'))) {
            router.delete(route('backup.destroy', filename));
        }
    };

    const handleRestore = (filename) => {
        const confirmed = confirm(
            `⚠️ ATTENTION — Restauration de la base de données\n\n` +
            `Fichier : ${filename}\n\n` +
            `Cette opération va ÉCRASER TOUTES les données actuelles par celles du backup.\n` +
            `Cette action est IRRÉVERSIBLE.\n\n` +
            `Êtes-vous absolument certain de vouloir continuer ?`
        );
        if (!confirmed) return;
        setRestoring(filename);
        router.post(route('backup.restore', filename), {}, {
            onFinish: () => setRestoring(null),
        });
    };

    return (
        <AppLayout
            title="Sauvegardes"
            breadcrumbs={[
                { label: 'Administration', href: '/admin' },
                { label: 'Sauvegardes' },
            ]}
        >
            <div className="mx-auto max-w-4xl space-y-6">

                {/* En-tête */}
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <h1 className="text-lg font-bold text-slate-800 dark:text-slate-100">
                            {t('Sauvegardes de la base de données')}
                        </h1>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            {t('Les backups sont des dumps SQL compressés (.sql.gz). Les 30 derniers sont conservés automatiquement.')}
                        </p>
                    </div>
                    {can.create && (
                        <button
                            onClick={handleCreate}
                            className="inline-flex items-center gap-2 rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-600"
                        >
                            <Icon name="database" className="h-4 w-4" />
                            {t('Créer un backup maintenant')}
                        </button>
                    )}
                </div>

                {/* Info automatique */}
                <div className="flex items-start gap-3 rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-blue-700 dark:border-blue-800 dark:bg-blue-900/20 dark:text-blue-300">
                    <Icon name="info" className="mt-0.5 h-4 w-4 shrink-0" />
                    <div>
                        <strong>{t('Backup automatique')}</strong> — {t('Un backup est automatiquement créé chaque nuit à 02h00 (heure serveur). Vous pouvez également en créer un manuellement à tout moment.')}
                    </div>
                </div>

                {/* Liste des backups */}
                <div className="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
                    {backups.length === 0 ? (
                        <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
                            <Icon name="database" className="h-12 w-12 text-slate-200 dark:text-slate-700" />
                            <p className="text-sm text-slate-400">{t('Aucun backup disponible pour le moment.')}</p>
                            {can.create && (
                                <button onClick={handleCreate} className="mt-2 rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-600">
                                    {t('Créer le premier backup')}
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-slate-50 dark:bg-slate-800/60">
                                    <tr>
                                        <th className="px-4 py-3 text-left font-medium text-slate-600 dark:text-slate-300">{t('Fichier')}</th>
                                        <th className="px-4 py-3 text-left font-medium text-slate-600 dark:text-slate-300">{t('Taille')}</th>
                                        <th className="px-4 py-3 text-left font-medium text-slate-600 dark:text-slate-300">{t('Créé le')}</th>
                                        <th className="px-4 py-3 text-right font-medium text-slate-600 dark:text-slate-300">{t('Actions')}</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                    {backups.map((b) => (
                                        <tr key={b.filename} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-2">
                                                    <Icon name="file-archive" className="h-4 w-4 shrink-0 text-slate-400" />
                                                    <span className="font-mono text-xs text-slate-700 dark:text-slate-300">{b.filename}</span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-slate-500">{b.size}</td>
                                            <td className="px-4 py-3 text-slate-500">{b.created_at}</td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center justify-end gap-2">
                                                    {can.download && (
                                                        <a
                                                            href={route('backup.download', b.filename)}
                                                            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300"
                                                        >
                                                            <Icon name="download" className="h-3.5 w-3.5" />
                                                            {t('Télécharger')}
                                                        </a>
                                                    )}
                                                    {can.create && (
                                                        <button
                                                            onClick={() => handleRestore(b.filename)}
                                                            disabled={restoring === b.filename}
                                                            className="inline-flex items-center gap-1.5 rounded-lg border border-amber-200 px-3 py-1.5 text-xs font-medium text-amber-700 hover:bg-amber-50 disabled:opacity-50 dark:border-amber-800 dark:text-amber-400"
                                                        >
                                                            <Icon name="rotate-ccw" className="h-3.5 w-3.5" />
                                                            {restoring === b.filename ? t('Restauration…') : t('Restaurer')}
                                                        </button>
                                                    )}
                                                    {can.delete && (
                                                        <button
                                                            onClick={() => handleDelete(b.filename)}
                                                            className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400"
                                                        >
                                                            <Icon name="trash-2" className="h-3.5 w-3.5" />
                                                            {t('Supprimer')}
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Avertissement restauration */}
                <div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-700 dark:border-amber-800 dark:bg-amber-900/20 dark:text-amber-300">
                    <Icon name="alert-triangle" className="mt-0.5 h-4 w-4 shrink-0" />
                    <div>
                        <strong>{t('Restauration')}</strong> — {t('Le bouton « Restaurer » réimporte le backup sélectionné et écrase toutes les données actuelles. Cette action est irréversible. Créez un backup de l\'état actuel avant de restaurer.')}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
