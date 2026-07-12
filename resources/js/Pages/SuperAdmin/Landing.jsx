import { useState } from 'react';
import { router, useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { PageHeader, Badge } from '@/Components/UI';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function Flash({ message, type = 'success' }) {
    if (!message) return null;
    const cls = type === 'success'
        ? 'bg-green-50 border-green-300 text-green-800 dark:bg-green-900/20 dark:text-green-300'
        : 'bg-red-50 border-red-300 text-red-800 dark:bg-red-900/20 dark:text-red-300';
    return (
        <div className={`border rounded-lg px-4 py-3 text-sm ${cls}`}>{message}</div>
    );
}

function TabButton({ label, active, onClick }) {
    return (
        <button
            onClick={onClick}
            className={`px-4 py-2 text-sm font-medium rounded-t-lg border-b-2 transition-colors ${
                active
                    ? 'border-orange-500 text-orange-600 dark:text-orange-400'
                    : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
        >
            {label}
        </button>
    );
}

function FieldRow({ label, children }) {
    return (
        <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">{label}</label>
            {children}
        </div>
    );
}

function Input({ className = '', ...props }) {
    return (
        <input
            className={`w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 ${className}`}
            {...props}
        />
    );
}

function Textarea({ className = '', ...props }) {
    return (
        <textarea
            rows={3}
            className={`w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 resize-y ${className}`}
            {...props}
        />
    );
}

function Btn({ children, variant = 'primary', size = 'sm', className = '', ...props }) {
    const base = 'inline-flex items-center gap-1 font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-orange-400 disabled:opacity-50';
    const sz = size === 'sm' ? 'px-3 py-1.5 text-sm' : 'px-4 py-2 text-sm';
    const v = {
        primary: 'bg-orange-500 hover:bg-orange-600 text-white',
        secondary: 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200',
        danger: 'bg-red-500 hover:bg-red-600 text-white',
        ghost: 'hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500',
    }[variant];
    return <button className={`${base} ${sz} ${v} ${className}`} {...props}>{children}</button>;
}

// ─── FAQ Tab ─────────────────────────────────────────────────────────────────

function FaqTab({ faqs, flash }) {
    const [editing, setEditing] = useState(null); // null | 'new' | id

    const empty = { question_fr: '', question_en: '', answer_fr: '', answer_en: '', sort_order: 0, is_active: true };
    const { data, setData, post, patch, processing, reset, errors } = useForm(empty);

    const openNew = () => { reset(); setData(empty); setEditing('new'); };
    const openEdit = (faq) => { setData({ ...faq, is_active: faq.is_active ?? true }); setEditing(faq.id); };
    const cancel = () => setEditing(null);

    const submit = (e) => {
        e.preventDefault();
        if (editing === 'new') {
            post(route('superadmin.landing.faq.store'), { onSuccess: cancel });
        } else {
            patch(route('superadmin.landing.faq.update', editing), { onSuccess: cancel });
        }
    };

    const destroy = (id) => {
        if (!confirm('Supprimer cette FAQ ?')) return;
        router.delete(route('superadmin.landing.faq.destroy', id));
    };

    return (
        <div className="space-y-4">
            <Flash message={flash?.success} />
            <div className="flex justify-between items-center">
                <p className="text-sm text-slate-500">{faqs.length} FAQ(s)</p>
                <Btn onClick={openNew}>+ Ajouter</Btn>
            </div>

            {editing && (
                <form onSubmit={submit} className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl p-4 space-y-3">
                    <h3 className="font-semibold text-slate-700 dark:text-slate-200">
                        {editing === 'new' ? 'Nouvelle FAQ' : 'Modifier FAQ'}
                    </h3>
                    <div className="grid gap-3 md:grid-cols-2">
                        <FieldRow label="Question FR *">
                            <Input value={data.question_fr} onChange={e => setData('question_fr', e.target.value)} required />
                            {errors.question_fr && <p className="text-red-500 text-xs mt-1">{errors.question_fr}</p>}
                        </FieldRow>
                        <FieldRow label="Question EN">
                            <Input value={data.question_en} onChange={e => setData('question_en', e.target.value)} />
                        </FieldRow>
                        <FieldRow label="Réponse FR *">
                            <Textarea value={data.answer_fr} onChange={e => setData('answer_fr', e.target.value)} required />
                        </FieldRow>
                        <FieldRow label="Réponse EN">
                            <Textarea value={data.answer_en} onChange={e => setData('answer_en', e.target.value)} />
                        </FieldRow>
                        <FieldRow label="Ordre">
                            <Input type="number" min={0} value={data.sort_order} onChange={e => setData('sort_order', parseInt(e.target.value) || 0)} />
                        </FieldRow>
                        <FieldRow label="Active">
                            <label className="flex items-center gap-2 cursor-pointer mt-2">
                                <input type="checkbox" checked={data.is_active} onChange={e => setData('is_active', e.target.checked)} className="h-4 w-4 rounded accent-orange-500" />
                                <span className="text-sm">Visible sur la landing</span>
                            </label>
                        </FieldRow>
                    </div>
                    <div className="flex gap-2">
                        <Btn type="submit" disabled={processing}>Enregistrer</Btn>
                        <Btn variant="secondary" type="button" onClick={cancel}>Annuler</Btn>
                    </div>
                </form>
            )}

            <div className="divide-y divide-slate-200 dark:divide-slate-700 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                {faqs.map(faq => (
                    <div key={faq.id} className="flex items-start justify-between gap-3 p-3 bg-white dark:bg-slate-800/30 hover:bg-slate-50 dark:hover:bg-slate-800/60">
                        <div className="min-w-0">
                            <p className="text-sm font-medium text-slate-800 dark:text-slate-100 truncate">{faq.question_fr}</p>
                            <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{faq.answer_fr}</p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                            <Badge variant={faq.is_active ? 'success' : 'neutral'}>{faq.is_active ? 'Actif' : 'Inactif'}</Badge>
                            <Btn variant="ghost" size="sm" onClick={() => openEdit(faq)}>✏️</Btn>
                            <Btn variant="ghost" size="sm" onClick={() => destroy(faq.id)}>🗑️</Btn>
                        </div>
                    </div>
                ))}
                {faqs.length === 0 && (
                    <div className="p-6 text-center text-sm text-slate-400">Aucune FAQ. Cliquez sur « Ajouter ».</div>
                )}
            </div>
        </div>
    );
}

// ─── Témoignages Tab ──────────────────────────────────────────────────────────

function TemoignagesTab({ temoignages, flash }) {
    const [editing, setEditing] = useState(null);

    const empty = { initiales: '', nom: '', poste: '', ville: '', texte_fr: '', texte_en: '', rating: 5, sort_order: 0, is_active: true };
    const { data, setData, post, patch, processing, reset, errors } = useForm(empty);

    const openNew = () => { reset(); setData(empty); setEditing('new'); };
    const openEdit = (t) => { setData({ ...t }); setEditing(t.id); };
    const cancel = () => setEditing(null);

    const submit = (e) => {
        e.preventDefault();
        if (editing === 'new') {
            post(route('superadmin.landing.temoignage.store'), { onSuccess: cancel });
        } else {
            patch(route('superadmin.landing.temoignage.update', editing), { onSuccess: cancel });
        }
    };

    const destroy = (id) => {
        if (!confirm('Supprimer ce témoignage ?')) return;
        router.delete(route('superadmin.landing.temoignage.destroy', id));
    };

    return (
        <div className="space-y-4">
            <Flash message={flash?.success} />
            <div className="flex justify-between items-center">
                <p className="text-sm text-slate-500">{temoignages.length} témoignage(s)</p>
                <Btn onClick={openNew}>+ Ajouter</Btn>
            </div>

            {editing && (
                <form onSubmit={submit} className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl p-4 space-y-3">
                    <h3 className="font-semibold text-slate-700 dark:text-slate-200">
                        {editing === 'new' ? 'Nouveau témoignage' : 'Modifier témoignage'}
                    </h3>
                    <div className="grid gap-3 md:grid-cols-2">
                        <FieldRow label="Initiales *">
                            <Input value={data.initiales} onChange={e => setData('initiales', e.target.value)} maxLength={4} required />
                        </FieldRow>
                        <FieldRow label="Nom *">
                            <Input value={data.nom} onChange={e => setData('nom', e.target.value)} required />
                        </FieldRow>
                        <FieldRow label="Poste *">
                            <Input value={data.poste} onChange={e => setData('poste', e.target.value)} required />
                        </FieldRow>
                        <FieldRow label="Ville *">
                            <Input value={data.ville} onChange={e => setData('ville', e.target.value)} required />
                        </FieldRow>
                        <FieldRow label="Texte FR *">
                            <Textarea value={data.texte_fr} onChange={e => setData('texte_fr', e.target.value)} required />
                        </FieldRow>
                        <FieldRow label="Texte EN">
                            <Textarea value={data.texte_en} onChange={e => setData('texte_en', e.target.value)} />
                        </FieldRow>
                        <FieldRow label="Note (1–5)">
                            <Input type="number" min={1} max={5} value={data.rating} onChange={e => setData('rating', parseInt(e.target.value) || 5)} />
                        </FieldRow>
                        <FieldRow label="Ordre">
                            <Input type="number" min={0} value={data.sort_order} onChange={e => setData('sort_order', parseInt(e.target.value) || 0)} />
                        </FieldRow>
                        <FieldRow label="Active">
                            <label className="flex items-center gap-2 cursor-pointer mt-2">
                                <input type="checkbox" checked={data.is_active} onChange={e => setData('is_active', e.target.checked)} className="h-4 w-4 rounded accent-orange-500" />
                                <span className="text-sm">Visible sur la landing</span>
                            </label>
                        </FieldRow>
                    </div>
                    <div className="flex gap-2">
                        <Btn type="submit" disabled={processing}>Enregistrer</Btn>
                        <Btn variant="secondary" type="button" onClick={cancel}>Annuler</Btn>
                    </div>
                </form>
            )}

            <div className="grid gap-3 md:grid-cols-2">
                {temoignages.map(t => (
                    <div key={t.id} className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/30 p-4 space-y-2">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="h-9 w-9 rounded-full bg-orange-100 text-orange-700 flex items-center justify-center text-sm font-bold">
                                    {t.initiales}
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{t.nom}</p>
                                    <p className="text-xs text-slate-400">{t.poste} · {t.ville}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-1">
                                <Badge variant={t.is_active ? 'success' : 'neutral'}>{t.is_active ? 'Actif' : 'Inactif'}</Badge>
                                <Btn variant="ghost" size="sm" onClick={() => openEdit(t)}>✏️</Btn>
                                <Btn variant="ghost" size="sm" onClick={() => destroy(t.id)}>🗑️</Btn>
                            </div>
                        </div>
                        <p className="text-xs text-slate-500 line-clamp-2">{t.texte_fr}</p>
                        <p className="text-xs text-orange-500">{'★'.repeat(t.rating)}{'☆'.repeat(5 - t.rating)}</p>
                    </div>
                ))}
                {temoignages.length === 0 && (
                    <div className="col-span-2 p-6 text-center text-sm text-slate-400 border border-slate-200 dark:border-slate-700 rounded-xl">
                        Aucun témoignage. Cliquez sur « Ajouter ».
                    </div>
                )}
            </div>
        </div>
    );
}

// ─── Settings Tab (SARA + Footer + Landing) ───────────────────────────────────

function SettingsTab({ settings, flash }) {
    const allSettings = [
        ...Object.entries(settings.footer || {}).map(([key, value]) => ({ key, value: value ?? '', group: 'footer' })),
        ...Object.entries(settings.sara || {}).map(([key, value]) => ({ key, value: value ?? '', group: 'sara' })),
        ...Object.entries(settings.landing || {}).map(([key, value]) => ({ key, value: value ?? '', group: 'landing' })),
    ];

    const [values, setValues] = useState(() => {
        const obj = {};
        allSettings.forEach(s => { obj[s.key] = s.value; });
        return obj;
    });

    const update = (key, val) => setValues(prev => ({ ...prev, [key]: val }));

    const handleSubmit = (e) => {
        e.preventDefault();
        const settingsArray = Object.entries(values).map(([key, value]) => ({ key, value }));
        router.post(route('superadmin.landing.settings.update'), { settings: settingsArray });
    };

    const groups = [
        { key: 'footer', label: '📍 Contacts Footer', keys: Object.keys(settings.footer || {}) },
        { key: 'sara',   label: '🤖 SARA — Config IA', keys: Object.keys(settings.sara || {}) },
        { key: 'landing', label: '📣 Landing général', keys: Object.keys(settings.landing || {}) },
    ];

    const LABELS = {
        footer_phone: 'Téléphone', footer_email: 'Email', footer_whatsapp: 'WhatsApp (sans espaces)', footer_address: 'Adresse',
        sara_model: 'Modèle Groq', sara_temperature: 'Température (0.0–1.0)', sara_max_tokens: 'Max tokens',
        sara_enabled: 'SARA activée (1=oui, 0=non)', sara_prompt_suffix: 'Complément système (optionnel)',
        landing_topbar_msg: 'Message barre supérieure',
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <Flash message={flash?.success} />
            {groups.map(group => (
                <div key={group.key} className="rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                    <div className="bg-slate-50 dark:bg-slate-800/50 px-4 py-2 border-b border-slate-200 dark:border-slate-700">
                        <h3 className="font-semibold text-slate-700 dark:text-slate-200 text-sm">{group.label}</h3>
                    </div>
                    <div className="p-4 grid gap-3 md:grid-cols-2">
                        {group.keys.map(key => (
                            <FieldRow key={key} label={LABELS[key] || key}>
                                <Input
                                    value={values[key] ?? ''}
                                    onChange={e => update(key, e.target.value)}
                                />
                            </FieldRow>
                        ))}
                    </div>
                </div>
            ))}
            <Btn type="submit" size="md">💾 Enregistrer tous les paramètres</Btn>
        </form>
    );
}

// ─── Pages légales Tab ────────────────────────────────────────────────────────

function LegalTab({ legalPages, flash }) {
    const toggle = (id) => {
        router.patch(route('superadmin.landing.legal.toggle', id));
    };

    return (
        <div className="space-y-4">
            <Flash message={flash?.success} />
            <p className="text-sm text-slate-500">{legalPages.length} page(s) légale(s)</p>
            <div className="divide-y divide-slate-200 dark:divide-slate-700 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                {legalPages.map(page => (
                    <div key={page.id} className="flex items-center justify-between gap-3 p-3 bg-white dark:bg-slate-800/30">
                        <div>
                            <p className="text-sm font-medium text-slate-800 dark:text-slate-100">{page.title_fr}</p>
                            <p className="text-xs text-slate-400 font-mono">/legal/{page.slug}</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <Badge variant={page.is_published ? 'success' : 'neutral'}>
                                {page.is_published ? 'Publié' : 'Brouillon'}
                            </Badge>
                            <Btn
                                variant={page.is_published ? 'secondary' : 'primary'}
                                size="sm"
                                onClick={() => toggle(page.id)}
                            >
                                {page.is_published ? 'Dépublier' : 'Publier'}
                            </Btn>
                        </div>
                    </div>
                ))}
                {legalPages.length === 0 && (
                    <div className="p-6 text-center text-sm text-slate-400">Aucune page légale.</div>
                )}
            </div>
        </div>
    );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

const TABS = [
    { key: 'faqs',        label: '❓ FAQ' },
    { key: 'temoignages', label: '💬 Témoignages' },
    { key: 'settings',    label: '⚙️ Config (SARA + Footer)' },
    { key: 'legal',       label: '📄 Pages légales' },
];

export default function SuperAdminLanding({ faqs, temoignages, legalPages, settings, flash }) {
    const [tab, setTab] = useState('faqs');

    return (
        <AppLayout title="SuperAdmin — Landing Page">
            <div className="mx-auto max-w-5xl px-4 py-6 space-y-6">
                <PageHeader
                    title="Gestion Landing Page"
                    subtitle="FAQ, témoignages, SARA, pages légales, contacts footer"
                />

                {/* Tabs */}
                <div className="flex gap-1 border-b border-slate-200 dark:border-slate-700">
                    {TABS.map(t => (
                        <TabButton key={t.key} label={t.label} active={tab === t.key} onClick={() => setTab(t.key)} />
                    ))}
                </div>

                {/* Content */}
                <div>
                    {tab === 'faqs'        && <FaqTab faqs={faqs} flash={flash} />}
                    {tab === 'temoignages' && <TemoignagesTab temoignages={temoignages} flash={flash} />}
                    {tab === 'settings'    && <SettingsTab settings={settings} flash={flash} />}
                    {tab === 'legal'       && <LegalTab legalPages={legalPages} flash={flash} />}
                </div>
            </div>
        </AppLayout>
    );
}
