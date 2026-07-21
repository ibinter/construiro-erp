import { Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { PageHeader, Badge } from '@/Components/UI';

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

export default function EmailTemplatesIndex({ templates }) {
    return (
        <AppLayout title="SuperAdmin — Templates emails">
            <div className="mx-auto max-w-5xl px-4 py-6 space-y-6">
                <PageHeader
                    title="Templates d'emails"
                    subtitle={`${templates.length} templates — sujets et corps HTML éditables`}
                />

                <div className="card">
                    <div className="card-body p-0">
                        <table className="table-construiro w-full">
                            <thead>
                                <tr>
                                    <th className="w-40">Clé</th>
                                    <th>Libellé</th>
                                    <th>Sujet (FR)</th>
                                    <th className="text-center w-24">Statut</th>
                                    <th className="text-center w-28">Mis à jour</th>
                                    <th className="text-right w-36">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {templates.map((tpl) => (
                                    <tr key={tpl.id}>
                                        <td>
                                            <code className="rounded bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 text-xs text-slate-600 dark:text-slate-300">
                                                {tpl.key}
                                            </code>
                                        </td>
                                        <td className="font-medium text-slate-800 dark:text-slate-100">
                                            {KEY_LABELS[tpl.key] ?? tpl.key}
                                        </td>
                                        <td className="text-slate-500 dark:text-slate-400 truncate max-w-xs">
                                            {tpl.subject_fr}
                                        </td>
                                        <td className="text-center">
                                            <Badge variant={tpl.is_active ? 'success' : 'neutral'}>
                                                {tpl.is_active ? 'Actif' : 'Inactif'}
                                            </Badge>
                                        </td>
                                        <td className="text-center text-sm text-slate-400">
                                            {tpl.updated_at}
                                        </td>
                                        <td className="text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <a
                                                    href={`/superadmin/email-templates/${tpl.id}/preview`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="btn btn-xs btn-ghost text-slate-500 hover:text-orange-500"
                                                    title="Aperçu"
                                                >
                                                    Aperçu
                                                </a>
                                                <Link
                                                    href={`/superadmin/email-templates/${tpl.id}/edit`}
                                                    className="btn btn-xs btn-primary"
                                                >
                                                    Éditer
                                                </Link>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
