import AppLayout from '@/Layouts/AppLayout';
import QualityForm from './Partials/QualityForm';
import { Head, useForm } from '@inertiajs/react';
import { useTrans } from '@/i18n';

export default function Edit({ control, projects, sites, controlTypes, results }) {
    const { t } = useTrans();
    const form = useForm({
        code: control.code ?? '',
        title: control.title ?? '',
        control_type: control.control_type ?? 'reception',
        result: control.result ?? 'en_attente',
        description: control.description ?? '',
        control_date: control.control_date ?? '',
        inspector: control.inspector ?? '',
        observations: control.observations ?? '',
        project_id: control.project_id ?? '',
        site_id: control.site_id ?? '',
    });

    const submit = (e) => {
        e.preventDefault();
        form.put(`/quality/${control.id}`);
    };

    return (
        <AppLayout header={`Modifier — ${control.title}`}>
            <Head title={`Modifier ${control.title}`} />
            <div className="mx-auto max-w-4xl">
                <QualityForm
                    form={form}
                    projects={projects}
                    sites={sites}
                    controlTypes={controlTypes}
                    results={results}
                    onSubmit={submit}
                    submitLabel={t('Enregistrer')}
                />
            </div>
        </AppLayout>
    );
}
