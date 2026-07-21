import { useState } from 'react';
import { Link, useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { PageHeader } from '@/Components/UI';

const KEY_LABELS = {
    welcome:              'Bienvenue',
    trial_expiring_7:     'Essai J-7',
    trial_expiring_3:     'Essai J-3',
    trial_expiring_1:     'Essai J-1',
    payment_confirmed:    'Paiement confirmé',
    account_expired:      'Compte expiré',
    password_reset:       'Réinitialisation MDP',
    demo_requested:       'Demande de démo',
    custom_offer_sent:    'Offre personnalisée',
    ticket_created:       'Ticket créé',
    ticket_resolved:      'Ticket résolu',
    account_suspended:    'Compte suspendu',
    suspicious_login:     'Connexion suspecte',
};

function Field({ label, error, children, hint }) {
    return (
        <div className="space-y-1">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">{label}</label>
            {children}
            {hint && <p className="text-xs text-slate-400">{hint}</p>}
            {error && <p className="text-xs text-red-500">{error}</p>}
        </div>
    );
}

export default function EmailTemplatesEdit({ template }) {
    const [activeTab, setActiveTab] = useState('fr');

    const { data, setData, put, processing, errors } = useForm({
        subject_fr: template.subject_fr ?? '',
        subject_en: template.subject_en ?? '',
        body_fr:    template.body_fr ?? '',
        body_en:    template.body_en ?? '',
        is_active:  template.is_active ?? true,
    });

    const submit = (e) => {
        e.preventDefault();
        put(`/superadmin/email-templates/${template.id}`, {
            preserveScroll: true,
        });
    };

    const openPreview = (locale = 'fr') => {
        window.open(
            `/superadmin/email-templates/${template.id}/preview?locale=${locale}`,
            '_blank',
            'width=700,height=800,noopener'
        );
    };

    const tabs = [
        { key: 'fr', label: 'Français' },
        { key: 'en', label: 'English' },
    ];

    return (
        <AppLayout title={`Template email — ${KEY_LABELS[template.key] ?? template.key}`}>
            <div className="mx-auto max-w-3xl px-4 py-6 space-y-6">
                <PageHeader
                    title={`Éditer : ${KEY_LABELS[template.key] ?? template.key}`}
                    subtitle={
                        <span>
                            Clé :{' '}
                            <code className="rounded bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 text-xs text-orange-600">
                                {template.key}
                            </code>
                        </span>
                    }
                    actions={
                        <Link
                            href="/superadmin/email-templates"
                            className="btn btn-ghost btn-sm"
                        >
                            ← Retour
                        </Link>
                    }
                />

                {/* Variables disponibles */}
                {template.variables?.length > 0 && (
                    <div className="card">
                        <div className="card-header">
                            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                                Variables disponibles
                            </h3>
                            <p className="text-xs text-slate-400 mt-0.5">
                                Utilisez ces variables dans le sujet et le corps HTML — elles seront remplacées à l'envoi.
                            </p>
                        </div>
                        <div className="card-body flex flex-wrap gap-2">
                            {template.variables.map((v) => (
                                <button
                                    key={v}
                                    type="button"
                                    onClick={() => navigator.clipboard?.writeText(`{{${v}}}`)}
                                    className="rounded-full bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 px-2.5 py-0.5 text-xs font-mono text-orange-700 dark:text-orange-300 hover:bg-orange-100 dark:hover:bg-orange-900/40 transition-colors"
                                    title="Cliquer pour copier"
                                >
                                    {'{{'}
                                    {v}
                                    {'}}'}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                <form onSubmit={submit} className="space-y-6">
                    {/* Onglets FR / EN */}
                    <div className="card">
                        <div className="card-header border-b-0 pb-0">
                            <div className="flex gap-1">
                                {tabs.map((tab) => (
                                    <button
                                        key={tab.key}
                                        type="button"
                                        onClick={() => setActiveTab(tab.key)}
                                        className={`rounded-t-md px-4 py-2 text-sm font-medium transition-colors ${
                                            activeTab === tab.key
                                                ? 'bg-white dark:bg-slate-900 border border-b-white dark:border-slate-700 dark:border-b-slate-900 text-orange-600 -mb-px'
                                                : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                                        }`}
                                    >
                                        {tab.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="card-body space-y-4">
                            {activeTab === 'fr' && (
                                <>
                                    <Field label="Sujet (FR)" error={errors.subject_fr}>
                                        <input
                                            type="text"
                                            value={data.subject_fr}
                                            onChange={(e) => setData('subject_fr', e.target.value)}
                                            className="form-input w-full"
                                            required
                                        />
                                    </Field>
                                    <Field
                                        label="Corps HTML (FR)"
                                        error={errors.body_fr}
                                        hint="HTML basique accepté : <p>, <strong>, <a>, <br>. Utilisez les variables {{varName}} pour personnaliser."
                                    >
                                        <textarea
                                            value={data.body_fr}
                                            onChange={(e) => setData('body_fr', e.target.value)}
                                            rows={14}
                                            className="form-input w-full font-mono text-xs"
                                            required
                                        />
                                    </Field>
                                    <button
                                        type="button"
                                        onClick={() => openPreview('fr')}
                                        className="btn btn-ghost btn-sm text-slate-500 hover:text-orange-500"
                                    >
                                        Aperçu FR →
                                    </button>
                                </>
                            )}

                            {activeTab === 'en' && (
                                <>
                                    <Field label="Subject (EN)" error={errors.subject_en}>
                                        <input
                                            type="text"
                                            value={data.subject_en}
                                            onChange={(e) => setData('subject_en', e.target.value)}
                                            className="form-input w-full"
                                        />
                                    </Field>
                                    <Field
                                        label="HTML Body (EN)"
                                        error={errors.body_en}
                                        hint="Basic HTML accepted. Use {{varName}} for personalization."
                                    >
                                        <textarea
                                            value={data.body_en}
                                            onChange={(e) => setData('body_en', e.target.value)}
                                            rows={14}
                                            className="form-input w-full font-mono text-xs"
                                        />
                                    </Field>
                                    <button
                                        type="button"
                                        onClick={() => openPreview('en')}
                                        className="btn btn-ghost btn-sm text-slate-500 hover:text-orange-500"
                                    >
                                        Preview EN →
                                    </button>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Statut + Enregistrer */}
                    <div className="card">
                        <div className="card-body flex items-center justify-between gap-4">
                            <label className="flex items-center gap-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={data.is_active}
                                    onChange={(e) => setData('is_active', e.target.checked)}
                                    className="form-checkbox h-4 w-4 text-orange-500 rounded"
                                />
                                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                    Template actif
                                </span>
                            </label>

                            <div className="flex gap-3">
                                <Link
                                    href="/superadmin/email-templates"
                                    className="btn btn-ghost"
                                >
                                    Annuler
                                </Link>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="btn btn-primary"
                                >
                                    {processing ? 'Enregistrement…' : 'Enregistrer'}
                                </button>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
