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

// Libellés locaux au module Paie (FR).
const STATUS = {
    draft:     { label: 'Brouillon', color: 'bg-slate-100 text-slate-600' },
    validated: { label: 'Validé',    color: 'bg-blue-100 text-blue-700' },
    paid:      { label: 'Payé',      color: 'bg-green-100 text-green-700' },
};

function StatusBadge({ status }) {
    const s = STATUS[status] ?? { label: status, color: 'bg-slate-100 text-slate-600' };
    return <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${s.color}`}>{s.label}</span>;
}

export default function Index({ payslips, filters, employees, statuses, can }) {
    const [showModal, setShowModal] = useState(false);

    const applyFilters = (next = {}) => {
        router.get('/payroll', { period: filters.period, ...next }, {
            preserveState: true,
            replace: true,
        });
    };

    const form = useForm({
        employee_id: '',
        period: filters.period,
        gross_salary: 0,
        deductions: 0,
        currency: 'XOF',
        notes: '',
    });

    const submit = (e) => {
        e.preventDefault();
        form.post('/payroll', {
            onSuccess: () => { form.reset(); setShowModal(false); },
            preserveScroll: true,
        });
    };

    // Pré-remplit brut et devise à partir du salaire de base de l'employé choisi.
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
            <Head title="Paie" />

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
                    <button
                        onClick={() => { form.setData('period', filters.period); setShowModal(true); }}
                        className="inline-flex items-center gap-2 rounded-md bg-orange-500 px-4 py-2 text-sm font-medium text-white hover:bg-orange-600"
                    >
                        <Icon name="plus" className="h-4 w-4" />
                        Générer un bulletin
                    </button>
                )}
            </div>

            {/* Tableau */}
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
                <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
                    <thead className="bg-slate-50 dark:bg-slate-800/50">
                        <tr className="text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                            <th className="px-4 py-3">Employé</th>
                            <th className="px-4 py-3">Période</th>
                            <th className="px-4 py-3">Brut</th>
                            <th className="px-4 py-3">Retenues</th>
                            <th className="px-4 py-3">Net</th>
                            <th className="px-4 py-3">Statut</th>
                            <th className="px-4 py-3 text-right">Actions</th>
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
                                <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{formatMoney(p.gross_salary, p.currency)}</td>
                                <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{formatMoney(p.deductions, p.currency)}</td>
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
                                        <div className="flex justify-end gap-2">
                                            {p.status === 'draft' && (
                                                <button
                                                    onClick={() => changeStatus(p, 'validated')}
                                                    className="rounded-md border border-blue-200 px-2 py-1 text-xs font-medium text-blue-600 hover:bg-blue-50 dark:border-blue-900/50"
                                                >
                                                    Valider
                                                </button>
                                            )}
                                            {p.status === 'validated' && (
                                                <button
                                                    onClick={() => changeStatus(p, 'paid')}
                                                    className="rounded-md border border-green-200 px-2 py-1 text-xs font-medium text-green-600 hover:bg-green-50 dark:border-green-900/50"
                                                >
                                                    Marquer payé
                                                </button>
                                            )}
                                            {p.status === 'paid' && (
                                                <span className="text-xs text-slate-400">—</span>
                                            )}
                                        </div>
                                    )}
                                    </div>
                                </td>
                            </tr>
                        ))}

                        {payslips.data.length === 0 && (
                            <tr>
                                <td colSpan={7} className="px-4 py-12 text-center text-slate-400">
                                    <Icon name="banknote" className="mx-auto mb-2 h-8 w-8" />
                                    Aucun bulletin pour cette période.
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

            {/* Modal génération de bulletin */}
            <Modal show={showModal} onClose={() => setShowModal(false)}>
                <form onSubmit={submit} className="p-6">
                    <h3 className="mb-4 text-lg font-semibold text-slate-800 dark:text-slate-100">Générer un bulletin</h3>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div className="sm:col-span-2">
                            <InputLabel htmlFor="pay_employee" value="Employé *" />
                            <select
                                id="pay_employee"
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
                                value={form.data.employee_id}
                                onChange={(e) => onEmployeeChange(e.target.value)}
                            >
                                <option value="">— Sélectionner —</option>
                                {employees.map((emp) => (
                                    <option key={emp.id} value={emp.id}>{emp.matricule} · {emp.first_name} {emp.last_name}</option>
                                ))}
                            </select>
                            <InputError message={form.errors.employee_id} className="mt-1" />
                        </div>
                        <div>
                            <InputLabel htmlFor="pay_period" value="Période *" />
                            <TextInput id="pay_period" type="month" className="mt-1 block w-full"
                                value={form.data.period} onChange={(e) => form.setData('period', e.target.value)} />
                            <InputError message={form.errors.period} className="mt-1" />
                        </div>
                        <div>
                            <InputLabel htmlFor="pay_currency" value="Devise *" />
                            <select id="pay_currency"
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
                                value={form.data.currency} onChange={(e) => form.setData('currency', e.target.value)}>
                                {['XOF', 'XAF', 'EUR', 'USD', 'GHS', 'NGN'].map((c) => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                        <div>
                            <InputLabel htmlFor="pay_gross" value="Salaire brut *" />
                            <TextInput id="pay_gross" type="number" min={0} step="0.01" className="mt-1 block w-full"
                                value={form.data.gross_salary} onChange={(e) => form.setData('gross_salary', e.target.value)} />
                            <InputError message={form.errors.gross_salary} className="mt-1" />
                        </div>
                        <div>
                            <InputLabel htmlFor="pay_deductions" value="Retenues" />
                            <TextInput id="pay_deductions" type="number" min={0} step="0.01" className="mt-1 block w-full"
                                value={form.data.deductions} onChange={(e) => form.setData('deductions', e.target.value)} />
                            <InputError message={form.errors.deductions} className="mt-1" />
                        </div>
                        <div className="sm:col-span-2 rounded-md bg-slate-50 px-4 py-3 text-sm dark:bg-slate-800/50">
                            <span className="text-slate-500">Net estimé : </span>
                            <span className="font-semibold text-slate-800 dark:text-slate-100">
                                {formatMoney(Number(form.data.gross_salary || 0) - Number(form.data.deductions || 0), form.data.currency)}
                            </span>
                        </div>
                    </div>
                    <div className="mt-6 flex justify-end gap-3">
                        <SecondaryButton type="button" onClick={() => setShowModal(false)}>Annuler</SecondaryButton>
                        <PrimaryButton disabled={form.processing} className="bg-orange-500 hover:bg-orange-600 focus:bg-orange-600">
                            Générer le bulletin
                        </PrimaryButton>
                    </div>
                </form>
            </Modal>
        </AppLayout>
    );
}
