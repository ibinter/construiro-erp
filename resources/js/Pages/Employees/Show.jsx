import { useState } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import Icon from '@/Components/Icon';
import Modal from '@/Components/Modal';
import SecondaryButton from '@/Components/SecondaryButton';
import DangerButton from '@/Components/DangerButton';
import { Head, Link, router } from '@inertiajs/react';
import { formatMoney } from '@/constants';
import { useTrans } from '@/i18n';

// Libellés locaux au module RH (FR).
const DEPARTMENT = {
    chantier:   { label: 'Chantier',   color: 'bg-orange-100 text-orange-700' },
    bureau:     { label: 'Bureau',     color: 'bg-blue-100 text-blue-700' },
    direction:  { label: 'Direction',  color: 'bg-purple-100 text-purple-700' },
    logistique: { label: 'Logistique', color: 'bg-teal-100 text-teal-700' },
    autre:      { label: 'Autre',      color: 'bg-slate-100 text-slate-600' },
};
const CONTRACT_TYPE = {
    cdi: 'CDI', cdd: 'CDD', journalier: 'Journalier', stage: 'Stage', prestation: 'Prestation',
};
const STATUS = {
    active:     { label: 'Actif',    color: 'bg-green-100 text-green-700' },
    suspended:  { label: 'Suspendu', color: 'bg-amber-100 text-amber-700' },
    terminated: { label: 'Sorti',    color: 'bg-red-100 text-red-700' },
};
const ATT_STATUS = {
    present:  { label: 'Présent',      color: 'bg-green-100 text-green-700' },
    absent:   { label: 'Absent',       color: 'bg-red-100 text-red-700' },
    leave:    { label: 'Congé',        color: 'bg-blue-100 text-blue-700' },
    half_day: { label: 'Demi-journée', color: 'bg-amber-100 text-amber-700' },
};
const PAY_STATUS = {
    draft:     { label: 'Brouillon', color: 'bg-slate-100 text-slate-600' },
    validated: { label: 'Validé',    color: 'bg-blue-100 text-blue-700' },
    paid:      { label: 'Payé',      color: 'bg-green-100 text-green-700' },
};

function Badge({ map, status }) {
    const { t } = useTrans();
    const s = map[status] ?? { label: status, color: 'bg-slate-100 text-slate-600' };
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

export default function Show({ employee, attendances, payslips, can }) {
    const { t } = useTrans();
    const [confirmDelete, setConfirmDelete] = useState(false);

    const deleteEmployee = () => {
        router.delete(`/hr/${employee.id}`);
    };

    const fmtDate = (d) => (d ? new Date(d).toLocaleDateString('fr-FR') : '—');

    return (
        <AppLayout header="Fiche employé">
            <Head title={employee.full_name} />

            {/* En-tête */}
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                    <div className="flex items-center gap-2">
                        <Link href="/hr" className="text-slate-400 hover:text-orange-600">
                            <Icon name="arrow-left" className="h-5 w-5" />
                        </Link>
                        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">{employee.full_name}</h2>
                        <Badge map={STATUS} status={employee.status} />
                    </div>
                    <p className="ml-7 text-sm text-slate-400">
                        {employee.matricule}
                        {employee.job_title ? ` · ${employee.job_title}` : ''}
                        {' · '}<Badge map={DEPARTMENT} status={employee.department} />
                    </p>
                </div>
                <div className="flex gap-2 flex-wrap">
                    <a
                        href={`/hr/${employee.id}/pdf`}
                        target="_blank" rel="noopener"
                        className="inline-flex items-center gap-2 rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                    >
                        <Icon name="file-down" className="h-4 w-4" /> PDF
                    </a>
                    <a
                        href="/export/employees"
                        target="_blank" rel="noopener"
                        className="inline-flex items-center gap-2 rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                    >
                        <Icon name="table-2" className="h-4 w-4" /> Excel
                    </a>
                    {can.update && (
                        <Link
                            href={`/hr/${employee.id}/edit`}
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
                <InfoTile icon="wallet" label={t('Salaire de base')} value={formatMoney(employee.base_salary, employee.currency)} />
                <InfoTile icon="file-text" label={t('Contrat')} value={t(CONTRACT_TYPE[employee.contract_type] ?? employee.contract_type)} />
                <InfoTile icon="calendar" label={t('Embauche')} value={fmtDate(employee.hire_date)} />
                <InfoTile icon="construction" label={t('Chantier')} value={employee.site?.name ?? '—'} />
            </div>

            {/* Coordonnées */}
            <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
                <InfoTile icon="phone" label={t('Téléphone')} value={employee.phone || '—'} />
                <InfoTile icon="mail" label={t('Email')} value={employee.email || '—'} />
                <InfoTile icon="building-2" label={t('Agence')} value={employee.agency?.name ?? '—'} />
            </div>

            {employee.notes && (
                <div className="mb-6 rounded-xl border border-slate-200 bg-white p-5 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
                    {employee.notes}
                </div>
            )}

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                {/* Présences récentes */}
                <div className="rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
                    <div className="border-b border-slate-100 px-5 py-4 dark:border-slate-800">
                        <h3 className="flex items-center gap-2 font-semibold text-slate-800 dark:text-slate-100">
                            <Icon name="fingerprint" className="h-5 w-5 text-orange-500" />
                            {t('Pointages récents')}
                        </h3>
                    </div>
                    <ul className="divide-y divide-slate-100 dark:divide-slate-800">
                        {attendances.map((a) => (
                            <li key={a.id} className="flex items-center justify-between px-5 py-3 text-sm">
                                <div>
                                    <div className="font-medium text-slate-800 dark:text-slate-100">{fmtDate(a.date)}</div>
                                    <div className="text-xs text-slate-400">
                                        {a.hours_worked} h{a.site ? ` · ${a.site.name}` : ''}
                                    </div>
                                </div>
                                <Badge map={ATT_STATUS} status={a.status} />
                            </li>
                        ))}
                        {attendances.length === 0 && (
                            <li className="px-5 py-8 text-center text-sm text-slate-400">{t('Aucun pointage enregistré.')}</li>
                        )}
                    </ul>
                </div>

                {/* Bulletins récents */}
                <div className="rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
                    <div className="border-b border-slate-100 px-5 py-4 dark:border-slate-800">
                        <h3 className="flex items-center gap-2 font-semibold text-slate-800 dark:text-slate-100">
                            <Icon name="banknote" className="h-5 w-5 text-orange-500" />
                            {t('Bulletins de paie')}
                        </h3>
                    </div>
                    <ul className="divide-y divide-slate-100 dark:divide-slate-800">
                        {payslips.map((p) => (
                            <li key={p.id} className="flex items-center justify-between px-5 py-3 text-sm">
                                <div>
                                    <div className="font-medium text-slate-800 dark:text-slate-100">{p.period}</div>
                                    <div className="text-xs text-slate-400">{t('Net :')} {formatMoney(p.net_salary, p.currency)}</div>
                                </div>
                                <Badge map={PAY_STATUS} status={p.status} />
                            </li>
                        ))}
                        {payslips.length === 0 && (
                            <li className="px-5 py-8 text-center text-sm text-slate-400">{t('Aucun bulletin de paie.')}</li>
                        )}
                    </ul>
                </div>
            </div>

            {/* Confirmation suppression employé */}
            <Modal show={confirmDelete} onClose={() => setConfirmDelete(false)} maxWidth="md">
                <div className="p-6">
                    <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">{t('Supprimer cet employé ?')}</h3>
                    <p className="mt-2 text-sm text-slate-500">
                        {t("L'employé")} « {employee.full_name} » {t('sera supprimé. Cette action est réversible (corbeille).')}
                    </p>
                    <div className="mt-6 flex justify-end gap-3">
                        <SecondaryButton type="button" onClick={() => setConfirmDelete(false)}>{t('Annuler')}</SecondaryButton>
                        <DangerButton onClick={deleteEmployee}>{t('Supprimer définitivement')}</DangerButton>
                    </div>
                </div>
            </Modal>
        </AppLayout>
    );
}
