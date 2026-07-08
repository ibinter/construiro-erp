import AppLayout from '@/Layouts/AppLayout';
import DocumentForm from './Partials/DocumentForm';
import { Head, useForm } from '@inertiajs/react';

export default function Edit({ document, projects, categories }) {
    const form = useForm({
        code: document.code ?? '',
        title: document.title ?? '',
        category: document.category ?? 'plan',
        version: document.version ?? '1.0',
        file_name: document.file_name ?? '',
        file_path: document.file_path ?? '',
        mime_type: document.mime_type ?? '',
        size_kb: document.size_kb ?? '',
        uploaded_by: document.uploaded_by ?? '',
        description: document.description ?? '',
        project_id: document.project_id ?? '',
    });

    const submit = (e) => {
        e.preventDefault();
        form.put(`/documents/${document.id}`);
    };

    return (
        <AppLayout header={`Modifier — ${document.title}`}>
            <Head title={`Modifier ${document.title}`} />
            <div className="mx-auto max-w-4xl">
                <DocumentForm
                    form={form}
                    projects={projects}
                    categories={categories}
                    onSubmit={submit}
                    submitLabel="Enregistrer"
                />
            </div>
        </AppLayout>
    );
}
