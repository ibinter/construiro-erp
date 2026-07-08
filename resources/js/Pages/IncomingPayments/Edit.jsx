import AppLayout from '@/Layouts/AppLayout';
import PaymentForm from './Partials/PaymentForm';
import { Head, useForm } from '@inertiajs/react';

export default function Edit({ payment, clients, invoices, projects, methods }) {
    const fmtDate = (d) => (d ? String(d).slice(0, 10) : '');

    const form = useForm({
        code: payment.code ?? '',
        client_id: payment.client_id ?? '',
        invoice_id: payment.invoice_id ?? '',
        project_id: payment.project_id ?? '',
        payer_name: payment.payer_name ?? '',
        amount: payment.amount ?? '',
        currency: payment.currency ?? 'XOF',
        method: payment.method ?? 'especes',
        date: fmtDate(payment.date),
        reference: payment.reference ?? '',
        notes: payment.notes ?? '',
    });

    const submit = (e) => {
        e.preventDefault();
        form.put(`/incoming-payments/${payment.id}`);
    };

    return (
        <AppLayout header="Modifier l'encaissement">
            <Head title={`Modifier ${payment.code}`} />
            <div className="mx-auto max-w-4xl">
                <PaymentForm
                    form={form}
                    clients={clients}
                    invoices={invoices}
                    projects={projects}
                    methods={methods}
                    onSubmit={submit}
                    submitLabel="Enregistrer les modifications"
                />
            </div>
        </AppLayout>
    );
}
