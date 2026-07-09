import AppLayout from '@/Layouts/AppLayout';
import BudgetForm from './Partials/BudgetForm';
import { Head, useForm } from '@inertiajs/react';
import { useTrans } from '@/i18n';

export default function Edit({ budget, projects, statuses }) {
    const { t } = useTrans();
    const form = useForm({
        code: budget.code ?? '',
        title: budget.title ?? '',
        fiscal_year: budget.fiscal_year ?? new Date().getFullYear(),
        project_id: budget.project_id ?? '',
        status: budget.status ?? 'draft',
        currency: budget.currency ?? 'XOF',
        notes: budget.notes ?? '',
        lines: (budget.lines ?? []).map((l) => ({
            category: l.category ?? '',
            label: l.label ?? '',
            planned_amount: l.planned_amount ?? 0,
            actual_amount: l.actual_amount ?? 0,
        })),
    });

    const submit = (e) => {
        e.preventDefault();
        form.put(`/budget/${budget.id}`);
    };

    return (
        <AppLayout header="Modifier le budget">
            <Head title={`${t('Modifier')} ${budget.code}`} />
            <div className="mx-auto max-w-5xl">
                <BudgetForm
                    form={form}
                    projects={projects}
                    statuses={statuses}
                    onSubmit={submit}
                    submitLabel={t('Enregistrer les modifications')}
                />
            </div>
        </AppLayout>
    );
}
