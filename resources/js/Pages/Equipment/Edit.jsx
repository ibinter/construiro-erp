import AppLayout from '@/Layouts/AppLayout';
import EquipmentForm from './Partials/EquipmentForm';
import { Head, useForm } from '@inertiajs/react';

export default function Edit({ equipment, sites, categories, statuses }) {
    const form = useForm({
        code: equipment.code ?? '',
        name: equipment.name ?? '',
        category: equipment.category ?? 'engin',
        status: equipment.status ?? 'available',
        brand: equipment.brand ?? '',
        model: equipment.model ?? '',
        registration: equipment.registration ?? '',
        current_site_id: equipment.current_site_id ?? null,
        acquisition_date: equipment.acquisition_date ? equipment.acquisition_date.substring(0, 10) : '',
        acquisition_value: equipment.acquisition_value ?? 0,
        currency: equipment.currency ?? 'XOF',
        notes: equipment.notes ?? '',
        is_active: equipment.is_active ?? true,
    });

    const submit = (e) => {
        e.preventDefault();
        form.put(`/equipment/${equipment.id}`);
    };

    return (
        <AppLayout header={`Modifier — ${equipment.name}`}>
            <Head title={`Modifier ${equipment.name}`} />
            <div className="mx-auto max-w-4xl">
                <EquipmentForm
                    form={form}
                    sites={sites}
                    categories={categories}
                    statuses={statuses}
                    onSubmit={submit}
                    submitLabel="Enregistrer"
                />
            </div>
        </AppLayout>
    );
}
