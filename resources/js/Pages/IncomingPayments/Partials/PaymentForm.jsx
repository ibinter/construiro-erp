import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import { Link } from '@inertiajs/react';

const CURRENCIES = ['XOF', 'XAF', 'EUR', 'USD', 'GHS', 'NGN'];

// Libellés FR des modes de règlement.
export const METHOD_LABELS = {
    especes:      'Espèces',
    virement:     'Virement',
    cheque:       'Chèque',
    mobile_money: 'Mobile Money',
    autre:        'Autre',
};

/**
 * Formulaire partagé création / édition d'un encaissement.
 * `form` est l'objet retourné par useForm() d'Inertia.
 */
export default function PaymentForm({
    form,
    clients = [],
    invoices = [],
    projects = [],
    methods = [],
    onSubmit,
    submitLabel,
}) {
    const { data, setData, errors, processing } = form;

    const methodList = methods.length ? methods : Object.keys(METHOD_LABELS);

    const field = (name, label, props = {}) => (
        <div>
            <InputLabel htmlFor={name} value={label} />
            <TextInput
                id={name}
                className="mt-1 block w-full"
                value={data[name] ?? ''}
                onChange={(e) => setData(name, e.target.value)}
                {...props}
            />
            <InputError message={errors[name]} className="mt-1" />
        </div>
    );

    return (
        <form onSubmit={onSubmit} className="space-y-6">
            <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
                <h3 className="mb-4 font-semibold text-slate-800 dark:text-slate-100">Informations générales</h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {field('code', 'Code encaissement *', { placeholder: 'ENC-2026-001' })}

                    <div>
                        <InputLabel htmlFor="client_id" value="Client" />
                        <select
                            id="client_id"
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
                            value={data.client_id ?? ''}
                            onChange={(e) => setData('client_id', e.target.value || null)}
                        >
                            <option value="">— Aucun —</option>
                            {clients.map((c) => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                        </select>
                        <InputError message={errors.client_id} className="mt-1" />
                    </div>

                    <div>
                        <InputLabel htmlFor="invoice_id" value="Facture réglée" />
                        <select
                            id="invoice_id"
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
                            value={data.invoice_id ?? ''}
                            onChange={(e) => setData('invoice_id', e.target.value || null)}
                        >
                            <option value="">— Aucune —</option>
                            {invoices.map((inv) => (
                                <option key={inv.id} value={inv.id}>{inv.code}</option>
                            ))}
                        </select>
                        <InputError message={errors.invoice_id} className="mt-1" />
                    </div>

                    <div>
                        <InputLabel htmlFor="project_id" value="Projet rattaché" />
                        <select
                            id="project_id"
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
                            value={data.project_id ?? ''}
                            onChange={(e) => setData('project_id', e.target.value || null)}
                        >
                            <option value="">— Aucun —</option>
                            {projects.map((p) => (
                                <option key={p.id} value={p.id}>{p.name}</option>
                            ))}
                        </select>
                        <InputError message={errors.project_id} className="mt-1" />
                    </div>

                    {field('payer_name', 'Nom du payeur', { placeholder: 'Si aucun client rattaché' })}

                    {field('amount', 'Montant reçu *', { type: 'number', min: '0.01', step: '0.01' })}

                    <div>
                        <InputLabel htmlFor="currency" value="Devise *" />
                        <select
                            id="currency"
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
                            value={data.currency}
                            onChange={(e) => setData('currency', e.target.value)}
                        >
                            {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
                        </select>
                        <InputError message={errors.currency} className="mt-1" />
                    </div>

                    <div>
                        <InputLabel htmlFor="method" value="Mode de règlement *" />
                        <select
                            id="method"
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
                            value={data.method}
                            onChange={(e) => setData('method', e.target.value)}
                        >
                            {methodList.map((m) => (
                                <option key={m} value={m}>{METHOD_LABELS[m] ?? m}</option>
                            ))}
                        </select>
                        <InputError message={errors.method} className="mt-1" />
                    </div>

                    {field('date', 'Date de l\'encaissement *', { type: 'date' })}
                    {field('reference', 'Référence', { placeholder: 'N° virement / chèque…' })}
                </div>

                <div className="mt-4">
                    <InputLabel htmlFor="notes" value="Notes" />
                    <textarea
                        id="notes"
                        rows={3}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
                        value={data.notes ?? ''}
                        onChange={(e) => setData('notes', e.target.value)}
                    />
                    <InputError message={errors.notes} className="mt-1" />
                </div>
            </div>

            <div className="flex items-center justify-end gap-3">
                <Link
                    href="/incoming-payments"
                    className="rounded-md px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                    Annuler
                </Link>
                <PrimaryButton disabled={processing} className="bg-orange-500 hover:bg-orange-600 focus:bg-orange-600">
                    {submitLabel}
                </PrimaryButton>
            </div>
        </form>
    );
}
