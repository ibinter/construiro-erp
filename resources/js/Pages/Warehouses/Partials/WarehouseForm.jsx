import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import { Link } from '@inertiajs/react';

/**
 * Formulaire partagé création / édition d'un magasin.
 * `form` est l'objet retourné par useForm() d'Inertia.
 */
export default function WarehouseForm({ form, onSubmit, submitLabel }) {
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
                <h3 className="mb-4 font-semibold text-slate-800 dark:text-slate-100">Informations du magasin</h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {field('code', 'Code magasin *', { placeholder: 'MAG-01' })}
                    {field('name', 'Nom *', { placeholder: 'Magasin Central Abidjan' })}
                    {field('city', 'Ville', { placeholder: 'Abidjan' })}
                    {field('manager_name', 'Magasinier responsable', { placeholder: 'Nom du responsable' })}
                </div>

                <div className="mt-4">
                    {field('address', 'Adresse')}
                </div>

                <label className="mt-4 inline-flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                    <input
                        type="checkbox"
                        className="rounded border-slate-300 text-orange-500 focus:ring-orange-500"
                        checked={!!data.is_active}
                        onChange={(e) => setData('is_active', e.target.checked)}
                    />
                    Actif
                </label>
            </div>

            <div className="flex items-center justify-end gap-3">
                <Link
                    href="/warehouses"
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
