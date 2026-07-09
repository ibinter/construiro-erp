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
import { formatMoney } from '@/constants';
import { useTrans } from '@/i18n';

// Libellés et styles des types de compte de trésorerie (FR).
export const ACCOUNT_TYPE = {
    caisse:       { label: 'Caisse',       color: 'bg-amber-100 text-amber-700', icon: 'wallet' },
    banque:       { label: 'Banque',       color: 'bg-blue-100 text-blue-700',   icon: 'landmark' },
    mobile_money: { label: 'Mobile Money', color: 'bg-orange-100 text-orange-700', icon: 'smartphone' },
};

// Libellés des types de transaction.
export const TRANSACTION_TYPE = {
    in:  { label: 'Entrée', color: 'bg-green-100 text-green-700' },
    out: { label: 'Sortie', color: 'bg-red-100 text-red-700' },
};

// Libellés des catégories de transaction.
export const TRANSACTION_CATEGORY = {
    encaissement_client: 'Encaissement client',
    achat:               'Achat / Fournisseur',
    salaire:             'Salaire',
    carburant:           'Carburant',
    autre:               'Autre',
};

const CATEGORY_KEYS = Object.keys(TRANSACTION_CATEGORY);

const today = () => new Date().toISOString().slice(0, 10);

export default function Index({ accounts, totalBalance, transactions, types, accountTypes, can }) {
    const { t } = useTrans();
    const [showAccountModal, setShowAccountModal] = useState(false);
    const [showTxModal, setShowTxModal] = useState(false);

    const accountForm = useForm({
        name: '',
        type: 'caisse',
        bank_name: '',
        account_number: '',
        currency: 'XOF',
        opening_balance: 0,
    });

    const txForm = useForm({
        cash_account_id: accounts[0]?.id ?? '',
        type: 'in',
        category: 'encaissement_client',
        amount: 0,
        date: today(),
        reference: '',
        description: '',
    });

    const submitAccount = (e) => {
        e.preventDefault();
        accountForm.post('/treasury/accounts', {
            preserveScroll: true,
            onSuccess: () => { accountForm.reset(); setShowAccountModal(false); },
        });
    };

    const submitTx = (e) => {
        e.preventDefault();
        txForm.post('/treasury/transactions', {
            preserveScroll: true,
            onSuccess: () => { txForm.reset(); txForm.setData('date', today()); setShowTxModal(false); },
        });
    };

    const fmtDate = (d) => (d ? new Date(d).toLocaleDateString('fr-FR') : '—');

    return (
        <AppLayout header="Trésorerie">
            <Head title="Trésorerie" />

            {/* Barre d'actions */}
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
                {can.create && (
                    <div className="flex flex-wrap gap-2">
                        <button
                            onClick={() => setShowAccountModal(true)}
                            className="inline-flex items-center gap-2 rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                        >
                            <Icon name="plus" className="h-4 w-4" />
                            {t('Nouveau compte')}
                        </button>
                        <button
                            onClick={() => setShowTxModal(true)}
                            disabled={accounts.length === 0}
                            className="inline-flex items-center gap-2 rounded-md bg-orange-500 px-4 py-2 text-sm font-medium text-white hover:bg-orange-600 disabled:opacity-40"
                        >
                            <Icon name="plus" className="h-4 w-4" />
                            {t('Nouvelle transaction')}
                        </button>
                    </div>
                )}
            </div>

            {/* Cartes des comptes + solde consolidé */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {/* Solde total consolidé */}
                <div className="rounded-xl border border-orange-200 bg-orange-50 p-5 dark:border-orange-900/50 dark:bg-orange-950/30">
                    <div className="flex items-center gap-2 text-sm font-medium text-orange-700 dark:text-orange-300">
                        <Icon name="wallet" className="h-5 w-5" />
                        {t('Solde total consolidé')}
                    </div>
                    <div className="mt-3 text-2xl font-bold text-orange-700 dark:text-orange-300">
                        {formatMoney(totalBalance)}
                    </div>
                    <div className="mt-1 text-xs text-orange-600/70 dark:text-orange-400/70">
                        {accounts.length} {accounts.length > 1 ? t('comptes') : t('compte')}
                    </div>
                </div>

                {accounts.map((acc) => {
                    const ty = ACCOUNT_TYPE[acc.type] ?? { label: acc.type, color: 'bg-slate-100 text-slate-600', icon: 'wallet' };
                    return (
                        <Link
                            key={acc.id}
                            href={`/treasury/accounts/${acc.id}`}
                            className="rounded-xl border border-slate-200 bg-white p-5 transition hover:border-orange-300 hover:shadow-sm dark:border-slate-800 dark:bg-slate-900"
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-2">
                                    <Icon name={ty.icon} className="h-5 w-5 text-slate-400" />
                                    <span className="font-semibold text-slate-800 dark:text-slate-100">{acc.name}</span>
                                </div>
                                <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${ty.color}`}>{t(ty.label)}</span>
                            </div>
                            {acc.bank_name && (
                                <div className="mt-1 text-xs text-slate-400">{acc.bank_name}</div>
                            )}
                            <div className="mt-3 text-xl font-bold text-slate-800 dark:text-slate-100">
                                {formatMoney(acc.balance, acc.currency)}
                            </div>
                            <div className="mt-1 text-xs text-slate-400">
                                {t('Ouverture')} : {formatMoney(acc.opening_balance, acc.currency)}
                            </div>
                        </Link>
                    );
                })}

                {accounts.length === 0 && (
                    <div className="col-span-full rounded-xl border border-dashed border-slate-300 p-12 text-center text-slate-400 dark:border-slate-700">
                        <Icon name="wallet" className="mx-auto mb-2 h-8 w-8" />
                        {t('Aucun compte de trésorerie. Créez-en un pour commencer.')}
                    </div>
                )}
            </div>

            {/* Dernières transactions */}
            <div className="mt-6 overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
                <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 dark:border-slate-800">
                    <h3 className="flex items-center gap-2 font-semibold text-slate-800 dark:text-slate-100">
                        <Icon name="arrow-left-right" className="h-5 w-5 text-orange-500" />
                        {t('Dernières transactions')}
                    </h3>
                </div>
                <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
                    <thead className="bg-slate-50 dark:bg-slate-800/50">
                        <tr className="text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                            <th className="px-4 py-3">{t('Date')}</th>
                            <th className="px-4 py-3">{t('Compte')}</th>
                            <th className="px-4 py-3">{t('Type')}</th>
                            <th className="px-4 py-3">{t('Catégorie')}</th>
                            <th className="px-4 py-3 text-right">{t('Montant')}</th>
                            <th className="px-4 py-3">{t('Description')}</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {transactions.map((tx) => {
                            const ty = TRANSACTION_TYPE[tx.type] ?? { label: tx.type, color: 'bg-slate-100 text-slate-600' };
                            return (
                                <tr key={tx.id} className="text-sm hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                    <td className="px-4 py-3 text-slate-500">{fmtDate(tx.date)}</td>
                                    <td className="px-4 py-3 text-slate-700 dark:text-slate-200">{tx.cash_account?.name}</td>
                                    <td className="px-4 py-3">
                                        <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${ty.color}`}>{t(ty.label)}</span>
                                    </td>
                                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                                        {t(TRANSACTION_CATEGORY[tx.category] ?? tx.category ?? '—')}
                                    </td>
                                    <td className={`px-4 py-3 text-right font-medium ${tx.type === 'in' ? 'text-green-600' : 'text-red-600'}`}>
                                        {tx.type === 'in' ? '+' : '−'} {formatMoney(tx.amount)}
                                    </td>
                                    <td className="px-4 py-3 text-slate-500">{tx.description ?? '—'}</td>
                                </tr>
                            );
                        })}

                        {transactions.length === 0 && (
                            <tr>
                                <td colSpan={6} className="px-4 py-12 text-center text-slate-400">
                                    <Icon name="arrow-left-right" className="mx-auto mb-2 h-8 w-8" />
                                    {t('Aucune transaction enregistrée.')}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modal nouveau compte */}
            <Modal show={showAccountModal} onClose={() => setShowAccountModal(false)}>
                <form onSubmit={submitAccount} className="p-6">
                    <h3 className="mb-4 text-lg font-semibold text-slate-800 dark:text-slate-100">{t('Nouveau compte de trésorerie')}</h3>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div className="sm:col-span-2">
                            <InputLabel htmlFor="acc_name" value={t('Nom du compte *')} />
                            <TextInput id="acc_name" className="mt-1 block w-full" placeholder={t('Caisse principale')}
                                value={accountForm.data.name} onChange={(e) => accountForm.setData('name', e.target.value)} />
                            <InputError message={accountForm.errors.name} className="mt-1" />
                        </div>
                        <div>
                            <InputLabel htmlFor="acc_type" value="Type *" />
                            <select
                                id="acc_type"
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
                                value={accountForm.data.type}
                                onChange={(e) => accountForm.setData('type', e.target.value)}
                            >
                                {accountTypes.map((t) => (
                                    <option key={t} value={t}>{ACCOUNT_TYPE[t]?.label ?? t}</option>
                                ))}
                            </select>
                            <InputError message={accountForm.errors.type} className="mt-1" />
                        </div>
                        <div>
                            <InputLabel htmlFor="acc_currency" value="Devise *" />
                            <TextInput id="acc_currency" className="mt-1 block w-full" maxLength={3}
                                value={accountForm.data.currency} onChange={(e) => accountForm.setData('currency', e.target.value.toUpperCase())} />
                            <InputError message={accountForm.errors.currency} className="mt-1" />
                        </div>
                        <div>
                            <InputLabel htmlFor="acc_bank" value="Banque / Opérateur" />
                            <TextInput id="acc_bank" className="mt-1 block w-full" placeholder="SGBCI, Orange…"
                                value={accountForm.data.bank_name} onChange={(e) => accountForm.setData('bank_name', e.target.value)} />
                            <InputError message={accountForm.errors.bank_name} className="mt-1" />
                        </div>
                        <div>
                            <InputLabel htmlFor="acc_number" value="N° de compte / téléphone" />
                            <TextInput id="acc_number" className="mt-1 block w-full"
                                value={accountForm.data.account_number} onChange={(e) => accountForm.setData('account_number', e.target.value)} />
                            <InputError message={accountForm.errors.account_number} className="mt-1" />
                        </div>
                        <div className="sm:col-span-2">
                            <InputLabel htmlFor="acc_opening" value="Solde d'ouverture *" />
                            <TextInput id="acc_opening" type="number" step="0.01" className="mt-1 block w-full"
                                value={accountForm.data.opening_balance} onChange={(e) => accountForm.setData('opening_balance', e.target.value)} />
                            <InputError message={accountForm.errors.opening_balance} className="mt-1" />
                        </div>
                    </div>
                    <div className="mt-6 flex justify-end gap-3">
                        <SecondaryButton type="button" onClick={() => setShowAccountModal(false)}>Annuler</SecondaryButton>
                        <PrimaryButton disabled={accountForm.processing} className="bg-orange-500 hover:bg-orange-600 focus:bg-orange-600">
                            Créer le compte
                        </PrimaryButton>
                    </div>
                </form>
            </Modal>

            {/* Modal nouvelle transaction */}
            <Modal show={showTxModal} onClose={() => setShowTxModal(false)}>
                <form onSubmit={submitTx} className="p-6">
                    <h3 className="mb-4 text-lg font-semibold text-slate-800 dark:text-slate-100">Nouvelle transaction</h3>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div>
                            <InputLabel htmlFor="tx_type" value="Type *" />
                            <select
                                id="tx_type"
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
                                value={txForm.data.type}
                                onChange={(e) => txForm.setData('type', e.target.value)}
                            >
                                {types.map((t) => (
                                    <option key={t} value={t}>{TRANSACTION_TYPE[t]?.label ?? t}</option>
                                ))}
                            </select>
                            <InputError message={txForm.errors.type} className="mt-1" />
                        </div>
                        <div>
                            <InputLabel htmlFor="tx_account" value="Compte *" />
                            <select
                                id="tx_account"
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
                                value={txForm.data.cash_account_id}
                                onChange={(e) => txForm.setData('cash_account_id', e.target.value)}
                            >
                                {accounts.map((a) => (
                                    <option key={a.id} value={a.id}>{a.name}</option>
                                ))}
                            </select>
                            <InputError message={txForm.errors.cash_account_id} className="mt-1" />
                        </div>
                        <div>
                            <InputLabel htmlFor="tx_amount" value="Montant *" />
                            <TextInput id="tx_amount" type="number" min={0} step="0.01" className="mt-1 block w-full"
                                value={txForm.data.amount} onChange={(e) => txForm.setData('amount', e.target.value)} />
                            <InputError message={txForm.errors.amount} className="mt-1" />
                        </div>
                        <div>
                            <InputLabel htmlFor="tx_category" value="Catégorie" />
                            <select
                                id="tx_category"
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
                                value={txForm.data.category}
                                onChange={(e) => txForm.setData('category', e.target.value)}
                            >
                                {CATEGORY_KEYS.map((c) => (
                                    <option key={c} value={c}>{TRANSACTION_CATEGORY[c]}</option>
                                ))}
                            </select>
                            <InputError message={txForm.errors.category} className="mt-1" />
                        </div>
                        <div>
                            <InputLabel htmlFor="tx_date" value="Date *" />
                            <TextInput id="tx_date" type="date" className="mt-1 block w-full"
                                value={txForm.data.date} onChange={(e) => txForm.setData('date', e.target.value)} />
                            <InputError message={txForm.errors.date} className="mt-1" />
                        </div>
                        <div>
                            <InputLabel htmlFor="tx_reference" value="Référence" />
                            <TextInput id="tx_reference" className="mt-1 block w-full"
                                value={txForm.data.reference} onChange={(e) => txForm.setData('reference', e.target.value)} />
                            <InputError message={txForm.errors.reference} className="mt-1" />
                        </div>
                        <div className="sm:col-span-2">
                            <InputLabel htmlFor="tx_description" value="Description" />
                            <TextInput id="tx_description" className="mt-1 block w-full"
                                value={txForm.data.description} onChange={(e) => txForm.setData('description', e.target.value)} />
                            <InputError message={txForm.errors.description} className="mt-1" />
                        </div>
                    </div>
                    <div className="mt-6 flex justify-end gap-3">
                        <SecondaryButton type="button" onClick={() => setShowTxModal(false)}>Annuler</SecondaryButton>
                        <PrimaryButton disabled={txForm.processing} className="bg-orange-500 hover:bg-orange-600 focus:bg-orange-600">
                            Enregistrer la transaction
                        </PrimaryButton>
                    </div>
                </form>
            </Modal>
        </AppLayout>
    );
}
