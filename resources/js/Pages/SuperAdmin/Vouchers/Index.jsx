import { useState } from 'react';
import { Link, router, useForm, usePage } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { PageHeader, Badge } from '@/Components/UI';

export default function VouchersIndex({ vouchers, batches, filters }) {
    const { props } = usePage();
    const flash = props.flash ?? {};

    /* ── Filtres ── */
    const [batchFilter, setBatchFilter]   = useState(filters.batch_id ?? '');
    const [statusFilter, setStatusFilter] = useState(filters.status   ?? '');

    const applyFilters = () => {
        router.get(
            '/superadmin/vouchers',
            { batch_id: batchFilter || undefined, status: statusFilter || undefined },
            { preserveState: true, replace: true }
        );
    };

    const resetFilters = () => {
        setBatchFilter('');
        setStatusFilter('');
        router.get('/superadmin/vouchers', {}, { preserveState: false, replace: true });
    };

    /* ── Formulaire génération ── */
    const { data, setData, post, processing, errors, reset } = useForm({
        quantity:   10,
        value:      5000,
        currency:   'XOF',
        expires_at: '',
    });

    const handleGenerate = (e) => {
        e.preventDefault();
        post('/superadmin/vouchers/generate', {
            onSuccess: () => reset(),
        });
    };

    return (
        <AppLayout title="SuperAdmin — Vouchers">
            <div className="mx-auto max-w-7xl px-4 py-6 space-y-8">
                <PageHeader
                    title="Codes voucher prépayés"
                    subtitle="Générer, consulter et exporter les codes d'activation"
                />

                {/* Flash message */}
                {flash.success && (
                    <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
                        {flash.success}
                    </div>
                )}

                {/* ── Section Génération ── */}
                <div className="card">
                    <div className="card-body">
                        <h2 className="text-base font-semibold mb-4">Générer un lot de codes</h2>
                        <form onSubmit={handleGenerate} className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
                            {/* Quantité */}
                            <div>
                                <label className="block text-xs font-medium text-slate-500 mb-1">Quantité</label>
                                <input
                                    type="number"
                                    min="1"
                                    max="500"
                                    value={data.quantity}
                                    onChange={(e) => setData('quantity', e.target.value)}
                                    className="form-input w-full"
                                />
                                {errors.quantity && <p className="mt-1 text-xs text-red-500">{errors.quantity}</p>}
                            </div>

                            {/* Valeur */}
                            <div>
                                <label className="block text-xs font-medium text-slate-500 mb-1">Valeur</label>
                                <input
                                    type="number"
                                    min="1000"
                                    step="500"
                                    value={data.value}
                                    onChange={(e) => setData('value', e.target.value)}
                                    className="form-input w-full"
                                />
                                {errors.value && <p className="mt-1 text-xs text-red-500">{errors.value}</p>}
                            </div>

                            {/* Devise */}
                            <div>
                                <label className="block text-xs font-medium text-slate-500 mb-1">Devise</label>
                                <select
                                    value={data.currency}
                                    onChange={(e) => setData('currency', e.target.value)}
                                    className="form-input w-full"
                                >
                                    <option value="XOF">XOF</option>
                                    <option value="EUR">EUR</option>
                                    <option value="USD">USD</option>
                                    <option value="GNF">GNF</option>
                                    <option value="XAF">XAF</option>
                                </select>
                                {errors.currency && <p className="mt-1 text-xs text-red-500">{errors.currency}</p>}
                            </div>

                            {/* Expiration */}
                            <div>
                                <label className="block text-xs font-medium text-slate-500 mb-1">Expiration (optionnel)</label>
                                <input
                                    type="date"
                                    value={data.expires_at}
                                    onChange={(e) => setData('expires_at', e.target.value)}
                                    className="form-input w-full"
                                />
                                {errors.expires_at && <p className="mt-1 text-xs text-red-500">{errors.expires_at}</p>}
                            </div>

                            {/* Bouton */}
                            <div className="flex items-end">
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="btn btn-primary w-full"
                                >
                                    {processing ? 'Génération…' : 'Générer'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

                {/* ── Filtres ── */}
                <div className="flex flex-wrap gap-3 items-end">
                    {/* Filtre batch */}
                    <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1">Lot (batch)</label>
                        <select
                            value={batchFilter}
                            onChange={(e) => setBatchFilter(e.target.value)}
                            className="form-input"
                        >
                            <option value="">Tous les lots</option>
                            {batches.map((b) => (
                                <option key={b} value={b}>{b}</option>
                            ))}
                        </select>
                    </div>

                    {/* Filtre statut */}
                    <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1">Statut</label>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="form-input"
                        >
                            <option value="">Tous</option>
                            <option value="available">Disponibles</option>
                            <option value="used">Utilisés</option>
                        </select>
                    </div>

                    <button onClick={applyFilters} className="btn btn-primary">Filtrer</button>
                    <button onClick={resetFilters} className="btn btn-secondary">Réinitialiser</button>

                    {/* Export CSV par batch sélectionné */}
                    {batchFilter && (
                        <a
                            href={`/superadmin/vouchers/export/${encodeURIComponent(batchFilter)}`}
                            className="btn btn-secondary ml-auto"
                        >
                            Exporter CSV (ce lot)
                        </a>
                    )}
                </div>

                {/* ── Tableau ── */}
                <div className="card">
                    <div className="card-body overflow-x-auto">
                        <table className="table-construiro w-full">
                            <thead>
                                <tr>
                                    <th>Code</th>
                                    <th>Valeur</th>
                                    <th>Lot (batch)</th>
                                    <th>Statut</th>
                                    <th>Société</th>
                                    <th>Date utilisation</th>
                                    <th>Expiration</th>
                                    <th>Créé le</th>
                                    <th>Export</th>
                                </tr>
                            </thead>
                            <tbody>
                                {vouchers.data.length === 0 && (
                                    <tr>
                                        <td colSpan={9} className="text-center text-slate-400 py-8">
                                            Aucun voucher trouvé.
                                        </td>
                                    </tr>
                                )}
                                {vouchers.data.map((v) => (
                                    <tr key={v.id}>
                                        <td>
                                            <span className="font-mono text-sm font-semibold tracking-widest">
                                                {v.code}
                                            </span>
                                        </td>
                                        <td className="whitespace-nowrap">
                                            {Number(v.value).toLocaleString('fr-FR')} {v.currency}
                                        </td>
                                        <td>
                                            <span className="font-mono text-xs text-slate-400 truncate max-w-[120px] block" title={v.batch_id}>
                                                {v.batch_id ? v.batch_id.slice(0, 8) + '…' : '—'}
                                            </span>
                                        </td>
                                        <td>
                                            {v.is_used
                                                ? <Badge variant="danger">Utilisé</Badge>
                                                : <Badge variant="success">Disponible</Badge>
                                            }
                                        </td>
                                        <td className="text-slate-600">{v.company_name ?? '—'}</td>
                                        <td className="text-slate-500">{v.used_at ?? '—'}</td>
                                        <td className="text-slate-500">{v.expires_at ?? '∞'}</td>
                                        <td className="text-slate-400">{v.created_at}</td>
                                        <td>
                                            {v.batch_id && (
                                                <a
                                                    href={`/superadmin/vouchers/export/${encodeURIComponent(v.batch_id)}`}
                                                    className="text-xs text-orange-500 hover:underline whitespace-nowrap"
                                                    title="Exporter tout le lot"
                                                >
                                                    CSV lot
                                                </a>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* ── Pagination ── */}
                {vouchers.links && (
                    <div className="flex gap-1 flex-wrap">
                        {vouchers.links.map((link, i) => (
                            <Link
                                key={i}
                                href={link.url ?? '#'}
                                className={`px-3 py-1 rounded text-sm border ${
                                    link.active
                                        ? 'bg-orange-500 text-white border-orange-500'
                                        : 'border-slate-200 text-slate-600 hover:border-orange-300'
                                }`}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        ))}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
