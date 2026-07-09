import { useState } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import Icon from '@/Components/Icon';
import Modal from '@/Components/Modal';
import SecondaryButton from '@/Components/SecondaryButton';
import DangerButton from '@/Components/DangerButton';
import { Head, Link, router } from '@inertiajs/react';
import { formatMoney } from '@/constants';
import { useTrans } from '@/i18n';

// Libellés et styles des statuts de budget (FR).
const BUDGET_STATUS = {
    draft:     { label: 'Brouillon', color: 'bg-slate-100 text-slate-600' },
    validated: { label: 'Validé',    color: 'bg-green-100 text-green-700' },
    closed:    { label: 'Clôturé',   color: 'bg-amber-100 text-amber-700' },
};

function StatusBadge({ status }) {
    const { t } = useTrans();
    const s = BUDGET_STATUS[status] ?? { label: status, color: 'bg-slate-100 text-slate-600' };
    return <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${s.color}`}>{t(s.label)}</span>;
}

export default function Show({ budget, can }) {
    const { t } = useTrans();
    const [confirmDelete, setConfirmDelete] = useState(false);

    const deleteBudget = () => {
        router.delete(`/budget/${budget.id}`);
    };

    const lines = budget.lines ?? [];
    const totalPlanned = lines.reduce((s, l) => s + Number(l.planned_amount || 0), 0);
    const totalActual = lines.reduce((s, l) => s + Number(l.actual_amount || 0), 0);

    return (
        <AppLayout header="Fiche budget">
            <Head title={budget.title} />

            {/* En-tête */}
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                    <div className="flex items-center gap-2">
                        <Link href="/budget" className="text-slate-400 hover:text-orange-600">
                            <Icon name="arrow-left" className="h-5 w-5" />
                        </Link>
                        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">{budget.title}</h2>
                        <StatusBadge status={budget.status} />
                    </div>
                    <p className="ml-7 text-sm text-slate-400">
                        {budget.code}
                        {` · Exercice ${budget.fiscal_year}`}
                        {budget.project ? ` · ${budget.project.name}` : ''}
                    </p>
                </div>
                <div className="flex gap-2">
                    {can.update && (
                        <Link
                            href={`/budget/${budget.id}/edit`}
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

            {/* Synthèse */}
            <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
                    <div className="flex items-center gap-2 text-slate-400">
                        <Icon name="target" className="h-4 w-4" />
                        <span className="text-xs uppercase tracking-wider">{t('Total planifié')}</span>
                    </div>
                    <div className="mt-1 font-semibold text-slate-800 dark:text-slate-100">{formatMoney(totalPlanned, budget.currency)}</div>
                </div>
                <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
                    <div className="flex items-center gap-2 text-slate-400">
                        <Icon name="activity" className="h-4 w-4" />
                        <span className="text-xs uppercase tracking-wider">{t('Total réalisé')}</span>
                    </div>
                    <div className="mt-1 font-semibold text-slate-800 dark:text-slate-100">{formatMoney(totalActual, budget.currency)}</div>
                </div>
                <div className="rounded-xl border border-orange-200 bg-orange-50 p-4 dark:border-orange-900/50 dark:bg-orange-950/30">
                    <div className="flex items-center gap-2 text-orange-600 dark:text-orange-300">
                        <Icon name="scale" className="h-4 w-4" />
                        <span className="text-xs uppercase tracking-wider">{t('Écart')}</span>
                    </div>
                    <div className="mt-1 font-semibold text-orange-700 dark:text-orange-300">
                        {formatMoney(totalPlanned - totalActual, budget.currency)}
                    </div>
                </div>
            </div>

            {/* Détail des postes : écart planifié vs réalisé par ligne */}
            <div className="rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
                <div className="flex items-center gap-2 border-b border-slate-100 px-5 py-4 dark:border-slate-800">
                    <Icon name="wallet" className="h-5 w-5 text-orange-500" />
                    <h3 className="font-semibold text-slate-800 dark:text-slate-100">{t('Postes budgétaires — planifié vs réalisé')}</h3>
                </div>

                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                    {lines.map((line) => {
                        const planned = Number(line.planned_amount || 0);
                        const actual = Number(line.actual_amount || 0);
                        // Taux de consommation : réalisé / planifié (borné à 100 % pour la barre).
                        const ratio = planned > 0 ? (actual / planned) * 100 : (actual > 0 ? 100 : 0);
                        const overrun = actual > planned;
                        const barWidth = Math.min(ratio, 100);
                        const barColor = overrun ? 'bg-red-500' : ratio > 85 ? 'bg-amber-500' : 'bg-green-500';

                        return (
                            <div key={line.id} className="px-5 py-4">
                                <div className="flex items-center justify-between text-sm">
                                    <div>
                                        <div className="font-medium text-slate-800 dark:text-slate-100">{line.label}</div>
                                        {line.category && <div className="text-xs text-slate-400">{line.category}</div>}
                                    </div>
                                    <div className="text-right">
                                        <div className="text-slate-600 dark:text-slate-300">
                                            {formatMoney(actual, budget.currency)} / {formatMoney(planned, budget.currency)}
                                        </div>
                                        <div className={`text-xs font-medium ${overrun ? 'text-red-600' : 'text-slate-400'}`}>
                                            {ratio.toFixed(0)} % {t('consommé')}{overrun ? ` · ${t('dépassement')}` : ''}
                                        </div>
                                    </div>
                                </div>
                                {/* Barre de progression réalisé / planifié */}
                                <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                                    <div className={`h-full rounded-full ${barColor}`} style={{ width: `${barWidth}%` }} />
                                </div>
                            </div>
                        );
                    })}

                    {lines.length === 0 && (
                        <div className="px-5 py-8 text-center text-sm text-slate-400">{t('Aucun poste budgétaire.')}</div>
                    )}
                </div>
            </div>

            {budget.notes && (
                <div className="mt-6 rounded-xl border border-slate-200 bg-white p-5 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
                    <div className="mb-1 text-xs font-semibold uppercase tracking-wider text-slate-400">{t('Notes')}</div>
                    {budget.notes}
                </div>
            )}

            {/* Confirmation suppression */}
            <Modal show={confirmDelete} onClose={() => setConfirmDelete(false)} maxWidth="md">
                <div className="p-6">
                    <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">{t('Supprimer ce budget ?')}</h3>
                    <p className="mt-2 text-sm text-slate-500">
                        {t('Le budget')} « {budget.title} » {t('sera supprimé. Cette action est réversible (corbeille).')}
                    </p>
                    <div className="mt-6 flex justify-end gap-3">
                        <SecondaryButton type="button" onClick={() => setConfirmDelete(false)}>{t('Annuler')}</SecondaryButton>
                        <DangerButton onClick={deleteBudget}>{t('Supprimer définitivement')}</DangerButton>
                    </div>
                </div>
            </Modal>
        </AppLayout>
    );
}
