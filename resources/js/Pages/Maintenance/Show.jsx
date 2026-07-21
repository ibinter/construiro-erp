import AppLayout from '@/Layouts/AppLayout';
import Icon from '@/Components/Icon';
import { Head, Link, router } from '@inertiajs/react';
import { formatMoney } from '@/constants';
import { useTrans } from '@/i18n';

// Détail d'un enregistrement de maintenance.

const MAINTENANCE_TYPE = {
    preventive: 'Préventif',
    curative:   'Curatif',
    revision:   'Révision',
};

const TYPE_COLOR = {
    preventive: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
    curative:   'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
    revision:   'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
};

const fmtDate = (d) => (d ? new Date(d).toLocaleDateString('fr-FR', { dateStyle: 'long' }) : '—');

function DetailRow({ label, value }) {
    return (
        <div className="flex flex-col gap-0.5 py-3 sm:flex-row sm:items-center sm:gap-4">
            <dt className="w-48 shrink-0 text-sm font-medium text-slate-500 dark:text-slate-400">{label}</dt>
            <dd className="text-sm text-slate-800 dark:text-slate-100">{value}</dd>
        </div>
    );
}

export default function Show({ record, can }) {
    const { t } = useTrans();

    const handleDelete = () => {
        if (!window.confirm(t('Confirmer la suppression de cet entretien ?'))) return;
        router.delete(`/maintenance/${record.id}`, { preserveScroll: false });
    };

    const equipment = record.equipment;
    const currency  = equipment?.currency ?? 'XOF';

    return (
        <AppLayout header={t('Détail entretien')}>
            <Head title={`${t('Entretien')} — ${record.description}`} />

            <div className="mx-auto max-w-2xl">
                {/* Breadcrumb */}
                <div className="mb-6 flex items-center gap-2 text-sm text-slate-500">
                    <Link href="/maintenance" className="hover:text-orange-500">
                        {t('Maintenance')}
                    </Link>
                    <Icon name="chevron-right" className="h-3 w-3" />
                    <span className="text-slate-700 dark:text-slate-300">{record.description}</span>
                </div>

                {/* En-tête avec actions */}
                <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                        <h1 className="text-xl font-semibold text-slate-800 dark:text-slate-100">
                            {record.description}
                        </h1>
                        <span
                            className={`mt-1 inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${TYPE_COLOR[record.type] ?? 'bg-slate-100 text-slate-600'}`}
                        >
                            {t(MAINTENANCE_TYPE[record.type] ?? record.type)}
                        </span>
                    </div>

                    <div className="flex shrink-0 gap-2">
                        {can.update && (
                            <Link
                                href={`/maintenance/${record.id}/edit`}
                                className="inline-flex items-center gap-1.5 rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
                            >
                                <Icon name="pencil" className="h-3.5 w-3.5" />
                                {t('Modifier')}
                            </Link>
                        )}
                        {can.delete && (
                            <button
                                onClick={handleDelete}
                                className="inline-flex items-center gap-1.5 rounded-md border border-red-300 bg-white px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 dark:border-red-700 dark:bg-slate-900 dark:text-red-400 dark:hover:bg-red-900/20"
                            >
                                <Icon name="trash" className="h-3.5 w-3.5" />
                                {t('Supprimer')}
                            </button>
                        )}
                    </div>
                </div>

                {/* Fiche détail */}
                <div className="rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
                    <dl className="divide-y divide-slate-100 px-6 dark:divide-slate-800">
                        <DetailRow
                            label={t('Équipement')}
                            value={
                                equipment ? (
                                    <span>
                                        <span className="font-medium">{equipment.name}</span>
                                        <span className="ml-2 text-xs text-slate-400">{equipment.code}</span>
                                    </span>
                                ) : '—'
                            }
                        />
                        <DetailRow
                            label={t('Catégorie équipement')}
                            value={equipment?.category ?? '—'}
                        />
                        <DetailRow
                            label={t('Date d\'entretien')}
                            value={fmtDate(record.performed_at)}
                        />
                        <DetailRow
                            label={t('Coût')}
                            value={
                                <span className="font-semibold text-slate-900 dark:text-slate-100">
                                    {formatMoney(record.cost, currency)}
                                </span>
                            }
                        />
                        {record.notes && (
                            <DetailRow
                                label={t('Notes / Prestataire')}
                                value={
                                    <span className="whitespace-pre-line">{record.notes}</span>
                                }
                            />
                        )}
                        <DetailRow
                            label={t('Enregistré le')}
                            value={fmtDate(record.created_at)}
                        />
                    </dl>
                </div>

                {/* Retour liste */}
                <div className="mt-6">
                    <Link
                        href="/maintenance"
                        className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-orange-500"
                    >
                        <Icon name="arrow-left" className="h-3.5 w-3.5" />
                        {t('Retour à la liste')}
                    </Link>
                </div>
            </div>
        </AppLayout>
    );
}
