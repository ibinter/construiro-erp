import AppLayout from '@/Layouts/AppLayout';
import UnitPriceForm from './Partials/UnitPriceForm';
import { Head, useForm } from '@inertiajs/react';
import { useTrans } from '@/i18n';

export default function Create({ units, categories }) {
    const { t } = useTrans();
    const form = useForm({
        code: '',
        designation: '',
        category: 'gros_oeuvre',
        unit: 'u',
        unit_price: 0,
        currency: 'XOF',
        is_active: true,
    });

    const submit = (e) => {
        e.preventDefault();
        form.post('/unit-prices');
    };

    return (
        <AppLayout header="Nouveau prix unitaire">
            <Head title={t('Nouveau prix unitaire')} />
            <div className="mx-auto max-w-4xl">
                <UnitPriceForm
                    form={form}
                    units={units}
                    categories={categories}
                    onSubmit={submit}
                    submitLabel={t('Créer le prix')}
                />
            </div>
        </AppLayout>
    );
}
