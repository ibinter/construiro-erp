import AppLayout from '@/Layouts/AppLayout';
import SubcontractorForm from './Partials/SubcontractorForm';
import { Head, useForm } from '@inertiajs/react';
import { useTrans } from '@/i18n';

export default function Create({ specialties }) {
    const { t } = useTrans();
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
            <Head title={t('Nouveau sous-traitant')} />
            <div className="mx-auto max-w-4xl">
                <SubcontractorForm
                    form={form}
                    specialties={specialties}
                    onSubmit={submit}
                    submitLabel={t('Créer le sous-traitant')}
                />
            </div>
        </AppLayout>
    );
}
