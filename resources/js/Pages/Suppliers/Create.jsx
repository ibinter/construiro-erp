import AppLayout from '@/Layouts/AppLayout';
import SupplierForm from './Partials/SupplierForm';
import { Head, useForm } from '@inertiajs/react';

export default function Create({ categories }) {
    const form = useForm({
        code: '',
        category: 'materiaux',
        name: '',
        contact_name: '',
        phone: '',
        email: '',
        tax_id: '',
        payment_terms: '',
        address: '',
        city: '',
        notes: '',
        is_active: true,
    });

    const submit = (e) => {
        e.preventDefault();
        form.post('/suppliers');
    };

    return (
        <AppLayout header="Nouveau fournisseur">
            <Head title="Nouveau fournisseur" />
            <div className="mx-auto max-w-4xl">
                <SupplierForm
                    form={form}
                    categories={categories}
                    onSubmit={submit}
                    submitLabel="Créer le fournisseur"
                />
            </div>
        </AppLayout>
    );
}
