import AppLayout from '@/Layouts/AppLayout';
import BoqForm from './Partials/BoqForm';
import { Head, useForm } from '@inertiajs/react';
import { useTrans } from '@/i18n';

export default function Edit({ boq, clients, projects, statuses, unitPrices }) {
    const { t } = useTrans();
    const form = useForm({
        code: boq.code ?? '',
        title: boq.title ?? '',
        client_id: boq.client_id ?? '',
        project_id: boq.project_id ?? '',
        status: boq.status ?? 'draft',
        currency: boq.currency ?? 'XOF',
        notes: boq.notes ?? '',
        lines: (boq.lines ?? []).map((l) => ({
            designation: l.designation ?? '',
            unit: l.unit ?? 'u',
            quantity: l.quantity ?? 1,
            unit_price: l.unit_price ?? 0,
        })),
    });

    const submit = (e) => {
        e.preventDefault();
        form.put(`/boq/${boq.id}`);
    };

    return (
        <AppLayout header={`Modifier — ${boq.title}`}>
            <Head title={`${t('Modifier')} ${boq.title}`} />
            <div className="mx-auto max-w-5xl">
                <BoqForm
                    form={form}
                    clients={clients}
                    projects={projects}
                    statuses={statuses}
                    unitPrices={unitPrices}
                    onSubmit={submit}
                    submitLabel={t('Enregistrer')}
                />
            </div>
        </AppLayout>
    );
}
