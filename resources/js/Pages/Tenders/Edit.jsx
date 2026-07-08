import AppLayout from '@/Layouts/AppLayout';
import TenderForm from './Partials/TenderForm';
import { Head, useForm } from '@inertiajs/react';

export default function Edit({ tender, types, statuses, projects }) {
    const form = useForm({
        code: tender.code ?? '',
        title: tender.title ?? '',
        client_name: tender.client_name ?? '',
        project_id: tender.project_id ?? '',
        type: tender.type ?? 'public',
        estimated_amount: tender.estimated_amount ?? 0,
        currency: tender.currency ?? 'XOF',
        status: tender.status ?? 'identifie',
        submission_deadline: tender.submission_deadline ?? '',
        submitted_at: tender.submitted_at ?? '',
        notes: tender.notes ?? '',
    });

    const submit = (e) => {
        e.preventDefault();
        form.put(`/tenders/${tender.id}`);
    };

    return (
        <AppLayout header={`Modifier — ${tender.title}`}>
            <Head title={`Modifier ${tender.title}`} />
            <div className="mx-auto max-w-4xl">
                <TenderForm
                    form={form}
                    types={types}
                    statuses={statuses}
                    projects={projects}
                    onSubmit={submit}
                    submitLabel="Enregistrer"
                />
            </div>
        </AppLayout>
    );
}
