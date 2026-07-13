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
import { useTrans } from '@/i18n';

// Libellés locaux au module Pointage (FR).
const STATUS = {
    present:  { label: 'Présent',      color: 'bg-green-100 text-green-700' },
    absent:   { label: 'Absent',       color: 'bg-red-100 text-red-700' },
    leave:    { label: 'Congé',        color: 'bg-blue-100 text-blue-700' },
    half_day: { label: 'Demi-journée', color: 'bg-amber-100 text-amber-700' },
};

function StatusBadge({ status }) {
    const { t } = useTrans();
    const s = STATUS[status] ?? { label: status, color: 'bg-slate-100 text-slate-600' };
    return <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${s.color}`}>{t(s.label)}</span>;
}

export default function Index({ attendances, filters, employees, sites, statuses, can }) {
    const { t } = useTrans();
    const [showModal, setShowModal] = useState(false);

    const applyFilters = (next = {}) => {
        router.get('/attendance', { date: filters.date, site_id: filters.site_id, ...next }, {
            preserveState: true,
            replace: true,
        });
    };

    const form = useForm({
        employee_id: '',
        date: filters.date,
        status: 'present',
        hours_worked: 8,
        overtime_hours: 0,
        site_id: '',
        notes: '',
    });

    const submit = (e) => {
        e.preventDefault();
        form.post('/attendance', {
            onSuccess: () => { form.reset(); setShowModal(false); },
            preserveScroll: true,
        });
    };

    const fmtDate = (d) => (d ? new Date(d).toLocaleDateString('fr-FR') : '—');

    return (
        <AppLayout header="Pointage">
            <Head title={t('Pointage')} />

            {/* Barre d'actions */}
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-wrap items-center gap-2">
                    <div className="relative">
                        <Icon name="calendar" className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <input
                            type="date"
                            value={filters.date ?? ''}
                            onChange={(e) => applyFilters({ date: e.target.value })}
                            className="rounded-md border-slate-300 pl-9 text-sm focus:border-orange-500 focus:ring-orange-500 dark:border-slate-700 dark:bg-slate-900"
                        />
                    </div>
                    <select
                        value={filters.site_id ?? ''}
                        onChange={(e) => applyFilters({ site_id: e.target.value })}
                        className="rounded-md border-slate-300 text-sm focus:border-orange-500 focus:ring-orange-500 dark:border-slate-700 dark:bg-slate-900"
                    >
                        <option value="">{t('Tous les chantiers')}</option>
                        {sites.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                </div>

                {can.create && (
                    <button
                        onClick={() => { form.setData('date', filters.date); setShowModal(true); }}
                        className="inline-flex items-center gap-2 rounded-md bg-orange-500 px-4 py-2 text-sm font-medium text-white hover:bg-orange-600"
                    >
                        <Icon name="plus" className="h-4 w-4" />
                        {t('Saisir un pointage')}
                    </button>
                )}
            </div>

            {/* Tableau */}
            <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
                <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
                    <thead className="bg-slate-50 dark:bg-slate-800/50">
                        <tr className="text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                            <th className="px-4 py-3">{t('Date')}</th>
                            <th className="px-4 py-3">{t('Employé')}</th>
                            <th className="px-4 py-3">{t('Chantier')}</th>
                            <th className="px-4 py-3">{t('Heures')}</th>
                            <th className="px-4 py-3">{t('Heures sup.')}</th>
                            <th className="px-4 py-3">{t('Statut')}</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {attendances.data.map((a) => (
                            <tr key={a.id} className="text-sm hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{fmtDate(a.date)}</td>
                                <td className="px-4 py-3">
                                    <div className="font-medium text-slate-800 dark:text-slate-100">
                                        {a.employee ? `${a.employee.first_name} ${a.employee.last_name}` : '—'}
                                    </div>
                                    <div className="font-mono text-xs text-slate-400">{a.employee?.matricule}</div>
                                </td>
                                <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{a.site?.name ?? '—'}</td>
                                <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{a.hours_worked} h</td>
                                <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{a.overtime_hours} h</td>
                                <td className="px-4 py-3"><StatusBadge status={a.status} /></td>
                            </tr>
                        ))}

                        {attendances.data.length === 0 && (
                            <tr>
                                <td colSpan={6} className="px-4 py-12 text-center text-slate-400">
                                    <Icon name="fingerprint" className="mx-auto mb-2 h-8 w-8" />
                                    {t('Aucun pointage pour cette date.')}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {attendances.last_page > 1 && (
                <div className="mt-4 flex flex-wrap gap-1">
                    {attendances.links.map((link, i) => (
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

            {/* Modal saisie de pointage */}
            <Modal show={showModal} onClose={() => setShowModal(false)}>
                <form onSubmit={submit} className="p-6">
                    <h3 className="mb-4 text-lg font-semibold text-slate-800 dark:text-slate-100">{t('Saisir un pointage')}</h3>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div className="sm:col-span-2">
                            <InputLabel htmlFor="att_employee" value={t('Employé *')} />
                            <select
                                id="att_employee"
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
                                value={form.data.employee_id}
                                onChange={(e) => form.setData('employee_id', e.target.value)}
                            >
                                <option value="">{t('— Sélectionner —')}</option>
                                {employees.map((emp) => (
                                    <option key={emp.id} value={emp.id}>{emp.matricule} · {emp.first_name} {emp.last_name}</option>
                                ))}
                            </select>
                            <InputError message={form.errors.employee_id} className="mt-1" />
                        </div>
                        <div>
                            <InputLabel htmlFor="att_date" value={t('Date *')} />
                            <TextInput id="att_date" type="date" className="mt-1 block w-full"
                                value={form.data.date} onChange={(e) => form.setData('date', e.target.value)} />
                            <InputError message={form.errors.date} className="mt-1" />
                        </div>
                        <div>
                            <InputLabel htmlFor="att_status" value={t('Statut *')} />
                            <select id="att_status"
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
                                value={form.data.status} onChange={(e) => form.setData('status', e.target.value)}>
                                {statuses.map((s) => <option key={s} value={s}>{t(STATUS[s]?.label ?? s)}</option>)}
                            </select>
                        </div>
                        <div>
                            <InputLabel htmlFor="att_hours" value={t('Heures travaillées *')} />
                            <TextInput id="att_hours" type="number" min={0} max={24} step="0.5" className="mt-1 block w-full"
                                value={form.data.hours_worked} onChange={(e) => form.setData('hours_worked', e.target.value)} />
                            <InputError message={form.errors.hours_worked} className="mt-1" />
                        </div>
                        <div>
                            <InputLabel htmlFor="att_ot" value={t('Heures supplémentaires')} />
                            <TextInput id="att_ot" type="number" min={0} max={24} step="0.5" className="mt-1 block w-full"
                                value={form.data.overtime_hours} onChange={(e) => form.setData('overtime_hours', e.target.value)} />
                        </div>
                        <div className="sm:col-span-2">
                            <InputLabel htmlFor="att_site" value={t('Chantier')} />
                            <select id="att_site"
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
                                value={form.data.site_id} onChange={(e) => form.setData('site_id', e.target.value)}>
                                <option value="">{t('— Aucun —')}</option>
                                {sites.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                            </select>
                        </div>
                    </div>
                    <div className="mt-6 flex justify-end gap-3">
                        <SecondaryButton type="button" onClick={() => setShowModal(false)}>{t('Annuler')}</SecondaryButton>
                        <PrimaryButton disabled={form.processing} className="bg-orange-500 hover:bg-orange-600 focus:bg-orange-600">
                            {t('Enregistrer le pointage')}
                        </PrimaryButton>
                    </div>
                </form>
            </Modal>
        </AppLayout>
    );
}
