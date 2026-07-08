import AppLayout from '@/Layouts/AppLayout';
import QualityForm from './Partials/QualityForm';
import { Head, useForm } from '@inertiajs/react';

export default function Create({ projects, sites, controlTypes, results }) {
    const form = useForm({
        code: '',
        title: '',
        control_type: 'reception',
        result: 'en_attente',
        description: '',
        control_date: '',
        inspector: '',
        observations: '',
        project_id: '',
        site_id: '',
    });

    const submit = (e) => {
        e.preventDefault();
        form.post('/quality');
    };

    return (
        <AppLayout header="Nouveau contrôle qualité">
            <Head title="Nouveau contrôle qualité" />
            <div className="mx-auto max-w-4xl">
                <QualityForm
                    form={form}
                    projects={projects}
                    sites={sites}
                    controlTypes={controlTypes}
                    results={results}
                    onSubmit={submit}
                    submitLabel="Créer le contrôle"
                />
            </div>
        </AppLayout>
    );
}
