import { useState, useRef } from 'react';
import { router, usePage } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import Icon from '@/Components/Icon';
import { useTrans } from '@/i18n';

export default function ImportIndex({ types }) {
    const { t } = useTrans();
    const { errors } = usePage().props;

    const [selectedType, setSelectedType] = useState('');
    const [file, setFile]                 = useState(null);
    const [loading, setLoading]           = useState(false);
    const [preview, setPreview]           = useState(null); // résultat de l'étape 2
    const [mapping, setMapping]           = useState({});   // { colIndex: fieldName }
    const [skipDups, setSkipDups]         = useState(true);
    const fileRef = useRef();

    // Config du type sélectionné (label, execute_route, columns)
    const typeConfig = types.find(tp => tp.key === selectedType);

    // ── Étape 2 : aperçu ──────────────────────────────────────────────────────
    const handlePreview = async () => {
        if (!selectedType || !file) return;
        setLoading(true);
        const fd = new FormData();
        fd.append('file', file);
        fd.append('type', selectedType);
        fd.append('_token', document.querySelector('meta[name=csrf-token]')?.content ?? '');

        try {
            const res  = await fetch(route('import.preview'), { method: 'POST', body: fd });
            const data = await res.json();
            if (!res.ok) {
                alert(data.error ?? 'Erreur de lecture du fichier.');
            } else {
                setPreview(data);
                // Appliquer le mapping automatique suggéré
                const initial = {};
                Object.entries(data.auto_map ?? {}).forEach(([i, field]) => {
                    initial[parseInt(i)] = field;
                });
                setMapping(initial);
            }
        } catch {
            alert('Impossible de contacter le serveur.');
        } finally {
            setLoading(false);
        }
    };

    // ── Étape 4 : exécution ──────────────────────────────────────────────────
    const handleExecute = () => {
        if (!preview) return;
        // Les 5 nouveaux types ont leur propre route enrichie ; les autres utilisent la route générique.
        const executeRoute = typeConfig?.execute_route ?? 'import.execute';
        router.post(route(executeRoute), {
            type:      selectedType,
            mapping:   mapping,
            tmp_path:  preview.tmp_path,
            skip_dups: skipDups,
        });
    };

    const columns = preview ? Object.entries(preview.columns) : [];

    return (
        <AppLayout title="Import de données" breadcrumbs={[{ label: 'Import', href: '/import' }]}>
            <div className="mx-auto max-w-4xl space-y-6">

                {/* Erreurs serveur */}
                {errors?.import && (
                    <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300">
                        <Icon name="alert-circle" className="mr-1.5 inline h-4 w-4" />
                        {errors.import}
                    </div>
                )}

                {/* ── Étape 1 : Sélection type + fichier ─────────────────── */}
                {!preview && (
                    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                        <h2 className="mb-4 text-base font-semibold text-slate-800 dark:text-slate-100">
                            {t('Sélectionner le type de données et le fichier')}
                        </h2>

                        <div className="grid gap-4 sm:grid-cols-2">
                            {/* Type */}
                            <div>
                                <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                                    {t('Type de données')}
                                </label>
                                <select
                                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                                    value={selectedType}
                                    onChange={e => setSelectedType(e.target.value)}
                                >
                                    <option value="">{t('-- Choisir --')}</option>
                                    {types.map(tp => (
                                        <option key={tp.key} value={tp.key}>{t(tp.label)}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Fichier */}
                            <div>
                                <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                                    {t('Fichier CSV ou Excel')}
                                </label>
                                <input
                                    ref={fileRef}
                                    type="file"
                                    accept=".csv,.txt,.xlsx,.xls"
                                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                                    onChange={e => setFile(e.target.files[0] ?? null)}
                                />
                                <p className="mt-1 text-xs text-slate-400">{t('Max 10 Mo — CSV (;/,) ou Excel .xlsx')}</p>
                            </div>
                        </div>

                        {/* Colonnes attendues pour le type sélectionné */}
                        {typeConfig?.columns?.length > 0 && (
                            <div className="mt-4 rounded-lg border border-blue-100 bg-blue-50 px-4 py-3 dark:border-blue-900/40 dark:bg-blue-900/20">
                                <p className="mb-1.5 text-xs font-semibold text-blue-700 dark:text-blue-300">
                                    {t('Colonnes attendues dans le fichier')} — {typeConfig.label}
                                </p>
                                <div className="flex flex-wrap gap-1.5">
                                    {typeConfig.columns.map((col, i) => (
                                        <span key={i} className="rounded bg-blue-100 px-2 py-0.5 text-xs text-blue-800 dark:bg-blue-800/40 dark:text-blue-200">
                                            {col}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="mt-5 flex items-center justify-between gap-3">
                            {/* Lien template CSV */}
                            {selectedType && ['projects','quotes','invoices','stocks','equipment'].includes(selectedType) && (
                                <a
                                    href={`/templates/import/${
                                        { projects: 'projets', quotes: 'devis', invoices: 'factures', stocks: 'stocks', equipment: 'equipements' }[selectedType]
                                    }-template.csv`}
                                    download
                                    className="inline-flex items-center gap-1.5 text-xs text-slate-500 underline-offset-2 hover:text-orange-500 hover:underline"
                                >
                                    <Icon name="download" className="h-3.5 w-3.5" />
                                    {t('Télécharger le modèle CSV')}
                                </a>
                            )}
                            <button
                                onClick={handlePreview}
                                disabled={!selectedType || !file || loading}
                                className="ml-auto inline-flex items-center gap-2 rounded-lg bg-orange-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-orange-600 disabled:opacity-50"
                            >
                                {loading
                                    ? <><Icon name="loader" className="h-4 w-4 animate-spin" />{t('Analyse…')}</>
                                    : <><Icon name="eye" className="h-4 w-4" />{t('Analyser le fichier')}</>
                                }
                            </button>
                        </div>
                    </div>
                )}

                {/* ── Étape 2/3 : Mapping + aperçu ───────────────────────── */}
                {preview && (
                    <>
                        {/* Stats */}
                        <div className="flex items-center gap-3 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700 dark:border-blue-800 dark:bg-blue-900/20 dark:text-blue-300">
                            <Icon name="info" className="h-4 w-4 shrink-0" />
                            <span>
                                {t('Fichier analysé')}&nbsp;— <strong>{preview.total}</strong> {t('lignes détectées')}.&nbsp;
                                {t('Associez chaque colonne du fichier à un champ CONSTRUIRO.')}
                            </span>
                            <button
                                onClick={() => { setPreview(null); setMapping({}); setFile(null); if (fileRef.current) fileRef.current.value = ''; }}
                                className="ml-auto shrink-0 text-xs underline"
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
                                <p className="text-xs text-slate-400">{t('Les colonnes en vert ont été reconnues automatiquement.')}</p>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead className="bg-slate-50 dark:bg-slate-800/60">
                                        <tr>
                                            <th className="px-4 py-2 text-left font-medium text-slate-600 dark:text-slate-300">{t('Colonne fichier')}</th>
                                            <th className="px-4 py-2 text-left font-medium text-slate-600 dark:text-slate-300">{t('Exemple')}</th>
                                            <th className="px-4 py-2 text-left font-medium text-slate-600 dark:text-slate-300">{t('Champ CONSTRUIRO')}</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                        {preview.headers.map((h, i) => {
                                            const mapped = mapping[i] ?? '';
                                            const auto   = preview.auto_map?.[i];
                                            return (
                                                <tr key={i} className={auto ? 'bg-green-50/50 dark:bg-green-900/10' : ''}>
                                                    <td className="px-4 py-2 font-medium text-slate-700 dark:text-slate-200">{h}</td>
                                                    <td className="px-4 py-2 text-slate-400">
                                                        {preview.preview[0]?.[i] ?? '—'}
                                                    </td>
                                                    <td className="px-4 py-2">
                                                        <select
                                                            className="w-full rounded border border-slate-300 bg-white px-2 py-1 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                                                            value={mapped}
                                                            onChange={e => setMapping(m => ({ ...m, [i]: e.target.value }))}
                                                        >
                                                            <option value="">{t('-- Ignorer --')}</option>
                                                            {columns.map(([field, cfg]) => (
                                                                <option key={field} value={field}>{cfg.label}</option>
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

                        {/* Aperçu données */}
                        <div className="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
                            <div className="border-b border-slate-200 px-6 py-4 dark:border-slate-800">
                                <h2 className="text-base font-semibold text-slate-800 dark:text-slate-100">
                                    {t('Aperçu (5 premières lignes)')}
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
                                            <tr key={ri}>
                                                {row.map((cell, ci) => (
                                                    <td key={ci} className="px-3 py-1.5 text-slate-600 dark:text-slate-300">{cell}</td>
                                                ))}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Options + lancer */}
                        <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                            <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                                <input
                                    type="checkbox"
                                    className="rounded border-slate-300 text-orange-500 focus:ring-orange-400"
                                    checked={skipDups}
                                    onChange={e => setSkipDups(e.target.checked)}
                                />
                                {t('Ignorer les doublons (basé sur le champ unique)')}
                            </label>

                            <button
                                onClick={handleExecute}
                                className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-green-700"
                            >
                                <Icon name="upload" className="h-4 w-4" />
                                {t('Lancer l\'import')} ({preview.total} {t('lignes')})
                            </button>
                        </div>
                    </>
                )}
            </div>
        </AppLayout>
    );
}
