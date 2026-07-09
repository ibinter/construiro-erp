import { useState } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import Icon from '@/Components/Icon';
import Modal from '@/Components/Modal';
import SecondaryButton from '@/Components/SecondaryButton';
import DangerButton from '@/Components/DangerButton';
import { Head, Link, router } from '@inertiajs/react';
import { useTrans } from '@/i18n';

// Libellés et styles des statuts de métré (FR).
const TAKEOFF_STATUS = {
    draft:     { label: 'Brouillon', color: 'bg-slate-100 text-slate-600' },
    validated: { label: 'Validé',    color: 'bg-green-100 text-green-700' },
};

const fmtNum = (n) => (n === null || n === undefined || n === '' ? '—' : Number(n).toLocaleString('fr-FR', { maximumFractionDigits: 3 }));

export default function Show({ takeoff, can }) {
    const { t } = useTrans();
    const [confirmDelete, setConfirmDelete] = useState(false);

    const deleteTakeoff = () => {
        router.delete(`/takeoff/${takeoff.id}`);
    };

    const s = TAKEOFF_STATUS[takeoff.status] ?? { label: takeoff.status, color: 'bg-slate-100 text-slate-600' };

    return (
        <AppLayout header="Fiche métré">
            <Head title={takeoff.title} />

            {/* En-tête */}
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                    <div className="flex items-center gap-2">
                        <Link href="/takeoff" className="text-slate-400 hover:text-orange-600">
                            <Icon name="arrow-left" className="h-5 w-5" />
                        </Link>
                        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">{takeoff.title}</h2>
                        <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${s.color}`}>{t(s.label)}</span>
                    </div>
                    <p className="ml-7 text-sm text-slate-400">
                        {takeoff.code}{takeoff.project ? ` · ${takeoff.project.name}` : ''}
                    </p>
                </div>
                <div className="flex gap-2">
                    {can.update && (
                        <Link
                            href={`/takeoff/${takeoff.id}/edit`}
                            className="inline-flex items-center gap-2 rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                        >
                            <Icon name="pencil" className="h-4 w-4" /> {t('Modifier')}
                        </Link>
                    )}
                    {can.delete && (
                        <button
                            onClick={() => setConfirmDelete(true)}
                            className="inline-flex items-center gap-2 rounded-md border border-red-200 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:border-red-900/50"
                        >
                            <Icon name="trash-2" className="h-4 w-4" /> {t('Supprimer')}
                        </button>
                    )}
                </div>
            </div>

            {/* Tableau des lignes */}
            <div className="rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
                <div className="flex items-center gap-2 border-b border-slate-100 px-5 py-4 dark:border-slate-800">
                    <Icon name="calculator" className="h-5 w-5 text-orange-500" />
                    <h3 className="font-semibold text-slate-800 dark:text-slate-100">{t('Détail des postes')}</h3>
                </div>

                <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
                    <thead className="bg-slate-50 dark:bg-slate-800/50">
                        <tr className="text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                            <th className="px-5 py-3">{t('Désignation')}</th>
                            <th className="px-5 py-3">{t('Unité')}</th>
                            <th className="px-5 py-3 text-right">{t('Nb')}</th>
                            <th className="px-5 py-3 text-right">{t('Long.')}</th>
                            <th className="px-5 py-3 text-right">{t('Larg.')}</th>
                            <th className="px-5 py-3 text-right">{t('Haut.')}</th>
                            <th className="px-5 py-3 text-right">{t('Quantité')}</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {takeoff.lines.map((line) => (
                            <tr key={line.id} className="text-sm">
                                <td className="px-5 py-3 text-slate-800 dark:text-slate-100">
                                    {line.designation}
                                    {line.notes ? <div className="text-xs text-slate-400">{line.notes}</div> : null}
                                </td>
                                <td className="px-5 py-3 text-slate-500">{line.unit ?? '—'}</td>
                                <td className="px-5 py-3 text-right text-slate-600 dark:text-slate-300">{fmtNum(line.count)}</td>
                                <td className="px-5 py-3 text-right text-slate-600 dark:text-slate-300">{fmtNum(line.length)}</td>
                                <td className="px-5 py-3 text-right text-slate-600 dark:text-slate-300">{fmtNum(line.width)}</td>
                                <td className="px-5 py-3 text-right text-slate-600 dark:text-slate-300">{fmtNum(line.height)}</td>
                                <td className="px-5 py-3 text-right font-medium text-slate-800 dark:text-slate-100">{fmtNum(line.quantity)}</td>
                            </tr>
                        ))}
                        {takeoff.lines.length === 0 && (
                            <tr>
                                <td colSpan={7} className="px-5 py-8 text-center text-sm text-slate-400">
                                    {t('Aucune ligne.')}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {takeoff.notes && (
                <div className="mt-6 rounded-xl border border-slate-200 bg-white p-5 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
                    <div className="mb-1 text-xs font-semibold uppercase tracking-wider text-slate-400">{t('Notes')}</div>
                    {takeoff.notes}
                </div>
            )}

            {/* Confirmation suppression */}
            <Modal show={confirmDelete} onClose={() => setConfirmDelete(false)} maxWidth="md">
                <div className="p-6">
                    <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">{t('Supprimer ce métré ?')}</h3>
                    <p className="mt-2 text-sm text-slate-500">
                        {t('Le métré')} « {takeoff.title} » {t('sera supprimé. Cette action est réversible (corbeille).')}
                    </p>
                    <div className="mt-6 flex justify-end gap-3">
                        <SecondaryButton type="button" onClick={() => setConfirmDelete(false)}>{t('Annuler')}</SecondaryButton>
                        <DangerButton onClick={deleteTakeoff}>{t('Supprimer définitivement')}</DangerButton>
                    </div>
                </div>
            </Modal>
        </AppLayout>
    );
}
