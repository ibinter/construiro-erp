import AppLayout from '@/Layouts/AppLayout';
import MaterialForm from './Partials/MaterialForm';
import { Head, useForm } from '@inertiajs/react';

export default function Create({ categories, units }) {
    const form = useForm({
        code: '',
        name: '',
        category: 'gros_oeuvre',
        unit: 'u',
        unit_price: 0,
        min_stock: 0,
        description: '',
        is_active: true,
    });

    const submit = (e) => {
        e.preventDefault();
        form.post('/materials');
    };

    return (
        <AppLayout header="Nouveau matériau">
            <Head title="Nouveau matériau" />
            <div className="mx-auto max-w-4xl">
                <MaterialForm
                    form={form}
                    categories={categories}
                    units={units}
                    onSubmit={submit}
                    submitLabel="Créer le matériau"
                />
            </div>
        </AppLayout>
    );
}
