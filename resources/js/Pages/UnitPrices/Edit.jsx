import AppLayout from '@/Layouts/AppLayout';
import UnitPriceForm from './Partials/UnitPriceForm';
import { Head, useForm } from '@inertiajs/react';

export default function Edit({ unitPrice, units, categories }) {
    const form = useForm({
        code: unitPrice.code ?? '',
        designation: unitPrice.designation ?? '',
        category: unitPrice.category ?? 'gros_oeuvre',
        unit: unitPrice.unit ?? 'u',
        unit_price: unitPrice.unit_price ?? 0,
        currency: unitPrice.currency ?? 'XOF',
        is_active: unitPrice.is_active ?? true,
    });

    const submit = (e) => {
        e.preventDefault();
        form.put(`/unit-prices/${unitPrice.id}`);
    };

    return (
        <AppLayout header={`Modifier — ${unitPrice.designation}`}>
            <Head title={`Modifier ${unitPrice.designation}`} />
            <div className="mx-auto max-w-4xl">
                <UnitPriceForm
                    form={form}
                    units={units}
                    categories={categories}
                    onSubmit={submit}
                    submitLabel="Enregistrer"
                />
            </div>
        </AppLayout>
    );
}
