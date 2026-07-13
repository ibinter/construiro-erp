import { useState } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import Icon from '@/Components/Icon';
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

function SpecialtyBadge({ specialty }) {
    const { t } = useTrans();
    const color = SPECIALTY_COLOR[specialty] ?? 'bg-slate-100 text-slate-600';
    return (
        <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${color}`}>
            {t(SPECIALTY[specialty] ?? specialty)}
        </span>
    );
}

function ActiveBadge({ active }) {
    const { t } = useTrans();
    return active ? (
        <span className="inline-flex rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700">
            {t('Actif')}
        </span>
    ) : (
        <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-500">
            {t('Inactif')}
        </span>
    );
}

// Affiche la note en étoiles (★★★★☆) ou un tiret si non évaluée.
function RatingStars({ rating }) {
    if (!rating) {
        return <span className="text-slate-300">—</span>;
    }
    return (
        <span className="text-amber-500" title={`${rating}/5`}>
            {'★'.repeat(rating)}
            <span className="text-slate-300">{'☆'.repeat(5 - rating)}</span>
        </span>
    );
}

export default function Index({ subcontractors, filters, specialties, can }) {
    const { t } = useTrans();
    const [search, setSearch] = useState(filters.search ?? '');

    const applyFilters = (next = {}) => {
        router.get('/subcontractors', { search, specialty: filters.specialty, ...next }, {
            preserveState: true,
            replace: true,
        });
    };

    return (
        <AppLayout header="Sous-traitants">
            <Head title={t('Sous-traitants')} />

            {/* Barre d'actions */}
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <form
                    onSubmit={(e) => { e.preventDefault(); applyFilters(); }}
                    className="flex items-center gap-2"
                >
                    <div className="relative">
                        <Icon name="search" className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder={t('Rechercher un sous-traitant…')}
                            className="w-full sm:w-64 rounded-md border-slate-300 pl-9 text-sm focus:border-orange-500 focus:ring-orange-500 dark:border-slate-700 dark:bg-slate-900"
                        />
                    </div>
                    <select
                        value={filters.specialty ?? ''}
                        onChange={(e) => applyFilters({ specialty: e.target.value })}
                        className="rounded-md border-slate-300 text-sm focus:border-orange-500 focus:ring-orange-500 dark:border-slate-700 dark:bg-slate-900"
                    >
                        <option value="">{t('Toutes les spécialités')}</option>
                        {specialties.map((s) => (
                            <option key={s} value={s}>{t(SPECIALTY[s] ?? s)}</option>
                        ))}
                    </select>
                </form>

                {can.create && (
                    <Link
                        href="/subcontractors/create"
                        className="inline-flex items-center gap-2 rounded-md bg-orange-500 px-4 py-2 text-sm font-medium text-white hover:bg-orange-600"
                    >
                        <Icon name="plus" className="h-4 w-4" />
                        {t('Nouveau sous-traitant')}
                    </Link>
                )}
            </div>

            {/* Tableau */}
            <div className="rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
                <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
                    <thead className="bg-slate-50 dark:bg-slate-800/50">
                        <tr className="text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                            <th className="px-4 py-3">{t('Sous-traitant')}</th>
                            <th className="px-4 py-3">{t('Spécialité')}</th>
                            <th className="px-4 py-3">{t('Contact')}</th>
                            <th className="px-4 py-3">{t('Ville')}</th>
                            <th className="px-4 py-3">{t('Note')}</th>
                            <th className="px-4 py-3">{t('Statut')}</th>
                            <th className="px-4 py-3"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {subcontractors.data.map((subcontractor) => (
                            <tr key={subcontractor.id} className="text-sm hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                <td className="px-4 py-3">
                                    <Link href={`/subcontractors/${subcontractor.id}`} className="font-medium text-slate-800 hover:text-orange-600 dark:text-slate-100">
                                        {subcontractor.name}
                                    </Link>
                                    <div className="text-xs text-slate-400">{subcontractor.code}</div>
                                </td>
                                <td className="px-4 py-3"><SpecialtyBadge specialty={subcontractor.specialty} /></td>
                                <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                                    {subcontractor.contact_name || '—'}
                                    {subcontractor.phone ? <div className="text-xs text-slate-400">{subcontractor.phone}</div> : null}
                                </td>
                                <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                                    {subcontractor.city || '—'}
                                </td>
                                <td className="px-4 py-3"><RatingStars rating={subcontractor.rating} /></td>
                                <td className="px-4 py-3"><ActiveBadge active={subcontractor.is_active} /></td>
                                <td className="px-4 py-3 text-right">
                                    <Link href={`/subcontractors/${subcontractor.id}`} className="text-slate-400 hover:text-orange-600">
                                        <Icon name="chevron-right" className="h-4 w-4" />
                                    </Link>
                                </td>
                            </tr>
                        ))}

                        {subcontractors.data.length === 0 && (
                            <tr>
                                <td colSpan={7} className="px-4 py-12 text-center text-slate-400">
                                    <Icon name="hard-hat" className="mx-auto mb-2 h-8 w-8" />
                                    {t('Aucun sous-traitant trouvé.')}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
                </div>
            </div>

            {/* Pagination */}
            {subcontractors.last_page > 1 && (
                <div className="mt-4 flex flex-wrap gap-1">
                    {subcontractors.links.map((link, i) => (
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
        </AppLayout>
    );
}
