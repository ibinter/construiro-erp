import AppLayout from '@/Layouts/AppLayout';
import IncidentForm from './Partials/IncidentForm';
import { Head, useForm } from '@inertiajs/react';
import { useTrans } from '@/i18n';

export default function Create({ projects, sites, types, severities, statuses }) {
    const { t } = useTrans();
    const form = useForm({
        code: '',
        title: '',
        type: 'accident',
        severity: 'mineur',
        status: 'ouvert',
        description: '',
        incident_date: '',
        location: '',
        corrective_action: '',
        reported_by: '',
        project_id: '',
        site_id: '',
    });

    const submit = (e) => {
        e.preventDefault();
        form.post('/hse');
    };

    return (
        <AppLayout header="Déclarer un incident QHSE">
            <Head title={t('Nouvel incident QHSE')} />
            <div className="mx-auto max-w-4xl">
                <IncidentForm
                    form={form}
                    projects={projects}
                    sites={sites}
                    types={types}
                    severities={severities}
                    statuses={statuses}
                    onSubmit={submit}
                    submitLabel={t("Déclarer l'incident")}
                />
            </div>
        </AppLayout>
    );
}
