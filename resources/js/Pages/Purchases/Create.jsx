import AppLayout from '@/Layouts/AppLayout';
import PurchaseForm from './Partials/PurchaseForm';
import { Head, useForm } from '@inertiajs/react';
import { useTrans } from '@/i18n';

export default function Create({ suppliers, materials, projects, statuses }) {
    const { t } = useTrans();
    const form = useForm({
        code: '',
        supplier_id: '',
        project_id: '',
        status: 'draft',
        currency: 'XOF',
        tax_rate: 18,
        order_date: '',
        expected_date: '',
        notes: '',
        lines: [
            { material_id: '', designation: '', unit: 'u', quantity: 1, unit_price: 0 },
        ],
    });

    const submit = (e) => {
        e.preventDefault();
        form.post('/purchases');
    };

    return (
        <AppLayout header="Nouveau bon de commande">
            <Head title={t('Nouveau bon de commande')} />
            <div className="mx-auto max-w-5xl">
                <PurchaseForm
                    form={form}
                    suppliers={suppliers}
                    materials={materials}
                    projects={projects}
                    statuses={statuses}
                    onSubmit={submit}
                    submitLabel={t('Créer le bon de commande')}
                />
            </div>
        </AppLayout>
    );
}
