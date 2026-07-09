import AppLayout from '@/Layouts/AppLayout';
import ProjectForm from './Partials/ProjectForm';
import { Head, useForm } from '@inertiajs/react';
import { useTrans } from '@/i18n';

export default function Create({ managers, types, statuses }) {
    const { t } = useTrans();
    const form = useForm({
        code: '',
        name: '',
        description: '',
        client_name: '',
        type: 'batiment',
        status: 'draft',
        budget_amount: 0,
        currency: 'XOF',
        progress: 0,
        start_date: '',
        end_date: '',
        manager_id: '',
        city: '',
        address: '',
    });

    const submit = (e) => {
        e.preventDefault();
        form.post('/projects');
    };

    return (
        <AppLayout header="Nouveau projet">
            <Head title={t('Nouveau projet')} />
            <div className="mx-auto max-w-4xl">
                <ProjectForm
                    form={form}
                    managers={managers}
                    types={types}
                    statuses={statuses}
                    onSubmit={submit}
                    submitLabel={t('Créer le projet')}
                />
            </div>
        </AppLayout>
    );
}
