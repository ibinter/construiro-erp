import AppLayout from '@/Layouts/AppLayout';
import TakeoffForm from './Partials/TakeoffForm';
import { Head, useForm } from '@inertiajs/react';

export default function Edit({ takeoff, projects, statuses }) {
    const form = useForm({
        code: takeoff.code ?? '',
        title: takeoff.title ?? '',
        project_id: takeoff.project_id ?? '',
        status: takeoff.status ?? 'draft',
        notes: takeoff.notes ?? '',
        lines: (takeoff.lines ?? []).map((l) => ({
            designation: l.designation ?? '',
            unit: l.unit ?? 'u',
            length: l.length ?? '',
            width: l.width ?? '',
            height: l.height ?? '',
            count: l.count ?? 1,
            quantity: l.quantity ?? 0,
            notes: l.notes ?? '',
        })),
    });

    const submit = (e) => {
        e.preventDefault();
        form.put(`/takeoff/${takeoff.id}`);
    };

    return (
        <AppLayout header={`Modifier — ${takeoff.title}`}>
            <Head title={`Modifier ${takeoff.title}`} />
            <div className="mx-auto max-w-5xl">
                <TakeoffForm
                    form={form}
                    projects={projects}
                    statuses={statuses}
                    onSubmit={submit}
                    submitLabel="Enregistrer"
                />
            </div>
        </AppLayout>
    );
}
