import AppLayout from '@/Layouts/AppLayout';
import BudgetForm from './Partials/BudgetForm';
import { Head, useForm } from '@inertiajs/react';
import { useTrans } from '@/i18n';

export default function Create({ projects, statuses }) {
    const { t } = useTrans();
    const form = useForm({
        code: '',
        title: '',
        fiscal_year: new Date().getFullYear(),
        project_id: '',
        status: 'draft',
        currency: 'XOF',
        notes: '',
        lines: [
            { category: '', label: '', planned_amount: 0, actual_amount: 0 },
        ],
    });

    const submit = (e) => {
        e.preventDefault();
        form.post('/budget');
    };

    return (
        <AppLayout header="Nouveau budget">
            <Head title={t('Nouveau budget')} />
            <div className="mx-auto max-w-5xl">
                <BudgetForm
                    form={form}
                    projects={projects}
                    statuses={statuses}
                    onSubmit={submit}
                    submitLabel={t('Créer le budget')}
                />
            </div>
        </AppLayout>
    );
}
