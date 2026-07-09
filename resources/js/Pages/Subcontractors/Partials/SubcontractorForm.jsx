import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import { Link } from '@inertiajs/react';
import { useTrans } from '@/i18n';

// Libellés des spécialités de sous-traitant (FR) — local à ce module.
const SPECIALTY = {
    gros_oeuvre: 'Gros œuvre',
    electricite: 'Électricité',
    plomberie:   'Plomberie',
    peinture:    'Peinture',
    etancheite:  'Étanchéité',
    menuiserie:  'Menuiserie',
    vrd:         'VRD',
    autre:       'Autre',
};

/**
 * Formulaire partagé création / édition d'un sous-traitant.
 * `form` est l'objet retourné par useForm() d'Inertia.
 */
export default function SubcontractorForm({ form, specialties = [], onSubmit, submitLabel }) {
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
                <h3 className="mb-4 font-semibold text-slate-800 dark:text-slate-100">{t('Informations générales')}</h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {field('code', t('Code sous-traitant *'), { placeholder: 'STR-001' })}
                    {field('name', t('Raison sociale / Nom *'), { placeholder: 'Entreprise Kouassi BTP' })}

                    <div>
                        <InputLabel htmlFor="specialty" value={t('Spécialité *')} />
                        <select
                            id="specialty"
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
                            value={data.specialty}
                            onChange={(e) => setData('specialty', e.target.value)}
                        >
                            {(specialties.length ? specialties : Object.keys(SPECIALTY)).map((s) => (
                                <option key={s} value={s}>{t(SPECIALTY[s] ?? s)}</option>
                            ))}
                        </select>
                        <InputError message={errors.specialty} className="mt-1" />
                    </div>

                    <div>
                        <InputLabel htmlFor="rating" value={t('Note (1 à 5)')} />
                        <select
                            id="rating"
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
                            value={data.rating ?? ''}
                            onChange={(e) => setData('rating', e.target.value === '' ? '' : Number(e.target.value))}
                        >
                            <option value="">{t('Non évalué')}</option>
                            {[1, 2, 3, 4, 5].map((n) => (
                                <option key={n} value={n}>{'★'.repeat(n)}{'☆'.repeat(5 - n)} ({n}/5)</option>
                            ))}
                        </select>
                        <InputError message={errors.rating} className="mt-1" />
                    </div>

                    {field('tax_id', t('NIF / IFU'), { placeholder: 'CI-1234567 A' })}
                </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
                <h3 className="mb-4 font-semibold text-slate-800 dark:text-slate-100">{t('Coordonnées')}</h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {field('contact_name', t('Personne à contacter'), { placeholder: 'M. Yao Kouassi' })}
                    {field('phone', t('Téléphone'), { placeholder: '+225 …' })}
                    {field('email', t('E-mail'), { type: 'email', placeholder: 'contact@exemple.ci' })}
                    {field('city', t('Ville'), { placeholder: 'Abidjan' })}
                    {field('address', t('Adresse'))}
                </div>

                <div className="mt-4">
                    <InputLabel htmlFor="notes" value={t('Notes')} />
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
                        <span className="text-sm text-slate-600 dark:text-slate-300">{t('Sous-traitant actif')}</span>
                    </label>
                    <InputError message={errors.is_active} className="mt-1" />
                </div>
            </div>

            <div className="flex items-center justify-end gap-3">
                <Link
                    href="/subcontractors"
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
