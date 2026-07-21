import { useState } from 'react';
import { Link, router, useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { PageHeader, Badge } from '@/Components/UI';

const STATUS_COLORS = {
    draft:    'neutral',
    sent:     'info',
    accepted: 'success',
    expired:  'danger',
};

const STATUS_LABELS = {
    draft:    'Brouillon',
    sent:     'Envoyée',
    accepted: 'Acceptée',
    expired:  'Expirée',
};

/** Modal de création d'offre */
function CreateOfferModal({ companies, onClose }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        company_id:       companies[0]?.id ?? '',
        description:      '',
        discount_percent: 0,
        valid_until:      '',
    });

    const submit = (e) => {
        e.preventDefault();
        post('/superadmin/offers', {
            onSuccess: () => {
                reset();
                onClose();
            },
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl w-full max-w-lg p-6 space-y-5">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
                        Créer une offre personnalisée
                    </h3>
                    <button
                        type="button"
                        onClick={onClose}
                        className="text-slate-400 hover:text-slate-600 text-xl leading-none"
                    >
                        &times;
                    </button>
                </div>

                <form onSubmit={submit} className="space-y-4">
                    {/* Entreprise */}
                    <div>
                        <label className="form-label">Entreprise *</label>
                        <select
                            className="form-select w-full"
                            value={data.company_id}
                            onChange={(e) => setData('company_id', e.target.value)}
                            required
                        >
                            <option value="">-- Choisir une entreprise --</option>
                            {companies.map((c) => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                        </select>
                        {errors.company_id && <p className="text-xs text-red-500 mt-1">{errors.company_id}</p>}
                    </div>

                    {/* Description */}
                    <div>
                        <label className="form-label">Description de l'offre *</label>
                        <textarea
                            className="form-input w-full"
                            rows={4}
                            placeholder="Ex : 3 mois offerts sur le plan Pro, accès à 5 modules supplémentaires…"
                            value={data.description}
                            onChange={(e) => setData('description', e.target.value)}
                            required
                            maxLength={2000}
                        />
                        {errors.description && <p className="text-xs text-red-500 mt-1">{errors.description}</p>}
                    </div>

                    {/* Remise et date */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="form-label">Remise (%)</label>
                            <input
                                type="number"
                                className="form-input w-full"
                                min={0}
                                max={100}
                                step={0.5}
                                value={data.discount_percent}
                                onChange={(e) => setData('discount_percent', parseFloat(e.target.value))}
                            />
                            {errors.discount_percent && <p className="text-xs text-red-500 mt-1">{errors.discount_percent}</p>}
                        </div>
                        <div>
                            <label className="form-label">Valable jusqu'au</label>
                            <input
                                type="date"
                                className="form-input w-full"
                                value={data.valid_until}
                                onChange={(e) => setData('valid_until', e.target.value)}
                            />
                            {errors.valid_until && <p className="text-xs text-red-500 mt-1">{errors.valid_until}</p>}
                        </div>
                    </div>

                    <p className="text-xs text-slate-400">
                        L'offre sera envoyée par email dès la création et son statut passera à "Envoyée".
                    </p>

                    <div className="flex gap-3 justify-end pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="btn btn-secondary"
                            disabled={processing}
                        >
                            Annuler
                        </button>
                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={processing}
                        >
                            {processing ? 'Envoi en cours…' : 'Créer et envoyer'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default function OffersIndex({ offers, companies, filters }) {
    const [showModal, setShowModal] = useState(false);
    const [statusFilter, setStatusFilter] = useState(filters.status ?? '');
    const [companyFilter, setCompanyFilter] = useState(filters.company_id ?? '');

    const applyFilters = (newStatus, newCompany) => {
        router.get(
            '/superadmin/offers',
            {
                status:     newStatus || undefined,
                company_id: newCompany || undefined,
            },
            { preserveState: true, replace: true }
        );
    };

    const handleStatusChange = (val) => {
        setStatusFilter(val);
        applyFilters(val, companyFilter);
    };

    const handleCompanyChange = (val) => {
        setCompanyFilter(val);
        applyFilters(statusFilter, val);
    };

    const handleDelete = (offerId) => {
        if (!confirm('Supprimer cette offre brouillon ?')) return;
        router.delete(`/superadmin/offers/${offerId}`);
    };

    return (
        <AppLayout title="SuperAdmin — Offres personnalisées">
            {showModal && (
                <CreateOfferModal
                    companies={companies}
                    onClose={() => setShowModal(false)}
                />
            )}

            <div className="mx-auto max-w-6xl px-4 py-6 space-y-6">
                <PageHeader
                    title="Offres personnalisées"
                    subtitle="Gérer et envoyer des offres commerciales aux clients"
                    actions={
                        <button
                            type="button"
                            className="btn btn-primary"
                            onClick={() => setShowModal(true)}
                        >
                            + Créer une offre
                        </button>
                    }
                />

                {/* Filtres */}
                <div className="flex flex-wrap gap-3 items-center">
                    <select
                        className="form-select w-auto"
                        value={statusFilter}
                        onChange={(e) => handleStatusChange(e.target.value)}
                    >
                        <option value="">Tous les statuts</option>
                        <option value="draft">Brouillon</option>
                        <option value="sent">Envoyée</option>
                        <option value="accepted">Acceptée</option>
                        <option value="expired">Expirée</option>
                    </select>

                    <select
                        className="form-select w-auto"
                        value={companyFilter}
                        onChange={(e) => handleCompanyChange(e.target.value)}
                    >
                        <option value="">Toutes les entreprises</option>
                        {companies.map((c) => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                    </select>

                    {(statusFilter || companyFilter) && (
                        <button
                            type="button"
                            className="text-sm text-orange-500 hover:underline"
                            onClick={() => {
                                setStatusFilter('');
                                setCompanyFilter('');
                                applyFilters('', '');
                            }}
                        >
                            Effacer les filtres
                        </button>
                    )}
                </div>

                {/* Tableau */}
                <div className="card">
                    <div className="card-body overflow-x-auto">
                        <table className="table-construiro w-full">
                            <thead>
                                <tr>
                                    <th>Entreprise</th>
                                    <th>Description</th>
                                    <th className="text-center">Remise</th>
                                    <th>Validité</th>
                                    <th>Statut</th>
                                    <th>Envoyée le</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {offers.data.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="text-center text-slate-400 py-8">
                                            Aucune offre trouvée.
                                        </td>
                                    </tr>
                                ) : (
                                    offers.data.map((o) => (
                                        <tr key={o.id}>
                                            <td>
                                                <span className="font-medium text-slate-700 dark:text-slate-200">
                                                    {o.company_name}
                                                </span>
                                            </td>
                                            <td>
                                                <p className="max-w-xs truncate text-sm text-slate-600 dark:text-slate-300">
                                                    {o.description}
                                                </p>
                                            </td>
                                            <td className="text-center font-semibold text-orange-500">
                                                {o.discount_percent > 0 ? `${o.discount_percent}%` : '—'}
                                            </td>
                                            <td className="text-sm text-slate-500">
                                                {o.valid_until ?? '—'}
                                            </td>
                                            <td>
                                                <Badge variant={STATUS_COLORS[o.status] ?? 'neutral'}>
                                                    {STATUS_LABELS[o.status] ?? o.status}
                                                </Badge>
                                            </td>
                                            <td className="text-sm text-slate-500">
                                                {o.sent_at ?? '—'}
                                            </td>
                                            <td>
                                                {o.status === 'draft' ? (
                                                    <button
                                                        type="button"
                                                        onClick={() => handleDelete(o.id)}
                                                        className="text-sm text-red-500 hover:underline"
                                                    >
                                                        Supprimer
                                                    </button>
                                                ) : (
                                                    <span className="text-xs text-slate-300">—</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Pagination */}
                {offers.links && offers.links.length > 3 && (
                    <div className="flex gap-1 flex-wrap">
                        {offers.links.map((link, i) => (
                            <Link
                                key={i}
                                href={link.url ?? '#'}
                                className={`px-3 py-1 rounded text-sm border ${link.active
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
