import { useState } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import Icon from '@/Components/Icon';
import Modal from '@/Components/Modal';
import SecondaryButton from '@/Components/SecondaryButton';
import DangerButton from '@/Components/DangerButton';
import { Head, Link, router } from '@inertiajs/react';
import { formatMoney } from '@/constants';
import { useTrans } from '@/i18n';

// ─── Dictionnaires de libellés ──────────────────────────────────────────────

const DEPARTMENT = {
    chantier:   { label: 'Chantier',   color: 'bg-orange-100 text-orange-700' },
    bureau:     { label: 'Bureau',     color: 'bg-blue-100 text-blue-700' },
    direction:  { label: 'Direction',  color: 'bg-purple-100 text-purple-700' },
    logistique: { label: 'Logistique', color: 'bg-teal-100 text-teal-700' },
    autre:      { label: 'Autre',      color: 'bg-slate-100 text-slate-600' },
};

const CONTRACT_TYPE = {
    cdi:        'CDI',
    cdd:        'CDD',
    journalier: 'Journalier',
    stage:      'Stage',
    prestation: 'Prestation',
};

const STATUS = {
    active:     { label: 'Actif',    color: 'bg-green-100 text-green-700' },
    suspended:  { label: 'Suspendu', color: 'bg-amber-100 text-amber-700' },
    terminated: { label: 'Sorti',    color: 'bg-red-100 text-red-700' },
};

const ATT_STATUS = {
    present:  { label: 'P',  bg: 'bg-green-500',  title: 'Présent' },
    absent:   { label: 'A',  bg: 'bg-red-500',    title: 'Absent' },
    leave:    { label: 'C',  bg: 'bg-blue-500',   title: 'Congé' },
    half_day: { label: 'D',  bg: 'bg-amber-400',  title: 'Demi-journée' },
};

const PAY_STATUS = {
    draft:     { label: 'Brouillon', color: 'bg-slate-100 text-slate-600' },
    validated: { label: 'Validé',    color: 'bg-blue-100 text-blue-700' },
    paid:      { label: 'Payé',      color: 'bg-green-100 text-green-700' },
};

// ─── Composants utilitaires ──────────────────────────────────────────────────

function Badge({ map, status }) {
    const { t } = useTrans();
    const s = map[status] ?? { label: status, color: 'bg-slate-100 text-slate-600' };
    return (
        <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${s.color}`}>
            {t(s.label)}
        </span>
    );
}

function KpiCard({ icon, label, value, sub, accent }) {
    return (
        <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between">
                <span className="text-xs font-medium uppercase tracking-wider text-slate-400">{label}</span>
                <Icon name={icon} className={`h-4 w-4 ${accent ?? 'text-orange-500'}`} />
            </div>
            <div className="mt-2 text-xl font-bold text-slate-800 dark:text-slate-100">{value}</div>
            {sub && <div className="mt-0.5 text-xs text-slate-400">{sub}</div>}
        </div>
    );
}

function SectionTitle({ icon, children }) {
    return (
        <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            <Icon name={icon} className="h-4 w-4 text-orange-500" />
            {children}
        </h3>
    );
}

// ─── Photo placeholder (initiales) ──────────────────────────────────────────

function AvatarPlaceholder({ name, size = 'lg' }) {
    const initials = name
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((w) => w[0].toUpperCase())
        .join('');

    const sizes = {
        lg: 'h-16 w-16 text-xl',
        sm: 'h-9 w-9 text-sm',
    };

    return (
        <div
            className={`flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-orange-400 to-orange-600 font-bold text-white shadow ${sizes[size]}`}
        >
            {initials}
        </div>
    );
}

// ─── Mini-calendrier d'assiduité ─────────────────────────────────────────────

function AttendanceCalendar({ attendances }) {
    const { t } = useTrans();
    const now   = new Date();
    const year  = now.getFullYear();
    const month = now.getMonth(); // 0-indexed

    // Construire un Map date-ISO → status
    const attMap = {};
    attendances.forEach((a) => {
        if (!a.date) return;
        const d = new Date(a.date);
        if (d.getFullYear() === year && d.getMonth() === month) {
            attMap[d.getDate()] = a.status;
        }
    });

    const daysInMonth = new Date(year, month + 1, 0).getDate();
    // Jour de la semaine du 1er (lundi = 0)
    const firstDay = (new Date(year, month, 1).getDay() + 6) % 7;

    const monthName = new Date(year, month, 1).toLocaleString('fr-FR', { month: 'long', year: 'numeric' });
    const dayLabels = ['Lu', 'Ma', 'Me', 'Je', 'Ve', 'Sa', 'Di'];

    const cells = [];
    // Cases vides avant le 1er
    for (let i = 0; i < firstDay; i++) {
        cells.push(null);
    }
    for (let d = 1; d <= daysInMonth; d++) {
        cells.push(d);
    }

    return (
        <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
            <SectionTitle icon="calendar-days">{t('Assiduité')} — {monthName}</SectionTitle>

            {/* En-têtes jours */}
            <div className="mb-1 grid grid-cols-7 gap-1 text-center">
                {dayLabels.map((d) => (
                    <div key={d} className="text-xs font-medium text-slate-400">{d}</div>
                ))}
            </div>

            {/* Grille */}
            <div className="grid grid-cols-7 gap-1">
                {cells.map((day, idx) => {
                    if (!day) {
                        return <div key={`empty-${idx}`} />;
                    }
                    const status = attMap[day];
                    const info   = ATT_STATUS[status];
                    const isToday = day === now.getDate();

                    return (
                        <div
                            key={day}
                            title={info ? t(info.title) : t('Sans données')}
                            className={`flex h-8 w-full items-center justify-center rounded-md text-xs font-medium
                                ${isToday ? 'ring-2 ring-orange-400 ring-offset-1' : ''}
                                ${info
                                    ? `${info.bg} text-white`
                                    : 'bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500'
                                }`}
                        >
                            {day}
                        </div>
                    );
                })}
            </div>

            {/* Légende */}
            <div className="mt-4 flex flex-wrap gap-3 text-xs text-slate-500">
                {Object.entries(ATT_STATUS).map(([key, val]) => (
                    <div key={key} className="flex items-center gap-1">
                        <span className={`inline-block h-3 w-3 rounded-sm ${val.bg}`} />
                        {t(val.title)}
                    </div>
                ))}
                <div className="flex items-center gap-1">
                    <span className="inline-block h-3 w-3 rounded-sm bg-slate-100 dark:bg-slate-800" />
                    {t('Sans données')}
                </div>
            </div>
        </div>
    );
}

// ─── Page principale ─────────────────────────────────────────────────────────

export default function Show({ employee, attendances, payslips, kpis, can }) {
    const { t }   = useTrans();
    const [confirmDelete, setConfirmDelete] = useState(false);

    const deleteEmployee = () => router.delete(`/hr/${employee.id}`);
    const fmtDate = (d) => (d ? new Date(d).toLocaleDateString('fr-FR') : '—');

    const dernierSalaire = kpis?.dernier_salaire;

    return (
        <AppLayout header="Fiche employé">
            <Head title={employee.full_name} />

            {/* ── En-tête employé ── */}
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/hr" className="text-slate-400 hover:text-orange-600">
                        <Icon name="arrow-left" className="h-5 w-5" />
                    </Link>

                    {/* Photo placeholder */}
                    <AvatarPlaceholder name={employee.full_name} size="lg" />

                    <div>
                        <div className="flex flex-wrap items-center gap-2">
                            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
                                {employee.full_name}
                            </h2>
                            <Badge map={STATUS} status={employee.status} />
                        </div>
                        <p className="mt-0.5 text-sm text-slate-400">
                            <span className="font-mono text-slate-500">{employee.matricule}</span>
                            {employee.job_title ? ` · ${employee.job_title}` : ''}
                        </p>
                        <div className="mt-1">
                            <Badge map={DEPARTMENT} status={employee.department} />
                        </div>
                    </div>
                </div>

                {/* Boutons */}
                <div className="flex flex-wrap gap-2">
                    <a
                        href={`/hr/${employee.id}/pdf`}
                        target="_blank" rel="noopener"
                        className="inline-flex items-center gap-2 rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                    >
                        <Icon name="file-down" className="h-4 w-4" /> {t('Fiche PDF')}
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

            {/* ── KPIs du mois ── */}
            <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
                <KpiCard
                    icon="user-check"
                    label={t('Présences ce mois')}
                    value={kpis?.presences ?? 0}
                    sub={t('jours présent ou demi-journée')}
                    accent="text-green-500"
                />
                <KpiCard
                    icon="user-x"
                    label={t('Absences ce mois')}
                    value={kpis?.absences ?? 0}
                    sub={t('jours sans pointage')}
                    accent="text-red-500"
                />
                <KpiCard
                    icon="clock-4"
                    label={t('Heures supplémentaires')}
                    value={`${(kpis?.heures_sup ?? 0).toFixed(1)} h`}
                    sub={t('ce mois')}
                    accent="text-amber-500"
                />
                <KpiCard
                    icon="banknote"
                    label={t('Dernier salaire net')}
                    value={
                        dernierSalaire
                            ? formatMoney(dernierSalaire.amount, dernierSalaire.currency)
                            : '—'
                    }
                    sub={dernierSalaire ? dernierSalaire.period : t('Aucun bulletin')}
                    accent="text-orange-500"
                />
            </div>

            {/* ── Infos personnelles et contractuelles ── */}
            <div className="mb-6 rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
                <SectionTitle icon="user">{t('Informations personnelles et contractuelles')}</SectionTitle>
                <div className="grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
                    {[
                        { icon: 'wallet',        label: t('Salaire de base'), value: formatMoney(employee.base_salary, employee.currency) },
                        { icon: 'file-text',     label: t('Type de contrat'), value: t(CONTRACT_TYPE[employee.contract_type] ?? employee.contract_type) },
                        { icon: 'calendar',      label: t("Date d'embauche"), value: fmtDate(employee.hire_date) },
                        { icon: 'construction',  label: t('Chantier'),        value: employee.site?.name ?? '—' },
                        { icon: 'building-2',    label: t('Agence'),          value: employee.agency?.name ?? '—' },
                        { icon: 'phone',         label: t('Téléphone'),       value: employee.phone || '—' },
                        { icon: 'mail',          label: t('Email'),           value: employee.email || '—' },
                    ].map(({ icon, label, value }) => (
                        <div key={label} className="flex items-start gap-3">
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-orange-50 dark:bg-orange-950/30">
                                <Icon name={icon} className="h-4 w-4 text-orange-500" />
                            </div>
                            <div>
                                <div className="text-xs text-slate-400">{label}</div>
                                <div className="mt-0.5 text-sm font-medium text-slate-700 dark:text-slate-200">
                                    {value}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {employee.notes && (
                    <div className="mt-4 rounded-lg bg-slate-50 p-3 text-sm text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                        {employee.notes}
                    </div>
                )}
            </div>

            {/* ── Grille : bulletins de paie + calendrier ── */}
            <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-2">

                {/* Bulletins de paie */}
                <div className="rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
                    <div className="border-b border-slate-100 px-5 py-4 dark:border-slate-800">
                        <h3 className="flex items-center gap-2 font-semibold text-slate-800 dark:text-slate-100">
                            <Icon name="banknote" className="h-5 w-5 text-orange-500" />
                            {t('Bulletins de paie')}
                            <span className="ml-auto text-xs font-normal text-slate-400">6 {t('derniers')}</span>
                        </h3>
                    </div>

                    {payslips.length === 0 ? (
                        <div className="px-5 py-10 text-center text-sm text-slate-400">
                            <Icon name="banknote" className="mx-auto mb-2 h-8 w-8" />
                            {t('Aucun bulletin de paie.')}
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-slate-100 dark:divide-slate-800">
                                <thead>
                                    <tr className="text-left text-xs font-semibold uppercase tracking-wider text-slate-400">
                                        <th className="px-5 py-3">{t('Période')}</th>
                                        <th className="px-5 py-3">{t('Brut')}</th>
                                        <th className="px-5 py-3">{t('Net')}</th>
                                        <th className="px-5 py-3">{t('Statut')}</th>
                                        <th className="px-5 py-3" />
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                    {payslips.map((p) => (
                                        <tr key={p.id} className="text-sm hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                            <td className="px-5 py-3 font-medium text-slate-700 dark:text-slate-200">
                                                {p.period}
                                            </td>
                                            <td className="px-5 py-3 text-slate-500">
                                                {formatMoney(p.gross_salary, p.currency)}
                                            </td>
                                            <td className="px-5 py-3 font-semibold text-slate-800 dark:text-slate-100">
                                                {formatMoney(p.net_salary, p.currency)}
                                            </td>
                                            <td className="px-5 py-3">
                                                <Badge map={PAY_STATUS} status={p.status} />
                                            </td>
                                            <td className="px-5 py-3 text-right">
                                                <a
                                                    href={`/hr/${employee.id}/payslips/${p.id}/pdf`}
                                                    target="_blank"
                                                    rel="noopener"
                                                    title={t('Télécharger le bulletin')}
                                                    className="inline-flex items-center gap-1 rounded-md border border-slate-200 px-2 py-1 text-xs text-slate-600 hover:bg-slate-50 hover:text-orange-600 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                                                >
                                                    <Icon name="file-down" className="h-3.5 w-3.5" />
                                                    PDF
                                                </a>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Calendrier d'assiduité */}
                <AttendanceCalendar attendances={attendances} />
            </div>

            {/* ── Pointages récents (liste) ── */}
            <div className="mb-6 rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
                <div className="border-b border-slate-100 px-5 py-4 dark:border-slate-800">
                    <h3 className="flex items-center gap-2 font-semibold text-slate-800 dark:text-slate-100">
                        <Icon name="fingerprint" className="h-5 w-5 text-orange-500" />
                        {t('Pointages récents')}
                        <span className="ml-auto text-xs font-normal text-slate-400">30 {t('derniers jours')}</span>
                    </h3>
                </div>

                {attendances.length === 0 ? (
                    <div className="px-5 py-10 text-center text-sm text-slate-400">
                        <Icon name="fingerprint" className="mx-auto mb-2 h-8 w-8" />
                        {t('Aucun pointage enregistré.')}
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-100 dark:divide-slate-800">
                            <thead>
                                <tr className="text-left text-xs font-semibold uppercase tracking-wider text-slate-400">
                                    <th className="px-5 py-3">{t('Date')}</th>
                                    <th className="px-5 py-3">{t('Statut')}</th>
                                    <th className="px-5 py-3">{t('Heures')}</th>
                                    <th className="px-5 py-3">{t('H. sup.')}</th>
                                    <th className="px-5 py-3">{t('Chantier')}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {attendances.map((a) => {
                                    const info = ATT_STATUS[a.status];
                                    return (
                                        <tr key={a.id} className="text-sm hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                            <td className="px-5 py-3 font-medium text-slate-700 dark:text-slate-200">
                                                {new Date(a.date).toLocaleDateString('fr-FR')}
                                            </td>
                                            <td className="px-5 py-3">
                                                {info ? (
                                                    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${info.bg} text-white`}>
                                                        {info.title}
                                                    </span>
                                                ) : (
                                                    <span className="text-slate-400">{a.status}</span>
                                                )}
                                            </td>
                                            <td className="px-5 py-3 text-slate-500">
                                                {a.hours_worked ? `${parseFloat(a.hours_worked).toFixed(1)} h` : '—'}
                                            </td>
                                            <td className="px-5 py-3 text-slate-500">
                                                {a.overtime_hours && parseFloat(a.overtime_hours) > 0
                                                    ? `+${parseFloat(a.overtime_hours).toFixed(1)} h`
                                                    : '—'}
                                            </td>
                                            <td className="px-5 py-3 text-slate-500">
                                                {a.site?.name ?? '—'}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* ── Modale suppression ── */}
            <Modal show={confirmDelete} onClose={() => setConfirmDelete(false)} maxWidth="md">
                <div className="p-6">
                    <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
                        {t('Supprimer cet employé ?')}
                    </h3>
                    <p className="mt-2 text-sm text-slate-500">
                        {t("L'employé")} « {employee.full_name} »{' '}
                        {t('sera supprimé. Cette action est réversible (corbeille).')}
                    </p>
                    <div className="mt-6 flex justify-end gap-3">
                        <SecondaryButton type="button" onClick={() => setConfirmDelete(false)}>
                            {t('Annuler')}
                        </SecondaryButton>
                        <DangerButton onClick={deleteEmployee}>
                            {t('Supprimer définitivement')}
                        </DangerButton>
                    </div>
                </div>
            </Modal>
        </AppLayout>
    );
}
