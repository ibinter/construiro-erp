import AppLayout from '@/Layouts/AppLayout';
import Icon from '@/Components/Icon';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import { Head, Link, useForm } from '@inertiajs/react';

const CURRENCIES = ['XOF', 'XAF', 'EUR', 'USD', 'GHS', 'NGN'];
const LOCALES = [
    { value: 'fr', label: 'Français' },
    { value: 'en', label: 'English' },
];

export default function Edit({ company, agencies }) {
    const form = useForm({
        name: company.name ?? '',
        legal_name: company.legal_name ?? '',
        registration_number: company.registration_number ?? '',
        tax_id: company.tax_id ?? '',
        country: company.country ?? '',
        city: company.city ?? '',
        address: company.address ?? '',
        phone: company.phone ?? '',
        email: company.email ?? '',
        website: company.website ?? '',
        base_currency: company.base_currency ?? 'XOF',
        locale: company.locale ?? 'fr',
    });

    const { data, setData, errors, processing } = form;

    const submit = (e) => {
        e.preventDefault();
        form.put('/admin/company');
    };

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
        <AppLayout header="Administration — Entreprise">
            <Head title="Paramètres de l'entreprise" />

            <div className="mx-auto max-w-4xl">
                <form onSubmit={submit} className="space-y-6">
                    <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
                        <h3 className="mb-4 font-semibold text-slate-800 dark:text-slate-100">Identité de l'entreprise</h3>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            {field('name', 'Nom commercial *', { placeholder: 'CONSTRUIRO' })}
                            {field('legal_name', 'Raison sociale', { placeholder: 'CONSTRUIRO SARL' })}
                            {field('registration_number', 'Registre de commerce (RCCM)')}
                            {field('tax_id', 'Identifiant fiscal (NIF)')}
                        </div>
                    </div>

                    <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
                        <h3 className="mb-4 font-semibold text-slate-800 dark:text-slate-100">Coordonnées</h3>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            {field('country', 'Pays', { placeholder: "Côte d'Ivoire" })}
                            {field('city', 'Ville', { placeholder: 'Abidjan' })}
                            {field('address', 'Adresse')}
                            {field('phone', 'Téléphone')}
                            {field('email', 'E-mail', { type: 'email' })}
                            {field('website', 'Site web', { placeholder: 'https://…' })}
                        </div>
                    </div>

                    <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
                        <h3 className="mb-4 font-semibold text-slate-800 dark:text-slate-100">Préférences</h3>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div>
                                <InputLabel htmlFor="base_currency" value="Devise de base *" />
                                <select
                                    id="base_currency"
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
                                    value={data.base_currency}
                                    onChange={(e) => setData('base_currency', e.target.value)}
                                >
                                    {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
                                </select>
                                <InputError message={errors.base_currency} className="mt-1" />
                            </div>
                            <div>
                                <InputLabel htmlFor="locale" value="Langue *" />
                                <select
                                    id="locale"
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
                                    value={data.locale}
                                    onChange={(e) => setData('locale', e.target.value)}
                                >
                                    {LOCALES.map((l) => <option key={l.value} value={l.value}>{l.label}</option>)}
                                </select>
                                <InputError message={errors.locale} className="mt-1" />
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center justify-end gap-3">
                        <Link
                            href="/admin/users"
                            className="rounded-md px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                        >
                            Annuler
                        </Link>
                        <PrimaryButton disabled={processing} className="bg-orange-500 hover:bg-orange-600 focus:bg-orange-600">
                            Enregistrer
                        </PrimaryButton>
                    </div>
                </form>

                {/* Agences — lecture seule */}
                <div className="mt-6 rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
                    <div className="flex items-center gap-2 border-b border-slate-100 px-5 py-4 dark:border-slate-800">
                        <Icon name="building-2" className="h-5 w-5 text-orange-500" />
                        <h3 className="font-semibold text-slate-800 dark:text-slate-100">
                            Agences ({agencies.length})
                        </h3>
                    </div>
                    <ul className="divide-y divide-slate-100 dark:divide-slate-800">
                        {agencies.map((agency) => (
                            <li key={agency.id} className="flex items-center justify-between px-5 py-3 text-sm">
                                <div>
                                    <div className="flex items-center gap-2 font-medium text-slate-800 dark:text-slate-100">
                                        {agency.name}
                                        {agency.is_headquarters && (
                                            <span className="inline-flex rounded-full bg-orange-100 px-2 py-0.5 text-xs font-medium text-orange-700 dark:bg-orange-500/10 dark:text-orange-400">
                                                Siège
                                            </span>
                                        )}
                                    </div>
                                    {agency.city && <div className="text-xs text-slate-400">{agency.city}</div>}
                                </div>
                                {agency.is_active ? (
                                    <span className="inline-flex rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
                                        Active
                                    </span>
                                ) : (
                                    <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-500 dark:bg-slate-700 dark:text-slate-300">
                                        Inactive
                                    </span>
                                )}
                            </li>
                        ))}
                        {agencies.length === 0 && (
                            <li className="px-5 py-8 text-center text-sm text-slate-400">
                                Aucune agence enregistrée.
                            </li>
                        )}
                    </ul>
                </div>
            </div>
        </AppLayout>
    );
}
