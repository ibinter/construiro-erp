import AppLayout from '@/Layouts/AppLayout';
import ClientForm from './Partials/ClientForm';
import { Head, useForm } from '@inertiajs/react';

export default function Edit({ client, types }) {
    const form = useForm({
        code: client.code ?? '',
        type: client.type ?? 'entreprise',
        name: client.name ?? '',
        contact_name: client.contact_name ?? '',
        phone: client.phone ?? '',
        email: client.email ?? '',
        tax_id: client.tax_id ?? '',
        address: client.address ?? '',
        city: client.city ?? '',
        notes: client.notes ?? '',
        is_active: client.is_active ?? true,
    });

    const submit = (e) => {
        e.preventDefault();
        form.put(`/clients/${client.id}`);
    };

    return (
        <AppLayout header={`Modifier — ${client.name}`}>
            <Head title={`Modifier ${client.name}`} />
            <div className="mx-auto max-w-4xl">
                <ClientForm
                    form={form}
                    types={types}
                    onSubmit={submit}
                    submitLabel="Enregistrer"
                />
            </div>
        </AppLayout>
    );
}
