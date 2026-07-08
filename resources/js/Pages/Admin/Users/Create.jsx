import AppLayout from '@/Layouts/AppLayout';
import UserForm from './Partials/UserForm';
import { Head, useForm } from '@inertiajs/react';

export default function Create({ roles, agencies }) {
    const form = useForm({
        name: '',
        email: '',
        phone: '',
        job_title: '',
        role: '',
        agency_id: '',
        is_active: true,
    });

    const submit = (e) => {
        e.preventDefault();
        form.post('/admin/users');
    };

    return (
        <AppLayout header="Nouvel utilisateur">
            <Head title="Nouvel utilisateur" />
            <div className="mx-auto max-w-4xl">
                <UserForm
                    form={form}
                    roles={roles}
                    agencies={agencies}
                    onSubmit={submit}
                    submitLabel="Créer l'utilisateur"
                    showPasswordNotice
                />
            </div>
        </AppLayout>
    );
}
