import AppLayout from '@/Layouts/AppLayout';
import DocumentForm from './Partials/DocumentForm';
import { Head, useForm } from '@inertiajs/react';
import { useTrans } from '@/i18n';

export default function Create({ projects, categories }) {
    const { t } = useTrans();
    const form = useForm({
        code: '',
        title: '',
        category: 'plan',
        version: '1.0',
        file: null,
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
        form.post('/documents', { forceFormData: true });
    };

    return (
        <AppLayout header="Nouveau document">
            <Head title={t('Nouveau document')} />
            <div className="mx-auto max-w-4xl">
                <DocumentForm
                    form={form}
                    projects={projects}
                    categories={categories}
                    onSubmit={submit}
                    submitLabel={t('Enregistrer le document')}
                />
            </div>
        </AppLayout>
    );
}
