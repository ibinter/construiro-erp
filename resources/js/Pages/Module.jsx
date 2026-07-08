import AppLayout from '@/Layouts/AppLayout';
import Icon from '@/Components/Icon';
import { Head } from '@inertiajs/react';

const ACTION_LABELS = {
    view: 'Consulter',
    create: 'Créer',
    update: 'Modifier',
    delete: 'Supprimer',
    export: 'Exporter',
};

export default function Module({ module, abilities = [] }) {
    return (
        <AppLayout header={module.label}>
            <Head title={module.label} />

            <div className="mb-6 flex items-center gap-4">
                <span className="flex h-14 w-14 items-center justify-center rounded-xl bg-orange-500 text-white">
                    <Icon name={module.icon} className="h-7 w-7" />
                </span>
                <div>
                    <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">
                        {module.label}
                    </h2>
                    <p className="text-sm text-slate-500">
                        Module en cours de construction — vos permissions sont déjà actives.
                    </p>
                </div>
            </div>

            {/* Actions autorisées pour cet utilisateur sur ce module */}
            <div className="mb-6 rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
                <h3 className="mb-3 text-sm font-semibold text-slate-700 dark:text-slate-200">
                    Vos actions autorisées
                </h3>
                <div className="flex flex-wrap gap-2">
                    {abilities.length === 0 && (
                        <span className="text-sm text-slate-400">Lecture seule.</span>
                    )}
                    {abilities.map((action) => (
                        <span
                            key={action}
                            className="inline-flex items-center gap-1.5 rounded-full bg-green-50 px-3 py-1 text-sm font-medium text-green-700 dark:bg-green-500/10 dark:text-green-400"
                        >
                            <Icon name="check" className="h-3.5 w-3.5" />
                            {ACTION_LABELS[action] ?? action}
                        </span>
                    ))}
                </div>
            </div>

            <div className="flex h-64 flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 text-center dark:border-slate-700">
                <Icon name="construction" className="mb-3 h-10 w-10 text-slate-300" />
                <p className="font-medium text-slate-500">
                    Écran « {module.label} » à spécifier
                </p>
                <p className="mt-1 max-w-md text-sm text-slate-400">
                    La structure (permissions, navigation, routing) est en place. Il reste à
                    concevoir les écrans et workflows métier de ce module.
                </p>
            </div>
        </AppLayout>
    );
}
