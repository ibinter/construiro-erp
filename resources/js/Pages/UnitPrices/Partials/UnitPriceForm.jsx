import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import { Link } from '@inertiajs/react';
import { useTrans } from '@/i18n';

const CURRENCIES = ['XOF', 'XAF', 'EUR', 'USD', 'GHS', 'NGN'];

// Libellés des catégories (FR) — local à ce module.
const CATEGORY_LABEL = {
    gros_oeuvre:   'Gros œuvre',
    second_oeuvre: 'Second œuvre',
    vrd:           'VRD',
    electricite:   'Électricité',
    plomberie:     'Plomberie',
    autre:         'Autre',
};

/**
 * Formulaire partagé création / édition d'un prix unitaire (BPU).
 * `form` est l'objet retourné par useForm() d'Inertia.
 */
export default function UnitPriceForm({ form, units = [], categories = [], onSubmit, submitLabel }) {
    const { t } = useTrans();
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
                <h3 className="mb-4 font-semibold text-slate-800 dark:text-slate-100">{t('Prix unitaire')}</h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {field('code', t('Code *'), { placeholder: 'BPU-001' })}
                    {field('designation', t('Désignation *'), { placeholder: t('Béton dosé 350 kg/m3') })}

                    <div>
                        <InputLabel htmlFor="category" value={t('Catégorie *')} />
                        <select
                            id="category"
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
                            value={data.category}
                            onChange={(e) => setData('category', e.target.value)}
                        >
                            {(categories.length ? categories : Object.keys(CATEGORY_LABEL)).map((c) => (
                                <option key={c} value={c}>{t(CATEGORY_LABEL[c] ?? c)}</option>
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
                            {(units.length ? units : ['u', 'm2', 'm3', 'ml', 'kg', 'forfait']).map((u) => (
                                <option key={u} value={u}>{u}</option>
                            ))}
                        </select>
                        <InputError message={errors.unit} className="mt-1" />
                    </div>

                    {field('unit_price', t('Prix unitaire *'), { type: 'number', min: 0, step: '0.01', placeholder: '95000' })}

                    <div>
                        <InputLabel htmlFor="currency" value={t('Devise *')} />
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
                    <label className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            className="rounded border-gray-300 text-orange-500 shadow-sm focus:ring-orange-500 dark:border-gray-700 dark:bg-gray-900"
                            checked={!!data.is_active}
                            onChange={(e) => setData('is_active', e.target.checked)}
                        />
                        <span className="text-sm text-slate-600 dark:text-slate-300">{t('Prix actif')}</span>
                    </label>
                    <InputError message={errors.is_active} className="mt-1" />
                </div>
            </div>

            <div className="flex items-center justify-end gap-3">
                <Link
                    href="/unit-prices"
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
