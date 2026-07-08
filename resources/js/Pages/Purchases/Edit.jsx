import AppLayout from '@/Layouts/AppLayout';
import PurchaseForm from './Partials/PurchaseForm';
import { Head, useForm } from '@inertiajs/react';

export default function Edit({ order, suppliers, materials, projects, statuses }) {
    const fmtDate = (d) => (d ? String(d).slice(0, 10) : '');

    const form = useForm({
        code: order.code ?? '',
        supplier_id: order.supplier_id ?? '',
        project_id: order.project_id ?? '',
        status: order.status ?? 'draft',
        currency: order.currency ?? 'XOF',
        tax_rate: order.tax_rate ?? 18,
        order_date: fmtDate(order.order_date),
        expected_date: fmtDate(order.expected_date),
        notes: order.notes ?? '',
        lines: (order.lines ?? []).map((l) => ({
            material_id: l.material_id ?? '',
            designation: l.designation ?? '',
            unit: l.unit ?? 'u',
            quantity: l.quantity ?? 1,
            unit_price: l.unit_price ?? 0,
        })),
    });

    const submit = (e) => {
        e.preventDefault();
        form.put(`/purchases/${order.id}`);
    };

    return (
        <AppLayout header="Modifier le bon de commande">
            <Head title={`Modifier ${order.code}`} />
            <div className="mx-auto max-w-5xl">
                <PurchaseForm
                    form={form}
                    suppliers={suppliers}
                    materials={materials}
                    projects={projects}
                    statuses={statuses}
                    onSubmit={submit}
                    submitLabel="Enregistrer les modifications"
                />
            </div>
        </AppLayout>
    );
}
