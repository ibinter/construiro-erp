import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import { Link } from '@inertiajs/react';
import { useTrans } from '@/i18n';

// Libellés catégorie / unité (FR) — locaux au module Matériaux.
export const MATERIAL_CATEGORY = {
    gros_oeuvre:   'Gros œuvre',
    second_oeuvre: 'Second œuvre',
    electricite:   'Électricité',
    plomberie:     'Plomberie',
    quincaillerie: 'Quincaillerie',
    consommable:   'Consommable',
    autre:         'Autre',
};

export const MATERIAL_UNIT = {
    u:     'Unité (u)',
    kg:    'Kilogramme (kg)',
    m:     'Mètre (m)',
    m2:    'Mètre carré (m²)',
    m3:    'Mètre cube (m³)',
    ml:    'Mètre linéaire (ml)',
    sac:   'Sac',
    tonne: 'Tonne',
};

/**
 * Formulaire partagé création / édition d'un matériau.
 * `form` est l'objet retourné par useForm() d'Inertia.
 */
export default function MaterialForm({ form, categories = [], units = [], onSubmit, submitLabel }) {
    const { t } = useTrans();
    const { data, setData, errors, processing } = form;

    const field = (name, label, props = {}) => (
        <div>
            <InputLabel htmlFor={name} value={t(label)} />
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
                <h3 className="mb-4 font-semibold text-slate-800 dark:text-slate-100">{t('Informations générales')}</h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {field('code', 'Code article *', { placeholder: 'MAT-001' })}
                    {field('name', 'Désignation *', { placeholder: 'Ciment CPA 42.5' })}

                    <div>
                        <InputLabel htmlFor="category" value={t('Catégorie *')} />
                        <select
                            id="category"
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
                            value={data.category}
                            onChange={(e) => setData('category', e.target.value)}
                        >
                            {(categories.length ? categories : Object.keys(MATERIAL_CATEGORY)).map((c) => (
                                <option key={c} value={c}>{t(MATERIAL_CATEGORY[c] ?? c)}</option>
                            ))}
                        </select>
                        <InputError message={errors.category} className="mt-1" />
                    </div>

                    <div>
                        <InputLabel htmlFor="unit" value={t('Unité *')} />
                        <select
                            id="unit"
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
                            value={data.unit}
                            onChange={(e) => setData('unit', e.target.value)}
                        >
                            {(units.length ? units : Object.keys(MATERIAL_UNIT)).map((u) => (
                                <option key={u} value={u}>{t(MATERIAL_UNIT[u] ?? u)}</option>
                            ))}
                        </select>
                        <InputError message={errors.unit} className="mt-1" />
                    </div>
                </div>

                <div className="mt-4">
                    <InputLabel htmlFor="description" value={t('Description')} />
                    <textarea
                        id="description"
                        rows={3}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
                        value={data.description ?? ''}
                        onChange={(e) => setData('description', e.target.value)}
                    />
                    <InputError message={errors.description} className="mt-1" />
                </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
                <h3 className="mb-4 font-semibold text-slate-800 dark:text-slate-100">{t("Prix & seuil d'alerte")}</h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {field('unit_price', 'Prix de référence *', { type: 'number', min: 0, step: '0.01' })}
                    {field('min_stock', 'Seuil d\'alerte (stock min.) *', { type: 'number', min: 0, step: '0.001' })}
                    <label className="mt-6 inline-flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                        <input
                            type="checkbox"
                            className="rounded border-slate-300 text-orange-500 focus:ring-orange-500"
                            checked={!!data.is_active}
                            onChange={(e) => setData('is_active', e.target.checked)}
                        />
                        {t('Actif')}
                    </label>
                </div>
            </div>

            <div className="flex items-center justify-end gap-3">
                <Link
                    href="/materials"
                    className="rounded-md px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                    {t('Annuler')}
                </Link>
                <PrimaryButton disabled={processing} className="bg-orange-500 hover:bg-orange-600 focus:bg-orange-600">
                    {submitLabel}
                </PrimaryButton>
            </div>
        </form>
    );
}
