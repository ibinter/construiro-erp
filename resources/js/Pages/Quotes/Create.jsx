import AppLayout from '@/Layouts/AppLayout';
import QuoteForm from './Partials/QuoteForm';
import { Head, useForm } from '@inertiajs/react';
import { useTrans } from '@/i18n';

export default function Create({ clients, projects, statuses }) {
    const { t } = useTrans();

    const form = useForm({
        code:        '',
        title:       '',
        client_id:   '',
        client_name: '',
        project_id:  '',
        status:      'draft',
        currency:    'XOF',
        tax_rate:    18,
        date:        '',
        valid_until: '',
        notes:       '',
        lines: [
            { designation: '', unit: 'u', quantity: 1, unit_price: 0 },
        ],
    });

    /** Enregistre avec le statut choisi. */
    const submitWithStatus = (targetStatus) => (e) => {
        if (e && e.preventDefault) e.preventDefault();
        form.transform((data) => ({ ...data, status: targetStatus })).post('/quotes');
    };

    return (
        <AppLayout header={t('Nouveau devis')}>
            <Head title={t('Nouveau devis')} />
            <div className="mx-auto max-w-5xl">
                <QuoteForm
                    form={form}
                    clients={clients}
                    projects={projects}
                    statuses={statuses}
                    onSubmit={submitWithStatus('draft')}
                    onSubmitSend={submitWithStatus('sent')}
                    submitLabel={t('Enregistrer brouillon')}
                />
            </div>
        </AppLayout>
    );
}
