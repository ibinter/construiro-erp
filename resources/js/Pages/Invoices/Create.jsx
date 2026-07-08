import AppLayout from '@/Layouts/AppLayout';
import InvoiceForm from './Partials/InvoiceForm';
import { Head, useForm } from '@inertiajs/react';

export default function Create({ clients, projects, statuses }) {
    const form = useForm({
        code: '',
        client_id: '',
        project_id: '',
        status: 'draft',
        currency: 'XOF',
        tax_rate: 18,
        issue_date: '',
        due_date: '',
        notes: '',
        lines: [
            { designation: '', unit: 'u', quantity: 1, unit_price: 0 },
        ],
    });

    const submit = (e) => {
        e.preventDefault();
        form.post('/invoices');
    };

    return (
        <AppLayout header="Nouvelle facture">
            <Head title="Nouvelle facture" />
            <div className="mx-auto max-w-5xl">
                <InvoiceForm
                    form={form}
                    clients={clients}
                    projects={projects}
                    statuses={statuses}
                    onSubmit={submit}
                    submitLabel="Créer la facture"
                />
            </div>
        </AppLayout>
    );
}
