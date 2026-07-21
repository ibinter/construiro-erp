import { useState } from 'react';
import { useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { PageHeader } from '@/Components/UI';

const ENCRYPTION_OPTIONS = [
    { value: 'tls',  label: 'TLS (recommandé)' },
    { value: 'ssl',  label: 'SSL' },
    { value: 'null', label: 'Aucun chiffrement' },
];

const PORT_OPTIONS = [25, 465, 587, 2525];

export default function SmtpPage({ settings }) {
    const { data, setData, put, post, processing, errors, recentlySuccessful } = useForm({
        host:         settings.host         ?? 'smtp.mailgun.org',
        port:         settings.port         ?? 587,
        username:     settings.username     ?? '',
        password:     '',  // ne pré-remplir le mot de passe pour sécurité
        encryption:   settings.encryption   ?? 'tls',
        from_address: settings.from_address ?? 'noreply@construiro.com',
        from_name:    settings.from_name    ?? 'CONSTRUIRO ERP',
    });

    const [testEmail, setTestEmail] = useState('');
    const [testMsg, setTestMsg]     = useState(null);
    const [testing, setTesting]     = useState(false);

    function handleSubmit(e) {
        e.preventDefault();
        put(route('superadmin.smtp.update'));
    }

    function handleTest(e) {
        e.preventDefault();
        if (!testEmail) return;
        setTesting(true);
        setTestMsg(null);
        post(route('superadmin.smtp.test'), {
            data: { test_email: testEmail },
            onFinish: () => setTesting(false),
            onSuccess: (page) => {
                const flash = page.props.flash ?? {};
                setTestMsg(flash.success ? { type: 'success', text: flash.success }
                                         : { type: 'error',   text: flash.error ?? 'Erreur inconnue' });
            },
            onError: () => {
                setTestMsg({ type: 'error', text: 'Erreur lors du test SMTP.' });
            },
        });
    }

    const isConfigured = !!settings.is_active;

    return (
        <AppLayout title="SuperAdmin — Configuration SMTP">
            <div className="mx-auto max-w-3xl px-4 py-6 space-y-8">
                <PageHeader
                    title="Configuration SMTP"
                    subtitle="Paramétrez le serveur d'envoi d'emails de CONSTRUIRO ERP"
                />

                {/* Badge statut */}
                <div className="flex items-center gap-3">
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-semibold
                        ${isConfigured
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                            : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                        }`}>
                        <span className={`w-2 h-2 rounded-full ${isConfigured ? 'bg-green-500' : 'bg-red-500'}`} />
                        {isConfigured ? 'SMTP Configuré' : 'Non configuré'}
                    </span>
                </div>

                {/* Formulaire principal */}
                <form onSubmit={handleSubmit} className="card">
                    <div className="card-header">
                        <h3 className="font-semibold text-slate-800 dark:text-slate-100">Paramètres du serveur</h3>
                    </div>
                    <div className="card-body space-y-5">

                        {/* Hôte + Port */}
                        <div className="grid gap-4 sm:grid-cols-3">
                            <div className="sm:col-span-2">
                                <label className="form-label">Hôte SMTP <span className="text-red-500">*</span></label>
                                <input
                                    type="text"
                                    className={`form-input w-full ${errors.host ? 'border-red-400' : ''}`}
                                    value={data.host}
                                    onChange={e => setData('host', e.target.value)}
                                    placeholder="smtp.mailgun.org"
                                />
                                {errors.host && <p className="mt-1 text-xs text-red-500">{errors.host}</p>}
                            </div>
                            <div>
                                <label className="form-label">Port <span className="text-red-500">*</span></label>
                                <select
                                    className={`form-input w-full ${errors.port ? 'border-red-400' : ''}`}
                                    value={data.port}
                                    onChange={e => setData('port', Number(e.target.value))}
                                >
                                    {PORT_OPTIONS.map(p => (
                                        <option key={p} value={p}>{p}</option>
                                    ))}
                                </select>
                                {errors.port && <p className="mt-1 text-xs text-red-500">{errors.port}</p>}
                            </div>
                        </div>

                        {/* Chiffrement */}
                        <div>
                            <label className="form-label">Chiffrement <span className="text-red-500">*</span></label>
                            <select
                                className={`form-input w-full ${errors.encryption ? 'border-red-400' : ''}`}
                                value={data.encryption}
                                onChange={e => setData('encryption', e.target.value)}
                            >
                                {ENCRYPTION_OPTIONS.map(o => (
                                    <option key={o.value} value={o.value}>{o.label}</option>
                                ))}
                            </select>
                        </div>

                        {/* Utilisateur + Mot de passe */}
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div>
                                <label className="form-label">Utilisateur SMTP</label>
                                <input
                                    type="text"
                                    className={`form-input w-full ${errors.username ? 'border-red-400' : ''}`}
                                    value={data.username}
                                    onChange={e => setData('username', e.target.value)}
                                    placeholder="utilisateur@domaine.com"
                                    autoComplete="off"
                                />
                                {errors.username && <p className="mt-1 text-xs text-red-500">{errors.username}</p>}
                            </div>
                            <div>
                                <label className="form-label">
                                    Mot de passe SMTP
                                    {isConfigured && <span className="ml-1 text-xs text-slate-400">(laisser vide pour conserver)</span>}
                                </label>
                                <input
                                    type="password"
                                    className={`form-input w-full ${errors.password ? 'border-red-400' : ''}`}
                                    value={data.password}
                                    onChange={e => setData('password', e.target.value)}
                                    autoComplete="new-password"
                                />
                                {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password}</p>}
                            </div>
                        </div>

                        {/* Expéditeur */}
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div>
                                <label className="form-label">Email expéditeur <span className="text-red-500">*</span></label>
                                <input
                                    type="email"
                                    className={`form-input w-full ${errors.from_address ? 'border-red-400' : ''}`}
                                    value={data.from_address}
                                    onChange={e => setData('from_address', e.target.value)}
                                    placeholder="noreply@construiro.com"
                                />
                                {errors.from_address && <p className="mt-1 text-xs text-red-500">{errors.from_address}</p>}
                            </div>
                            <div>
                                <label className="form-label">Nom expéditeur <span className="text-red-500">*</span></label>
                                <input
                                    type="text"
                                    className={`form-input w-full ${errors.from_name ? 'border-red-400' : ''}`}
                                    value={data.from_name}
                                    onChange={e => setData('from_name', e.target.value)}
                                    placeholder="CONSTRUIRO ERP"
                                />
                                {errors.from_name && <p className="mt-1 text-xs text-red-500">{errors.from_name}</p>}
                            </div>
                        </div>

                        {recentlySuccessful && (
                            <p className="text-sm font-medium text-green-600 dark:text-green-400">
                                Configuration SMTP sauvegardée avec succès.
                            </p>
                        )}

                        <div className="flex justify-end">
                            <button
                                type="submit"
                                className="btn btn-primary"
                                disabled={processing}
                            >
                                {processing ? 'Enregistrement…' : 'Enregistrer la configuration'}
                            </button>
                        </div>
                    </div>
                </form>

                {/* Section Test */}
                <div className="card">
                    <div className="card-header">
                        <h3 className="font-semibold text-slate-800 dark:text-slate-100">Tester la configuration</h3>
                    </div>
                    <div className="card-body space-y-4">
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            Envoyez un email de test pour vérifier que la configuration SMTP est correcte.
                            Assurez-vous d'avoir sauvegardé vos paramètres avant de tester.
                        </p>
                        <form onSubmit={handleTest} className="flex gap-3">
                            <input
                                type="email"
                                className="form-input flex-1"
                                value={testEmail}
                                onChange={e => setTestEmail(e.target.value)}
                                placeholder="adresse@exemple.com"
                                required
                            />
                            <button
                                type="submit"
                                className="btn btn-secondary whitespace-nowrap"
                                disabled={testing || !testEmail}
                            >
                                {testing ? 'Envoi…' : 'Envoyer un test'}
                            </button>
                        </form>

                        {testMsg && (
                            <div className={`rounded-lg px-4 py-3 text-sm font-medium
                                ${testMsg.type === 'success'
                                    ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400'
                                    : 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400'
                                }`}>
                                {testMsg.text}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
