import AppLayout from '@/Layouts/AppLayout';
import EmployeeForm from './Partials/EmployeeForm';
import { Head, useForm } from '@inertiajs/react';
import { useTrans } from '@/i18n';

export default function Create({ sites, agencies, departments, contractTypes, statuses }) {
    const { t } = useTrans();
    const form = useForm({
        matricule: '',
        first_name: '',
        last_name: '',
        job_title: '',
        department: 'chantier',
        contract_type: 'cdi',
        status: 'active',
        phone: '',
        email: '',
        hire_date: '',
        base_salary: 0,
        currency: 'XOF',
        site_id: '',
        agency_id: '',
        is_active: true,
        notes: '',
    });

    const submit = (e) => {
        e.preventDefault();
        form.post('/hr');
    };

    return (
        <AppLayout header="Nouvel employé">
            <Head title={t('Nouvel employé')} />
            <div className="mx-auto max-w-4xl">
                <EmployeeForm
                    form={form}
                    sites={sites}
                    agencies={agencies}
                    departments={departments}
                    contractTypes={contractTypes}
                    statuses={statuses}
                    onSubmit={submit}
                    submitLabel={t("Créer l'employé")}
                />
            </div>
        </AppLayout>
    );
}
