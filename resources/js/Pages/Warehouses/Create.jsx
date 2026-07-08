import AppLayout from '@/Layouts/AppLayout';
import WarehouseForm from './Partials/WarehouseForm';
import { Head, useForm } from '@inertiajs/react';

export default function Create() {
    const form = useForm({
        code: '',
        name: '',
        city: '',
        address: '',
        manager_name: '',
        is_active: true,
    });

    const submit = (e) => {
        e.preventDefault();
        form.post('/warehouses');
    };

    return (
        <AppLayout header="Nouveau magasin">
            <Head title="Nouveau magasin" />
            <div className="mx-auto max-w-4xl">
                <WarehouseForm form={form} onSubmit={submit} submitLabel="Créer le magasin" />
            </div>
        </AppLayout>
    );
}
