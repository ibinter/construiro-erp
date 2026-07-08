import AppLayout from '@/Layouts/AppLayout';
import OpportunityForm from './Partials/OpportunityForm';
import { Head, useForm } from '@inertiajs/react';

export default function Create({ stages, clients, users }) {
    const form = useForm({
        code: '',
        title: '',
        client_id: '',
        client_name: '',
        assignee_id: '',
        estimated_amount: 0,
        currency: 'XOF',
        stage: 'prospect',
        probability: 0,
        expected_close_date: '',
        source: '',
        notes: '',
    });

    const submit = (e) => {
        e.preventDefault();
        form.post('/crm');
    };

    return (
        <AppLayout header="Nouvelle opportunité">
            <Head title="Nouvelle opportunité" />
            <div className="mx-auto max-w-4xl">
                <OpportunityForm
                    form={form}
                    stages={stages}
                    clients={clients}
                    users={users}
                    onSubmit={submit}
                    submitLabel="Créer l'opportunité"
                />
            </div>
        </AppLayout>
    );
}
