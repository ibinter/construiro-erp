import AppLayout from '@/Layouts/AppLayout';
import SupplierForm from './Partials/SupplierForm';
import { Head, useForm } from '@inertiajs/react';
import { useTrans } from '@/i18n';

export default function Edit({ supplier, categories }) {
    const { t } = useTrans();
    const form = useForm({
        code: supplier.code ?? '',
        category: supplier.category ?? 'materiaux',
        name: supplier.name ?? '',
        contact_name: supplier.contact_name ?? '',
        phone: supplier.phone ?? '',
        email: supplier.email ?? '',
        tax_id: supplier.tax_id ?? '',
        payment_terms: supplier.payment_terms ?? '',
        address: supplier.address ?? '',
        city: supplier.city ?? '',
        notes: supplier.notes ?? '',
        is_active: supplier.is_active ?? true,
    });

    const submit = (e) => {
        e.preventDefault();
        form.put(`/suppliers/${supplier.id}`);
    };

    return (
        <AppLayout header={`Modifier — ${supplier.name}`}>
            <Head title={`${t('Modifier')} ${supplier.name}`} />
            <div className="mx-auto max-w-4xl">
                <SupplierForm
                    form={form}
                    categories={categories}
                    onSubmit={submit}
                    submitLabel={t('Enregistrer')}
                />
            </div>
        </AppLayout>
    );
}
