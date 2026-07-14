import AppLayout from '@/Layouts/AppLayout';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { useState } from 'react';

const TABS = [
    { id: 'organization', label: 'Organisation', icon: '🏢' },
    { id: 'documents',    label: 'Documents',    icon: '📄' },
    { id: 'notifications',label: 'Notifications',icon: '🔔' },
    { id: 'integrations', label: 'Intégrations', icon: '🔌' },
    { id: 'data',         label: 'Données',       icon: '💾' },
    { id: 'subscription', label: 'Abonnement',    icon: '⭐' },
];

const CURRENCIES = ['XOF','XAF','USD','EUR','GHS','NGN','KES','MAD','TND','DZD'];
const TIMEZONES  = ['Africa/Abidjan','Africa/Lagos','Africa/Dakar','Africa/Douala','Africa/Nairobi','Africa/Casablanca','Europe/Paris','UTC'];

export default function SettingsIndex({ company, usage, can }) {
    const [tab, setTab] = useState('organization');
    const { props } = usePage();
    const flash = props.flash ?? {};

    return (
        <AppLayout title="Paramètres" breadcrumbs={[{ label: 'Paramètres' }]}>
            <Head title="Paramètres" />

            {flash.success && (
                <div className="mb-4 rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700 dark:bg-green-900/20 dark:border-green-800 dark:text-green-300">
                    {flash.success}
                </div>
            )}

            <div className="flex gap-6 flex-col lg:flex-row">
                {/* Sidebar */}
                <nav className="lg:w-56 shrink-0">
                    <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 overflow-hidden">
                        {TABS.map(t => (
                            <button
                                key={t.id}
                                onClick={() => setTab(t.id)}
                                className={`w-full flex items-center gap-3 px-4 py-3 text-sm text-left transition-colors
                                    ${tab === t.id
                                        ? 'bg-orange-50 text-orange-600 font-semibold dark:bg-orange-900/20 dark:text-orange-400'
                                        : 'text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800'}`}
                            >
                                <span>{t.icon}</span>
                                {t.label}
                            </button>
                        ))}
                    </div>
                </nav>

                {/* Contenu */}
                <div className="flex-1 min-w-0">
                    {tab === 'organization'  && <OrgTab  company={company} can={can} />}
                    {tab === 'documents'     && <DocsTab company={company} can={can} />}
                    {tab === 'notifications' && <NotifsTab company={company} can={can} />}
                    {tab === 'integrations'  && <IntegTab />}
                    {tab === 'data'          && <DataTab usage={usage} />}
                    {tab === 'subscription'  && <SubTab usage={usage} />}
                </div>
            </div>
        </AppLayout>
    );
}

/* ─── Onglet Organisation ─────────────────────────────────────────────────── */
function OrgTab({ company, can }) {
    const { data, setData, post, processing, errors } = useForm({
        _method:       'PUT',
        name:          company.name,
        email:         company.email,
        phone:         company.phone,
        address:       company.address,
        city:          company.city,
        country:       company.country,
        siret:         company.siret,
        vat_number:    company.vat_number,
        base_currency: company.base_currency,
        locale:        company.locale,
        timezone:      company.timezone,
        date_format:   company.date_format,
    });

    const submit = e => {
        e.preventDefault();
        post(route('settings.organization'));
    };

    return (
        <Card title="Informations de l'entreprise">
            <form onSubmit={submit} className="space-y-5">
                <div className="grid sm:grid-cols-2 gap-4">
                    <Field label="Nom de l'entreprise *" error={errors.name}>
                        <input value={data.name} onChange={e => setData('name', e.target.value)} className={inp(errors.name)} />
                    </Field>
                    <Field label="Email" error={errors.email}>
                        <input type="email" value={data.email} onChange={e => setData('email', e.target.value)} className={inp(errors.email)} />
                    </Field>
                    <Field label="Téléphone" error={errors.phone}>
                        <input value={data.phone} onChange={e => setData('phone', e.target.value)} className={inp(errors.phone)} />
                    </Field>
                    <Field label="N° SIRET / RCCM" error={errors.siret}>
                        <input value={data.siret} onChange={e => setData('siret', e.target.value)} className={inp(errors.siret)} />
                    </Field>
                    <Field label="N° TVA" error={errors.vat_number}>
                        <input value={data.vat_number} onChange={e => setData('vat_number', e.target.value)} className={inp(errors.vat_number)} />
                    </Field>
                    <Field label="Devise" error={errors.base_currency}>
                        <select value={data.base_currency} onChange={e => setData('base_currency', e.target.value)} className={inp()}>
                            {CURRENCIES.map(c => <option key={c}>{c}</option>)}
                        </select>
                    </Field>
                    <Field label="Langue" error={errors.locale}>
                        <select value={data.locale} onChange={e => setData('locale', e.target.value)} className={inp()}>
                            <option value="fr">Français</option>
                            <option value="en">English</option>
                        </select>
                    </Field>
                    <Field label="Fuseau horaire" error={errors.timezone}>
                        <select value={data.timezone} onChange={e => setData('timezone', e.target.value)} className={inp()}>
                            {TIMEZONES.map(t => <option key={t}>{t}</option>)}
                        </select>
                    </Field>
                    <Field label="Format de date" error={errors.date_format}>
                        <select value={data.date_format} onChange={e => setData('date_format', e.target.value)} className={inp()}>
                            <option value="d/m/Y">JJ/MM/AAAA</option>
                            <option value="m/d/Y">MM/DD/YYYY</option>
                            <option value="Y-m-d">AAAA-MM-JJ</option>
                        </select>
                    </Field>
                    <Field label="Adresse" error={errors.address} className="sm:col-span-2">
                        <input value={data.address} onChange={e => setData('address', e.target.value)} className={inp(errors.address)} />
                    </Field>
                    <Field label="Ville" error={errors.city}>
                        <input value={data.city} onChange={e => setData('city', e.target.value)} className={inp(errors.city)} />
                    </Field>
                    <Field label="Pays (ISO 2)" error={errors.country}>
                        <input value={data.country} maxLength={2} onChange={e => setData('country', e.target.value.toUpperCase())} className={inp(errors.country)} placeholder="CI" />
                    </Field>
                </div>

                {can.manage && (
                    <div className="flex justify-end pt-2">
                        <button type="submit" disabled={processing} className="btn-primary">
                            {processing ? 'Enregistrement…' : 'Enregistrer'}
                        </button>
                    </div>
                )}
            </form>
        </Card>
    );
}

/* ─── Onglet Documents ───────────────────────────────────────────────────── */
function DocsTab({ company, can }) {
    const { data, setData, put, processing, errors } = useForm({
        invoice_prefix: company.invoice_prefix,
        quote_prefix:   company.quote_prefix,
        invoice_footer: company.invoice_footer,
        invoice_notes:  company.invoice_notes,
    });

    const submit = e => { e.preventDefault(); put(route('settings.documents')); };

    return (
        <Card title="Paramètres des documents">
            <form onSubmit={submit} className="space-y-5">
                <div className="grid sm:grid-cols-2 gap-4">
                    <Field label="Préfixe factures" error={errors.invoice_prefix}>
                        <input value={data.invoice_prefix} onChange={e => setData('invoice_prefix', e.target.value)} className={inp(errors.invoice_prefix)} placeholder="FAC" />
                    </Field>
                    <Field label="Préfixe devis" error={errors.quote_prefix}>
                        <input value={data.quote_prefix} onChange={e => setData('quote_prefix', e.target.value)} className={inp(errors.quote_prefix)} placeholder="DEV" />
                    </Field>
                </div>
                <Field label="Pied de page des documents" error={errors.invoice_footer}>
                    <textarea rows={3} value={data.invoice_footer} onChange={e => setData('invoice_footer', e.target.value)} className={inp(errors.invoice_footer)} />
                </Field>
                <Field label="Notes par défaut" error={errors.invoice_notes}>
                    <textarea rows={3} value={data.invoice_notes} onChange={e => setData('invoice_notes', e.target.value)} className={inp(errors.invoice_notes)} />
                </Field>
                {can.manage && (
                    <div className="flex justify-end">
                        <button type="submit" disabled={processing} className="btn-primary">
                            {processing ? 'Enregistrement…' : 'Enregistrer'}
                        </button>
                    </div>
                )}
            </form>
        </Card>
    );
}

/* ─── Onglet Notifications ───────────────────────────────────────────────── */
function NotifsTab({ company, can }) {
    const defaults = company.notification_settings ?? {};
    const { data, setData, put, processing } = useForm({
        notif_invoice_due:  defaults.notif_invoice_due  ?? true,
        notif_payment:      defaults.notif_payment      ?? true,
        notif_support:      defaults.notif_support      ?? true,
        notif_subscription: defaults.notif_subscription ?? true,
    });

    const submit = e => { e.preventDefault(); put(route('settings.notifications')); };

    const Toggle = ({ k, label }) => (
        <label className="flex items-center justify-between py-3 border-b border-slate-100 dark:border-slate-800 last:border-0 cursor-pointer">
            <span className="text-sm text-slate-700 dark:text-slate-300">{label}</span>
            <input type="checkbox" checked={data[k]} onChange={e => setData(k, e.target.checked)}
                className="w-5 h-5 rounded accent-orange-500 cursor-pointer" />
        </label>
    );

    return (
        <Card title="Préférences de notifications">
            <form onSubmit={submit} className="space-y-1">
                <Toggle k="notif_invoice_due"   label="Factures en retard de paiement" />
                <Toggle k="notif_payment"       label="Paiements reçus" />
                <Toggle k="notif_support"       label="Nouveaux tickets support" />
                <Toggle k="notif_subscription"  label="Expiration d'abonnement" />
                {can.manage && (
                    <div className="flex justify-end pt-4">
                        <button type="submit" disabled={processing} className="btn-primary">
                            {processing ? 'Enregistrement…' : 'Enregistrer'}
                        </button>
                    </div>
                )}
            </form>
        </Card>
    );
}

/* ─── Onglet Intégrations (lien vers page dédiée) ───────────────────────── */
function IntegTab() {
    return (
        <Card title="Intégrations">
            <p className="text-sm text-slate-500 mb-4">
                Gérez vos connexions à des services tiers (paiements mobiles, WhatsApp, SMTP…).
            </p>
            <a href={route('integrations.index')} className="btn-primary inline-block">
                Accéder aux intégrations
            </a>
        </Card>
    );
}

/* ─── Onglet Données ─────────────────────────────────────────────────────── */
function DataTab({ usage }) {
    return (
        <Card title="Données & Sauvegardes">
            <div className="space-y-4">
                <UsageLine label="Utilisateurs" used={usage?.users_count} max={usage?.max_users} />
                <UsageLine label="Projets"      used={usage?.projects_count} max={usage?.max_projects} />
            </div>
            <div className="mt-6 flex gap-3 flex-wrap">
                <a href={route('backups.index')} className="btn-secondary text-sm">
                    💾 Gérer les sauvegardes
                </a>
                <a href={route('import.index')} className="btn-secondary text-sm">
                    📥 Importer des données
                </a>
            </div>
        </Card>
    );
}

/* ─── Onglet Abonnement ──────────────────────────────────────────────────── */
function SubTab({ usage }) {
    return (
        <Card title="Mon abonnement">
            <div className="space-y-3 text-sm">
                <Row label="Plan actuel"   value={<span className="font-semibold text-orange-600">{usage?.plan_name ?? '—'}</span>} />
                <Row label="Utilisateurs"  value={`${usage?.users_count ?? 0} / ${usage?.max_users === 9999 ? '∞' : (usage?.max_users ?? '?')}`} />
                <Row label="Projets"       value={`${usage?.projects_count ?? 0} / ${usage?.max_projects === 9999 ? '∞' : (usage?.max_projects ?? '?')}`} />
                <Row label="Expiration"    value={usage?.expires_at ? new Date(usage.expires_at).toLocaleDateString('fr-FR') : '—'} />
            </div>
            <div className="mt-6">
                <a href={route('subscriptions.index')} className="btn-primary text-sm">
                    Gérer mon abonnement
                </a>
            </div>
        </Card>
    );
}

/* ─── Helpers ────────────────────────────────────────────────────────────── */
function Card({ title, children }) {
    return (
        <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-6">
            <h2 className="text-base font-semibold text-slate-900 dark:text-white mb-5">{title}</h2>
            {children}
        </div>
    );
}

function Field({ label, error, children, className = '' }) {
    return (
        <div className={className}>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">{label}</label>
            {children}
            {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
        </div>
    );
}

function Row({ label, value }) {
    return (
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2 last:border-0 last:pb-0">
            <span className="text-slate-500">{label}</span>
            <span className="text-slate-800 dark:text-slate-200">{value}</span>
        </div>
    );
}

function UsageLine({ label, used = 0, max = 0 }) {
    const pct = max === 9999 ? 0 : Math.min(100, Math.round((used / max) * 100));
    return (
        <div>
            <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-600 dark:text-slate-400">{label}</span>
                <span className="text-slate-800 dark:text-slate-200">{used} / {max === 9999 ? '∞' : max}</span>
            </div>
            {max !== 9999 && (
                <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${pct >= 90 ? 'bg-red-500' : pct >= 70 ? 'bg-amber-500' : 'bg-orange-500'}`}
                         style={{ width: `${pct}%` }} />
                </div>
            )}
        </div>
    );
}

const inp = (err = null) =>
    `w-full rounded-lg border px-3 py-2 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white
     focus:outline-none focus:ring-2 focus:ring-orange-400 transition
     ${err ? 'border-red-400' : 'border-slate-300 dark:border-slate-600'}`;
