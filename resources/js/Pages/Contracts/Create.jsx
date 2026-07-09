import AppLayout from '@/Layouts/AppLayout';
import ContractForm from './Partials/ContractForm';
import { Head, useForm } from '@inertiajs/react';
import { useTrans } from '@/i18n';

export default function Create({ projects, types, statuses }) {
    const { t } = useTrans();
    const form = useForm({
        code: '',
        title: '',
        type: 'client',
        party_name: '',
        amount: 0,
        currency: 'XOF',
        status: 'draft',
        start_date: '',
        end_date: '',
        signed_date: '',
        notes: '',
        project_id: '',
    });

    const submit = (e) => {
        e.preventDefault();
        form.post('/contracts');
    };

    return (
        <AppLayout header="Nouveau contrat">
            <Head title={t('Nouveau contrat')} />
            <div className="mx-auto max-w-4xl">
                <ContractForm
                    form={form}
                    projects={projects}
                    types={types}
                    statuses={statuses}
                    onSubmit={submit}
                    submitLabel={t('Créer le contrat')}
                />
            </div>
        </AppLayout>
    );
}
