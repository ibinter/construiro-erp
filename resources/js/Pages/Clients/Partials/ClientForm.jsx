import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import { Link } from '@inertiajs/react';

// Libellés des types de client (FR) — local à ce module.
const CLIENT_TYPE = {
    particulier: 'Particulier',
    entreprise:  'Entreprise',
    public:      'Secteur public',
    promoteur:   'Promoteur immobilier',
};

/**
 * Formulaire partagé création / édition d'un client.
 * `form` est l'objet retourné par useForm() d'Inertia.
 */
export default function ClientForm({ form, types = [], onSubmit, submitLabel }) {
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
                    {field('code', 'Code client *', { placeholder: 'CLI-001' })}
                    {field('name', 'Raison sociale / Nom *', { placeholder: 'SCI Horizon' })}

                    <div>
                        <InputLabel htmlFor="type" value="Type de client *" />
                        <select
                            id="type"
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
                            value={data.type}
                            onChange={(e) => setData('type', e.target.value)}
                        >
                            {(types.length ? types : Object.keys(CLIENT_TYPE)).map((t) => (
                                <option key={t} value={t}>{CLIENT_TYPE[t] ?? t}</option>
                            ))}
                        </select>
                        <InputError message={errors.type} className="mt-1" />
                    </div>

                    {field('tax_id', 'NIF / IFU', { placeholder: 'CI-1234567 A' })}
                </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
                <h3 className="mb-4 font-semibold text-slate-800 dark:text-slate-100">Coordonnées</h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {field('contact_name', 'Personne à contacter', { placeholder: 'Mme Aïcha Traoré' })}
                    {field('phone', 'Téléphone', { placeholder: '+225 …' })}
                    {field('email', 'E-mail', { type: 'email', placeholder: 'contact@exemple.ci' })}
                    {field('city', 'Ville', { placeholder: 'Abidjan' })}
                    {field('address', 'Adresse')}
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

                <div className="mt-4">
                    <label className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            className="rounded border-gray-300 text-orange-500 shadow-sm focus:ring-orange-500 dark:border-gray-700 dark:bg-gray-900"
                            checked={!!data.is_active}
                            onChange={(e) => setData('is_active', e.target.checked)}
                        />
                        <span className="text-sm text-slate-600 dark:text-slate-300">Client actif</span>
                    </label>
                    <InputError message={errors.is_active} className="mt-1" />
                </div>
            </div>

            <div className="flex items-center justify-end gap-3">
                <Link
                    href="/clients"
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
