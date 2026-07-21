import AppLayout from '@/Layouts/AppLayout';
import BoqForm from './Partials/BoqForm';
import { Head, useForm } from '@inertiajs/react';
import { useTrans } from '@/i18n';

export default function Create({ clients, projects, statuses, unitPrices }) {
    const { t } = useTrans();

    const form = useForm({
        code:       '',
        title:      '',
        lot:        '',
        client_id:  '',
        project_id: '',
        status:     'draft',
        currency:   'XOF',
        notes:      '',
        lines: [
            { designation: '', unit: 'u', quantity: 1, unit_price: 0 },
        ],
    });

    /** Soumet avec un statut cible (draft ou validated). */
    const submitWithStatus = (targetStatus) => (e) => {
        if (e && e.preventDefault) e.preventDefault();
        form.transform((data) => ({ ...data, status: targetStatus })).post('/boq');
    };

    return (
        <AppLayout header={t('Nouveau DPGF')}>
            <Head title={t('Nouveau DPGF')} />
            <div className="mx-auto max-w-5xl">
                <BoqForm
                    form={form}
                    clients={clients}
                    projects={projects}
                    statuses={statuses}
                    unitPrices={unitPrices}
                    onSubmit={submitWithStatus('draft')}
                    onSubmitValidate={submitWithStatus('validated')}
                    submitLabel={t('Enregistrer brouillon')}
                />
            </div>
        </AppLayout>
    );
}
