import AppLayout from '@/Layouts/AppLayout';
import ClientForm from './Partials/ClientForm';
import { Head, useForm } from '@inertiajs/react';

export default function Create({ types }) {
    const form = useForm({
        code: '',
        type: 'entreprise',
        name: '',
        contact_name: '',
        phone: '',
        email: '',
        tax_id: '',
        address: '',
        city: '',
        notes: '',
        is_active: true,
    });

    const submit = (e) => {
        e.preventDefault();
        form.post('/clients');
    };

    return (
        <AppLayout header="Nouveau client">
            <Head title="Nouveau client" />
            <div className="mx-auto max-w-4xl">
                <ClientForm
                    form={form}
                    types={types}
                    onSubmit={submit}
                    submitLabel="Créer le client"
                />
            </div>
        </AppLayout>
    );
}
