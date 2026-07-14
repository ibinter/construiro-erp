import { useState } from 'react';
import { router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import Icon from '@/Components/Icon';
import { useTrans } from '@/i18n';

const COLOR_CLASSES = {
    orange:  'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400',
    yellow:  'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400',
    blue:    'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
    purple:  'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400',
    slate:   'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300',
    green:   'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400',
    indigo:  'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400',
    teal:    'bg-teal-100 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400',
};

export default function IntegrationsIndex({ integrations = [] }) {
    const { t } = useTrans();
    const [editing, setEditing]  = useState(null); // { type, provider, fields, config }
    const [formData, setFormData] = useState({});
    const [saving, setSaving]    = useState(false);

    const openEdit = (integ) => {
        setEditing(integ);
        setFormData(Object.fromEntries(
            integ.fields.map(f => [f.key, integ.config?.[f.key] ?? ''])
        ));
    };

    const handleSave = (integ, enabled) => {
        setSaving(true);
        router.put(route('integrations.update', { type: integ.type, provider: integ.provider }), {
            is_enabled: enabled ?? integ.is_enabled,
            config:     formData,
        }, {
            onFinish: () => { setSaving(false); setEditing(null); },
        });
    };

    const handleTest = (integ) => {
        router.post(route('integrations.test', { type: integ.type, provider: integ.provider }));
    };

    // Grouper par type
    const groups = integrations.reduce((acc, integ) => {
        (acc[integ.type] = acc[integ.type] ?? []).push(integ);
        return acc;
    }, {});

    const groupLabels = {
        payment:  '💳 Paiements Mobile Money',
        ai:       '🤖 Intelligence Artificielle',
        email:    '📧 Email',
        whatsapp: '💬 WhatsApp',
        webhook:  '🔗 Webhooks sortants',
        api:      '🔌 API tierces',
    };

    return (
        <AppLayout
            title="Intégrations"
            breadcrumbs={[{ label: 'Administration', href: '/admin' }, { label: 'Intégrations' }]}
        >
            <div className="mx-auto max-w-5xl space-y-8">

                {Object.entries(groups).map(([type, items]) => (
                    <section key={type}>
                        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                            {t(groupLabels[type] ?? type)}
                        </h2>
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {items.map((integ) => (
                                <IntegrationCard
                                    key={integ.type + ':' + integ.provider}
                                    integ={integ}
                                    onEdit={() => openEdit(integ)}
                                    onTest={() => handleTest(integ)}
                                    onToggle={(enabled) => {
                                        setFormData(Object.fromEntries(
                                            integ.fields.map(f => [f.key, integ.config?.[f.key] ?? ''])
                                        ));
                                        handleSave(integ, enabled);
                                    }}
                                />
                            ))}
                        </div>
                    </section>
                ))}
            </div>

            {/* Modal d'édition */}
            {editing && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl dark:bg-slate-900">
                        <div className="mb-4 flex items-center justify-between">
                            <h2 className="text-base font-bold text-slate-800 dark:text-slate-100">
                                {t('Configurer')} {editing.label}
                            </h2>
                            <button onClick={() => setEditing(null)} className="text-slate-400 hover:text-slate-600">
                                <Icon name="x" className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="space-y-3">
                            {editing.fields.map((field) => (
                                <div key={field.key}>
                                    <label className="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-300">
                                        {t(field.label)}
                                    </label>
                                    {field.type === 'checkbox' ? (
                                        <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                                            <input
                                                type="checkbox"
                                                checked={!!formData[field.key]}
                                                onChange={e => setFormData(d => ({ ...d, [field.key]: e.target.checked }))}
                                                className="rounded border-slate-300 text-orange-500"
                                            />
                                            {t('Activer le mode sandbox (test)')}
                                        </label>
                                    ) : (
                                        <input
                                            type={field.type}
                                            value={formData[field.key] ?? ''}
                                            placeholder={field.placeholder ?? ''}
                                            onChange={e => setFormData(d => ({ ...d, [field.key]: e.target.value }))}
                                            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                                        />
                                    )}
                                </div>
                            ))}
                        </div>

                        <div className="mt-5 flex justify-end gap-3">
                            <button
                                onClick={() => setEditing(null)}
                                className="rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 dark:border-slate-700"
                            >
                                {t('Annuler')}
                            </button>
                            <button
                                onClick={() => handleSave(editing)}
                                disabled={saving}
                                className="rounded-lg bg-orange-500 px-5 py-2 text-sm font-semibold text-white hover:bg-orange-600 disabled:opacity-50"
                            >
                                {saving ? t('Enregistrement…') : t('Enregistrer')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}

function IntegrationCard({ integ, onEdit, onTest, onToggle }) {
    const { t } = useTrans();
    const colorCls = COLOR_CLASSES[integ.color] ?? COLOR_CLASSES.slate;

    return (
        <div className={`flex flex-col rounded-xl border bg-white p-4 shadow-sm transition-all dark:bg-slate-900 ${
            integ.is_enabled
                ? 'border-green-200 dark:border-green-800'
                : 'border-slate-200 dark:border-slate-800'
        }`}>
            {/* Header */}
            <div className="mb-3 flex items-start gap-3">
                <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${colorCls}`}>
                    <Icon name={integ.icon} className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-slate-800 dark:text-slate-100">{integ.label}</p>
                    <p className="text-[11px] text-slate-400">{integ.type}</p>
                </div>
                {/* Toggle */}
                <button
                    onClick={() => onToggle(!integ.is_enabled)}
                    className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                        integ.is_enabled
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                            : 'bg-slate-100 text-slate-500 dark:bg-slate-800'
                    }`}
                >
                    {integ.is_enabled ? t('Actif') : t('Inactif')}
                </button>
            </div>

            <p className="mb-3 flex-1 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{integ.description}</p>

            {/* Test status */}
            {integ.last_tested_at && (
                <p className={`mb-2 text-[10px] ${integ.last_test_ok ? 'text-green-600' : 'text-red-500'}`}>
                    {integ.last_test_ok ? '✓' : '✗'} {t('Testé')} {integ.last_tested_at}
                </p>
            )}

            {/* Actions */}
            <div className="flex gap-2">
                <button
                    onClick={onEdit}
                    className="flex-1 rounded-lg border border-slate-200 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300"
                >
                    {t('Configurer')}
                </button>
                <button
                    onClick={onTest}
                    className="flex-1 rounded-lg border border-orange-200 py-1.5 text-xs font-medium text-orange-600 hover:bg-orange-50 dark:border-orange-800 dark:text-orange-400"
                >
                    {t('Tester')}
                </button>
            </div>
        </div>
    );
}
