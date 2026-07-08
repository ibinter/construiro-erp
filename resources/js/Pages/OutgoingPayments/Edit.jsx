import AppLayout from '@/Layouts/AppLayout';
import PaymentForm from './Partials/PaymentForm';
import { Head, useForm } from '@inertiajs/react';

export default function Edit({ payment, suppliers, purchaseOrders, projects, categories, methods }) {
    const fmtDate = (d) => (d ? String(d).slice(0, 10) : '');

    const form = useForm({
        code: payment.code ?? '',
        supplier_id: payment.supplier_id ?? '',
        purchase_order_id: payment.purchase_order_id ?? '',
        project_id: payment.project_id ?? '',
        payee_name: payment.payee_name ?? '',
        amount: payment.amount ?? '',
        currency: payment.currency ?? 'XOF',
        category: payment.category ?? 'fournisseur',
        method: payment.method ?? 'virement',
        date: fmtDate(payment.date),
        reference: payment.reference ?? '',
        notes: payment.notes ?? '',
    });

    const submit = (e) => {
        e.preventDefault();
        form.put(`/outgoing-payments/${payment.id}`);
    };

    return (
        <AppLayout header="Modifier le décaissement">
            <Head title={`Modifier ${payment.code}`} />
            <div className="mx-auto max-w-4xl">
                <PaymentForm
                    form={form}
                    suppliers={suppliers}
                    purchaseOrders={purchaseOrders}
                    projects={projects}
                    categories={categories}
                    methods={methods}
                    onSubmit={submit}
                    submitLabel="Enregistrer les modifications"
                />
            </div>
        </AppLayout>
    );
}
