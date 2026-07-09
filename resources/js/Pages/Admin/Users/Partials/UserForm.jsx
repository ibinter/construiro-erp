import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import Checkbox from '@/Components/Checkbox';
import PrimaryButton from '@/Components/PrimaryButton';
import Icon from '@/Components/Icon';
import { Link } from '@inertiajs/react';
import { useTrans } from '@/i18n';

/**
 * Formulaire partagé création / édition d'un utilisateur.
 * `form` est l'objet retourné par useForm() d'Inertia.
 * `showPasswordNotice` affiche l'encart du mot de passe initial (création).
 */
export default function UserForm({ form, roles = [], agencies = [], onSubmit, submitLabel, showPasswordNotice = false }) {
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
            {showPasswordNotice && (
                <div className="flex items-start gap-3 rounded-xl border border-orange-200 bg-orange-50 p-4 text-sm text-orange-800 dark:border-orange-500/30 dark:bg-orange-500/10 dark:text-orange-300">
                    <Icon name="info" className="mt-0.5 h-5 w-5 shrink-0" />
                    <p>
                        {t('Le mot de passe initial de ce compte est')} <span className="font-semibold">« password »</span>.
                        {' '}{t('L\'utilisateur devra le modifier à sa première connexion.')}
                    </p>
                </div>
            )}

            <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
                <h3 className="mb-4 font-semibold text-slate-800 dark:text-slate-100">{t('Identité')}</h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {field('name', t('Nom complet *'), { placeholder: 'Jean Dupont' })}
                    {field('email', t('Adresse e-mail *'), { type: 'email', placeholder: 'jean.dupont@exemple.com' })}
                    {field('phone', t('Téléphone'), { placeholder: '+225 07 00 00 00 00' })}
                    {field('job_title', t('Fonction'), { placeholder: 'Conducteur de travaux' })}
                </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
                <h3 className="mb-4 font-semibold text-slate-800 dark:text-slate-100">{t('Rôle & rattachement')}</h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                        <InputLabel htmlFor="role" value={t('Rôle / portail *')} />
                        <select
                            id="role"
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
                            value={data.role ?? ''}
                            onChange={(e) => setData('role', e.target.value)}
                        >
                            <option value="">{t('— Sélectionner —')}</option>
                            {roles.map((r) => (
                                <option key={r.value} value={r.value}>{r.label}</option>
                            ))}
                        </select>
                        <InputError message={errors.role} className="mt-1" />
                    </div>

                    <div>
                        <InputLabel htmlFor="agency_id" value={t('Agence')} />
                        <select
                            id="agency_id"
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
                            value={data.agency_id ?? ''}
                            onChange={(e) => setData('agency_id', e.target.value || null)}
                        >
                            <option value="">{t('— Aucune —')}</option>
                            {agencies.map((a) => (
                                <option key={a.id} value={a.id}>{a.name}</option>
                            ))}
                        </select>
                        <InputError message={errors.agency_id} className="mt-1" />
                    </div>
                </div>

                <label className="mt-4 flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                    <Checkbox
                        checked={!!data.is_active}
                        onChange={(e) => setData('is_active', e.target.checked)}
                    />
                    {t('Compte actif')}
                </label>
                <InputError message={errors.is_active} className="mt-1" />
            </div>

            <div className="flex items-center justify-end gap-3">
                <Link
                    href="/admin/users"
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
