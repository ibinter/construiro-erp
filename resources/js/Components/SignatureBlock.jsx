import { useState } from 'react';
import { router } from '@inertiajs/react';
import Modal from '@/Components/Modal';
import SecondaryButton from '@/Components/SecondaryButton';
import Icon from '@/Components/Icon';
import { useTrans } from '@/i18n';

/**
 * Bloc de signature électronique simple côté serveur (SHA-256).
 *
 * Props :
 *   record  — objet Quote ou Contract (doit avoir id, signed_at, signed_by, signature_hash)
 *   model   — 'quote' | 'contract'
 *   can     — { sign: bool }
 */
export default function SignatureBlock({ record, model, can }) {
    const { t } = useTrans();
    const [open, setOpen]         = useState(false);
    const [name, setName]         = useState('');
    const [certified, setCertified] = useState(false);
    const [loading, setLoading]   = useState(false);

    const fmtDate = (d) =>
        d ? new Date(d).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' }) : '—';

    const handleSign = () => {
        if (!name.trim() || !certified) return;
        setLoading(true);
        router.post(
            `/sign/${model}/${record.id}`,
            { signed_by: name.trim() },
            {
                onFinish: () => {
                    setLoading(false);
                    setOpen(false);
                    setName('');
                    setCertified(false);
                },
            }
        );
    };

    /* --- Document déjà signé ------------------------------------------------ */
    if (record.signed_at) {
        return (
            <div className="mt-6 flex items-start gap-3 rounded-xl border border-green-200 bg-green-50 p-4 dark:border-green-900/50 dark:bg-green-950/30">
                <Icon name="shield-check" className="mt-0.5 h-5 w-5 shrink-0 text-green-600" />
                <div className="text-sm">
                    <p className="font-semibold text-green-800 dark:text-green-300">
                        {t('Signé électroniquement')}
                    </p>
                    <p className="mt-0.5 text-green-700 dark:text-green-400">
                        {t('Par')} <strong>{record.signed_by}</strong>{' '}
                        {t('le')} {fmtDate(record.signed_at)}
                    </p>
                    {record.signature_hash && (
                        <p className="mt-1 font-mono text-xs text-green-600 dark:text-green-500">
                            {t('Empreinte')} : {record.signature_hash.slice(0, 16)}…
                        </p>
                    )}
                </div>
            </div>
        );
    }

    /* --- Bouton de signature ------------------------------------------------- */
    if (!can?.sign) return null;

    return (
        <>
            <div className="mt-6 flex justify-end">
                <button
                    type="button"
                    onClick={() => setOpen(true)}
                    className="inline-flex items-center gap-2 rounded-md bg-orange-500 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-offset-2"
                >
                    <Icon name="pen-line" className="h-4 w-4" />
                    {t('Signer ce document')}
                </button>
            </div>

            {/* Modal de signature */}
            <Modal show={open} onClose={() => setOpen(false)} maxWidth="md">
                <div className="p-6">
                    <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
                        {t('Signature électronique')}
                    </h3>
                    <p className="mt-1 text-sm text-slate-500">
                        {t('Votre signature sera horodatée et liée à ce document de façon permanente.')}
                    </p>

                    <div className="mt-4">
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                            {t('Votre nom complet')} *
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-orange-400 focus:outline-none focus:ring-1 focus:ring-orange-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                            placeholder={t('Prénom Nom')}
                        />
                    </div>

                    <div className="mt-4 flex items-start gap-2">
                        <input
                            id="sig-certify"
                            type="checkbox"
                            checked={certified}
                            onChange={(e) => setCertified(e.target.checked)}
                            className="mt-0.5 h-4 w-4 rounded border-slate-300 text-orange-500 focus:ring-orange-400"
                        />
                        <label htmlFor="sig-certify" className="text-sm text-slate-600 dark:text-slate-300">
                            {t('Je certifie avoir lu et approuvé ce document')}
                        </label>
                    </div>

                    <div className="mt-6 flex justify-end gap-3">
                        <SecondaryButton type="button" onClick={() => setOpen(false)}>
                            {t('Annuler')}
                        </SecondaryButton>
                        <button
                            type="button"
                            onClick={handleSign}
                            disabled={!name.trim() || !certified || loading}
                            className="inline-flex items-center gap-2 rounded-md bg-orange-500 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            <Icon name="pen-line" className="h-4 w-4" />
                            {loading ? t('Signature en cours…') : t('Signer')}
                        </button>
                    </div>
                </div>
            </Modal>
        </>
    );
}
