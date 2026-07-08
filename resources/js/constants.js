// Libellés et styles partagés pour les projets et chantiers (FR).

export const PROJECT_STATUS = {
    draft:       { label: 'Brouillon',   color: 'bg-slate-100 text-slate-600' },
    in_progress: { label: 'En cours',    color: 'bg-blue-100 text-blue-700' },
    on_hold:     { label: 'En pause',    color: 'bg-amber-100 text-amber-700' },
    completed:   { label: 'Terminé',     color: 'bg-green-100 text-green-700' },
    cancelled:   { label: 'Annulé',      color: 'bg-red-100 text-red-700' },
};

export const SITE_STATUS = {
    preparation: { label: 'Préparation', color: 'bg-slate-100 text-slate-600' },
    in_progress: { label: 'En cours',    color: 'bg-blue-100 text-blue-700' },
    suspended:   { label: 'Suspendu',    color: 'bg-amber-100 text-amber-700' },
    completed:   { label: 'Terminé',     color: 'bg-green-100 text-green-700' },
};

export const PROJECT_TYPE = {
    batiment:    'Bâtiment',
    genie_civil: 'Génie civil',
    route:       'Route',
    hydraulique: 'Hydraulique',
    vrd:         'VRD',
    autre:       'Autre',
};

export const formatMoney = (amount, currency = 'XOF') => {
    const value = Number(amount || 0);
    try {
        return new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency,
            maximumFractionDigits: currency === 'XOF' || currency === 'XAF' ? 0 : 2,
        }).format(value);
    } catch {
        return `${value.toLocaleString('fr-FR')} ${currency}`;
    }
};
