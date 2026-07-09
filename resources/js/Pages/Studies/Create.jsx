import AppLayout from '@/Layouts/AppLayout';
import StudyForm from './Partials/StudyForm';
import { Head, useForm } from '@inertiajs/react';
import { useTrans } from '@/i18n';

export default function Create({ projects, types, statuses }) {
    const { t } = useTrans();
    const form = useForm({
        code: '',
        title: '',
        type: 'plan',
        status: 'en_cours',
        project_id: '',
        author: '',
        notes: '',
    });

    const submit = (e) => {
        e.preventDefault();
        form.post('/design-office');
    };

    return (
        <AppLayout header="Nouvelle étude">
            <Head title={t('Nouvelle étude')} />
            <div className="mx-auto max-w-4xl">
                <StudyForm
                    form={form}
                    projects={projects}
                    types={types}
                    statuses={statuses}
                    onSubmit={submit}
                    submitLabel={t("Créer l'étude")}
                />
            </div>
        </AppLayout>
    );
}
