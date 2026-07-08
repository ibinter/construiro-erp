import AppLayout from '@/Layouts/AppLayout';
import PaymentForm from './Partials/PaymentForm';
import { Head, useForm } from '@inertiajs/react';

export default function Create({ suppliers, purchaseOrders, projects, categories, methods }) {
    const form = useForm({
        code: '',
        supplier_id: '',
        purchase_order_id: '',
        project_id: '',
        payee_name: '',
        amount: '',
        currency: 'XOF',
        category: 'fournisseur',
        method: 'virement',
        date: new Date().toISOString().slice(0, 10),
        reference: '',
        notes: '',
    });

    const submit = (e) => {
        e.preventDefault();
        form.post('/outgoing-payments');
    };

    return (
        <AppLayout header="Nouveau décaissement">
            <Head title="Nouveau décaissement" />
            <div className="mx-auto max-w-4xl">
                <PaymentForm
                    form={form}
                    suppliers={suppliers}
                    purchaseOrders={purchaseOrders}
                    projects={projects}
                    categories={categories}
                    methods={methods}
                    onSubmit={submit}
                    submitLabel="Enregistrer le décaissement"
                />
            </div>
        </AppLayout>
    );
}
