import AppLayout from '@/Layouts/AppLayout';
import ContractForm from './Partials/ContractForm';
import { Head, useForm } from '@inertiajs/react';
import { useTrans } from '@/i18n';

export default function Edit({ contract, projects, types, statuses }) {
    const { t } = useTrans();
    const form = useForm({
        code: contract.code ?? '',
        title: contract.title ?? '',
        type: contract.type ?? 'client',
        party_name: contract.party_name ?? '',
        amount: contract.amount ?? 0,
        currency: contract.currency ?? 'XOF',
        status: contract.status ?? 'draft',
        start_date: contract.start_date ?? '',
        end_date: contract.end_date ?? '',
        signed_date: contract.signed_date ?? '',
        notes: contract.notes ?? '',
        project_id: contract.project_id ?? '',
    });

    const submit = (e) => {
        e.preventDefault();
        form.put(`/contracts/${contract.id}`);
    };

    return (
        <AppLayout header={`Modifier — ${contract.title}`}>
            <Head title={`${t('Modifier')} ${contract.title}`} />
            <div className="mx-auto max-w-4xl">
                <ContractForm
                    form={form}
                    projects={projects}
                    types={types}
                    statuses={statuses}
                    onSubmit={submit}
                    submitLabel={t('Enregistrer')}
                />
            </div>
        </AppLayout>
    );
}
