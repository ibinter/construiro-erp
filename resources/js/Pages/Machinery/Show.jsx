import AppLayout from '@/Layouts/AppLayout';
import Icon from '@/Components/Icon';
import { Head, Link } from '@inertiajs/react';
import { formatMoney } from '@/constants';
import { useTrans } from '@/i18n';
import { EQUIPMENT_STATUS } from '@/Pages/Equipment/Partials/EquipmentForm';

// Fiche engin (lecture seule). L'édition passe par le module Parc matériel.

const MAINTENANCE_TYPE = {
    preventive: 'Préventif',
    curative:   'Curatif',
    revision:   'Révision',
};

function StatusBadge({ status }) {
    const { t } = useTrans();
    const s = EQUIPMENT_STATUS[status] ?? { label: status, color: 'bg-slate-100 text-slate-600' };
    return <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${s.color}`}>{t(s.label)}</span>;
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

export default function Show({ equipment }) {
    const { t } = useTrans();
    const fmtDate = (d) => (d ? new Date(d).toLocaleDateString('fr-FR') : '—');
    const records = equipment.maintenance_records ?? [];

    return (
        <AppLayout header="Fiche engin">
            <Head title={equipment.name} />

            {/* En-tête */}
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                    <div className="flex items-center gap-2">
                        <Link href="/machinery" className="text-slate-400 hover:text-orange-600">
                            <Icon name="arrow-left" className="h-5 w-5" />
                        </Link>
                        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">{equipment.name}</h2>
                        <StatusBadge status={equipment.status} />
                    </div>
                    <p className="ml-7 text-sm text-slate-400">
                        {equipment.code} · {t('Engin')}
                        {equipment.registration ? ` · ${equipment.registration}` : ''}
                    </p>
                </div>
                <Link
                    href={`/equipment/${equipment.id}`}
                    className="inline-flex items-center gap-2 rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                >
                    <Icon name="external-link" className="h-4 w-4" /> {t('Ouvrir dans le parc matériel')}
                </Link>
            </div>

            {/* Tuiles d'info */}
            <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
                <InfoTile icon="tag" label={t('Marque / Modèle')} value={[equipment.brand, equipment.model].filter(Boolean).join(' ') || '—'} />
                <InfoTile icon="wallet" label={t("Valeur d'acquisition")} value={formatMoney(equipment.acquisition_value, equipment.currency)} />
                <InfoTile icon="calendar" label={t('Acquis le')} value={fmtDate(equipment.acquisition_date)} />
                <InfoTile icon="map-pin" label={t('Chantier affecté')} value={equipment.current_site?.name ?? '—'} />
            </div>

            {equipment.notes && (
                <div className="mb-6 rounded-xl border border-slate-200 bg-white p-5 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
                    {equipment.notes}
                </div>
            )}

            {/* Historique de maintenance */}
            <div className="rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
                <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 dark:border-slate-800">
                    <h3 className="flex items-center gap-2 font-semibold text-slate-800 dark:text-slate-100">
                        <Icon name="wrench" className="h-5 w-5 text-orange-500" />
                        {t('Historique de maintenance')} ({records.length})
                    </h3>
                </div>
                <ul className="divide-y divide-slate-100 dark:divide-slate-800">
                    {records.map((record) => (
                        <li key={record.id} className="flex items-center justify-between px-5 py-3 text-sm">
                            <div>
                                <div className="font-medium text-slate-800 dark:text-slate-100">{record.description}</div>
                                <div className="text-xs text-slate-400">
                                    {t(MAINTENANCE_TYPE[record.type] ?? record.type)} · {fmtDate(record.performed_at)}
                                </div>
                            </div>
                            <div className="text-slate-600 dark:text-slate-300">
                                {formatMoney(record.cost, equipment.currency)}
                            </div>
                        </li>
                    ))}
                    {records.length === 0 && (
                        <li className="px-5 py-8 text-center text-sm text-slate-400">
                            {t('Aucun entretien enregistré pour cet engin.')}
                        </li>
                    )}
                </ul>
            </div>
        </AppLayout>
    );
}
