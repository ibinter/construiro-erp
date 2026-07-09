import AppLayout from '@/Layouts/AppLayout';
import LabTestForm from './Partials/LabTestForm';
import { Head, useForm } from '@inertiajs/react';
import { useTrans } from '@/i18n';

export default function Create({ projects, sites, sampleTypes, results }) {
    const { t } = useTrans();
    const form = useForm({
        code: '',
        sample_type: 'beton',
        test_name: '',
        result: 'en_attente',
        sample_date: '',
        test_date: '',
        result_value: '',
        unit: '',
        threshold: '',
        technician: '',
        observations: '',
        project_id: '',
        site_id: '',
    });

    const submit = (e) => {
        e.preventDefault();
        form.post('/laboratory');
    };

    return (
        <AppLayout header="Nouvel essai">
            <Head title={t('Nouvel essai')} />
            <div className="mx-auto max-w-4xl">
                <LabTestForm
                    form={form}
                    projects={projects}
                    sites={sites}
                    sampleTypes={sampleTypes}
                    results={results}
                    onSubmit={submit}
                    submitLabel={t("Créer l'essai")}
                />
            </div>
        </AppLayout>
    );
}
