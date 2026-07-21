import AppLayout from '@/Layouts/AppLayout';
import Icon from '@/Components/Icon';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import { Head, Link, useForm } from '@inertiajs/react';
import { TRANSACTION_TYPE, TRANSACTION_CATEGORY } from '@/Pages/Treasury/Index';
import { useTrans } from '@/i18n';

const CATEGORY_KEYS = Object.keys(TRANSACTION_CATEGORY);

export default function Edit({ transaction, accounts, projects, types }) {
    const { t } = useTrans();

    const form = useForm({
        cash_account_id: transaction.cash_account_id ?? '',
        project_id:      transaction.project_id ?? '',
        type:            transaction.type ?? 'in',
        category:        transaction.category ?? '',
        amount:          transaction.amount ?? 0,
        date:            transaction.date ? transaction.date.substring(0, 10) : '',
        reference:       transaction.reference ?? '',
        description:     transaction.description ?? '',
    });

    const submit = (e) => {
        e.preventDefault();
        form.put(`/treasury/transactions/${transaction.id}`);
    };

    return (
        <AppLayout header={t('Modifier la transaction')}>
            <Head title={t('Modifier la transaction')} />

            <div className="mx-auto max-w-2xl">
                {/* Fil d'Ariane */}
                <div className="mb-4 flex items-center gap-2 text-sm text-slate-500">
                    <Link href="/treasury" className="hover:text-orange-600">{t('Trésorerie')}</Link>
                    <Icon name="chevron-right" className="h-4 w-4" />
                    {transaction.cash_account && (
                        <>
                            <Link
                                href={`/treasury/accounts/${transaction.cash_account_id}`}
                                className="hover:text-orange-600"
                            >
                                {transaction.cash_account.name}
                            </Link>
                            <Icon name="chevron-right" className="h-4 w-4" />
                        </>
                    )}
                    <span className="text-slate-700 dark:text-slate-200">{t('Modifier')}</span>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
                    <h2 className="mb-6 text-lg font-semibold text-slate-800 dark:text-slate-100">
                        {t('Modifier la transaction')}
                    </h2>

                    <form onSubmit={submit} className="space-y-5">
                        {/* Type et Compte */}
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div>
                                <InputLabel htmlFor="type" value={t('Type *')} />
                                <select
                                    id="type"
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
                                    value={form.data.type}
                                    onChange={(e) => form.setData('type', e.target.value)}
                                >
                                    {types.map((k) => (
                                        <option key={k} value={k}>{t(TRANSACTION_TYPE[k]?.label ?? k)}</option>
                                    ))}
                                </select>
                                <InputError message={form.errors.type} className="mt-1" />
                            </div>

                            <div>
                                <InputLabel htmlFor="cash_account_id" value={t('Compte *')} />
                                <select
                                    id="cash_account_id"
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
                                    value={form.data.cash_account_id}
                                    onChange={(e) => form.setData('cash_account_id', e.target.value)}
                                >
                                    {accounts.map((a) => (
                                        <option key={a.id} value={a.id}>{a.name}</option>
                                    ))}
                                </select>
                                <InputError message={form.errors.cash_account_id} className="mt-1" />
                            </div>
                        </div>

                        {/* Montant et Date */}
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div>
                                <InputLabel htmlFor="amount" value={t('Montant *')} />
                                <TextInput
                                    id="amount"
                                    type="number"
                                    min={0}
                                    step="0.01"
                                    className="mt-1 block w-full"
                                    value={form.data.amount}
                                    onChange={(e) => form.setData('amount', e.target.value)}
                                />
                                <InputError message={form.errors.amount} className="mt-1" />
                            </div>

                            <div>
                                <InputLabel htmlFor="date" value={t('Date *')} />
                                <TextInput
                                    id="date"
                                    type="date"
                                    className="mt-1 block w-full"
                                    value={form.data.date}
                                    onChange={(e) => form.setData('date', e.target.value)}
                                />
                                <InputError message={form.errors.date} className="mt-1" />
                            </div>
                        </div>

                        {/* Catégorie et Référence */}
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div>
                                <InputLabel htmlFor="category" value={t('Catégorie')} />
                                <select
                                    id="category"
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
                                    value={form.data.category}
                                    onChange={(e) => form.setData('category', e.target.value)}
                                >
                                    <option value="">{t('— Aucune catégorie —')}</option>
                                    {CATEGORY_KEYS.map((c) => (
                                        <option key={c} value={c}>{t(TRANSACTION_CATEGORY[c])}</option>
                                    ))}
                                </select>
                                <InputError message={form.errors.category} className="mt-1" />
                            </div>

                            <div>
                                <InputLabel htmlFor="reference" value={t('Référence')} />
                                <TextInput
                                    id="reference"
                                    className="mt-1 block w-full"
                                    value={form.data.reference}
                                    onChange={(e) => form.setData('reference', e.target.value)}
                                />
                                <InputError message={form.errors.reference} className="mt-1" />
                            </div>
                        </div>

                        {/* Projet */}
                        {projects.length > 0 && (
                            <div>
                                <InputLabel htmlFor="project_id" value={t('Projet associé')} />
                                <select
                                    id="project_id"
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
                                    value={form.data.project_id}
                                    onChange={(e) => form.setData('project_id', e.target.value)}
                                >
                                    <option value="">{t('— Aucun projet —')}</option>
                                    {projects.map((p) => (
                                        <option key={p.id} value={p.id}>{p.name}</option>
                                    ))}
                                </select>
                                <InputError message={form.errors.project_id} className="mt-1" />
                            </div>
                        )}

                        {/* Description */}
                        <div>
                            <InputLabel htmlFor="description" value={t('Description')} />
                            <TextInput
                                id="description"
                                className="mt-1 block w-full"
                                value={form.data.description}
                                onChange={(e) => form.setData('description', e.target.value)}
                            />
                            <InputError message={form.errors.description} className="mt-1" />
                        </div>

                        {/* Actions */}
                        <div className="flex justify-end gap-3 pt-2">
                            <SecondaryButton
                                type="button"
                                onClick={() => window.history.back()}
                            >
                                {t('Annuler')}
                            </SecondaryButton>
                            <PrimaryButton
                                disabled={form.processing}
                                className="bg-orange-500 hover:bg-orange-600 focus:bg-orange-600"
                            >
                                {t('Enregistrer les modifications')}
                            </PrimaryButton>
                        </div>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}
