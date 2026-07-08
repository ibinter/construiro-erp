import AppLayout from '@/Layouts/AppLayout';
import QuoteForm from './Partials/QuoteForm';
import { Head, useForm } from '@inertiajs/react';

export default function Create({ projects, statuses }) {
    const form = useForm({
        code: '',
        title: '',
        client_name: '',
        project_id: '',
        status: 'draft',
        currency: 'XOF',
        tax_rate: 18,
        date: '',
        valid_until: '',
        notes: '',
        lines: [
            { designation: '', unit: 'u', quantity: 1, unit_price: 0 },
        ],
    });

    const submit = (e) => {
        e.preventDefault();
        form.post('/quotes');
    };

    return (
        <AppLayout header="Nouveau devis">
            <Head title="Nouveau devis" />
            <div className="mx-auto max-w-5xl">
                <QuoteForm
                    form={form}
                    projects={projects}
                    statuses={statuses}
                    onSubmit={submit}
                    submitLabel="Créer le devis"
                />
            </div>
        </AppLayout>
    );
}
