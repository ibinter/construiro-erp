import AppLayout from '@/Layouts/AppLayout';
import PaymentForm from './Partials/PaymentForm';
import { Head, useForm } from '@inertiajs/react';
import { useTrans } from '@/i18n';

export default function Create({ clients, invoices, projects, methods }) {
    const { t } = useTrans();
    const form = useForm({
        code: '',
        client_id: '',
        invoice_id: '',
        project_id: '',
        payer_name: '',
        amount: '',
        currency: 'XOF',
        method: 'especes',
        date: new Date().toISOString().slice(0, 10),
        reference: '',
        notes: '',
    });

    const submit = (e) => {
        e.preventDefault();
        form.post('/incoming-payments');
    };

    return (
        <AppLayout header="Nouvel encaissement">
            <Head title={t('Nouvel encaissement')} />
            <div className="mx-auto max-w-4xl">
                <PaymentForm
                    form={form}
                    clients={clients}
                    invoices={invoices}
                    projects={projects}
                    methods={methods}
                    onSubmit={submit}
                    submitLabel={t("Enregistrer l'encaissement")}
                />
            </div>
        </AppLayout>
    );
}
