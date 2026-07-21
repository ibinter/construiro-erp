import AppLayout from '@/Layouts/AppLayout';
import QuoteForm from './Partials/QuoteForm';
import { Head, useForm } from '@inertiajs/react';
import { useTrans } from '@/i18n';

export default function Edit({ quote, clients, projects, statuses }) {
    const { t } = useTrans();

    /** Normalise une date ISO en "YYYY-MM-DD" pour l'input[type=date]. */
    const fmtDate = (d) => (d ? String(d).slice(0, 10) : '');

    const form = useForm({
        code:        quote.code        ?? '',
        title:       quote.title       ?? '',
        client_id:   quote.client_id   ?? '',
        client_name: '',
        project_id:  quote.project_id  ?? '',
        status:      quote.status      ?? 'draft',
        currency:    quote.currency    ?? 'XOF',
        tax_rate:    quote.tax_rate    ?? 18,
        date:        fmtDate(quote.date),
        valid_until: fmtDate(quote.valid_until),
        notes:       quote.notes       ?? '',
        lines: (quote.lines ?? []).map((l) => ({
            designation: l.designation ?? '',
            unit:        l.unit        ?? 'u',
            quantity:    l.quantity    ?? 1,
            unit_price:  l.unit_price  ?? 0,
        })),
    });

    /** Enregistre avec le statut cible. */
    const submitWithStatus = (targetStatus) => (e) => {
        if (e && e.preventDefault) e.preventDefault();
        form.transform((data) => ({ ...data, status: targetStatus }))
            .put(`/quotes/${quote.id}`);
    };

    return (
        <AppLayout header={t('Modifier le devis')}>
            <Head title={`${t('Modifier')} — ${quote.code}`} />
            <div className="mx-auto max-w-5xl">
                <QuoteForm
                    form={form}
                    clients={clients}
                    projects={projects}
                    statuses={statuses}
                    onSubmit={submitWithStatus(quote.status ?? 'draft')}
                    onSubmitSend={submitWithStatus('sent')}
                    submitLabel={t('Enregistrer les modifications')}
                />
            </div>
        </AppLayout>
    );
}
