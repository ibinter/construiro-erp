import AppLayout from '@/Layouts/AppLayout';
import MaterialForm from './Partials/MaterialForm';
import { Head, useForm } from '@inertiajs/react';

export default function Edit({ material, categories, units }) {
    const form = useForm({
        code: material.code ?? '',
        name: material.name ?? '',
        category: material.category ?? 'gros_oeuvre',
        unit: material.unit ?? 'u',
        unit_price: material.unit_price ?? 0,
        min_stock: material.min_stock ?? 0,
        description: material.description ?? '',
        is_active: material.is_active ?? true,
    });

    const submit = (e) => {
        e.preventDefault();
        form.put(`/materials/${material.id}`);
    };

    return (
        <AppLayout header={`Modifier — ${material.name}`}>
            <Head title={`Modifier ${material.name}`} />
            <div className="mx-auto max-w-4xl">
                <MaterialForm
                    form={form}
                    categories={categories}
                    units={units}
                    onSubmit={submit}
                    submitLabel="Enregistrer"
                />
            </div>
        </AppLayout>
    );
}
