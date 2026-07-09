import AppLayout from '@/Layouts/AppLayout';
import UserForm from './Partials/UserForm';
import { Head, useForm } from '@inertiajs/react';
import { useTrans } from '@/i18n';

export default function Edit({ user, roles, agencies }) {
    const { t } = useTrans();
    const form = useForm({
        name: user.name ?? '',
        email: user.email ?? '',
        phone: user.phone ?? '',
        job_title: user.job_title ?? '',
        role: user.role ?? '',
        agency_id: user.agency_id ?? '',
        is_active: !!user.is_active,
    });

    const submit = (e) => {
        e.preventDefault();
        form.put(`/admin/users/${user.id}`);
    };

    return (
        <AppLayout header={`Modifier — ${user.name}`}>
            <Head title={`Modifier ${user.name}`} />
            <div className="mx-auto max-w-4xl">
                <UserForm
                    form={form}
                    roles={roles}
                    agencies={agencies}
                    onSubmit={submit}
                    submitLabel={t('Enregistrer')}
                />
            </div>
        </AppLayout>
    );
}
