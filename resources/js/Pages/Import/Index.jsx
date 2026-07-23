import { useState, useRef } from 'react';
import { router, usePage } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import Icon from '@/Components/Icon';
import { useTrans } from '@/i18n';

// ── Badge statut ────────────────────────────────────────────────────────────

const STATUS_STYLES = {
    pending:    'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
    processing: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
    completed:  'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
    failed:     'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
};

const STATUS_LABELS = {
    pending:    'En attente',
    processing: 'En cours',
    completed:  'Terminé',
    failed:     'Échoué',
};

function StatusBadge({ status }) {
    return (
        <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_STYLES[status] ?? STATUS_STYLES.pending}`}>
            {STATUS_LABELS[status] ?? status}
        </span>
    );
}

// ── Étape indicator ──────────────────────────────────────────────────────────

function StepIndicator({ step }) {
    const steps = ['Module', 'Fichier & Mapping', 'Import'];
    return (
        <div className="flex items-center gap-0">
            {steps.map((label, i) => {
                const num    = i + 1;
                const active = step === num;
                const done   = step > num;
                return (
                    <div key={i} className="flex items-center">
                        <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold transition-colors
                            ${done   ? 'bg-green-500 text-white'
                            : active ? 'bg-orange-500 text-white'
                            : 'bg-slate-200 text-slate-500 dark:bg-slate-700 dark:text-slate-400'}`}
                        >
                            {done ? <Icon name="check" className="h-4 w-4" /> : num}
                        </div>
                        <span className={`ml-2 hidden text-xs font-medium sm:block
                            ${active ? 'text-orange-600 dark:text-orange-400'
                            : done   ? 'text-green-600 dark:text-green-400'
                            : 'text-slate-400'}`}
                        >
                            {label}
                        </span>
                        {i < steps.length - 1 && (
                            <div className={`mx-3 h-px w-8 sm:w-16 ${done ? 'bg-green-400' : 'bg-slate-200 dark:bg-slate-700'}`} />
                        )}
                    </div>
                );
            })}
        </div>
    );
}

// ── Composant principal ──────────────────────────────────────────────────────

export default function ImportIndex({ modules = [], types = [], logs = [] }) {
    const { t } = useTrans();
    const { errors, flash } = usePage().props;
    const allModules = modules.length ? modules : types; // rétro-compat

    const [step,          setStep]          = useState(1);
    const [selectedModule, setSelectedModule] = useState('');
    const [file,          setFile]          = useState(null);
    const [loading,       setLoading]       = useState(false);
    const [submitting,    setSubmitting]    = useState(false);
    const [preview,       setPreview]       = useState(null);
    const [mapping,       setMapping]       = useState({});
    const [report,        setReport]        = useState(null);
    const fileRef = useRef();

    const moduleConfig = allModules.find(m => m.key === selectedModule);

    // ── Réinitialiser ──────────────────────────────────────────────────────────
    const reset = () => {
        setStep(1);
        setSelectedModule('');
        setFile(null);
        setPreview(null);
        setMapping({});
        setReport(null);
        if (fileRef.current) fileRef.current.value = '';
    };

    // ── Étape 2 : aperçu ──────────────────────────────────────────────────────
    const handlePreview = async () => {
        if (!selectedModule || !file) return;
        setLoading(true);
        const fd = new FormData();
        fd.append('file', file);
        fd.append('type', selectedModule); // param attendu par l'endpoint existant
        fd.append('_token', document.querySelector('meta[name=csrf-token]')?.content ?? '');

        try {
            const res  = await fetch(route('import.preview'), { method: 'POST', body: fd });
            const data = await res.json();
            if (!res.ok) {
                alert(data.error ?? 'Erreur de lecture du fichier.');
            } else {
                setPreview(data);
                // Mapping automatique suggéré par le serveur
                const initial = {};
                Object.entries(data.auto_map ?? {}).forEach(([i, field]) => {
                    initial[parseInt(i, 10)] = field;
                });
                setMapping(initial);
                setStep(2);
            }
        } catch {
            alert('Impossible de contacter le serveur.');
        } finally {
            setLoading(false);
        }
    };

    // ── Étape 3 : lancer l'import ────────────────────────────────────────────
    const handleRun = () => {
        if (!preview || !file) return;
        setSubmitting(true);

        const fd = new FormData();
        fd.append('file',   file);
        fd.append('module', selectedModule);
        // mapping : {'0': 'name', '1': 'email', ...}
        Object.entries(mapping).forEach(([k, v]) => {
            fd.append(`mapping[${k}]`, v);
        });

        // Utiliser router.post d'Inertia pour gérer la redirection + flash
        router.post(route('import.run'), fd, {
            forceFormData: true,
            onFinish: () => setSubmitting(false),
            onSuccess: () => {
                setStep(1);
                setSelectedModule('');
                setFile(null);
                setPreview(null);
                setMapping({});
                if (fileRef.current) fileRef.current.value = '';
            },
        });
    };

    // Colonnes disponibles pour le mapping (field → label)
    const targetColumns = preview
        ? Object.entries(preview.columns ?? {})
        : [];

    return (
        <AppLayout
            title="Import de données"
            breadcrumbs={[{ label: 'Import', href: route('import.index') }]}
        >
            <div className="mx-auto max-w-4xl space-y-6">

                {/* ── Flash succès ───────────────────────────────────────────── */}
                {flash?.success && (
                    <div className="flex items-start gap-3 rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-800 dark:border-green-800 dark:bg-green-900/20 dark:text-green-300">
                        <Icon name="check-circle" className="mt-0.5 h-4 w-4 shrink-0" />
                        <span>{flash.success}</span>
                    </div>
                )}

                {/* ── Erreurs serveur ────────────────────────────────────────── */}
                {(errors?.import || errors?.file) && (
                    <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300">
                        <Icon name="alert-circle" className="mt-0.5 h-4 w-4 shrink-0" />
                        <span>{errors.import ?? errors.file}</span>
                    </div>
                )}

                {/* ── En-tête + indicateur d'étape ──────────────────────────── */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">
                            {t('Import de données')}
                        </h1>
                        <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
                            {t('Importez vos données depuis un fichier CSV ou Excel (.xlsx)')}
                        </p>
                    </div>
                    <StepIndicator step={step} />
                </div>

                {/* ════════════════════════════════════════════════════════════
                    ÉTAPE 1 : Sélection du module
                ════════════════════════════════════════════════════════════ */}
                {step === 1 && (
                    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                        <h2 className="mb-5 text-base font-semibold text-slate-800 dark:text-slate-100">
                            {t('Étape 1 — Choisir le module à importer')}
                        </h2>

                        {/* Grille des modules */}
                        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                            {allModules.map(m => (
                                <button
                                    key={m.key}
                                    onClick={() => setSelectedModule(m.key)}
                                    className={`flex flex-col gap-2 rounded-xl border-2 p-4 text-left transition-all
                                        ${selectedModule === m.key
                                            ? 'border-orange-400 bg-orange-50 dark:border-orange-500 dark:bg-orange-900/20'
                                            : 'border-slate-200 hover:border-orange-200 dark:border-slate-700 dark:hover:border-orange-700'
                                        }`}
                                >
                                    <span className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                                        {t(m.label)}
                                    </span>
                                    <span className="text-xs text-slate-400">
                                        {(m.column_keys ?? m.columns ?? []).slice(0, 4).join(', ')}
                                        {(m.column_keys ?? m.columns ?? []).length > 4 ? '…' : ''}
                                    </span>
                                </button>
                            ))}
                        </div>

                        {/* Colonnes attendues + download template */}
                        {moduleConfig && (
                            <div className="mt-5 rounded-lg border border-blue-100 bg-blue-50 p-4 dark:border-blue-900/40 dark:bg-blue-900/20">
                                <div className="mb-3 flex items-center justify-between gap-3">
                                    <p className="text-xs font-semibold text-blue-700 dark:text-blue-300">
                                        {t('Colonnes du module')} {moduleConfig.label}
                                    </p>
                                    <a
                                        href={route('import.template', { module: selectedModule })}
                                        download
                                        className="inline-flex items-center gap-1.5 rounded-md bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700"
                                    >
                                        <Icon name="download" className="h-3 w-3" />
                                        {t('Télécharger le modèle CSV')}
                                    </a>
                                </div>
                                <div className="flex flex-wrap gap-1.5">
                                    {(moduleConfig.column_keys ?? moduleConfig.columns ?? []).map((col, i) => (
                                        <span key={i} className="rounded bg-blue-100 px-2 py-0.5 text-xs text-blue-800 dark:bg-blue-800/40 dark:text-blue-200">
                                            {col}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Upload fichier */}
                        {selectedModule && (
                            <div className="mt-5 space-y-3">
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                                    {t('Fichier CSV ou Excel')}
                                </label>
                                <input
                                    ref={fileRef}
                                    type="file"
                                    accept=".csv,.txt,.xlsx,.xls"
                                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                                    onChange={e => setFile(e.target.files[0] ?? null)}
                                />
                                <p className="text-xs text-slate-400">
                                    {t('Max 10 Mo — CSV (séparateur ; ou ,) ou Excel .xlsx/.xls')}
                                </p>
                            </div>
                        )}

                        <div className="mt-6 flex justify-end">
                            <button
                                onClick={handlePreview}
                                disabled={!selectedModule || !file || loading}
                                className="inline-flex items-center gap-2 rounded-lg bg-orange-500 px-6 py-2.5 text-sm font-semibold text-white hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {loading
                                    ? <><Icon name="loader" className="h-4 w-4 animate-spin" />{t('Analyse…')}</>
                                    : <><Icon name="eye" className="h-4 w-4" />{t('Analyser le fichier')}</>
                                }
                            </button>
                        </div>
                    </div>
                )}

                {/* ════════════════════════════════════════════════════════════
                    ÉTAPE 2 : Aperçu + Mapping des colonnes
                ════════════════════════════════════════════════════════════ */}
                {step === 2 && preview && (
                    <>
                        {/* Bandeau info */}
                        <div className="flex items-center gap-3 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700 dark:border-blue-800 dark:bg-blue-900/20 dark:text-blue-300">
                            <Icon name="info" className="h-4 w-4 shrink-0" />
                            <span>
                                <strong>{preview.total}</strong> {t('lignes détectées dans')} <strong>{file?.name}</strong>.&nbsp;
                                {t('Associez chaque colonne du fichier à un champ CONSTRUIRO.')}
                            </span>
                            <button
                                onClick={() => { setPreview(null); setMapping({}); setFile(null); setStep(1); if (fileRef.current) fileRef.current.value = ''; }}
                                className="ml-auto shrink-0 text-xs underline underline-offset-2"
                            >
                                {t('Changer de fichier')}
                            </button>
                        </div>

                        {/* Mapping */}
                        <div className="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
                            <div className="border-b border-slate-200 px-6 py-4 dark:border-slate-800">
                                <h2 className="text-base font-semibold text-slate-800 dark:text-slate-100">
                                    {t('Correspondance des colonnes')}
                                </h2>
                                <p className="text-xs text-slate-400">
                                    {t('Les lignes en vert ont été reconnues automatiquement.')}
                                </p>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead className="bg-slate-50 dark:bg-slate-800/60">
                                        <tr>
                                            <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">{t('Colonne fichier')}</th>
                                            <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">{t('Exemple')}</th>
                                            <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">{t('Champ CONSTRUIRO')}</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                        {preview.headers.map((h, i) => {
                                            const mappedVal = mapping[i] ?? '';
                                            const isAuto    = preview.auto_map?.[i];
                                            return (
                                                <tr key={i} className={isAuto ? 'bg-green-50/60 dark:bg-green-900/10' : ''}>
                                                    <td className="px-4 py-2 font-medium text-slate-700 dark:text-slate-200">
                                                        {isAuto && <span className="mr-1.5 inline-block h-2 w-2 rounded-full bg-green-500" />}
                                                        {h}
                                                    </td>
                                                    <td className="px-4 py-2 text-slate-400">
                                                        {preview.preview[0]?.[i] ?? '—'}
                                                    </td>
                                                    <td className="px-4 py-2">
                                                        <select
                                                            className="w-full rounded border border-slate-300 bg-white px-2 py-1 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                                                            value={mappedVal}
                                                            onChange={e => setMapping(m => ({ ...m, [i]: e.target.value }))}
                                                        >
                                                            <option value="">{t('-- Ignorer --')}</option>
                                                            {targetColumns.map(([field, cfg]) => (
                                                                <option key={field} value={field}>
                                                                    {cfg.label ?? field}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Aperçu 5 lignes */}
                        <div className="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
                            <div className="border-b border-slate-200 px-6 py-4 dark:border-slate-800">
                                <h2 className="text-base font-semibold text-slate-800 dark:text-slate-100">
                                    {t('Aperçu — 5 premières lignes')}
                                </h2>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-xs">
                                    <thead className="bg-slate-50 dark:bg-slate-800/60">
                                        <tr>
                                            {preview.headers.map((h, i) => (
                                                <th key={i} className="px-3 py-2 text-left font-medium text-slate-500">{h}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                        {preview.preview.map((row, ri) => (
                                            <tr key={ri} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                                                {(Array.isArray(row) ? row : Object.values(row)).map((cell, ci) => (
                                                    <td key={ci} className="px-3 py-1.5 text-slate-600 dark:text-slate-300">
                                                        {cell ?? '—'}
                                                    </td>
                                                ))}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Boutons navigation */}
                        <div className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                            <button
                                onClick={() => setStep(1)}
                                className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                            >
                                <Icon name="arrow-left" className="h-4 w-4" />
                                {t('Retour')}
                            </button>
                            <button
                                onClick={() => setStep(3)}
                                className="inline-flex items-center gap-2 rounded-lg bg-orange-500 px-6 py-2.5 text-sm font-semibold text-white hover:bg-orange-600"
                            >
                                {t('Continuer')}
                                <Icon name="arrow-right" className="h-4 w-4" />
                            </button>
                        </div>
                    </>
                )}

                {/* ════════════════════════════════════════════════════════════
                    ÉTAPE 3 : Confirmation + lancement
                ════════════════════════════════════════════════════════════ */}
                {step === 3 && preview && (
                    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                        <h2 className="mb-4 text-base font-semibold text-slate-800 dark:text-slate-100">
                            {t('Étape 3 — Confirmation de l\'import')}
                        </h2>

                        {/* Récapitulatif */}
                        <div className="mb-6 grid gap-4 sm:grid-cols-3">
                            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800">
                                <p className="text-xs text-slate-500 dark:text-slate-400">{t('Module')}</p>
                                <p className="mt-1 font-semibold text-slate-800 dark:text-slate-100">{moduleConfig?.label ?? selectedModule}</p>
                            </div>
                            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800">
                                <p className="text-xs text-slate-500 dark:text-slate-400">{t('Fichier')}</p>
                                <p className="mt-1 truncate font-semibold text-slate-800 dark:text-slate-100">{file?.name}</p>
                            </div>
                            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800">
                                <p className="text-xs text-slate-500 dark:text-slate-400">{t('Lignes à importer')}</p>
                                <p className="mt-1 text-2xl font-bold text-orange-500">{preview.total}</p>
                            </div>
                        </div>

                        {/* Mapping récapitulatif */}
                        <div className="mb-6 rounded-lg border border-slate-200 p-4 dark:border-slate-700">
                            <p className="mb-3 text-xs font-semibold text-slate-600 dark:text-slate-300">
                                {t('Correspondances définies')} ({Object.values(mapping).filter(Boolean).length} / {preview.headers.length})
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {preview.headers.map((h, i) => (
                                    mapping[i] ? (
                                        <span key={i} className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-1 text-xs text-green-800 dark:bg-green-900/30 dark:text-green-300">
                                            <span className="font-medium">{h}</span>
                                            <Icon name="arrow-right" className="h-2.5 w-2.5" />
                                            <span>{mapping[i]}</span>
                                        </span>
                                    ) : (
                                        <span key={i} className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-400 dark:bg-slate-800 dark:text-slate-500">
                                            <Icon name="x" className="h-2.5 w-2.5" />
                                            <span>{h}</span>
                                        </span>
                                    )
                                ))}
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center justify-between gap-4">
                            <button
                                onClick={() => setStep(2)}
                                className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                            >
                                <Icon name="arrow-left" className="h-4 w-4" />
                                {t('Modifier le mapping')}
                            </button>

                            <button
                                onClick={handleRun}
                                disabled={submitting}
                                className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {submitting
                                    ? <><Icon name="loader" className="h-4 w-4 animate-spin" />{t('Import en cours…')}</>
                                    : <><Icon name="upload" className="h-4 w-4" />{t('Lancer l\'import')} ({preview.total} {t('lignes')})</>
                                }
                            </button>
                        </div>
                    </div>
                )}

                {/* ════════════════════════════════════════════════════════════
                    Historique des imports
                ════════════════════════════════════════════════════════════ */}
                {logs.length > 0 && (
                    <div className="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
                        <div className="border-b border-slate-200 px-6 py-4 dark:border-slate-800">
                            <h2 className="text-base font-semibold text-slate-800 dark:text-slate-100">
                                {t('Historique des imports récents')}
                            </h2>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-slate-50 dark:bg-slate-800/60">
                                    <tr>
                                        <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">{t('Module')}</th>
                                        <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">{t('Fichier')}</th>
                                        <th className="px-4 py-2.5 text-center text-xs font-semibold uppercase tracking-wide text-slate-500">{t('Total')}</th>
                                        <th className="px-4 py-2.5 text-center text-xs font-semibold uppercase tracking-wide text-slate-500">{t('Importés')}</th>
                                        <th className="px-4 py-2.5 text-center text-xs font-semibold uppercase tracking-wide text-slate-500">{t('Erreurs')}</th>
                                        <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">{t('Statut')}</th>
                                        <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">{t('Date')}</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                    {logs.map(log => (
                                        <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                                            <td className="px-4 py-2.5">
                                                <span className="rounded bg-orange-100 px-2 py-0.5 text-xs font-medium capitalize text-orange-800 dark:bg-orange-900/30 dark:text-orange-300">
                                                    {log.module}
                                                </span>
                                            </td>
                                            <td className="max-w-xs px-4 py-2.5 text-slate-600 dark:text-slate-300">
                                                <span className="block truncate text-xs" title={log.filename}>{log.filename}</span>
                                            </td>
                                            <td className="px-4 py-2.5 text-center text-slate-500">{log.total ?? 0}</td>
                                            <td className="px-4 py-2.5 text-center font-semibold text-green-600 dark:text-green-400">{log.imported ?? 0}</td>
                                            <td className="px-4 py-2.5 text-center font-semibold text-red-500 dark:text-red-400">{log.errors ?? 0}</td>
                                            <td className="px-4 py-2.5"><StatusBadge status={log.status} /></td>
                                            <td className="px-4 py-2.5 text-xs text-slate-400">{log.created_at}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {logs.length === 0 && step === 1 && (
                    <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-6 py-8 text-center dark:border-slate-700 dark:bg-slate-900">
                        <Icon name="inbox" className="mx-auto mb-2 h-8 w-8 text-slate-300 dark:text-slate-600" />
                        <p className="text-sm text-slate-400 dark:text-slate-500">{t('Aucun import effectué pour le moment.')}</p>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
