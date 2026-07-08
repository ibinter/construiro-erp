import AppLayout from '@/Layouts/AppLayout';
import SubcontractorForm from './Partials/SubcontractorForm';
import { Head, useForm } from '@inertiajs/react';

export default function Edit({ subcontractor, specialties }) {
    const form = useForm({
        code: subcontractor.code ?? '',
        name: subcontractor.name ?? '',
        specialty: subcontractor.specialty ?? 'gros_oeuvre',
        contact_name: subcontractor.contact_name ?? '',
        phone: subcontractor.phone ?? '',
        email: subcontractor.email ?? '',
        tax_id: subcontractor.tax_id ?? '',
        rating: subcontractor.rating ?? '',
        address: subcontractor.address ?? '',
        city: subcontractor.city ?? '',
        notes: subcontractor.notes ?? '',
        is_active: subcontractor.is_active ?? true,
    });

    const submit = (e) => {
        e.preventDefault();
        form.put(`/subcontractors/${subcontractor.id}`);
    };

    return (
        <AppLayout header={`Modifier — ${subcontractor.name}`}>
            <Head title={`Modifier ${subcontractor.name}`} />
            <div className="mx-auto max-w-4xl">
                <SubcontractorForm
                    form={form}
                    specialties={specialties}
                    onSubmit={submit}
                    submitLabel="Enregistrer"
                />
            </div>
        </AppLayout>
    );
}
