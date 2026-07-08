import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import { Link } from '@inertiajs/react';

const CURRENCIES = ['XOF', 'XAF', 'EUR', 'USD', 'GHS', 'NGN'];

const CONTRACT_TYPE = {
    client:         'Client',
    sous_traitance: 'Sous-traitance',
    fournisseur:    'Fournisseur',
    autre:          'Autre',
};

const CONTRACT_STATUS = {
    draft:     'Brouillon',
    active:    'Actif',
    suspended: 'Suspendu',
    closed:    'Clôturé',
    cancelled: 'Annulé',
};

/**
 * Formulaire partagé création / édition d'un contrat.
 * `form` est l'objet retourné par useForm() d'Inertia.
 */
export default function ContractForm({ form, projects = [], types = [], statuses = [], onSubmit, submitLabel }) {
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
                    {field('code', 'Code contrat *', { placeholder: 'CTR-2026-001' })}
                    {field('title', 'Intitulé *', { placeholder: 'Marché principal gros œuvre' })}
                    {field('party_name', 'Contrepartie', { placeholder: 'Nom du client / fournisseur' })}

                    <div>
                        <InputLabel htmlFor="type" value="Type de contrat *" />
                        <select
                            id="type"
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
                            value={data.type}
                            onChange={(e) => setData('type', e.target.value)}
                        >
                            {(types.length ? types : Object.keys(CONTRACT_TYPE)).map((t) => (
                                <option key={t} value={t}>{CONTRACT_TYPE[t] ?? t}</option>
                            ))}
                        </select>
                        <InputError message={errors.type} className="mt-1" />
                    </div>

                    <div>
                        <InputLabel htmlFor="status" value="Statut *" />
                        <select
                            id="status"
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
                            value={data.status}
                            onChange={(e) => setData('status', e.target.value)}
                        >
                            {(statuses.length ? statuses : Object.keys(CONTRACT_STATUS)).map((s) => (
                                <option key={s} value={s}>{CONTRACT_STATUS[s] ?? s}</option>
                            ))}
                        </select>
                        <InputError message={errors.status} className="mt-1" />
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
                <h3 className="mb-4 font-semibold text-slate-800 dark:text-slate-100">Montant & dates</h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {field('amount', 'Montant *', { type: 'number', min: 0, step: '0.01' })}
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
                    {field('signed_date', 'Date de signature', { type: 'date' })}
                    <div className="hidden lg:block" />
                    {field('start_date', 'Date de début', { type: 'date' })}
                    {field('end_date', 'Date de fin', { type: 'date' })}
                </div>
            </div>

            <div className="flex items-center justify-end gap-3">
                <Link
                    href="/contracts"
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
