import AppLayout from '@/Layouts/AppLayout';
import LabTestForm from './Partials/LabTestForm';
import { Head, useForm } from '@inertiajs/react';

export default function Edit({ test, projects, sites, sampleTypes, results }) {
    const form = useForm({
        code: test.code ?? '',
        sample_type: test.sample_type ?? 'beton',
        test_name: test.test_name ?? '',
        result: test.result ?? 'en_attente',
        sample_date: test.sample_date ?? '',
        test_date: test.test_date ?? '',
        result_value: test.result_value ?? '',
        unit: test.unit ?? '',
        threshold: test.threshold ?? '',
        technician: test.technician ?? '',
        observations: test.observations ?? '',
        project_id: test.project_id ?? '',
        site_id: test.site_id ?? '',
    });

    const submit = (e) => {
        e.preventDefault();
        form.put(`/laboratory/${test.id}`);
    };

    return (
        <AppLayout header={`Modifier — ${test.test_name}`}>
            <Head title={`Modifier ${test.test_name}`} />
            <div className="mx-auto max-w-4xl">
                <LabTestForm
                    form={form}
                    projects={projects}
                    sites={sites}
                    sampleTypes={sampleTypes}
                    results={results}
                    onSubmit={submit}
                    submitLabel="Enregistrer"
                />
            </div>
        </AppLayout>
    );
}
