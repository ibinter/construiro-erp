import AppLayout from '@/Layouts/AppLayout';
import SubcontractorForm from './Partials/SubcontractorForm';
import { Head, useForm } from '@inertiajs/react';

export default function Create({ specialties }) {
    const form = useForm({
        code: '',
        name: '',
        specialty: 'gros_oeuvre',
        contact_name: '',
        phone: '',
        email: '',
        tax_id: '',
        rating: '',
        address: '',
        city: '',
        notes: '',
        is_active: true,
    });

    const submit = (e) => {
        e.preventDefault();
        form.post('/subcontractors');
    };

    return (
        <AppLayout header="Nouveau sous-traitant">
            <Head title="Nouveau sous-traitant" />
            <div className="mx-auto max-w-4xl">
                <SubcontractorForm
                    form={form}
                    specialties={specialties}
                    onSubmit={submit}
                    submitLabel="Créer le sous-traitant"
                />
            </div>
        </AppLayout>
    );
}
