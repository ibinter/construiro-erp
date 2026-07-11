import { useState } from 'react';
import { useForm } from '@inertiajs/react';
import Modal from '@/Components/Modal';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import Icon from '@/Components/Icon';
import { useTrans } from '@/i18n';

const OPERATORS = [
    { value: 'orange_money', label: 'Orange Money', color: 'bg-orange-100 text-orange-700 border-orange-300', dot: 'bg-orange-500' },
    { value: 'mtn_momo',     label: 'MTN MoMo',     color: 'bg-yellow-100 text-yellow-700 border-yellow-300', dot: 'bg-yellow-400' },
    { value: 'wave',         label: 'Wave',          color: 'bg-blue-100 text-blue-700 border-blue-300',       dot: 'bg-blue-500' },
];

export default function MobileMoneyButton({ invoice, can }) {
    const { t } = useTrans();
    const [open, setOpen] = useState(false);

    const balance = Number(invoice.balance ?? 0);

    const form = useForm({
        operator:     'orange_money',
        phone_number: '',
        amount:       balance > 0 ? String(balance) : '',
    });

    if (!can?.update || balance <= 0) return null;

    const submit = (e) => {
        e.preventDefault();
        form.post(`/invoices/${invoice.id}/mobile-money`, {
            onSuccess: () => {
                setOpen(false);
                form.reset();
            },
        });
    };

    const close = () => {
        setOpen(false);
        form.reset();
        form.clearErrors();
    };

    return (
        <>
            <button
                type="button"
                onClick={() => setOpen(true)}
                className="inline-flex items-center gap-2 rounded-md bg-orange-500 px-3 py-2 text-sm font-medium text-white hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-offset-1"
            >
                <Icon name="smartphone" className="h-4 w-4" />
                {t('Payer par Mobile Money')}
            </button>

            <Modal show={open} onClose={close} maxWidth="md">
                <form onSubmit={submit} className="p-6">
                    <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
                        {t('Paiement Mobile Money')}
                    </h3>
                    <p className="mt-1 text-sm text-slate-500">
                        {t('Reste à payer')} :{' '}
                        <span className="font-medium text-orange-600">
                            {Number(balance).toLocaleString('fr-FR')} {invoice.currency ?? 'XOF'}
                        </span>
                    </p>

                    {/* Sélecteur opérateur */}
                    <div className="mt-4">
                        <InputLabel value={t('Opérateur')} />
                        <div className="mt-2 grid grid-cols-3 gap-2">
                            {OPERATORS.map((op) => (
                                <button
                                    key={op.value}
                                    type="button"
                                    onClick={() => form.setData('operator', op.value)}
                                    className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-all focus:outline-none ${
                                        form.data.operator === op.value
                                            ? `${op.color} ring-2 ring-offset-1 ring-current`
                                            : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800'
                                    }`}
                                >
                                    <span className={`inline-block h-2.5 w-2.5 rounded-full ${op.dot}`} />
                                    {op.label}
                                </button>
                            ))}
                        </div>
                        <InputError message={form.errors.operator} className="mt-1" />
                    </div>

                    {/* Numéro de téléphone */}
                    <div className="mt-4">
                        <InputLabel htmlFor="phone_number" value={t('Numéro de téléphone')} />
                        <TextInput
                            id="phone_number"
                            type="tel"
                            placeholder="+2250700000000"
                            className="mt-1 block w-full"
                            value={form.data.phone_number}
                            onChange={(e) => form.setData('phone_number', e.target.value)}
                            autoFocus
                        />
                        <InputError message={form.errors.phone_number} className="mt-1" />
                    </div>

                    {/* Montant */}
                    <div className="mt-4">
                        <InputLabel htmlFor="mm_amount" value={t('Montant') + ` (${invoice.currency ?? 'XOF'})`} />
                        <TextInput
                            id="mm_amount"
                            type="number"
                            min="1"
                            step="1"
                            max={balance}
                            className="mt-1 block w-full"
                            value={form.data.amount}
                            onChange={(e) => form.setData('amount', e.target.value)}
                        />
                        <InputError message={form.errors.amount} className="mt-1" />
                    </div>

                    <div className="mt-6 flex justify-end gap-3">
                        <SecondaryButton type="button" onClick={close}>
                            {t('Annuler')}
                        </SecondaryButton>
                        <PrimaryButton
                            disabled={form.processing}
                            className="bg-orange-500 hover:bg-orange-600 focus:bg-orange-600"
                        >
                            <Icon name="send" className="mr-1.5 h-4 w-4" />
                            {form.processing ? t('Envoi…') : t('Confirmer le paiement')}
                        </PrimaryButton>
                    </div>
                </form>
            </Modal>
        </>
    );
}
