import AppLayout from '@/Layouts/AppLayout';
import ProjectForm from './Partials/ProjectForm';
import { Head, useForm } from '@inertiajs/react';
import { useTrans } from '@/i18n';

export default function Edit({ project, managers, types, statuses }) {
    const { t } = useTrans();
    const form = useForm({
        code: project.code ?? '',
        name: project.name ?? '',
        description: project.description ?? '',
        client_name: project.client_name ?? '',
        type: project.type ?? 'batiment',
        status: project.status ?? 'draft',
        budget_amount: project.budget_amount ?? 0,
        currency: project.currency ?? 'XOF',
        progress: project.progress ?? 0,
        start_date: project.start_date ?? '',
        end_date: project.end_date ?? '',
        manager_id: project.manager_id ?? '',
        city: project.city ?? '',
        address: project.address ?? '',
    });

    const submit = (e) => {
        e.preventDefault();
        form.put(`/projects/${project.id}`);
    };

    return (
        <AppLayout header={`${t('Modifier')} — ${project.name}`}>
            <Head title={`${t('Modifier')} ${project.name}`} />
            <div className="mx-auto max-w-4xl">
                <ProjectForm
                    form={form}
                    managers={managers}
                    types={types}
                    statuses={statuses}
                    onSubmit={submit}
                    submitLabel={t('Enregistrer')}
                />
            </div>
        </AppLayout>
    );
}
