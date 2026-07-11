import AppLayout from '@/Layouts/AppLayout';
import QuoteForm from './Partials/QuoteForm';
import { Head, useForm } from '@inertiajs/react';
import { useTrans } from '@/i18n';

export default function Create({ clients, projects, statuses }) {
    const { t } = useTrans();
    const form = useForm({
        code: '',
        title: '',
        client_id: '',
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
            <Head title={t('Nouveau devis')} />
            <div className="mx-auto max-w-5xl">
                <QuoteForm
                    form={form}
                    clients={clients}
                    projects={projects}
                    statuses={statuses}
                    onSubmit={submit}
                    submitLabel={t('Créer le devis')}
                />
            </div>
        </AppLayout>
    );
}
