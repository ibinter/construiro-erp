import AppLayout from '@/Layouts/AppLayout';
import TenderForm from './Partials/TenderForm';
import { Head, useForm } from '@inertiajs/react';
import { useTrans } from '@/i18n';

export default function Create({ types, statuses, projects }) {
    const { t } = useTrans();
    const form = useForm({
        code: '',
        title: '',
        client_name: '',
        project_id: '',
        type: 'public',
        estimated_amount: 0,
        currency: 'XOF',
        status: 'identifie',
        submission_deadline: '',
        submitted_at: '',
        notes: '',
    });

    const submit = (e) => {
        e.preventDefault();
        form.post('/tenders');
    };

    return (
        <AppLayout header="Nouvel appel d'offres">
            <Head title={t("Nouvel appel d'offres")} />
            <div className="mx-auto max-w-4xl">
                <TenderForm
                    form={form}
                    types={types}
                    statuses={statuses}
                    projects={projects}
                    onSubmit={submit}
                    submitLabel={t("Créer l'appel d'offres")}
                />
            </div>
        </AppLayout>
    );
}
