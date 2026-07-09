import AppLayout from '@/Layouts/AppLayout';
import Icon from '@/Components/Icon';
import { Head, Link, router } from '@inertiajs/react';
import { formatMoney } from '@/constants';
import { useTrans } from '@/i18n';

const MOVEMENT_TYPE = {
    in:         { label: 'Entrée',     color: 'bg-green-100 text-green-700' },
    out:        { label: 'Sortie',     color: 'bg-red-100 text-red-700' },
    adjustment: { label: 'Ajustement', color: 'bg-amber-100 text-amber-700' },
};

const UNIT_SHORT = { u: 'u', kg: 'kg', m: 'm', m2: 'm²', m3: 'm³', ml: 'ml', sac: 'sac', tonne: 't' };

export default function Movements({ movements, warehouses, filters, types }) {
    const { t } = useTrans();
    const applyFilters = (next = {}) => {
        router.get('/stocks/movements', { ...filters, ...next }, { preserveState: true, replace: true });
    };

    const fmtDate = (d) => (d ? new Date(d).toLocaleDateString('fr-FR') : '—');

    return (
        <AppLayout header="Mouvements de stock">
            <Head title={t('Mouvements de stock')} />

            {/* Barre d'actions */}
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-2">
                    <Link href="/stocks" className="text-slate-400 hover:text-orange-600">
                        <Icon name="arrow-left" className="h-5 w-5" />
                    </Link>
                    <select
                        value={filters.warehouse_id ?? ''}
                        onChange={(e) => applyFilters({ warehouse_id: e.target.value || undefined })}
                        className="rounded-md border-slate-300 text-sm focus:border-orange-500 focus:ring-orange-500 dark:border-slate-700 dark:bg-slate-900"
                    >
                        <option value="">{t('Tous les magasins')}</option>
                        {warehouses.map((w) => (
                            <option key={w.id} value={w.id}>{w.name}</option>
                        ))}
                    </select>
                    <select
                        value={filters.type ?? ''}
                        onChange={(e) => applyFilters({ type: e.target.value || undefined })}
                        className="rounded-md border-slate-300 text-sm focus:border-orange-500 focus:ring-orange-500 dark:border-slate-700 dark:bg-slate-900"
                    >
                        <option value="">{t('Tous les types')}</option>
                        {types.map((ty) => (
                            <option key={ty} value={ty}>{t(MOVEMENT_TYPE[ty]?.label ?? ty)}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Tableau */}
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
                <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
                    <thead className="bg-slate-50 dark:bg-slate-800/50">
                        <tr className="text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                            <th className="px-4 py-3">{t('Date')}</th>
                            <th className="px-4 py-3">{t('Type')}</th>
                            <th className="px-4 py-3">{t('Matériau')}</th>
                            <th className="px-4 py-3">{t('Magasin')}</th>
                            <th className="px-4 py-3">{t('Quantité')}</th>
                            <th className="px-4 py-3">{t('Prix unit.')}</th>
                            <th className="px-4 py-3">{t('Référence')}</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {movements.data.map((mv) => {
                            const mt = MOVEMENT_TYPE[mv.type] ?? { label: mv.type, color: 'bg-slate-100 text-slate-600' };
                            const unit = UNIT_SHORT[mv.material?.unit] ?? mv.material?.unit;
                            return (
                                <tr key={mv.id} className="text-sm hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                    <td className="px-4 py-3 text-slate-500">{fmtDate(mv.moved_at)}</td>
                                    <td className="px-4 py-3">
                                        <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${mt.color}`}>{t(mt.label)}</span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className="font-medium text-slate-800 dark:text-slate-100">{mv.material?.name}</span>
                                        <div className="text-xs text-slate-400">{mv.material?.code}</div>
                                    </td>
                                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{mv.warehouse?.name}</td>
                                    <td className="px-4 py-3 text-slate-700 dark:text-slate-200">
                                        {Number(mv.quantity).toLocaleString('fr-FR')} {unit}
                                    </td>
                                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{formatMoney(mv.unit_price)}</td>
                                    <td className="px-4 py-3 text-slate-500">{mv.reference ?? '—'}</td>
                                </tr>
                            );
                        })}

                        {movements.data.length === 0 && (
                            <tr>
                                <td colSpan={7} className="px-4 py-12 text-center text-slate-400">
                                    <Icon name="arrow-left-right" className="mx-auto mb-2 h-8 w-8" />
                                    {t('Aucun mouvement trouvé.')}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {movements.last_page > 1 && (
                <div className="mt-4 flex flex-wrap gap-1">
                    {movements.links.map((link, i) => (
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
