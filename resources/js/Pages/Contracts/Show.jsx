import { useState } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import Icon from '@/Components/Icon';
import Modal from '@/Components/Modal';
import SecondaryButton from '@/Components/SecondaryButton';
import DangerButton from '@/Components/DangerButton';
import SignatureBlock from '@/Components/SignatureBlock';
import { Head, Link, router } from '@inertiajs/react';
import { formatMoney } from '@/constants';
import { useTrans } from '@/i18n';

// Libellés et styles des contrats (FR).
const CONTRACT_STATUS = {
    draft:     { label: 'Brouillon', color: 'bg-slate-100 text-slate-600' },
    active:    { label: 'Actif',     color: 'bg-green-100 text-green-700' },
    suspended: { label: 'Suspendu',  color: 'bg-amber-100 text-amber-700' },
    closed:    { label: 'Clôturé',   color: 'bg-blue-100 text-blue-700' },
    cancelled: { label: 'Annulé',    color: 'bg-red-100 text-red-700' },
};

const CONTRACT_TYPE = {
    client:         'Client',
    sous_traitance: 'Sous-traitance',
    fournisseur:    'Fournisseur',
    autre:          'Autre',
};

function StatusBadge({ status }) {
    const { t } = useTrans();
    const s = CONTRACT_STATUS[status] ?? { label: status, color: 'bg-slate-100 text-slate-600' };
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

export default function Show({ contract, can }) {
    const { t } = useTrans();
    const [confirmDelete, setConfirmDelete] = useState(false);

    const deleteContract = () => {
        router.delete(`/contracts/${contract.id}`);
    };

    const fmtDate = (d) => (d ? new Date(d).toLocaleDateString('fr-FR') : '—');

    return (
        <AppLayout header="Fiche contrat">
            <Head title={contract.title} />

            {/* En-tête */}
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                    <div className="flex items-center gap-2">
                        <Link href="/contracts" className="text-slate-400 hover:text-orange-600">
                            <Icon name="arrow-left" className="h-5 w-5" />
                        </Link>
                        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">{contract.title}</h2>
                        <StatusBadge status={contract.status} />
                    </div>
                    <p className="ml-7 text-sm text-slate-400">
                        {contract.code} · {t(CONTRACT_TYPE[contract.type] ?? contract.type)}
                        {contract.party_name ? ` · ${contract.party_name}` : ''}
                    </p>
                </div>
                <div className="flex gap-2 flex-wrap">
                    <a
                        href={`/contracts/${contract.id}/pdf`}
                        target="_blank" rel="noopener"
                        className="inline-flex items-center gap-2 rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                    >
                        <Icon name="file-down" className="h-4 w-4" /> PDF
                    </a>
                    {contract.verify_token && (
                        <a
                            href={`/verify/${contract.verify_token}`}
                            target="_blank" rel="noopener"
                            className="inline-flex items-center gap-2 rounded-md border border-green-300 px-3 py-2 text-sm font-medium text-green-700 hover:bg-green-50 dark:border-green-700 dark:text-green-300"
                        >
                            <Icon name="shield-check" className="h-4 w-4" /> {t('Vérifier')}
                        </a>
                    )}
                    <a
                        href="/export/contracts"
                        target="_blank" rel="noopener"
                        className="inline-flex items-center gap-2 rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                    >
                        <Icon name="table-2" className="h-4 w-4" /> Excel
                    </a>
                    {can.update && (
                        <Link
                            href={`/contracts/${contract.id}/edit`}
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
                <InfoTile icon="wallet" label={t('Montant')} value={formatMoney(contract.amount, contract.currency)} />
                <InfoTile icon="calendar" label={t('Début → Fin')} value={`${fmtDate(contract.start_date)} → ${fmtDate(contract.end_date)}`} />
                <InfoTile icon="pen-line" label={t('Signé le')} value={fmtDate(contract.signed_date)} />
                <InfoTile icon="folder" label={t('Projet')} value={contract.project?.name ?? '—'} />
            </div>

            {contract.notes && (
                <div className="mb-6 rounded-xl border border-slate-200 bg-white p-5 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
                    {contract.notes}
                </div>
            )}

            {/* Signature électronique */}
            <SignatureBlock record={contract} model="contract" can={can} />

            {/* Confirmation suppression contrat */}
            <Modal show={confirmDelete} onClose={() => setConfirmDelete(false)} maxWidth="md">
                <div className="p-6">
                    <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">{t('Supprimer ce contrat ?')}</h3>
                    <p className="mt-2 text-sm text-slate-500">
                        {t('Le contrat')} « {contract.title} » {t('sera supprimé. Cette action est réversible (corbeille).')}
                    </p>
                    <div className="mt-6 flex justify-end gap-3">
                        <SecondaryButton type="button" onClick={() => setConfirmDelete(false)}>{t('Annuler')}</SecondaryButton>
                        <DangerButton onClick={deleteContract}>{t('Supprimer définitivement')}</DangerButton>
                    </div>
                </div>
            </Modal>
        </AppLayout>
    );
}
