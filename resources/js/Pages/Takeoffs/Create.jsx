import AppLayout from '@/Layouts/AppLayout';
import TakeoffForm from './Partials/TakeoffForm';
import { Head, useForm } from '@inertiajs/react';

export default function Create({ projects, statuses }) {
    const form = useForm({
        code: '',
        title: '',
        project_id: '',
        status: 'draft',
        notes: '',
        lines: [
            { designation: '', unit: 'u', length: '', width: '', height: '', count: 1, quantity: 0, notes: '' },
        ],
    });

    const submit = (e) => {
        e.preventDefault();
        form.post('/takeoff');
    };

    return (
        <AppLayout header="Nouveau métré">
            <Head title="Nouveau métré" />
            <div className="mx-auto max-w-5xl">
                <TakeoffForm
                    form={form}
                    projects={projects}
                    statuses={statuses}
                    onSubmit={submit}
                    submitLabel="Créer le métré"
                />
            </div>
        </AppLayout>
    );
}
