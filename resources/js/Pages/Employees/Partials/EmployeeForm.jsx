import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import { Link } from '@inertiajs/react';

const CURRENCIES = ['XOF', 'XAF', 'EUR', 'USD', 'GHS', 'NGN'];

// Libellés locaux au module RH (FR).
const DEPARTMENT_LABEL = {
    chantier: 'Chantier', bureau: 'Bureau', direction: 'Direction', logistique: 'Logistique', autre: 'Autre',
};
const CONTRACT_LABEL = {
    cdi: 'CDI', cdd: 'CDD', journalier: 'Journalier', stage: 'Stage', prestation: 'Prestation',
};
const STATUS_LABEL = {
    active: 'Actif', suspended: 'Suspendu', terminated: 'Sorti',
};

/**
 * Formulaire partagé création / édition d'un employé.
 * `form` est l'objet retourné par useForm() d'Inertia.
 */
export default function EmployeeForm({ form, sites = [], agencies = [], departments = [], contractTypes = [], statuses = [], onSubmit, submitLabel }) {
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

    const select = (name, label, options, labels) => (
        <div>
            <InputLabel htmlFor={name} value={label} />
            <select
                id={name}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
                value={data[name] ?? ''}
                onChange={(e) => setData(name, e.target.value)}
            >
                {options.map((o) => <option key={o} value={o}>{labels[o] ?? o}</option>)}
            </select>
            <InputError message={errors[name]} className="mt-1" />
        </div>
    );

    return (
        <form onSubmit={onSubmit} className="space-y-6">
            <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
                <h3 className="mb-4 font-semibold text-slate-800 dark:text-slate-100">Identité</h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {field('matricule', 'Matricule *', { placeholder: 'EMP-001' })}
                    {field('job_title', 'Poste', { placeholder: 'Chef de chantier' })}
                    {field('first_name', 'Prénom *', { placeholder: 'Kouassi' })}
                    {field('last_name', 'Nom *', { placeholder: 'Yao' })}
                    {field('phone', 'Téléphone', { placeholder: '+225 …' })}
                    {field('email', 'Email', { type: 'email', placeholder: 'employe@exemple.com' })}
                </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
                <h3 className="mb-4 font-semibold text-slate-800 dark:text-slate-100">Affectation & contrat</h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {select('department', 'Service *', departments.length ? departments : Object.keys(DEPARTMENT_LABEL), DEPARTMENT_LABEL)}
                    {select('contract_type', 'Type de contrat *', contractTypes.length ? contractTypes : Object.keys(CONTRACT_LABEL), CONTRACT_LABEL)}
                    {select('status', 'Statut *', statuses.length ? statuses : Object.keys(STATUS_LABEL), STATUS_LABEL)}

                    <div>
                        <InputLabel htmlFor="site_id" value="Chantier d'affectation" />
                        <select
                            id="site_id"
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
                            value={data.site_id ?? ''}
                            onChange={(e) => setData('site_id', e.target.value || null)}
                        >
                            <option value="">— Aucun —</option>
                            {sites.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                        </select>
                        <InputError message={errors.site_id} className="mt-1" />
                    </div>

                    <div>
                        <InputLabel htmlFor="agency_id" value="Agence" />
                        <select
                            id="agency_id"
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
                            value={data.agency_id ?? ''}
                            onChange={(e) => setData('agency_id', e.target.value || null)}
                        >
                            <option value="">— Aucune —</option>
                            {agencies.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
                        </select>
                        <InputError message={errors.agency_id} className="mt-1" />
                    </div>

                    {field('hire_date', "Date d'embauche", { type: 'date' })}
                </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
                <h3 className="mb-4 font-semibold text-slate-800 dark:text-slate-100">Rémunération</h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {field('base_salary', 'Salaire de base *', { type: 'number', min: 0, step: '0.01' })}
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
                    href="/hr"
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
