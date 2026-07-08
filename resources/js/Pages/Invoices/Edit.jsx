import AppLayout from '@/Layouts/AppLayout';
import InvoiceForm from './Partials/InvoiceForm';
import { Head, useForm } from '@inertiajs/react';

export default function Edit({ invoice, clients, projects, statuses }) {
    const fmtDate = (d) => (d ? String(d).slice(0, 10) : '');

    const form = useForm({
        code: invoice.code ?? '',
        client_id: invoice.client_id ?? '',
        project_id: invoice.project_id ?? '',
        status: invoice.status ?? 'draft',
        currency: invoice.currency ?? 'XOF',
        tax_rate: invoice.tax_rate ?? 18,
        issue_date: fmtDate(invoice.issue_date),
        due_date: fmtDate(invoice.due_date),
        notes: invoice.notes ?? '',
        lines: (invoice.lines ?? []).map((l) => ({
            designation: l.designation ?? '',
            unit: l.unit ?? 'u',
            quantity: l.quantity ?? 1,
            unit_price: l.unit_price ?? 0,
        })),
    });

    const submit = (e) => {
        e.preventDefault();
        form.put(`/invoices/${invoice.id}`);
    };

    return (
        <AppLayout header="Modifier la facture">
            <Head title={`Modifier ${invoice.code}`} />
            <div className="mx-auto max-w-5xl">
                <InvoiceForm
                    form={form}
                    clients={clients}
                    projects={projects}
                    statuses={statuses}
                    onSubmit={submit}
                    submitLabel="Enregistrer les modifications"
                />
            </div>
        </AppLayout>
    );
}
