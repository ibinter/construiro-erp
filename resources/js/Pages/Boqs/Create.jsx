import AppLayout from '@/Layouts/AppLayout';
import BoqForm from './Partials/BoqForm';
import { Head, useForm } from '@inertiajs/react';
import { useTrans } from '@/i18n';

export default function Create({ projects, statuses, unitPrices }) {
    const { t } = useTrans();
    const form = useForm({
        code: '',
        title: '',
        project_id: '',
        status: 'draft',
        currency: 'XOF',
        notes: '',
        lines: [
            { designation: '', unit: 'u', quantity: 1, unit_price: 0 },
        ],
    });

    const submit = (e) => {
        e.preventDefault();
        form.post('/boq');
    };

    return (
        <AppLayout header="Nouveau DQE">
            <Head title={t('Nouveau DQE')} />
            <div className="mx-auto max-w-5xl">
                <BoqForm
                    form={form}
                    projects={projects}
                    statuses={statuses}
                    unitPrices={unitPrices}
                    onSubmit={submit}
                    submitLabel={t('Créer le DQE')}
                />
            </div>
        </AppLayout>
    );
}
