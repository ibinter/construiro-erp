import AppLayout from '@/Layouts/AppLayout';
import EquipmentForm from './Partials/EquipmentForm';
import { Head, useForm } from '@inertiajs/react';

export default function Create({ sites, categories, statuses }) {
    const form = useForm({
        code: '',
        name: '',
        category: 'engin',
        status: 'available',
        brand: '',
        model: '',
        registration: '',
        current_site_id: null,
        acquisition_date: '',
        acquisition_value: 0,
        currency: 'XOF',
        notes: '',
        is_active: true,
    });

    const submit = (e) => {
        e.preventDefault();
        form.post('/equipment');
    };

    return (
        <AppLayout header="Nouvel équipement">
            <Head title="Nouvel équipement" />
            <div className="mx-auto max-w-4xl">
                <EquipmentForm
                    form={form}
                    sites={sites}
                    categories={categories}
                    statuses={statuses}
                    onSubmit={submit}
                    submitLabel="Créer l'équipement"
                />
            </div>
        </AppLayout>
    );
}
