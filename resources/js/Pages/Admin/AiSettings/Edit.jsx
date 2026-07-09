import { useState } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import Icon from '@/Components/Icon';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import { Head, Link, router, useForm } from '@inertiajs/react';

export default function Edit({ setting, providers }) {
    const form = useForm({
        provider: setting.provider ?? 'none',
        model: setting.model ?? '',
        base_url: setting.base_url ?? '',
        enabled: setting.enabled ?? false,
        api_key: '',
    });
    const { data, setData, errors, processing } = form;
    const [testing, setTesting] = useState(false);

    const current = providers.find((p) => p.key === data.provider) ?? providers[0];
    const isNone = data.provider === 'none';

    const submit = (e) => {
        e.preventDefault();
        form.put('/admin/ai-settings', { preserveScroll: true, onSuccess: () => form.setData('api_key', '') });
    };

    const testConnection = () => {
        setTesting(true);
        router.post('/admin/ai-settings/test', {}, {
            preserveScroll: true,
            onFinish: () => setTesting(false),
        });
    };

    return (
        <AppLayout header="Paramétrage de l'Assistant IA">
            <Head title="Paramétrage IA" />

            <div className="mx-auto max-w-2xl space-y-6">
                <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
                    <div className="flex items-start gap-3">
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-orange-100 text-orange-600 dark:bg-orange-500/10">
                            <Icon name="sparkles" className="h-5 w-5" />
                        </span>
                        <div>
                            <h2 className="font-semibold text-slate-800 dark:text-slate-100">Fournisseur d'intelligence artificielle</h2>
                            <p className="mt-1 text-sm text-slate-500">
                                Aucune clé n'est fournie par le logiciel. Choisissez votre fournisseur et saisissez
                                votre propre clé API. Sans configuration, l'assistant fonctionne avec le moteur de
                                règles interne (gratuit).
                            </p>
                        </div>
                    </div>
                </div>

                <form onSubmit={submit} className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
                    <div className="space-y-5">
                        {/* Fournisseur */}
                        <div>
                            <InputLabel htmlFor="provider" value="Fournisseur" />
                            <select
                                id="provider"
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
                                value={data.provider}
                                onChange={(e) => setData('provider', e.target.value)}
                            >
                                {providers.map((p) => (
                                    <option key={p.key} value={p.key}>{p.label}</option>
                                ))}
                            </select>
                            <InputError message={errors.provider} className="mt-1" />
                            {current?.docs && (
                                <p className="mt-1 text-xs text-slate-400">
                                    Obtenir une clé : <a href={current.docs} target="_blank" rel="noopener" className="text-orange-600 hover:underline">{current.docs}</a>
                                </p>
                            )}
                        </div>

                        {!isNone && (
                            <>
                                {/* Clé API */}
                                <div>
                                    <InputLabel htmlFor="api_key" value="Clé API" />
                                    <TextInput
                                        id="api_key"
                                        type="password"
                                        autoComplete="off"
                                        className="mt-1 block w-full"
                                        placeholder={setting.has_key ? '•••••••• (clé déjà enregistrée — laisser vide pour conserver)' : 'Collez votre clé API'}
                                        value={data.api_key}
                                        onChange={(e) => setData('api_key', e.target.value)}
                                    />
                                    <InputError message={errors.api_key} className="mt-1" />
                                    <p className="mt-1 text-xs text-slate-400">
                                        La clé est chiffrée en base et n'est jamais réaffichée.
                                    </p>
                                </div>

                                {/* Modèle */}
                                <div>
                                    <InputLabel htmlFor="model" value="Modèle" />
                                    <TextInput
                                        id="model"
                                        className="mt-1 block w-full"
                                        placeholder={current?.default_model ? `Défaut : ${current.default_model}` : ''}
                                        value={data.model}
                                        onChange={(e) => setData('model', e.target.value)}
                                    />
                                    <InputError message={errors.model} className="mt-1" />
                                </div>

                                {/* URL de base (avancé) */}
                                <div>
                                    <InputLabel htmlFor="base_url" value="URL de base (optionnel)" />
                                    <TextInput
                                        id="base_url"
                                        className="mt-1 block w-full"
                                        placeholder={current?.base_url ?? ''}
                                        value={data.base_url}
                                        onChange={(e) => setData('base_url', e.target.value)}
                                    />
                                    <InputError message={errors.base_url} className="mt-1" />
                                </div>

                                {/* Activation */}
                                <label className="flex items-center gap-3">
                                    <input
                                        type="checkbox"
                                        className="rounded border-gray-300 text-orange-500 focus:ring-orange-500"
                                        checked={data.enabled}
                                        onChange={(e) => setData('enabled', e.target.checked)}
                                    />
                                    <span className="text-sm text-slate-700 dark:text-slate-200">
                                        Activer l'assistant IA avec ce fournisseur
                                    </span>
                                </label>
                            </>
                        )}
                    </div>

                    <div className="mt-6 flex items-center justify-between">
                        <Link href="/ai" className="text-sm text-slate-500 hover:underline">← Retour à l'assistant</Link>
                        <div className="flex gap-2">
                            {!isNone && (
                                <button
                                    type="button"
                                    onClick={testConnection}
                                    disabled={testing}
                                    className="inline-flex items-center gap-2 rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                                >
                                    <Icon name="plug-zap" className="h-4 w-4" /> {testing ? 'Test…' : 'Tester la connexion'}
                                </button>
                            )}
                            <PrimaryButton disabled={processing} className="bg-orange-500 hover:bg-orange-600 focus:bg-orange-600">
                                Enregistrer
                            </PrimaryButton>
                        </div>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
