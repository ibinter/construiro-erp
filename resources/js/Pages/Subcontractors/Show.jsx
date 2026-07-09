import { useState } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import Icon from '@/Components/Icon';
import Modal from '@/Components/Modal';
import SecondaryButton from '@/Components/SecondaryButton';
import DangerButton from '@/Components/DangerButton';
import { Head, Link, router } from '@inertiajs/react';
import { useTrans } from '@/i18n';

// Libellés des spécialités de sous-traitant (FR) — local à ce module.
const SPECIALTY = {
    gros_oeuvre: 'Gros œuvre',
    electricite: 'Électricité',
    plomberie:   'Plomberie',
    peinture:    'Peinture',
    etancheite:  'Étanchéité',
    menuiserie:  'Menuiserie',
    vrd:         'VRD',
    autre:       'Autre',
};

const SPECIALTY_COLOR = {
    gros_oeuvre: 'bg-orange-100 text-orange-700',
    electricite: 'bg-amber-100 text-amber-700',
    plomberie:   'bg-blue-100 text-blue-700',
    peinture:    'bg-purple-100 text-purple-700',
    etancheite:  'bg-cyan-100 text-cyan-700',
    menuiserie:  'bg-yellow-100 text-yellow-700',
    vrd:         'bg-green-100 text-green-700',
    autre:       'bg-slate-100 text-slate-600',
};

// Affiche la note en étoiles (★★★★☆) ou « Non évalué ».
function ratingLabel(rating, t) {
    if (!rating) {
        return t('Non évalué');
    }
    return `${'★'.repeat(rating)}${'☆'.repeat(5 - rating)} (${rating}/5)`;
}

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

export default function Show({ subcontractor, can }) {
    const { t } = useTrans();
    const [confirmDelete, setConfirmDelete] = useState(false);

    const deleteSubcontractor = () => {
        router.delete(`/subcontractors/${subcontractor.id}`);
    };

    const specialtyColor = SPECIALTY_COLOR[subcontractor.specialty] ?? 'bg-slate-100 text-slate-600';

    return (
        <AppLayout header="Fiche sous-traitant">
            <Head title={subcontractor.name} />

            {/* En-tête */}
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                    <div className="flex items-center gap-2">
                        <Link href="/subcontractors" className="text-slate-400 hover:text-orange-600">
                            <Icon name="arrow-left" className="h-5 w-5" />
                        </Link>
                        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">{subcontractor.name}</h2>
                        <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${specialtyColor}`}>
                            {t(SPECIALTY[subcontractor.specialty] ?? subcontractor.specialty)}
                        </span>
                        {!subcontractor.is_active && (
                            <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-500">
                                {t('Inactif')}
                            </span>
                        )}
                    </div>
                    <p className="ml-7 text-sm text-slate-400">{subcontractor.code}</p>
                </div>
                <div className="flex gap-2">
                    {can.update && (
                        <Link
                            href={`/subcontractors/${subcontractor.id}/edit`}
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
                <InfoTile icon="user" label={t('Contact')} value={subcontractor.contact_name || '—'} />
                <InfoTile icon="phone" label={t('Téléphone')} value={subcontractor.phone || '—'} />
                <InfoTile icon="mail" label={t('E-mail')} value={subcontractor.email || '—'} />
                <InfoTile icon="star" label={t('Note')} value={ratingLabel(subcontractor.rating, t)} />
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
                            <dd className="text-slate-700 dark:text-slate-200">{subcontractor.address || '—'}</dd>
                        </div>
                        <div className="flex justify-between">
                            <dt className="text-slate-400">{t('Ville')}</dt>
                            <dd className="text-slate-700 dark:text-slate-200">{subcontractor.city || '—'}</dd>
                        </div>
                        <div className="flex justify-between">
                            <dt className="text-slate-400">{t('Pays')}</dt>
                            <dd className="text-slate-700 dark:text-slate-200">{subcontractor.country || '—'}</dd>
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
                            <dd className="text-slate-700 dark:text-slate-200">{subcontractor.tax_id || '—'}</dd>
                        </div>
                        <div className="flex justify-between">
                            <dt className="text-slate-400">{t('Spécialité')}</dt>
                            <dd className="text-slate-700 dark:text-slate-200">{t(SPECIALTY[subcontractor.specialty] ?? subcontractor.specialty)}</dd>
                        </div>
                        <div className="flex justify-between">
                            <dt className="text-slate-400">{t('Note')}</dt>
                            <dd className="text-slate-700 dark:text-slate-200">{ratingLabel(subcontractor.rating, t)}</dd>
                        </div>
                        <div className="flex justify-between">
                            <dt className="text-slate-400">{t('Statut')}</dt>
                            <dd className="text-slate-700 dark:text-slate-200">{subcontractor.is_active ? t('Actif') : t('Inactif')}</dd>
                        </div>
                    </dl>
                </div>
            </div>

            {subcontractor.notes && (
                <div className="mb-6 rounded-xl border border-slate-200 bg-white p-5 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
                    {subcontractor.notes}
                </div>
            )}

            {/* Confirmation suppression sous-traitant */}
            <Modal show={confirmDelete} onClose={() => setConfirmDelete(false)} maxWidth="md">
                <div className="p-6">
                    <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">{t('Supprimer ce sous-traitant ?')}</h3>
                    <p className="mt-2 text-sm text-slate-500">
                        {t('Le sous-traitant')} « {subcontractor.name} » {t('sera supprimé. Cette action est réversible (corbeille).')}
                    </p>
                    <div className="mt-6 flex justify-end gap-3">
                        <SecondaryButton type="button" onClick={() => setConfirmDelete(false)}>{t('Annuler')}</SecondaryButton>
                        <DangerButton onClick={deleteSubcontractor}>{t('Supprimer définitivement')}</DangerButton>
                    </div>
                </div>
            </Modal>
        </AppLayout>
    );
}
