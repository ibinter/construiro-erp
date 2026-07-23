import { useState } from 'react';
import { router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { PageHeader } from '@/Components/UI';

// Champs considérés comme secrets
const SECRET_FIELDS = ['api_key', 'secret', 'secret_key', 'private_key', 'password', 'token', 'access_token', 'webhook_secret'];

const isSecretField = (key) => SECRET_FIELDS.some((s) => key.toLowerCase().includes(s));

const METHOD_EMOJIS = {
    orange_money:      '🟠',
    mtn_momo:          '🟡',
    wave:              '🌊',
    moov_money:        '🔵',
    airtel_money:      '🔴',
    free_money:        '🟢',
    paypal:            '🅿️',
    stripe:            '💳',
    bank_transfer:     '🏦',
    cash:              '💵',
    cheque:            '📄',
};

/** Paire clé-valeur pour la config JSON */
function ConfigPair({ keyName, value, onKeyChange, onValueChange, onRemove, isNew }) {
    const [showVal, setShowVal] = useState(false);
    const secret = isSecretField(keyName);

    return (
        <div className="flex items-center gap-2">
            <input
                type="text"
                className="form-input flex-1 min-w-0 text-sm font-mono"
                placeholder="clé"
                value={keyName}
                onChange={(e) => onKeyChange(e.target.value)}
            />
            <div className="relative flex-1 min-w-0">
                <input
                    type={secret && !showVal ? 'password' : 'text'}
                    className="form-input w-full text-sm font-mono pr-16"
                    placeholder="valeur"
                    value={value}
                    onChange={(e) => onValueChange(e.target.value)}
                    autoComplete="off"
                />
                {secret && (
                    <button
                        type="button"
                        onClick={() => setShowVal((v) => !v)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-orange-500"
                    >
                        {showVal ? 'Masquer' : 'Afficher'}
                    </button>
                )}
            </div>
            <button
                type="button"
                onClick={onRemove}
                className="flex-shrink-0 text-red-400 hover:text-red-600 text-lg leading-none"
                title="Supprimer"
            >
                &times;
            </button>
        </div>
    );
}

/** Card par méthode de paiement */
function PaymentMethodCard({ method }) {
    const [open, setOpen] = useState(false);
    const [saving, setSaving] = useState(false);
    const [toggling, setToggling] = useState(false);

    // État local du formulaire
    const [name, setName] = useState(method.name ?? '');
    const [instrFr, setInstrFr] = useState(method.instructions_fr ?? '');
    const [instrEn, setInstrEn] = useState(method.instructions_en ?? '');
    const [minAmount, setMinAmount] = useState(method.min_amount ?? 0);

    // Config JSON → tableau de paires {k, v}
    const configToRows = (cfg) => {
        if (!cfg || typeof cfg !== 'object') return [];
        return Object.entries(cfg).map(([k, v]) => ({ k, v: String(v) }));
    };
    const [configRows, setConfigRows] = useState(() => configToRows(method.config));

    const updateRow = (idx, field, val) => {
        setConfigRows((rows) => rows.map((r, i) => i === idx ? { ...r, [field]: val } : r));
    };
    const removeRow = (idx) => setConfigRows((rows) => rows.filter((_, i) => i !== idx));
    const addRow = () => setConfigRows((rows) => [...rows, { k: '', v: '' }]);

    const rowsToObject = () => {
        const obj = {};
        configRows.forEach(({ k, v }) => { if (k.trim()) obj[k.trim()] = v; });
        return obj;
    };

    const handleToggle = () => {
        setToggling(true);
        router.patch(
            `/superadmin/payment-config/${method.type}/toggle`,
            {},
            {
                preserveScroll: true,
                onFinish: () => setToggling(false),
            }
        );
    };

    const handleSave = (e) => {
        e.preventDefault();
        setSaving(true);
        router.patch(
            `/superadmin/payment-config/${method.type}`,
            {
                name,
                instructions_fr: instrFr,
                instructions_en: instrEn,
                min_amount:      minAmount,
                config:          rowsToObject(),
            },
            {
                preserveScroll: true,
                onSuccess: () => setOpen(false),
                onFinish:  () => setSaving(false),
            }
        );
    };

    const emoji = METHOD_EMOJIS[method.type] ?? '💱';
    const active = method.is_active;

    return (
        <div className={`card transition-all border-2 ${active ? 'border-green-200 dark:border-green-800' : 'border-slate-200 dark:border-slate-700'}`}>
            {/* Header */}
            <div className="card-body flex items-center justify-between gap-3 py-4">
                <div className="flex items-center gap-3 min-w-0">
                    <span className="text-2xl flex-shrink-0">{emoji}</span>
                    <div className="min-w-0">
                        <p className="font-semibold text-slate-800 dark:text-slate-100 truncate">{method.name}</p>
                        <p className="text-xs text-slate-400 font-mono">{method.type}</p>
                    </div>
                </div>

                <div className="flex items-center gap-3 flex-shrink-0">
                    {/* Badge statut */}
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        active
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400'
                            : 'bg-slate-100 text-slate-400 dark:bg-slate-700 dark:text-slate-500'
                    }`}>
                        {active ? 'Actif' : 'Inactif'}
                    </span>

                    {/* Toggle */}
                    <button
                        type="button"
                        onClick={handleToggle}
                        disabled={toggling}
                        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 ${
                            active ? 'bg-green-500' : 'bg-slate-300 dark:bg-slate-600'
                        } ${toggling ? 'opacity-60 cursor-not-allowed' : ''}`}
                        title={active ? 'Désactiver' : 'Activer'}
                    >
                        <span
                            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                                active ? 'translate-x-5' : 'translate-x-0'
                            }`}
                        />
                    </button>

                    {/* Bouton configurer */}
                    <button
                        type="button"
                        onClick={() => setOpen((o) => !o)}
                        className="text-sm text-orange-500 hover:text-orange-600 font-medium"
                    >
                        {open ? 'Fermer ▲' : 'Configurer ▼'}
                    </button>
                </div>
            </div>

            {/* Corps collapsible */}
            {open && (
                <form onSubmit={handleSave} className="border-t border-slate-100 dark:border-slate-700 px-5 py-5 space-y-4">
                    {/* Nom */}
                    <div>
                        <label className="form-label">Nom affiché</label>
                        <input
                            type="text"
                            className="form-input w-full"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>

                    {/* Instructions */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="form-label">Instructions (FR)</label>
                            <textarea
                                className="form-input w-full text-sm"
                                rows={4}
                                placeholder="Instructions en français pour le client…"
                                value={instrFr}
                                onChange={(e) => setInstrFr(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="form-label">Instructions (EN)</label>
                            <textarea
                                className="form-input w-full text-sm"
                                rows={4}
                                placeholder="Instructions in English for the client…"
                                value={instrEn}
                                onChange={(e) => setInstrEn(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Montant minimum */}
                    <div className="max-w-xs">
                        <label className="form-label">Montant minimum (XOF)</label>
                        <input
                            type="number"
                            className="form-input w-full"
                            min={0}
                            step={100}
                            value={minAmount}
                            onChange={(e) => setMinAmount(Number(e.target.value))}
                        />
                    </div>

                    {/* Config JSON en paires clé-valeur */}
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <label className="form-label mb-0">Configuration (clés API, paramètres)</label>
                            <button
                                type="button"
                                onClick={addRow}
                                className="text-sm text-orange-500 hover:text-orange-600 font-medium"
                            >
                                + Ajouter un champ
                            </button>
                        </div>

                        {configRows.length === 0 ? (
                            <p className="text-sm text-slate-400 italic">Aucun paramètre de configuration. Cliquez sur "+ Ajouter un champ" pour commencer.</p>
                        ) : (
                            <div className="space-y-2">
                                {configRows.map((row, idx) => (
                                    <ConfigPair
                                        key={idx}
                                        keyName={row.k}
                                        value={row.v}
                                        onKeyChange={(val) => updateRow(idx, 'k', val)}
                                        onValueChange={(val) => updateRow(idx, 'v', val)}
                                        onRemove={() => removeRow(idx)}
                                    />
                                ))}
                            </div>
                        )}
                        <p className="text-xs text-slate-400 mt-2">
                            Les champs contenant "api_key", "secret", "token" ou "password" sont masqués par défaut.
                        </p>
                    </div>

                    {/* Bouton Sauvegarder */}
                    <div className="flex justify-end pt-2 border-t border-slate-100 dark:border-slate-700">
                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={saving}
                        >
                            {saving ? 'Sauvegarde…' : 'Sauvegarder les modifications'}
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
}

export default function PaymentConfigIndex({ methods }) {
    const activeCount = (methods ?? []).filter((m) => m.is_active).length;

    return (
        <AppLayout title="SuperAdmin — Configuration des paiements">
            <div className="mx-auto max-w-5xl px-4 py-6 space-y-6">
                <PageHeader
                    title="Configuration des paiements"
                    subtitle={`${activeCount} méthode${activeCount !== 1 ? 's' : ''} active${activeCount !== 1 ? 's' : ''} sur ${(methods ?? []).length}`}
                />

                {/* Barre d'info */}
                <div className="rounded-lg bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 px-4 py-3 text-sm text-orange-700 dark:text-orange-300">
                    Activez ou désactivez chaque méthode de paiement et configurez ses paramètres. Les modifications sont appliquées immédiatement pour tous les clients.
                </div>

                {/* Grille de cards */}
                {(methods ?? []).length === 0 ? (
                    <div className="card">
                        <div className="card-body text-center py-12 text-slate-400">
                            Aucune méthode de paiement configurée.
                        </div>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {(methods ?? []).map((method) => (
                            <PaymentMethodCard key={method.type} method={method} />
                        ))}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
