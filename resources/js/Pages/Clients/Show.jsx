import { useState } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import Icon from '@/Components/Icon';
import Modal from '@/Components/Modal';
import SecondaryButton from '@/Components/SecondaryButton';
import DangerButton from '@/Components/DangerButton';
import { Head, Link, router } from '@inertiajs/react';
import { useTrans } from '@/i18n';

// Libellés des types de client (FR) — local à ce module.
const CLIENT_TYPE = {
    particulier: 'Particulier',
    entreprise:  'Entreprise',
    public:      'Secteur public',
    promoteur:   'Promoteur immobilier',
};

const TYPE_COLOR = {
    particulier: 'bg-slate-100 text-slate-600',
    entreprise:  'bg-blue-100 text-blue-700',
    public:      'bg-purple-100 text-purple-700',
    promoteur:   'bg-orange-100 text-orange-700',
};

function InfoTile({ icon, label, value }) {
    return (
        <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center gap-2 text-slate-400">
                <Icon name={icon} className="h-4 w-4" />
                <span className="text-xs uppercase tracking-wider">{label}</span>
            </div>
            <div className="mt-1 font-semibold text-slate-800 dark:text-slate-100">{value}</div>
        </div>
    );
}

export default function Show({ client, can }) {
    const { t } = useTrans();
    const [confirmDelete, setConfirmDelete] = useState(false);

    const deleteClient = () => {
        router.delete(`/clients/${client.id}`);
    };

    const typeColor = TYPE_COLOR[client.type] ?? 'bg-slate-100 text-slate-600';

    return (
        <AppLayout header="Fiche client">
            <Head title={client.name} />

            {/* En-tête */}
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                    <div className="flex items-center gap-2">
                        <Link href="/clients" className="text-slate-400 hover:text-orange-600">
                            <Icon name="arrow-left" className="h-5 w-5" />
                        </Link>
                        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">{client.name}</h2>
                        <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${typeColor}`}>
                            {t(CLIENT_TYPE[client.type] ?? client.type)}
                        </span>
                        {!client.is_active && (
                            <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-500">
                                {t('Inactif')}
                            </span>
                        )}
                    </div>
                    <p className="ml-7 text-sm text-slate-400">{client.code}</p>
                </div>
                <div className="flex gap-2">
                    <a
                        href={`/clients/${client.id}/pdf`}
                        target="_blank" rel="noopener"
                        className="inline-flex items-center gap-2 rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                    >
                        <Icon name="file-down" className="h-4 w-4" /> PDF
                    </a>
                    <a
                        href="/export/clients"
                        target="_blank" rel="noopener"
                        className="inline-flex items-center gap-2 rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                    >
                        <Icon name="table-2" className="h-4 w-4" /> Excel
                    </a>
                    {can.update && (
                        <Link
                            href={`/clients/${client.id}/edit`}
                            className="inline-flex items-center gap-2 rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                        >
                            <Icon name="pencil" className="h-4 w-4" /> {t('Modifier')}
                        </Link>
                    )}
                    {can.delete && (
                        <button
                            onClick={() => setConfirmDelete(true)}
                            className="inline-flex items-center gap-2 rounded-md border border-red-200 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:border-red-900/50"
                        >
                            <Icon name="trash-2" className="h-4 w-4" /> {t('Supprimer')}
                        </button>
                    )}
                </div>
            </div>

            {/* Tuiles d'info */}
            <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
                <InfoTile icon="user" label={t('Contact')} value={client.contact_name || '—'} />
                <InfoTile icon="phone" label={t('Téléphone')} value={client.phone || '—'} />
                <InfoTile icon="mail" label={t('E-mail')} value={client.email || '—'} />
                <InfoTile icon="map-pin" label={t('Ville')} value={client.city || '—'} />
            </div>

            {/* Coordonnées & informations */}
            <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
                <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
                    <h3 className="mb-3 flex items-center gap-2 font-semibold text-slate-800 dark:text-slate-100">
                        <Icon name="map-pin" className="h-5 w-5 text-orange-500" /> {t('Adresse')}
                    </h3>
                    <dl className="space-y-2 text-sm">
                        <div className="flex justify-between">
                            <dt className="text-slate-400">{t('Adresse')}</dt>
                            <dd className="text-slate-700 dark:text-slate-200">{client.address || '—'}</dd>
                        </div>
                        <div className="flex justify-between">
                            <dt className="text-slate-400">{t('Ville')}</dt>
                            <dd className="text-slate-700 dark:text-slate-200">{client.city || '—'}</dd>
                        </div>
                        <div className="flex justify-between">
                            <dt className="text-slate-400">{t('Pays')}</dt>
                            <dd className="text-slate-700 dark:text-slate-200">{client.country || '—'}</dd>
                        </div>
                    </dl>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
                    <h3 className="mb-3 flex items-center gap-2 font-semibold text-slate-800 dark:text-slate-100">
                        <Icon name="file-text" className="h-5 w-5 text-orange-500" /> {t('Informations')}
                    </h3>
                    <dl className="space-y-2 text-sm">
                        <div className="flex justify-between">
                            <dt className="text-slate-400">{t('NIF / IFU')}</dt>
                            <dd className="text-slate-700 dark:text-slate-200">{client.tax_id || '—'}</dd>
                        </div>
                        <div className="flex justify-between">
                            <dt className="text-slate-400">{t('Type')}</dt>
                            <dd className="text-slate-700 dark:text-slate-200">{t(CLIENT_TYPE[client.type] ?? client.type)}</dd>
                        </div>
                        <div className="flex justify-between">
                            <dt className="text-slate-400">{t('Statut')}</dt>
                            <dd className="text-slate-700 dark:text-slate-200">{client.is_active ? t('Actif') : t('Inactif')}</dd>
                        </div>
                    </dl>
                </div>
            </div>

            {client.notes && (
                <div className="mb-6 rounded-xl border border-slate-200 bg-white p-5 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
                    {client.notes}
                </div>
            )}

            {/* Confirmation suppression client */}
            <Modal show={confirmDelete} onClose={() => setConfirmDelete(false)} maxWidth="md">
                <div className="p-6">
                    <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">{t('Supprimer ce client ?')}</h3>
                    <p className="mt-2 text-sm text-slate-500">
                        {t('Le client')} « {client.name} » {t('sera supprimé. Cette action est réversible (corbeille).')}
                    </p>
                    <div className="mt-6 flex justify-end gap-3">
                        <SecondaryButton type="button" onClick={() => setConfirmDelete(false)}>{t('Annuler')}</SecondaryButton>
                        <DangerButton onClick={deleteClient}>{t('Supprimer définitivement')}</DangerButton>
                    </div>
                </div>
            </Modal>
        </AppLayout>
    );
}
