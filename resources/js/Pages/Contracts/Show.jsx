import { useState } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import Icon from '@/Components/Icon';
import Modal from '@/Components/Modal';
import SecondaryButton from '@/Components/SecondaryButton';
import DangerButton from '@/Components/DangerButton';
import SignatureBlock from '@/Components/SignatureBlock';
import { Head, Link, router } from '@inertiajs/react';
import { formatMoney } from '@/constants';
import { useTrans } from '@/i18n';

// ─── Dictionnaires de libellés ──────────────────────────────────────────────

const CONTRACT_STATUS = {
    draft:     { label: 'Brouillon', color: 'bg-slate-100 text-slate-600' },
    active:    { label: 'Actif',     color: 'bg-green-100 text-green-700' },
    suspended: { label: 'Suspendu',  color: 'bg-amber-100 text-amber-700' },
    closed:    { label: 'Clôturé',   color: 'bg-blue-100 text-blue-700' },
    cancelled: { label: 'Annulé',    color: 'bg-red-100 text-red-700' },
};

const CONTRACT_TYPE = {
    client:         'Client',
    sous_traitance: 'Sous-traitance',
    fournisseur:    'Fournisseur',
    autre:          'Autre',
};

// ─── Composants utilitaires ──────────────────────────────────────────────────

function StatusBadge({ status }) {
    const { t } = useTrans();
    const s = CONTRACT_STATUS[status] ?? { label: status, color: 'bg-slate-100 text-slate-600' };
    return (
        <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${s.color}`}>
            {t(s.label)}
        </span>
    );
}

function KpiCard({ icon, label, value, sub, accent }) {
    return (
        <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between">
                <span className="text-xs font-medium uppercase tracking-wider text-slate-400">{label}</span>
                <Icon name={icon} className={`h-4 w-4 ${accent ?? 'text-orange-500'}`} />
            </div>
            <div className="mt-2 text-xl font-bold text-slate-800 dark:text-slate-100">{value}</div>
            {sub && <div className="mt-0.5 text-xs text-slate-400">{sub}</div>}
        </div>
    );
}

function SectionTitle({ icon, children }) {
    return (
        <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            <Icon name={icon} className="h-4 w-4 text-orange-500" />
            {children}
        </h3>
    );
}

// ─── Modale « Envoyer pour signature » ──────────────────────────────────────

function SendSignatureModal({ contract, open, onClose }) {
    const { t } = useTrans();
    const [email, setEmail] = useState('');
    const [sending, setSending] = useState(false);

    const send = () => {
        if (!email.trim()) return;
        setSending(true);
        router.post(
            `/contracts/${contract.id}/send-signature`,
            { email: email.trim() },
            {
                onFinish: () => {
                    setSending(false);
                    onClose();
                    setEmail('');
                },
            }
        );
    };

    return (
        <Modal show={open} onClose={onClose} maxWidth="md">
            <div className="p-6">
                <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
                    {t('Envoyer pour signature')}
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                    {t('Un lien de signature électronique sera envoyé à l\'adresse indiquée.')}
                </p>
                <div className="mt-4">
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                        {t('Email du destinataire')} *
                    </label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-orange-400 focus:outline-none focus:ring-1 focus:ring-orange-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                        placeholder="exemple@domaine.com"
                    />
                </div>
                <div className="mt-6 flex justify-end gap-3">
                    <SecondaryButton type="button" onClick={onClose}>{t('Annuler')}</SecondaryButton>
                    <button
                        type="button"
                        onClick={send}
                        disabled={!email.trim() || sending}
                        className="inline-flex items-center gap-2 rounded-md bg-orange-500 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        <Icon name="send" className="h-4 w-4" />
                        {sending ? t('Envoi…') : t('Envoyer')}
                    </button>
                </div>
            </div>
        </Modal>
    );
}

// ─── Page principale ─────────────────────────────────────────────────────────

export default function Show({ contract, avancement, documents, can }) {
    const { t } = useTrans();
    const [confirmDelete, setConfirmDelete]   = useState(false);
    const [sendSigOpen, setSendSigOpen]       = useState(false);

    const deleteContract = () => router.delete(`/contracts/${contract.id}`);

    const fmtDate = (d) => (d ? new Date(d).toLocaleDateString('fr-FR') : '—');
    const fmtDatetime = (d) =>
        d ? new Date(d).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' }) : '—';

    const isSigned = Boolean(contract.signed_at);
    const sigCount = isSigned ? 1 : 0;

    // Couleur barre d'avancement
    const progressColor =
        avancement >= 100 ? 'bg-blue-500' :
        avancement >= 75  ? 'bg-orange-500' :
        avancement >= 40  ? 'bg-amber-400' :
        'bg-green-500';

    return (
        <AppLayout header="Fiche contrat">
            <Head title={contract.title} />

            {/* ── En-tête ── */}
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                    <div className="flex flex-wrap items-center gap-2">
                        <Link href="/contracts" className="text-slate-400 hover:text-orange-600">
                            <Icon name="arrow-left" className="h-5 w-5" />
                        </Link>
                        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
                            {contract.title}
                        </h2>
                        <StatusBadge status={contract.status} />
                    </div>
                    <p className="ml-7 mt-0.5 text-sm text-slate-400">
                        <span className="font-mono font-medium text-slate-500">{contract.code}</span>
                        {' · '}{t(CONTRACT_TYPE[contract.type] ?? contract.type)}
                        {contract.party_name ? ` · ${contract.party_name}` : ''}
                        {contract.project ? ` · ${contract.project.name}` : ''}
                    </p>
                </div>

                {/* Boutons d'action */}
                <div className="flex flex-wrap gap-2">
                    <a
                        href={`/contracts/${contract.id}/pdf`}
                        target="_blank" rel="noopener"
                        className="inline-flex items-center gap-2 rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                    >
                        <Icon name="file-down" className="h-4 w-4" />
                        {t('Télécharger PDF')}
                    </a>

                    {can.sign && !isSigned && (
                        <button
                            type="button"
                            onClick={() => setSendSigOpen(true)}
                            className="inline-flex items-center gap-2 rounded-md border border-orange-300 px-3 py-2 text-sm font-medium text-orange-700 hover:bg-orange-50 dark:border-orange-700 dark:text-orange-300 dark:hover:bg-orange-950/30"
                        >
                            <Icon name="send" className="h-4 w-4" />
                            {t('Envoyer pour signature')}
                        </button>
                    )}

                    {contract.verify_token && (
                        <a
                            href={`/verify/${contract.verify_token}`}
                            target="_blank" rel="noopener"
                            className="inline-flex items-center gap-2 rounded-md border border-green-300 px-3 py-2 text-sm font-medium text-green-700 hover:bg-green-50 dark:border-green-700 dark:text-green-300"
                        >
                            <Icon name="shield-check" className="h-4 w-4" />
                            {t('Vérifier')}
                        </a>
                    )}

                    {can.update && (
                        <Link
                            href={`/contracts/${contract.id}/edit`}
                            className="inline-flex items-center gap-2 rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                        >
                            <Icon name="pencil" className="h-4 w-4" />
                            {t('Modifier')}
                        </Link>
                    )}

                    {can.delete && (
                        <button
                            onClick={() => setConfirmDelete(true)}
                            className="inline-flex items-center gap-2 rounded-md border border-red-200 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:border-red-900/50"
                        >
                            <Icon name="trash-2" className="h-4 w-4" />
                            {t('Supprimer')}
                        </button>
                    )}
                </div>
            </div>

            {/* ── KPIs ── */}
            <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
                <KpiCard
                    icon="wallet"
                    label={t('Montant')}
                    value={formatMoney(contract.amount, contract.currency)}
                    sub={contract.currency}
                />
                <KpiCard
                    icon="trending-up"
                    label={t('Avancement')}
                    value={`${avancement} %`}
                    sub={`${fmtDate(contract.start_date)} → ${fmtDate(contract.end_date)}`}
                />
                <KpiCard
                    icon="pen-line"
                    label={t('Signatures')}
                    value={sigCount === 1 ? t('Signé') : t('Non signé')}
                    sub={isSigned ? fmtDatetime(contract.signed_at) : '—'}
                    accent={isSigned ? 'text-green-500' : 'text-slate-400'}
                />
                <KpiCard
                    icon="circle-dot"
                    label={t('Statut')}
                    value={t(CONTRACT_STATUS[contract.status]?.label ?? contract.status)}
                    sub={fmtDate(contract.signed_date)}
                />
            </div>

            {/* Barre de progression */}
            <div className="mb-6 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
                <div className="mb-1.5 flex justify-between text-xs text-slate-500">
                    <span>{t('Progression temporelle du contrat')}</span>
                    <span className="font-semibold">{avancement} %</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                    <div
                        className={`h-2 rounded-full transition-all ${progressColor}`}
                        style={{ width: `${avancement}%` }}
                    />
                </div>
            </div>

            {/* ── Clauses / Description ── */}
            {contract.notes && (
                <div className="mb-6 rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
                    <SectionTitle icon="file-text">{t('Clauses et description')}</SectionTitle>
                    <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                        {contract.notes}
                    </p>
                </div>
            )}

            {/* ── Signature ── */}
            <div className="mb-6 rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
                <SectionTitle icon="shield-check">{t('Signatures')}</SectionTitle>

                {isSigned ? (
                    <div className="flex items-start gap-3 rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-900/50 dark:bg-green-950/30">
                        <Icon name="shield-check" className="mt-0.5 h-5 w-5 shrink-0 text-green-600" />
                        <div className="text-sm">
                            <p className="font-semibold text-green-800 dark:text-green-300">
                                {t('Signé électroniquement')}
                            </p>
                            <p className="mt-0.5 text-green-700 dark:text-green-400">
                                {t('Par')} <strong>{contract.signed_by}</strong>{' '}
                                {t('le')} {fmtDatetime(contract.signed_at)}
                            </p>
                            {contract.signature_hash && (
                                <p className="mt-1 font-mono text-xs text-green-600 dark:text-green-500">
                                    {t('Empreinte')} : {contract.signature_hash.slice(0, 24)}…
                                </p>
                            )}
                            {contract.signature_ip && (
                                <p className="mt-0.5 text-xs text-green-600/70 dark:text-green-500/70">
                                    IP : {contract.signature_ip}
                                </p>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="flex items-center gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-900/50 dark:bg-amber-950/30">
                        <Icon name="clock" className="h-5 w-5 shrink-0 text-amber-500" />
                        <p className="text-sm text-amber-800 dark:text-amber-300">
                            {t('Ce contrat n\'a pas encore été signé.')}
                        </p>
                    </div>
                )}

                {/* Bouton signer (délégué à SignatureBlock si non signé) */}
                {!isSigned && <SignatureBlock record={contract} model="contract" can={can} />}
            </div>

            {/* ── Documents attachés ── */}
            <div className="mb-6 rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
                <SectionTitle icon="paperclip">{t('Documents attachés')}</SectionTitle>

                {documents && documents.length > 0 ? (
                    <ul className="divide-y divide-slate-100 dark:divide-slate-800">
                        {documents.map((doc) => (
                            <li key={doc.id} className="flex items-center justify-between py-2.5 text-sm">
                                <div className="flex items-center gap-2">
                                    <Icon name="file" className="h-4 w-4 text-slate-400" />
                                    <span className="text-slate-700 dark:text-slate-200">{doc.name}</span>
                                </div>
                                <a
                                    href={doc.url}
                                    target="_blank" rel="noopener"
                                    className="text-xs text-orange-600 hover:underline"
                                >
                                    {t('Télécharger')}
                                </a>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <div className="flex flex-col items-center justify-center py-8 text-center text-slate-400">
                        <Icon name="paperclip" className="mb-2 h-8 w-8" />
                        <p className="text-sm">{t('Aucun document attaché.')}</p>
                        <p className="mt-0.5 text-xs text-slate-300 dark:text-slate-600">
                            {t('Le module Documents sera disponible prochainement.')}
                        </p>
                    </div>
                )}
            </div>

            {/* ── Modale envoi pour signature ── */}
            <SendSignatureModal
                contract={contract}
                open={sendSigOpen}
                onClose={() => setSendSigOpen(false)}
            />

            {/* ── Modale suppression ── */}
            <Modal show={confirmDelete} onClose={() => setConfirmDelete(false)} maxWidth="md">
                <div className="p-6">
                    <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
                        {t('Supprimer ce contrat ?')}
                    </h3>
                    <p className="mt-2 text-sm text-slate-500">
                        {t('Le contrat')} « {contract.title} »{' '}
                        {t('sera supprimé. Cette action est réversible (corbeille).')}
                    </p>
                    <div className="mt-6 flex justify-end gap-3">
                        <SecondaryButton type="button" onClick={() => setConfirmDelete(false)}>
                            {t('Annuler')}
                        </SecondaryButton>
                        <DangerButton onClick={deleteContract}>
                            {t('Supprimer définitivement')}
                        </DangerButton>
                    </div>
                </div>
            </Modal>
        </AppLayout>
    );
}
