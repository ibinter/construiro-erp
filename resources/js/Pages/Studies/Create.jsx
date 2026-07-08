import AppLayout from '@/Layouts/AppLayout';
import StudyForm from './Partials/StudyForm';
import { Head, useForm } from '@inertiajs/react';

export default function Create({ projects, types, statuses }) {
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
            <Head title="Nouvelle étude" />
            <div className="mx-auto max-w-4xl">
                <StudyForm
                    form={form}
                    projects={projects}
                    types={types}
                    statuses={statuses}
                    onSubmit={submit}
                    submitLabel="Créer l'étude"
                />
            </div>
        </AppLayout>
    );
}
