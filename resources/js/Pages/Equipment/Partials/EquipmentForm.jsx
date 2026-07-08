import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import { Link } from '@inertiajs/react';

const CURRENCIES = ['XOF', 'XAF', 'EUR', 'USD', 'GHS', 'NGN'];

// Libellés catégorie / statut (FR) — locaux au module Parc matériel.
export const EQUIPMENT_CATEGORY = {
    engin:     'Engin',
    vehicule:  'Véhicule',
    materiel:  'Matériel',
    outillage: 'Outillage',
};

export const EQUIPMENT_STATUS = {
    available:      { label: 'Disponible',     color: 'bg-green-100 text-green-700' },
    in_use:         { label: 'En service',     color: 'bg-blue-100 text-blue-700' },
    maintenance:    { label: 'En maintenance', color: 'bg-amber-100 text-amber-700' },
    out_of_service: { label: 'Hors service',   color: 'bg-red-100 text-red-700' },
};

/**
 * Formulaire partagé création / édition d'un équipement.
 * `form` est l'objet retourné par useForm() d'Inertia.
 */
export default function EquipmentForm({ form, sites = [], categories = [], statuses = [], onSubmit, submitLabel }) {
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
                    {field('code', 'Code équipement *', { placeholder: 'EQ-001' })}
                    {field('name', 'Désignation *', { placeholder: 'Grue à tour Potain' })}

                    <div>
                        <InputLabel htmlFor="category" value="Catégorie *" />
                        <select
                            id="category"
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
                            value={data.category}
                            onChange={(e) => setData('category', e.target.value)}
                        >
                            {(categories.length ? categories : Object.keys(EQUIPMENT_CATEGORY)).map((c) => (
                                <option key={c} value={c}>{EQUIPMENT_CATEGORY[c] ?? c}</option>
                            ))}
                        </select>
                        <InputError message={errors.category} className="mt-1" />
                    </div>

                    <div>
                        <InputLabel htmlFor="status" value="Statut *" />
                        <select
                            id="status"
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
                            value={data.status}
                            onChange={(e) => setData('status', e.target.value)}
                        >
                            {(statuses.length ? statuses : Object.keys(EQUIPMENT_STATUS)).map((s) => (
                                <option key={s} value={s}>{EQUIPMENT_STATUS[s]?.label ?? s}</option>
                            ))}
                        </select>
                        <InputError message={errors.status} className="mt-1" />
                    </div>

                    {field('brand', 'Marque', { placeholder: 'Caterpillar' })}
                    {field('model', 'Modèle', { placeholder: '320D' })}
                    {field('registration', 'Immatriculation / N° série', { placeholder: '1234 AB 01' })}

                    <div>
                        <InputLabel htmlFor="current_site_id" value="Chantier affecté" />
                        <select
                            id="current_site_id"
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
                            value={data.current_site_id ?? ''}
                            onChange={(e) => setData('current_site_id', e.target.value || null)}
                        >
                            <option value="">— Non affecté —</option>
                            {sites.map((s) => (
                                <option key={s.id} value={s.id}>{s.name}{s.code ? ` (${s.code})` : ''}</option>
                            ))}
                        </select>
                        <InputError message={errors.current_site_id} className="mt-1" />
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
                <h3 className="mb-4 font-semibold text-slate-800 dark:text-slate-100">Acquisition</h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {field('acquisition_date', 'Date d\'acquisition', { type: 'date' })}
                    {field('acquisition_value', 'Valeur d\'acquisition *', { type: 'number', min: 0, step: '0.01' })}
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
                    <label className="mt-6 inline-flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                        <input
                            type="checkbox"
                            className="rounded border-slate-300 text-orange-500 focus:ring-orange-500"
                            checked={!!data.is_active}
                            onChange={(e) => setData('is_active', e.target.checked)}
                        />
                        Actif
                    </label>
                </div>
            </div>

            <div className="flex items-center justify-end gap-3">
                <Link
                    href="/equipment"
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
