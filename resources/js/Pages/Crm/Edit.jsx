import AppLayout from '@/Layouts/AppLayout';
import OpportunityForm from './Partials/OpportunityForm';
import { Head, useForm } from '@inertiajs/react';

export default function Edit({ opportunity, stages, clients, users }) {
    const form = useForm({
        code: opportunity.code ?? '',
        title: opportunity.title ?? '',
        client_id: opportunity.client_id ?? '',
        client_name: opportunity.client_name ?? '',
        assignee_id: opportunity.assignee_id ?? '',
        estimated_amount: opportunity.estimated_amount ?? 0,
        currency: opportunity.currency ?? 'XOF',
        stage: opportunity.stage ?? 'prospect',
        probability: opportunity.probability ?? 0,
        expected_close_date: opportunity.expected_close_date ?? '',
        source: opportunity.source ?? '',
        notes: opportunity.notes ?? '',
    });

    const submit = (e) => {
        e.preventDefault();
        form.put(`/crm/${opportunity.id}`);
    };

    return (
        <AppLayout header={`Modifier — ${opportunity.title}`}>
            <Head title={`Modifier ${opportunity.title}`} />
            <div className="mx-auto max-w-4xl">
                <OpportunityForm
                    form={form}
                    stages={stages}
                    clients={clients}
                    users={users}
                    onSubmit={submit}
                    submitLabel="Enregistrer"
                />
            </div>
        </AppLayout>
    );
}
