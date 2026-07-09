import { useState } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import Icon from '@/Components/Icon';
import Modal from '@/Components/Modal';
import SecondaryButton from '@/Components/SecondaryButton';
import DangerButton from '@/Components/DangerButton';
import { Head, Link, router } from '@inertiajs/react';
import { formatMoney } from '@/constants';
import { useTrans } from '@/i18n';
import { TENDER_STATUS, TENDER_TYPE } from './Index';

function StatusBadge({ status }) {
    const { t } = useTrans();
    const s = TENDER_STATUS[status] ?? { label: status, color: 'bg-slate-100 text-slate-600' };
    return <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${s.color}`}>{t(s.label)}</span>;
}

function InfoTile({ icon, label, value }) {
    return (
        <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center gap-2 text-slate-400">
                <Icon name={icon} className="h-4 w-4" />
                <span className="text-xs uppercase tracking-wider">{label}</span>
            </div>
            <div className="mt-1 font-semibold text-slate-800 dark:text-slate-100">{value}</div>
        </div>
    );
}

export default function Show({ tender, can }) {
    const { t } = useTrans();
    const [confirmDelete, setConfirmDelete] = useState(false);

    const deleteTender = () => {
        router.delete(`/tenders/${tender.id}`);
    };

    const fmtDate = (d) => (d ? new Date(d).toLocaleDateString('fr-FR') : '—');

    return (
        <AppLayout header="Fiche appel d'offres">
            <Head title={tender.title} />

            {/* En-tête */}
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                    <div className="flex items-center gap-2">
                        <Link href="/tenders" className="text-slate-400 hover:text-orange-600">
                            <Icon name="arrow-left" className="h-5 w-5" />
                        </Link>
                        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">{tender.title}</h2>
                        <StatusBadge status={tender.status} />
                    </div>
                    <p className="ml-7 text-sm text-slate-400">
                        {tender.code} · {t(TENDER_TYPE[tender.type] ?? tender.type)}
                        {tender.client_name ? ` · ${tender.client_name}` : ''}
                    </p>
                </div>
                <div className="flex gap-2">
                    {can.update && (
                        <Link
                            href={`/tenders/${tender.id}/edit`}
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

            {/* Tuiles d'info */}
            <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
                <InfoTile icon="wallet" label={t('Montant estimé')} value={formatMoney(tender.estimated_amount, tender.currency)} />
                <InfoTile icon="calendar-clock" label={t('Date limite de dépôt')} value={fmtDate(tender.submission_deadline)} />
                <InfoTile icon="send" label={t('Soumis le')} value={fmtDate(tender.submitted_at)} />
                <InfoTile icon="folder-kanban" label={t('Projet rattaché')} value={tender.project?.name ?? '—'} />
            </div>

            {tender.notes && (
                <div className="rounded-xl border border-slate-200 bg-white p-5 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
                    <h3 className="mb-2 font-semibold text-slate-800 dark:text-slate-100">{t('Notes')}</h3>
                    {tender.notes}
                </div>
            )}

            {/* Confirmation suppression */}
            <Modal show={confirmDelete} onClose={() => setConfirmDelete(false)} maxWidth="md">
                <div className="p-6">
                    <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">{t("Supprimer cet appel d'offres ?")}</h3>
                    <p className="mt-2 text-sm text-slate-500">
                        {t("L'appel d'offres")} « {tender.title} » {t('sera supprimé. Cette action est réversible (corbeille).')}
                    </p>
                    <div className="mt-6 flex justify-end gap-3">
                        <SecondaryButton type="button" onClick={() => setConfirmDelete(false)}>{t('Annuler')}</SecondaryButton>
                        <DangerButton onClick={deleteTender}>{t('Supprimer définitivement')}</DangerButton>
                    </div>
                </div>
            </Modal>
        </AppLayout>
    );
}
