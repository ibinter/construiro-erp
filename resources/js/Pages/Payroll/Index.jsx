import { useState } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import Icon from '@/Components/Icon';
import Modal from '@/Components/Modal';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import { Head, router, useForm } from '@inertiajs/react';
import { formatMoney } from '@/constants';
import { useTrans } from '@/i18n';

const STATUS = {
    draft:     { label: 'Brouillon', color: 'bg-slate-100 text-slate-600' },
    validated: { label: 'Validé',    color: 'bg-blue-100 text-blue-700' },
    paid:      { label: 'Payé',      color: 'bg-green-100 text-green-700' },
};

const COUNTRIES = [
    { code: 'CI', label: 'Côte d\'Ivoire (CNPS 3,2% / ITS)' },
    { code: 'SN', label: 'Sénégal (IPRES 5,6% / TRIMF)' },
    { code: 'CM', label: 'Cameroun (CNPS 2,8% / IRPP)' },
];

function StatusBadge({ status }) {
    const { t } = useTrans();
    const s = STATUS[status] ?? { label: status, color: 'bg-slate-100 text-slate-600' };
    return <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${s.color}`}>{t(s.label)}</span>;
}

function BreakdownRow({ label, amount, currency, negative = false, bold = false }) {
    if (!amount || Number(amount) === 0) return null;
    return (
        <div className={`flex justify-between text-xs py-0.5 ${bold ? 'font-semibold' : ''}`}>
            <span className="text-slate-500">{label}</span>
            <span className={negative ? 'text-red-600' : 'text-slate-700 dark:text-slate-300'}>
                {negative ? '−' : ''}{formatMoney(amount, currency)}
            </span>
        </div>
    );
}

function PayslipDetail({ p }) {
    const [open, setOpen] = useState(false);
    const hasCotisations = Number(p.cnps_employee) > 0 || Number(p.its_amount) > 0;

    if (!hasCotisations) return null;

    return (
        <div>
            <button
                onClick={() => setOpen((v) => !v)}
                className="text-xs text-orange-500 underline underline-offset-2"
            >
                {open ? 'Masquer' : 'Détail'}
            </button>
            {open && (
                <div className="mt-2 rounded-md border border-slate-100 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-800/50 min-w-[220px]">
                    <BreakdownRow label="Salaire de base" amount={p.base_salary} currency={p.currency} />
                    <BreakdownRow label="Heures supp." amount={p.overtime_amount} currency={p.currency} />
                    <BreakdownRow label="Transport" amount={p.transport_allowance} currency={p.currency} />
                    <BreakdownRow label="Logement" amount={p.housing_allowance} currency={p.currency} />
                    <BreakdownRow label="Autres alloc." amount={p.other_allowances} currency={p.currency} />
                    <div className="my-1 border-t border-slate-200 dark:border-slate-700" />
                    <BreakdownRow label="Brut" amount={p.gross_salary} currency={p.currency} bold />
                    <BreakdownRow label="CNPS/IPRES" amount={p.cnps_employee} currency={p.currency} negative />
                    <BreakdownRow label="ITS/TRIMF" amount={p.its_amount} currency={p.currency} negative />
                    <BreakdownRow label="Avances" amount={p.advance_deductions} currency={p.currency} negative />
                    <div className="my-1 border-t border-slate-200 dark:border-slate-700" />
                    <BreakdownRow label="Net à payer" amount={p.net_salary} currency={p.currency} bold />
                    {p.days_worked !== null && (
                        <div className="mt-1 text-xs text-slate-400">
                            {p.days_worked} / {p.working_days} jours
                            {Number(p.overtime_hours) > 0 && ` · ${p.overtime_hours}h supp.`}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default function Index({ payslips, filters, employees, statuses, can }) {
    const { t } = useTrans();
    const [showModal, setShowModal]       = useState(false);
    const [showGenModal, setShowGenModal] = useState(false);

    const applyFilters = (next = {}) => {
        router.get('/payroll', { period: filters.period, ...next }, { preserveState: true, replace: true });
    };

    // Formulaire génération manuelle (1 employé)
    const form = useForm({
        employee_id: '',
        period: filters.period,
        gross_salary: 0,
        deductions: 0,
        currency: 'XOF',
        notes: '',
    });

    // Formulaire génération automatique (tous les employés)
    const genForm = useForm({
        period: filters.period,
        country_code: 'CI',
    });

    const submit = (e) => {
        e.preventDefault();
        form.post('/payroll', {
            onSuccess: () => { form.reset(); setShowModal(false); },
            preserveScroll: true,
        });
    };

    const submitGenerate = (e) => {
        e.preventDefault();
        genForm.post('/payroll/generate', {
            onSuccess: () => setShowGenModal(false),
            preserveScroll: true,
        });
    };

    const onEmployeeChange = (id) => {
        form.setData('employee_id', id);
        const emp = employees.find((e) => String(e.id) === String(id));
        if (emp) {
            form.setData('gross_salary', emp.base_salary);
            form.setData('currency', emp.currency ?? 'XOF');
        }
    };

    const changeStatus = (payslip, status) => {
        router.post(`/payroll/${payslip.id}/status`, { status }, { preserveScroll: true });
    };

    return (
        <AppLayout header="Paie">
            <Head title={t('Paie')} />

            {/* Barre d'actions */}
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="relative">
                    <Icon name="calendar" className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                        type="month"
                        value={filters.period ?? ''}
                        onChange={(e) => applyFilters({ period: e.target.value })}
                        className="rounded-md border-slate-300 pl-9 text-sm focus:border-orange-500 focus:ring-orange-500 dark:border-slate-700 dark:bg-slate-900"
                    />
                </div>

                {can.create && (
                    <div className="flex gap-2">
                        <button
                            onClick={() => { genForm.setData('period', filters.period); setShowGenModal(true); }}
                            className="inline-flex items-center gap-2 rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
                        >
                            <Icon name="zap" className="h-4 w-4" />
                            {t('Générer tous')}
                        </button>
                        <button
                            onClick={() => { form.setData('period', filters.period); setShowModal(true); }}
                            className="inline-flex items-center gap-2 rounded-md bg-orange-500 px-4 py-2 text-sm font-medium text-white hover:bg-orange-600"
                        >
                            <Icon name="plus" className="h-4 w-4" />
                            {t('Bulletin manuel')}
                        </button>
                    </div>
                )}
            </div>

            {/* Tableau */}
            <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
                <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
                    <thead className="bg-slate-50 dark:bg-slate-800/50">
                        <tr className="text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                            <th className="px-4 py-3">{t('Employé')}</th>
                            <th className="px-4 py-3">{t('Période')}</th>
                            <th className="px-4 py-3">{t('Jours')}</th>
                            <th className="px-4 py-3">{t('Brut')}</th>
                            <th className="px-4 py-3">{t('Cotisations')}</th>
                            <th className="px-4 py-3">{t('Net')}</th>
                            <th className="px-4 py-3">{t('Statut')}</th>
                            <th className="px-4 py-3 text-right">{t('Actions')}</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {payslips.data.map((p) => (
                            <tr key={p.id} className="text-sm hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                <td className="px-4 py-3">
                                    <div className="font-medium text-slate-800 dark:text-slate-100">
                                        {p.employee ? `${p.employee.first_name} ${p.employee.last_name}` : '—'}
                                    </div>
                                    <div className="font-mono text-xs text-slate-400">{p.employee?.matricule}</div>
                                </td>
                                <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{p.period}</td>
                                <td className="px-4 py-3 text-slate-500 text-xs">
                                    {p.days_worked !== null ? `${p.days_worked}/${p.working_days}` : '—'}
                                </td>
                                <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{formatMoney(p.gross_salary, p.currency)}</td>
                                <td className="px-4 py-3">
                                    <div className="text-slate-600 dark:text-slate-300 mb-1">{formatMoney(p.deductions, p.currency)}</div>
                                    <PayslipDetail p={p} />
                                </td>
                                <td className="px-4 py-3 font-semibold text-slate-800 dark:text-slate-100">{formatMoney(p.net_salary, p.currency)}</td>
                                <td className="px-4 py-3"><StatusBadge status={p.status} /></td>
                                <td className="px-4 py-3 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        <a
                                            href={`/payroll/${p.id}/pdf`}
                                            target="_blank"
                                            rel="noopener"
                                            className="rounded-md border border-slate-200 px-2 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                                        >
                                            PDF
                                        </a>
                                        {can.update && (
                                            <div className="flex gap-2">
                                                {p.status === 'draft' && (
                                                    <button
                                                        onClick={() => changeStatus(p, 'validated')}
                                                        className="rounded-md border border-blue-200 px-2 py-1 text-xs font-medium text-blue-600 hover:bg-blue-50 dark:border-blue-900/50"
                                                    >
                                                        {t('Valider')}
                                                    </button>
                                                )}
                                                {p.status === 'validated' && (
                                                    <button
                                                        onClick={() => changeStatus(p, 'paid')}
                                                        className="rounded-md border border-green-200 px-2 py-1 text-xs font-medium text-green-600 hover:bg-green-50 dark:border-green-900/50"
                                                    >
                                                        {t('Marquer payé')}
                                                    </button>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}

                        {payslips.data.length === 0 && (
                            <tr>
                                <td colSpan={8} className="px-4 py-12 text-center text-slate-400">
                                    <Icon name="banknote" className="mx-auto mb-2 h-8 w-8" />
                                    <div>{t('Aucun bulletin pour cette période.')}</div>
                                    {can.create && (
                                        <button
                                            onClick={() => { genForm.setData('period', filters.period); setShowGenModal(true); }}
                                            className="mt-3 inline-flex items-center gap-1 rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
                                        >
                                            <Icon name="zap" className="h-4 w-4" />
                                            {t('Générer tous les bulletins')}
                                        </button>
                                    )}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {payslips.last_page > 1 && (
                <div className="mt-4 flex flex-wrap gap-1">
                    {payslips.links.map((link, i) => (
                        <button
                            key={i}
                            disabled={!link.url}
                            onClick={() => link.url && router.get(link.url, {}, { preserveState: true })}
                            className={`rounded-md px-3 py-1.5 text-sm ${
                                link.active
                                    ? 'bg-orange-500 text-white'
                                    : 'text-slate-600 hover:bg-slate-100 disabled:opacity-40 dark:text-slate-300 dark:hover:bg-slate-800'
                            }`}
                            dangerouslySetInnerHTML={{ __html: link.label }}
                        />
                    ))}
                </div>
            )}

            {/* Modal — Génération automatique tous les employés */}
            <Modal show={showGenModal} onClose={() => setShowGenModal(false)}>
                <form onSubmit={submitGenerate} className="p-6">
                    <div className="mb-4 flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30">
                            <Icon name="zap" className="h-5 w-5 text-emerald-600" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">{t('Génération automatique')}</h3>
                            <p className="text-sm text-slate-500">{t('Calcul depuis les pointages + cotisations légales')}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div>
                            <InputLabel htmlFor="gen_period" value={t('Période *')} />
                            <TextInput id="gen_period" type="month" className="mt-1 block w-full"
                                value={genForm.data.period}
                                onChange={(e) => genForm.setData('period', e.target.value)} />
                            <InputError message={genForm.errors.period} className="mt-1" />
                        </div>
                        <div>
                            <InputLabel htmlFor="gen_country" value={t('Pays / Régime *')} />
                            <select
                                id="gen_country"
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
                                value={genForm.data.country_code}
                                onChange={(e) => genForm.setData('country_code', e.target.value)}
                            >
                                {COUNTRIES.map((c) => <option key={c.code} value={c.code}>{c.label}</option>)}
                            </select>
                        </div>
                    </div>

                    <div className="mt-4 rounded-md border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800 dark:border-emerald-900/30 dark:bg-emerald-900/10 dark:text-emerald-400">
                        <strong>{t('Calcul automatique :')}</strong>{' '}
                        {t('salaire de base × jours travaillés/ouvrables + heures supp − cotisations légales')}
                    </div>

                    <div className="mt-6 flex justify-end gap-3">
                        <SecondaryButton type="button" onClick={() => setShowGenModal(false)}>{t('Annuler')}</SecondaryButton>
                        <PrimaryButton disabled={genForm.processing} className="bg-emerald-600 hover:bg-emerald-700 focus:bg-emerald-700">
                            <Icon name="zap" className="mr-2 h-4 w-4" />
                            {t('Générer tous les bulletins')}
                        </PrimaryButton>
                    </div>
                </form>
            </Modal>

            {/* Modal — Génération manuelle (1 employé) */}
            <Modal show={showModal} onClose={() => setShowModal(false)}>
                <form onSubmit={submit} className="p-6">
                    <h3 className="mb-4 text-lg font-semibold text-slate-800 dark:text-slate-100">{t('Bulletin manuel')}</h3>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div className="sm:col-span-2">
                            <InputLabel htmlFor="pay_employee" value={t('Employé *')} />
                            <select
                                id="pay_employee"
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
                                value={form.data.employee_id}
                                onChange={(e) => onEmployeeChange(e.target.value)}
                            >
                                <option value="">{t('— Sélectionner —')}</option>
                                {employees.map((emp) => (
                                    <option key={emp.id} value={emp.id}>{emp.matricule} · {emp.first_name} {emp.last_name}</option>
                                ))}
                            </select>
                            <InputError message={form.errors.employee_id} className="mt-1" />
                        </div>
                        <div>
                            <InputLabel htmlFor="pay_period" value={t('Période *')} />
                            <TextInput id="pay_period" type="month" className="mt-1 block w-full"
                                value={form.data.period} onChange={(e) => form.setData('period', e.target.value)} />
                            <InputError message={form.errors.period} className="mt-1" />
                        </div>
                        <div>
                            <InputLabel htmlFor="pay_currency" value={t('Devise *')} />
                            <select id="pay_currency"
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
                                value={form.data.currency} onChange={(e) => form.setData('currency', e.target.value)}>
                                {['XOF', 'XAF', 'EUR', 'USD', 'GHS', 'NGN'].map((c) => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                        <div>
                            <InputLabel htmlFor="pay_gross" value={t('Salaire brut *')} />
                            <TextInput id="pay_gross" type="number" min={0} step="0.01" className="mt-1 block w-full"
                                value={form.data.gross_salary} onChange={(e) => form.setData('gross_salary', e.target.value)} />
                            <InputError message={form.errors.gross_salary} className="mt-1" />
                        </div>
                        <div>
                            <InputLabel htmlFor="pay_deductions" value={t('Retenues manuelles')} />
                            <TextInput id="pay_deductions" type="number" min={0} step="0.01" className="mt-1 block w-full"
                                value={form.data.deductions} onChange={(e) => form.setData('deductions', e.target.value)} />
                        </div>
                        <div className="sm:col-span-2 rounded-md bg-slate-50 px-4 py-3 text-sm dark:bg-slate-800/50">
                            <span className="text-slate-500">{t('Net estimé :')} </span>
                            <span className="font-semibold text-slate-800 dark:text-slate-100">
                                {formatMoney(Number(form.data.gross_salary || 0) - Number(form.data.deductions || 0), form.data.currency)}
                            </span>
                        </div>
                    </div>
                    <div className="mt-6 flex justify-end gap-3">
                        <SecondaryButton type="button" onClick={() => setShowModal(false)}>{t('Annuler')}</SecondaryButton>
                        <PrimaryButton disabled={form.processing} className="bg-orange-500 hover:bg-orange-600 focus:bg-orange-600">
                            {t('Générer')}
                        </PrimaryButton>
                    </div>
                </form>
            </Modal>
        </AppLayout>
    );
}
