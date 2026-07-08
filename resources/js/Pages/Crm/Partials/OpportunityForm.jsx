import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import { Link } from '@inertiajs/react';

const CURRENCIES = ['XOF', 'XAF', 'EUR', 'USD', 'GHS', 'NGN'];

// Libellés locaux des étapes du pipeline commercial (FR).
export const STAGE_LABELS = {
    prospect:    'Prospect',
    qualifie:    'Qualifié',
    proposition: 'Proposition',
    negociation: 'Négociation',
    gagne:       'Gagné',
    perdu:       'Perdu',
};

/**
 * Formulaire partagé création / édition d'une opportunité (CRM).
 * `form` est l'objet retourné par useForm() d'Inertia.
 */
export default function OpportunityForm({ form, stages = [], clients = [], users = [], onSubmit, submitLabel }) {
    const { data, setData, errors, processing } = form;

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
                    {field('code', 'Code opportunité *', { placeholder: 'OPP-2026-001' })}
                    {field('title', 'Intitulé *', { placeholder: 'Construction lycée moderne' })}

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

                    {field('client_name', 'Prospect (nom libre)', { placeholder: 'Si non rattaché à un client' })}

                    <div>
                        <InputLabel htmlFor="stage" value="Étape *" />
                        <select
                            id="stage"
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
                            value={data.stage}
                            onChange={(e) => setData('stage', e.target.value)}
                        >
                            {(stages.length ? stages : Object.keys(STAGE_LABELS)).map((s) => (
                                <option key={s} value={s}>{STAGE_LABELS[s] ?? s}</option>
                            ))}
                        </select>
                        <InputError message={errors.stage} className="mt-1" />
                    </div>

                    <div>
                        <InputLabel htmlFor="assignee_id" value="Commercial affecté" />
                        <select
                            id="assignee_id"
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
                            value={data.assignee_id ?? ''}
                            onChange={(e) => setData('assignee_id', e.target.value || null)}
                        >
                            <option value="">— Aucun —</option>
                            {users.map((u) => (
                                <option key={u.id} value={u.id}>{u.name}</option>
                            ))}
                        </select>
                        <InputError message={errors.assignee_id} className="mt-1" />
                    </div>
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

            <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
                <h3 className="mb-4 font-semibold text-slate-800 dark:text-slate-100">Montant & prévision</h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {field('estimated_amount', 'Montant estimé *', { type: 'number', min: 0, step: '0.01' })}
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
                    {field('probability', 'Probabilité (%)', { type: 'number', min: 0, max: 100 })}
                    {field('expected_close_date', 'Clôture prévue', { type: 'date' })}
                    {field('source', 'Source', { placeholder: 'Recommandation, salon, appel d\'offres…' })}
                </div>
            </div>

            <div className="flex items-center justify-end gap-3">
                <Link
                    href="/crm"
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
