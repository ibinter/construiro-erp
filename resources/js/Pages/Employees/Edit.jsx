import AppLayout from '@/Layouts/AppLayout';
import EmployeeForm from './Partials/EmployeeForm';
import { Head, useForm } from '@inertiajs/react';
import { useTrans } from '@/i18n';

export default function Edit({ employee, sites, agencies, departments, contractTypes, statuses }) {
    const { t } = useTrans();
    const form = useForm({
        matricule: employee.matricule ?? '',
        first_name: employee.first_name ?? '',
        last_name: employee.last_name ?? '',
        job_title: employee.job_title ?? '',
        department: employee.department ?? 'chantier',
        contract_type: employee.contract_type ?? 'cdi',
        status: employee.status ?? 'active',
        phone: employee.phone ?? '',
        email: employee.email ?? '',
        hire_date: employee.hire_date ?? '',
        base_salary: employee.base_salary ?? 0,
        currency: employee.currency ?? 'XOF',
        site_id: employee.site_id ?? '',
        agency_id: employee.agency_id ?? '',
        is_active: employee.is_active ?? true,
        notes: employee.notes ?? '',
    });

    const submit = (e) => {
        e.preventDefault();
        form.put(`/hr/${employee.id}`);
    };

    return (
        <AppLayout header={`Modifier — ${employee.full_name}`}>
            <Head title={`Modifier ${employee.full_name}`} />
            <div className="mx-auto max-w-4xl">
                <EmployeeForm
                    form={form}
                    sites={sites}
                    agencies={agencies}
                    departments={departments}
                    contractTypes={contractTypes}
                    statuses={statuses}
                    onSubmit={submit}
                    submitLabel={t('Enregistrer')}
                />
            </div>
        </AppLayout>
    );
}
