import AppLayout from '@/Layouts/AppLayout';
import StudyForm from './Partials/StudyForm';
import { Head, useForm } from '@inertiajs/react';
import { useTrans } from '@/i18n';

export default function Edit({ study, projects, types, statuses }) {
    const { t } = useTrans();
    const form = useForm({
        code: study.code ?? '',
        title: study.title ?? '',
        type: study.type ?? 'plan',
        status: study.status ?? 'en_cours',
        project_id: study.project_id ?? '',
        author: study.author ?? '',
        notes: study.notes ?? '',
    });

    const submit = (e) => {
        e.preventDefault();
        form.put(`/design-office/${study.id}`);
    };

    return (
        <AppLayout header={`Modifier — ${study.title}`}>
            <Head title={`${t('Modifier')} ${study.title}`} />
            <div className="mx-auto max-w-4xl">
                <StudyForm
                    form={form}
                    projects={projects}
                    types={types}
                    statuses={statuses}
                    onSubmit={submit}
                    submitLabel={t('Enregistrer')}
                />
            </div>
        </AppLayout>
    );
}
