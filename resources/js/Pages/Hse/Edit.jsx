import AppLayout from '@/Layouts/AppLayout';
import IncidentForm from './Partials/IncidentForm';
import { Head, useForm } from '@inertiajs/react';
import { useTrans } from '@/i18n';

export default function Edit({ incident, projects, sites, types, severities, statuses }) {
    const { t } = useTrans();
    const form = useForm({
        code: incident.code ?? '',
        title: incident.title ?? '',
        type: incident.type ?? 'accident',
        severity: incident.severity ?? 'mineur',
        status: incident.status ?? 'ouvert',
        description: incident.description ?? '',
        incident_date: incident.incident_date ?? '',
        location: incident.location ?? '',
        corrective_action: incident.corrective_action ?? '',
        reported_by: incident.reported_by ?? '',
        project_id: incident.project_id ?? '',
        site_id: incident.site_id ?? '',
    });

    const submit = (e) => {
        e.preventDefault();
        form.put(`/hse/${incident.id}`);
    };

    return (
        <AppLayout header={`Modifier — ${incident.title}`}>
            <Head title={`Modifier ${incident.title}`} />
            <div className="mx-auto max-w-4xl">
                <IncidentForm
                    form={form}
                    projects={projects}
                    sites={sites}
                    types={types}
                    severities={severities}
                    statuses={statuses}
                    onSubmit={submit}
                    submitLabel={t('Enregistrer')}
                />
            </div>
        </AppLayout>
    );
}
