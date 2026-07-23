import { useState } from 'react';
import { useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { PageHeader } from '@/Components/UI';

// ---------- Labels affichés en interface ----------------------------------------
const PROVIDER_LABELS = {
    groq:      'Groq (Llama, Mixtral…)',
    openai:    'OpenAI (ChatGPT)',
    anthropic: 'Anthropic (Claude)',
    google:    'Google Gemini',
    mistral:   'Mistral AI',
    grok:      'Grok (xAI)',
};

// Badge couleur par fournisseur
const PROVIDER_COLORS = {
    groq:      'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
    openai:    'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    anthropic: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    google:    'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    mistral:   'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
    grok:      'bg-slate-100 text-slate-700 dark:bg-slate-700/40 dark:text-slate-300',
};

// ---------- Composant slider avec affichage valeur ------------------------------
function RangeField({ label, hint, value, min, max, step, onChange, displayValue }) {
    return (
        <div>
            <div className="flex items-center justify-between mb-1">
                <label className="form-label mb-0">{label}</label>
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-200 tabular-nums">
                    {displayValue ?? value}
                </span>
            </div>
            <input
                type="range"
                className="w-full accent-blue-600"
                min={min}
                max={max}
                step={step}
                value={value}
                onChange={e => onChange(e.target.value)}
            />
            {hint && (
                <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">{hint}</p>
            )}
        </div>
    );
}

// ---------- Page principale ----------------------------------------------------
export default function AiSettingEdit({ setting, providers }) {
    const { data, setData, put, processing, errors, recentlySuccessful } = useForm({
        provider:     setting.provider     ?? 'groq',
        model:        setting.model        ?? '',
        sara_enabled: setting.sara_enabled ?? true,
        max_tokens:   setting.max_tokens   ?? 1024,
        temperature:  setting.temperature  ?? 0.7,
        config: {
            api_key: setting.config?.api_key ?? '',
        },
    });

    const [showKey, setShowKey] = useState(false);

    // Modèles disponibles pour le fournisseur courant
    const availableModels = providers[data.provider] ?? [];

    function handleProviderChange(provider) {
        const defaultModel = (providers[provider] ?? [])[0] ?? '';
        setData(d => ({ ...d, provider, model: defaultModel }));
    }

    function handleSubmit(e) {
        e.preventDefault();
        put(route('superadmin.ai-setting.update'));
    }

    const isConfigured = setting.config?.api_key === '***';

    return (
        <AppLayout title="SuperAdmin — Configuration IA (SARA)">
            <div className="mx-auto max-w-3xl px-4 py-6 space-y-8">
                <PageHeader
                    title="Configuration IA — SARA"
                    subtitle="Paramétrez le fournisseur LLM utilisé par l'assistante SARA (chatbot public et repli plateforme)."
                />

                {/* Badge statut + fournisseur actif */}
                <div className="flex flex-wrap items-center gap-3">
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-semibold
                        ${data.sara_enabled
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                            : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                        }`}>
                        <span className={`w-2 h-2 rounded-full ${data.sara_enabled ? 'bg-green-500' : 'bg-slate-400'}`} />
                        {data.sara_enabled ? 'SARA activée' : 'SARA désactivée'}
                    </span>

                    {data.provider && (
                        <span className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${PROVIDER_COLORS[data.provider] ?? ''}`}>
                            {PROVIDER_LABELS[data.provider] ?? data.provider}
                        </span>
                    )}

                    {isConfigured && (
                        <span className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-sm font-medium bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                    d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                            </svg>
                            Clé API configurée
                        </span>
                    )}
                </div>

                {/* Formulaire principal */}
                <form onSubmit={handleSubmit} className="space-y-6">

                    {/* Activation SARA */}
                    <div className="card">
                        <div className="card-header">
                            <h3 className="font-semibold text-slate-800 dark:text-slate-100">Statut de SARA</h3>
                        </div>
                        <div className="card-body">
                            <label className="flex items-center gap-4 cursor-pointer select-none">
                                {/* Toggle switch */}
                                <button
                                    type="button"
                                    role="switch"
                                    aria-checked={data.sara_enabled}
                                    onClick={() => setData('sara_enabled', !data.sara_enabled)}
                                    className={`relative inline-flex h-6 w-11 shrink-0 rounded-full border-2 border-transparent
                                        transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                                        ${data.sara_enabled ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-600'}`}
                                >
                                    <span
                                        className={`pointer-events-none block h-5 w-5 rounded-full bg-white shadow-md
                                            transform transition-transform duration-200
                                            ${data.sara_enabled ? 'translate-x-5' : 'translate-x-0'}`}
                                    />
                                </button>
                                <span className="text-sm text-slate-700 dark:text-slate-300">
                                    {data.sara_enabled
                                        ? 'SARA est active — le chatbot répond aux visiteurs'
                                        : 'SARA est désactivée — le chatbot affiche un message d\'indisponibilité'}
                                </span>
                            </label>
                        </div>
                    </div>

                    {/* Fournisseur + Modèle */}
                    <div className="card">
                        <div className="card-header">
                            <h3 className="font-semibold text-slate-800 dark:text-slate-100">Fournisseur LLM</h3>
                        </div>
                        <div className="card-body space-y-5">
                            <div className="grid gap-4 sm:grid-cols-2">
                                {/* Fournisseur */}
                                <div>
                                    <label className="form-label">
                                        Fournisseur <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        className={`form-input w-full ${errors.provider ? 'border-red-400' : ''}`}
                                        value={data.provider}
                                        onChange={e => handleProviderChange(e.target.value)}
                                    >
                                        {Object.entries(PROVIDER_LABELS).map(([key, label]) => (
                                            <option key={key} value={key}>{label}</option>
                                        ))}
                                    </select>
                                    {errors.provider && (
                                        <p className="mt-1 text-xs text-red-500">{errors.provider}</p>
                                    )}
                                </div>

                                {/* Modèle */}
                                <div>
                                    <label className="form-label">
                                        Modèle <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        className={`form-input w-full ${errors.model ? 'border-red-400' : ''}`}
                                        value={data.model}
                                        onChange={e => setData('model', e.target.value)}
                                    >
                                        {availableModels.length === 0 && (
                                            <option value="">— sélectionner un fournisseur —</option>
                                        )}
                                        {availableModels.map(m => (
                                            <option key={m} value={m}>{m}</option>
                                        ))}
                                    </select>
                                    {errors.model && (
                                        <p className="mt-1 text-xs text-red-500">{errors.model}</p>
                                    )}
                                </div>
                            </div>

                            {/* Lien vers la console du fournisseur */}
                            <p className="text-xs text-slate-400 dark:text-slate-500">
                                Obtenez votre clé API directement dans la console du fournisseur sélectionné.
                                Aucune clé n'est partagée entre entreprises.
                            </p>
                        </div>
                    </div>

                    {/* Clé API */}
                    <div className="card">
                        <div className="card-header">
                            <h3 className="font-semibold text-slate-800 dark:text-slate-100">Authentification</h3>
                        </div>
                        <div className="card-body space-y-4">
                            <div>
                                <label className="form-label">
                                    Clé API
                                    {isConfigured && (
                                        <span className="ml-2 text-xs font-normal text-slate-400">
                                            (laisser vide pour conserver la clé existante)
                                        </span>
                                    )}
                                </label>
                                <div className="relative">
                                    <input
                                        type={showKey ? 'text' : 'password'}
                                        className={`form-input w-full pr-10 font-mono text-sm ${errors['config.api_key'] ? 'border-red-400' : ''}`}
                                        value={data.config.api_key}
                                        onChange={e => setData('config', { ...data.config, api_key: e.target.value })}
                                        placeholder={isConfigured ? '••••••••••••••••••••' : 'sk-...  ou  gsk_...'}
                                        autoComplete="new-password"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowKey(v => !v)}
                                        className="absolute inset-y-0 right-0 flex items-center px-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                                        aria-label={showKey ? 'Masquer la clé' : 'Afficher la clé'}
                                    >
                                        {showKey ? (
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                    d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 4.411m0 0L21 21" />
                                            </svg>
                                        ) : (
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                            </svg>
                                        )}
                                    </button>
                                </div>
                                <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
                                    Stockée chiffrée au repos. Non visible après enregistrement.
                                </p>
                                {errors['config.api_key'] && (
                                    <p className="mt-1 text-xs text-red-500">{errors['config.api_key']}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Paramètres fins */}
                    <div className="card">
                        <div className="card-header">
                            <h3 className="font-semibold text-slate-800 dark:text-slate-100">Paramètres de génération</h3>
                        </div>
                        <div className="card-body space-y-6">

                            <RangeField
                                label="Longueur maximale (max_tokens)"
                                hint="Nombre maximum de tokens dans la réponse. 1024 est adapté pour SARA."
                                value={data.max_tokens}
                                min={100}
                                max={8192}
                                step={64}
                                onChange={v => setData('max_tokens', parseInt(v, 10))}
                                displayValue={`${data.max_tokens} tokens`}
                            />

                            <RangeField
                                label="Température (créativité)"
                                hint="0.0 = réponses très déterministes · 1.0 = plus créatif · 2.0 = très aléatoire"
                                value={data.temperature}
                                min={0}
                                max={2}
                                step={0.05}
                                onChange={v => setData('temperature', parseFloat(v))}
                                displayValue={parseFloat(data.temperature).toFixed(2)}
                            />

                            {/* Grille de référence température */}
                            <div className="grid grid-cols-3 gap-2 text-xs text-center text-slate-400 dark:text-slate-500">
                                <div className="bg-slate-50 dark:bg-slate-800 rounded px-2 py-1.5">
                                    <div className="font-semibold text-slate-600 dark:text-slate-300">0.0 – 0.4</div>
                                    <div>Précis, factuel</div>
                                </div>
                                <div className="bg-blue-50 dark:bg-blue-900/20 rounded px-2 py-1.5">
                                    <div className="font-semibold text-blue-600 dark:text-blue-400">0.5 – 0.9</div>
                                    <div>Recommandé SARA</div>
                                </div>
                                <div className="bg-slate-50 dark:bg-slate-800 rounded px-2 py-1.5">
                                    <div className="font-semibold text-slate-600 dark:text-slate-300">1.0 – 2.0</div>
                                    <div>Créatif, variable</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between">
                        <div>
                            {recentlySuccessful && (
                                <p className="text-sm font-medium text-green-600 dark:text-green-400">
                                    Configuration enregistrée avec succès.
                                </p>
                            )}
                        </div>
                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={processing}
                        >
                            {processing ? 'Enregistrement…' : 'Enregistrer la configuration'}
                        </button>
                    </div>
                </form>

                {/* Info-box architecture */}
                <div className="rounded-xl border border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/30 px-5 py-4 text-sm text-blue-700 dark:text-blue-300 space-y-1">
                    <p className="font-semibold">Architecture multi-fournisseur</p>
                    <p>Cette configuration est utilisée par SARA en ordre de priorité :</p>
                    <ol className="list-decimal list-inside space-y-0.5 mt-1 text-blue-600 dark:text-blue-400">
                        <li>Config IA de l'entreprise (clé propre via <em>Administration › IA</em>)</li>
                        <li>Config plateforme ci-dessus (SaraGateway global)</li>
                        <li>Moteur de règles interne (sans clé API, gratuit)</li>
                    </ol>
                </div>
            </div>
        </AppLayout>
    );
}
