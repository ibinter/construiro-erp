import AppLayout from '@/Layouts/AppLayout';
import Icon from '@/Components/Icon';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import { Head, Link, useForm } from '@inertiajs/react';
import { useTrans } from '@/i18n';

// Libellés des statuts de pointage.
const STATUS_LABELS = {
    present:  'Présent',
    absent:   'Absent',
    leave:    'Congé',
    half_day: 'Demi-journée',
};

export default function Edit({ attendance, employees, sites, statuses }) {
    const { t } = useTrans();

    const employeeName = attendance.employee
        ? `${attendance.employee.first_name} ${attendance.employee.last_name}`
        : '';

    const form = useForm({
        employee_id:    attendance.employee_id ?? '',
        date:           attendance.date ? attendance.date.substring(0, 10) : '',
        status:         attendance.status ?? 'present',
        hours_worked:   attendance.hours_worked ?? 8,
        overtime_hours: attendance.overtime_hours ?? 0,
        site_id:        attendance.site_id ?? '',
        notes:          attendance.notes ?? '',
    });

    const submit = (e) => {
        e.preventDefault();
        form.put(`/attendance/${attendance.id}`);
    };

    return (
        <AppLayout header={t('Modifier le pointage')}>
            <Head title={t('Modifier le pointage')} />

            <div className="mx-auto max-w-2xl">
                {/* Fil d'Ariane */}
                <div className="mb-4 flex items-center gap-2 text-sm text-slate-500">
                    <Link
                        href={`/attendance?date=${form.data.date}`}
                        className="hover:text-orange-600"
                    >
                        {t('Pointage')}
                    </Link>
                    <Icon name="chevron-right" className="h-4 w-4" />
                    <span className="text-slate-700 dark:text-slate-200">
                        {employeeName || t('Modifier')}
                    </span>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
                    <h2 className="mb-6 text-lg font-semibold text-slate-800 dark:text-slate-100">
                        {t('Modifier le pointage')}
                    </h2>

                    <form onSubmit={submit} className="space-y-5">
                        {/* Employé */}
                        <div>
                            <InputLabel htmlFor="employee_id" value={t('Employé *')} />
                            <select
                                id="employee_id"
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
                                value={form.data.employee_id}
                                onChange={(e) => form.setData('employee_id', e.target.value)}
                            >
                                <option value="">{t('— Sélectionner —')}</option>
                                {employees.map((emp) => (
                                    <option key={emp.id} value={emp.id}>
                                        {emp.last_name} {emp.first_name} ({emp.matricule})
                                    </option>
                                ))}
                            </select>
                            <InputError message={form.errors.employee_id} className="mt-1" />
                        </div>

                        {/* Date et Statut */}
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div>
                                <InputLabel htmlFor="date" value={t('Date *')} />
                                <TextInput
                                    id="date"
                                    type="date"
                                    className="mt-1 block w-full"
                                    value={form.data.date}
                                    onChange={(e) => form.setData('date', e.target.value)}
                                />
                                <InputError message={form.errors.date} className="mt-1" />
                            </div>

                            <div>
                                <InputLabel htmlFor="status" value={t('Statut *')} />
                                <select
                                    id="status"
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
                                    value={form.data.status}
                                    onChange={(e) => form.setData('status', e.target.value)}
                                >
                                    {statuses.map((s) => (
                                        <option key={s} value={s}>{t(STATUS_LABELS[s] ?? s)}</option>
                                    ))}
                                </select>
                                <InputError message={form.errors.status} className="mt-1" />
                            </div>
                        </div>

                        {/* Heures travaillées et supplémentaires */}
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div>
                                <InputLabel htmlFor="hours_worked" value={t('Heures travaillées *')} />
                                <TextInput
                                    id="hours_worked"
                                    type="number"
                                    min={0}
                                    max={24}
                                    step="0.5"
                                    className="mt-1 block w-full"
                                    value={form.data.hours_worked}
                                    onChange={(e) => form.setData('hours_worked', e.target.value)}
                                />
                                <InputError message={form.errors.hours_worked} className="mt-1" />
                            </div>

                            <div>
                                <InputLabel htmlFor="overtime_hours" value={t('Heures supplémentaires')} />
                                <TextInput
                                    id="overtime_hours"
                                    type="number"
                                    min={0}
                                    max={24}
                                    step="0.5"
                                    className="mt-1 block w-full"
                                    value={form.data.overtime_hours}
                                    onChange={(e) => form.setData('overtime_hours', e.target.value)}
                                />
                                <InputError message={form.errors.overtime_hours} className="mt-1" />
                            </div>
                        </div>

                        {/* Chantier */}
                        {sites.length > 0 && (
                            <div>
                                <InputLabel htmlFor="site_id" value={t('Chantier')} />
                                <select
                                    id="site_id"
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
                                    value={form.data.site_id}
                                    onChange={(e) => form.setData('site_id', e.target.value)}
                                >
                                    <option value="">{t('— Aucun chantier —')}</option>
                                    {sites.map((site) => (
                                        <option key={site.id} value={site.id}>{site.name}</option>
                                    ))}
                                </select>
                                <InputError message={form.errors.site_id} className="mt-1" />
                            </div>
                        )}

                        {/* Notes */}
                        <div>
                            <InputLabel htmlFor="notes" value={t('Notes')} />
                            <TextInput
                                id="notes"
                                className="mt-1 block w-full"
                                value={form.data.notes}
                                onChange={(e) => form.setData('notes', e.target.value)}
                            />
                            <InputError message={form.errors.notes} className="mt-1" />
                        </div>

                        {/* Actions */}
                        <div className="flex justify-end gap-3 pt-2">
                            <SecondaryButton
                                type="button"
                                onClick={() => window.history.back()}
                            >
                                {t('Annuler')}
                            </SecondaryButton>
                            <PrimaryButton
                                disabled={form.processing}
                                className="bg-orange-500 hover:bg-orange-600 focus:bg-orange-600"
                            >
                                {t('Enregistrer les modifications')}
                            </PrimaryButton>
                        </div>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}
