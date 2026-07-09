import { useState } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import Icon from '@/Components/Icon';
import Modal from '@/Components/Modal';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import { Head, router, useForm } from '@inertiajs/react';
import { useTrans } from '@/i18n';

// Libellés et couleurs des statuts (FR) — locaux à ce module.
const STATUS = {
    pending: { label: 'En attente', color: 'bg-amber-100 text-amber-700' },
    signed:  { label: 'Signé',      color: 'bg-green-100 text-green-700' },
    refused: { label: 'Refusé',     color: 'bg-red-100 text-red-700' },
    expired: { label: 'Expiré',     color: 'bg-slate-100 text-slate-600' },
};

function StatusBadge({ status }) {
    const { t } = useTrans();
    const s = STATUS[status] ?? { label: status, color: 'bg-slate-100 text-slate-600' };
    return <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${s.color}`}>{t(s.label)}</span>;
}

export default function Index({ requests, filters, statuses, documents, can }) {
    const { t } = useTrans();
    const [showModal, setShowModal] = useState(false);

    const form = useForm({
        title: '',
        signer_name: '',
        signer_email: '',
        document_id: '',
        notes: '',
    });

    const submit = (e) => {
        e.preventDefault();
        form.post('/e-signature', {
            onSuccess: () => { form.reset(); setShowModal(false); },
            preserveScroll: true,
        });
    };

    const applyFilters = (next = {}) => {
        router.get('/e-signature', { status: filters.status, ...next }, { preserveState: true, replace: true });
    };

    // Simule le workflow : marque la demande signée ou refusée.
    const act = (request, action) => {
        const verb = action === 'sign' ? 'signer' : 'refuser';
        if (confirm(`Marquer la demande « ${request.title} » comme ${action === 'sign' ? 'signée' : 'refusée'} ?`)) {
            router.post(`/e-signature/${request.id}/status`, { action }, { preserveScroll: true });
        }
    };

    const fmtDate = (d) => (d ? new Date(d).toLocaleDateString('fr-FR') : '—');

    return (
        <AppLayout header="Signature électronique">
            <Head title={t('Signature électronique')} />

            {/* Barre d'actions */}
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <select
                    value={filters.status ?? ''}
                    onChange={(e) => applyFilters({ status: e.target.value })}
                    className="rounded-md border-slate-300 text-sm focus:border-orange-500 focus:ring-orange-500 dark:border-slate-700 dark:bg-slate-900"
                >
                    <option value="">{t('Tous les statuts')}</option>
                    {statuses.map((s) => (
                        <option key={s} value={s}>{t(STATUS[s]?.label ?? s)}</option>
                    ))}
                </select>

                {can.create && (
                    <button
                        onClick={() => setShowModal(true)}
                        className="inline-flex items-center gap-2 rounded-md bg-orange-500 px-4 py-2 text-sm font-medium text-white hover:bg-orange-600"
                    >
                        <Icon name="pen-line" className="h-4 w-4" />
                        {t('Nouvelle demande')}
                    </button>
                )}
            </div>

            {/* Tableau */}
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
                <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
                    <thead className="bg-slate-50 dark:bg-slate-800/50">
                        <tr className="text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                            <th className="px-4 py-3">{t('Demande')}</th>
                            <th className="px-4 py-3">{t('Signataire')}</th>
                            <th className="px-4 py-3">{t('Document')}</th>
                            <th className="px-4 py-3">{t('Envoyée')}</th>
                            <th className="px-4 py-3">{t('Statut')}</th>
                            <th className="px-4 py-3 text-right">{t('Actions')}</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {requests.data.map((req) => (
                            <tr key={req.id} className="text-sm hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                <td className="px-4 py-3 font-medium text-slate-800 dark:text-slate-100">{req.title}</td>
                                <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                                    {req.signer_name}
                                    {req.signer_email ? <div className="text-xs text-slate-400">{req.signer_email}</div> : null}
                                </td>
                                <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{req.document?.title || '—'}</td>
                                <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{fmtDate(req.sent_at)}</td>
                                <td className="px-4 py-3"><StatusBadge status={req.status} /></td>
                                <td className="px-4 py-3 text-right">
                                    {can.update && req.status === 'pending' ? (
                                        <div className="flex justify-end gap-2">
                                            <button
                                                onClick={() => act(req, 'sign')}
                                                className="inline-flex items-center gap-1 rounded-md border border-green-200 px-2.5 py-1 text-xs font-medium text-green-700 hover:bg-green-50 dark:border-green-900/50"
                                            >
                                                <Icon name="check" className="h-3.5 w-3.5" /> {t('Signer')}
                                            </button>
                                            <button
                                                onClick={() => act(req, 'refuse')}
                                                className="inline-flex items-center gap-1 rounded-md border border-red-200 px-2.5 py-1 text-xs font-medium text-red-600 hover:bg-red-50 dark:border-red-900/50"
                                            >
                                                <Icon name="x" className="h-3.5 w-3.5" /> {t('Refuser')}
                                            </button>
                                        </div>
                                    ) : (
                                        <span className="text-xs text-slate-400">{fmtDate(req.signed_at)}</span>
                                    )}
                                </td>
                            </tr>
                        ))}

                        {requests.data.length === 0 && (
                            <tr>
                                <td colSpan={6} className="px-4 py-12 text-center text-slate-400">
                                    <Icon name="pen-line" className="mx-auto mb-2 h-8 w-8" />
                                    {t('Aucune demande de signature.')}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {requests.last_page > 1 && (
                <div className="mt-4 flex flex-wrap gap-1">
                    {requests.links.map((link, i) => (
                        <button
                            key={i}
                            disabled={!link.url}
                            onClick={() => link.url && router.get(link.url, {}, { preserveState: true })}
                            className={`rounded-md px-3 py-1.5 text-sm ${
                                link.active
                                    ? 'bg-orange-500 text-white'
                                    : 'text-slate-600 hover:bg-slate-100 disabled:opacity-40 dark:text-slate-300 dark:hover:bg-slate-800'
                            }`}
                            dangerouslySetInnerHTML={{ __html: link.label }}
                        />
                    ))}
                </div>
            )}

            {/* Modal nouvelle demande */}
            <Modal show={showModal} onClose={() => setShowModal(false)}>
                <form onSubmit={submit} className="p-6">
                    <h3 className="mb-4 text-lg font-semibold text-slate-800 dark:text-slate-100">{t('Nouvelle demande de signature')}</h3>
                    <div className="grid grid-cols-1 gap-4">
                        <div>
                            <InputLabel htmlFor="sig_title" value={t('Intitulé *')} />
                            <TextInput id="sig_title" className="mt-1 block w-full" value={form.data.title}
                                onChange={(e) => form.setData('title', e.target.value)} placeholder={t('Signature du contrat de sous-traitance')} />
                            <InputError message={form.errors.title} className="mt-1" />
                        </div>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div>
                                <InputLabel htmlFor="sig_signer" value={t('Signataire *')} />
                                <TextInput id="sig_signer" className="mt-1 block w-full" value={form.data.signer_name}
                                    onChange={(e) => form.setData('signer_name', e.target.value)} placeholder="M. Koffi Yao" />
                                <InputError message={form.errors.signer_name} className="mt-1" />
                            </div>
                            <div>
                                <InputLabel htmlFor="sig_email" value={t('E-mail du signataire')} />
                                <TextInput id="sig_email" type="email" className="mt-1 block w-full" value={form.data.signer_email}
                                    onChange={(e) => form.setData('signer_email', e.target.value)} placeholder="signataire@exemple.ci" />
                                <InputError message={form.errors.signer_email} className="mt-1" />
                            </div>
                        </div>
                        <div>
                            <InputLabel htmlFor="sig_document" value={t('Document (GED)')} />
                            <select id="sig_document"
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
                                value={form.data.document_id} onChange={(e) => form.setData('document_id', e.target.value)}>
                                <option value="">{t('— Aucun —')}</option>
                                {documents.map((d) => (
                                    <option key={d.id} value={d.id}>{d.code} · {d.title}</option>
                                ))}
                            </select>
                            <InputError message={form.errors.document_id} className="mt-1" />
                        </div>
                        <div>
                            <InputLabel htmlFor="sig_notes" value={t('Notes')} />
                            <textarea id="sig_notes" rows={3}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
                                value={form.data.notes} onChange={(e) => form.setData('notes', e.target.value)} />
                            <InputError message={form.errors.notes} className="mt-1" />
                        </div>
                    </div>
                    <div className="mt-6 flex justify-end gap-3">
                        <SecondaryButton type="button" onClick={() => setShowModal(false)}>{t('Annuler')}</SecondaryButton>
                        <PrimaryButton disabled={form.processing} className="bg-orange-500 hover:bg-orange-600 focus:bg-orange-600">
                            {t('Créer la demande')}
                        </PrimaryButton>
                    </div>
                </form>
            </Modal>
        </AppLayout>
    );
}
