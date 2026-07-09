import AppLayout from '@/Layouts/AppLayout';
import QuoteForm from './Partials/QuoteForm';
import { Head, useForm } from '@inertiajs/react';
import { useTrans } from '@/i18n';

export default function Edit({ quote, projects, statuses }) {
    const { t } = useTrans();
    const fmtDate = (d) => (d ? String(d).slice(0, 10) : '');

    const form = useForm({
        code: quote.code ?? '',
        title: quote.title ?? '',
        client_name: quote.client_name ?? '',
        project_id: quote.project_id ?? '',
        status: quote.status ?? 'draft',
        currency: quote.currency ?? 'XOF',
        tax_rate: quote.tax_rate ?? 18,
        date: fmtDate(quote.date),
        valid_until: fmtDate(quote.valid_until),
        notes: quote.notes ?? '',
        lines: (quote.lines ?? []).map((l) => ({
            designation: l.designation ?? '',
            unit: l.unit ?? 'u',
            quantity: l.quantity ?? 1,
            unit_price: l.unit_price ?? 0,
        })),
    });

    const submit = (e) => {
        e.preventDefault();
        form.put(`/quotes/${quote.id}`);
    };

    return (
        <AppLayout header="Modifier le devis">
            <Head title={`${t('Modifier')} ${quote.code}`} />
            <div className="mx-auto max-w-5xl">
                <QuoteForm
                    form={form}
                    projects={projects}
                    statuses={statuses}
                    onSubmit={submit}
                    submitLabel={t('Enregistrer les modifications')}
                />
            </div>
        </AppLayout>
    );
}
