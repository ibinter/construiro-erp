import { useState } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import Icon from '@/Components/Icon';
import Modal from '@/Components/Modal';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import { Head, Link, useForm } from '@inertiajs/react';
import { useTrans } from '@/i18n';

// Libellés et styles des types de compte (SYSCOHADA).
const ACCOUNT_TYPE = {
    actif:   { label: 'Actif',   color: 'bg-blue-100 text-blue-700' },
    passif:  { label: 'Passif',  color: 'bg-purple-100 text-purple-700' },
    charge:  { label: 'Charge',  color: 'bg-red-100 text-red-700' },
    produit: { label: 'Produit', color: 'bg-green-100 text-green-700' },
};

export default function Accounts({ accounts, types, can }) {
    const { t } = useTrans();
    const [showModal, setShowModal] = useState(false);

    const form = useForm({
        code: '',
        label: '',
        type: 'charge',
    });

    const submit = (e) => {
        e.preventDefault();
        form.post('/accounting/accounts', {
            preserveScroll: true,
            onSuccess: () => { form.reset(); setShowModal(false); },
        });
    };

    return (
        <AppLayout header="Plan comptable">
            <Head title="Plan comptable" />

            {/* Barre d'actions */}
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <Link href="/accounting" className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-orange-600">
                    <Icon name="arrow-left" className="h-4 w-4" />
                    {t('Retour au journal')}
                </Link>

                {can.create && (
                    <button
                        onClick={() => setShowModal(true)}
                        className="inline-flex items-center gap-2 rounded-md bg-orange-500 px-4 py-2 text-sm font-medium text-white hover:bg-orange-600"
                    >
                        <Icon name="plus" className="h-4 w-4" />
                        {t('Nouveau compte')}
                    </button>
                )}
            </div>

            {/* Liste des comptes */}
            <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
                <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
                    <thead className="bg-slate-50 dark:bg-slate-800/50">
                        <tr className="text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                            <th className="px-4 py-3">{t('Code')}</th>
                            <th className="px-4 py-3">{t('Intitulé')}</th>
                            <th className="px-4 py-3">{t('Type')}</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {accounts.map((account) => {
                            const ty = ACCOUNT_TYPE[account.type] ?? { label: account.type, color: 'bg-slate-100 text-slate-600' };
                            return (
                                <tr key={account.id} className="text-sm hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                    <td className="px-4 py-3 font-mono font-medium text-slate-800 dark:text-slate-100">{account.code}</td>
                                    <td className="px-4 py-3 text-slate-700 dark:text-slate-200">{account.label}</td>
                                    <td className="px-4 py-3">
                                        <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${ty.color}`}>{t(ty.label)}</span>
                                    </td>
                                </tr>
                            );
                        })}

                        {accounts.length === 0 && (
                            <tr>
                                <td colSpan={3} className="px-4 py-12 text-center text-slate-400">
                                    <Icon name="book" className="mx-auto mb-2 h-8 w-8" />
                                    {t('Aucun compte dans le plan comptable.')}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modal nouveau compte */}
            <Modal show={showModal} onClose={() => setShowModal(false)} maxWidth="md">
                <form onSubmit={submit} className="p-6">
                    <h3 className="mb-4 text-lg font-semibold text-slate-800 dark:text-slate-100">{t('Nouveau compte')}</h3>
                    <div className="space-y-4">
                        <div>
                            <InputLabel htmlFor="ac_code" value={t('Code *')} />
                            <TextInput id="ac_code" className="mt-1 block w-full" placeholder="601"
                                value={form.data.code} onChange={(e) => form.setData('code', e.target.value)} />
                            <InputError message={form.errors.code} className="mt-1" />
                        </div>
                        <div>
                            <InputLabel htmlFor="ac_label" value={t('Intitulé *')} />
                            <TextInput id="ac_label" className="mt-1 block w-full" placeholder={t('Achats de marchandises')}
                                value={form.data.label} onChange={(e) => form.setData('label', e.target.value)} />
                            <InputError message={form.errors.label} className="mt-1" />
                        </div>
                        <div>
                            <InputLabel htmlFor="ac_type" value={t('Type *')} />
                            <select
                                id="ac_type"
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
                                value={form.data.type}
                                onChange={(e) => form.setData('type', e.target.value)}
                            >
                                {types.map((k) => (
                                    <option key={k} value={k}>{t(ACCOUNT_TYPE[k]?.label ?? k)}</option>
                                ))}
                            </select>
                            <InputError message={form.errors.type} className="mt-1" />
                        </div>
                    </div>
                    <div className="mt-6 flex justify-end gap-3">
                        <SecondaryButton type="button" onClick={() => setShowModal(false)}>{t('Annuler')}</SecondaryButton>
                        <PrimaryButton disabled={form.processing} className="bg-orange-500 hover:bg-orange-600 focus:bg-orange-600">
                            {t('Créer le compte')}
                        </PrimaryButton>
                    </div>
                </form>
            </Modal>
        </AppLayout>
    );
}
