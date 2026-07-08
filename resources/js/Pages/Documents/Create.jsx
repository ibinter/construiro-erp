import AppLayout from '@/Layouts/AppLayout';
import DocumentForm from './Partials/DocumentForm';
import { Head, useForm } from '@inertiajs/react';

export default function Create({ projects, categories }) {
    const form = useForm({
        code: '',
        title: '',
        category: 'plan',
        version: '1.0',
        file_name: '',
        file_path: '',
        mime_type: '',
        size_kb: '',
        uploaded_by: '',
        description: '',
        project_id: '',
    });

    const submit = (e) => {
        e.preventDefault();
        form.post('/documents');
    };

    return (
        <AppLayout header="Nouveau document">
            <Head title="Nouveau document" />
            <div className="mx-auto max-w-4xl">
                <DocumentForm
                    form={form}
                    projects={projects}
                    categories={categories}
                    onSubmit={submit}
                    submitLabel="Enregistrer le document"
                />
            </div>
        </AppLayout>
    );
}
