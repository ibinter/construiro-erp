import AppLayout from '@/Layouts/AppLayout';
import Icon from '@/Components/Icon';
import { Head, Link } from '@inertiajs/react';
import { SITE_STATUS } from '@/constants';
import { useTrans } from '@/i18n';

function StatusBadge({ status }) {
    const { t } = useTrans();
    const s = SITE_STATUS[status] ?? { label: status, color: 'bg-slate-100 text-slate-600' };
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

export default function Show({ site }) {
    const { t } = useTrans();
    const fmtDate = (d) => (d ? new Date(d).toLocaleDateString('fr-FR') : '—');
    const statusLabel = t(SITE_STATUS[site.status]?.label ?? site.status);

    return (
        <AppLayout header="Fiche chantier">
            <Head title={site.name} />

            {/* En-tête */}
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                    <div className="flex items-center gap-2">
                        <Link href="/sites" className="text-slate-400 hover:text-orange-600">
                            <Icon name="arrow-left" className="h-5 w-5" />
                        </Link>
                        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">{site.name}</h2>
                        <StatusBadge status={site.status} />
                    </div>
                    <p className="ml-7 text-sm text-slate-400">
                        {site.code}
                        {site.city ? ` · ${site.city}` : ''}
                        {site.project ? ` · ${site.project.name}` : ''}
                    </p>
                </div>
                {site.project && (
                    <Link
                        href={`/projects/${site.project.id}`}
                        className="inline-flex items-center gap-2 rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                    >
                        <Icon name="folder" className="h-4 w-4" /> {t('Voir le projet')}
                    </Link>
                )}
            </div>

            {/* Tuiles d'info */}
            <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
                <InfoTile icon="folder" label={t('Projet')} value={site.project?.name ?? '—'} />
                <InfoTile icon="activity" label={t('Statut')} value={statusLabel} />
                <InfoTile icon="trending-up" label={t('Avancement')} value={`${site.progress} %`} />
                <InfoTile icon="user" label={t('Chef de chantier')} value={site.site_manager?.name ?? '—'} />
                <InfoTile icon="calendar" label={t('Début → Fin')} value={`${fmtDate(site.start_date)} → ${fmtDate(site.end_date)}`} />
                <InfoTile icon="map-pin" label={t('Ville')} value={site.city ?? '—'} />
                <InfoTile icon="map" label={t('Adresse')} value={site.address ?? '—'} />
            </div>

            {site.description && (
                <div className="rounded-xl border border-slate-200 bg-white p-5 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
                    {site.description}
                </div>
            )}
        </AppLayout>
    );
}
