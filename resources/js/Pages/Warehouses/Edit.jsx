import AppLayout from '@/Layouts/AppLayout';
import WarehouseForm from './Partials/WarehouseForm';
import { Head, useForm } from '@inertiajs/react';

export default function Edit({ warehouse }) {
    const form = useForm({
        code: warehouse.code ?? '',
        name: warehouse.name ?? '',
        city: warehouse.city ?? '',
        address: warehouse.address ?? '',
        manager_name: warehouse.manager_name ?? '',
        is_active: warehouse.is_active ?? true,
    });

    const submit = (e) => {
        e.preventDefault();
        form.put(`/warehouses/${warehouse.id}`);
    };

    return (
        <AppLayout header={`Modifier — ${warehouse.name}`}>
            <Head title={`Modifier ${warehouse.name}`} />
            <div className="mx-auto max-w-4xl">
                <WarehouseForm form={form} onSubmit={submit} submitLabel="Enregistrer" />
            </div>
        </AppLayout>
    );
}
