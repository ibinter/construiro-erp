import { useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { PageHeader } from '@/Components/UI';

const CHANNEL_LABELS = { app: 'Notifications in-app', email: 'Notifications email' };

export default function Preferences({ preferences, types, typeLabels }) {
    const { data, setData, put, processing, recentlySuccessful } = useForm({ preferences });

    const toggle = (channel, type) => {
        setData('preferences', {
            ...data.preferences,
            [channel]: {
                ...data.preferences[channel],
                [type]: !data.preferences[channel][type],
            },
        });
    };

    const submit = (e) => {
        e.preventDefault();
        put(route('notifications.preferences.update'));
    };

    return (
        <AppLayout title="Préférences de notifications">
            <div className="mx-auto max-w-3xl px-4 py-6 space-y-6">
                <PageHeader
                    title="Préférences de notifications"
                    subtitle="Choisissez les notifications que vous souhaitez recevoir"
                />

                <form onSubmit={submit} className="space-y-6">
                    {['app', 'email'].map((channel) => (
                        <div key={channel} className="card">
                            <div className="card-header">
                                <h3 className="font-semibold text-slate-800 dark:text-slate-100">
                                    {CHANNEL_LABELS[channel]}
                                </h3>
                            </div>
                            <div className="card-body divide-y divide-slate-100 dark:divide-slate-800">
                                {types.map((type) => (
                                    <div key={type} className="flex items-center justify-between py-3">
                                        <span className="text-sm text-slate-700 dark:text-slate-300">
                                            {typeLabels[type] ?? type}
                                        </span>
                                        <button
                                            type="button"
                                            role="switch"
                                            aria-checked={data.preferences[channel][type]}
                                            onClick={() => toggle(channel, type)}
                                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 ${
                                                data.preferences[channel][type]
                                                    ? 'bg-orange-500'
                                                    : 'bg-slate-200 dark:bg-slate-700'
                                            }`}
                                        >
                                            <span
                                                className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                                                    data.preferences[channel][type] ? 'translate-x-6' : 'translate-x-1'
                                                }`}
                                            />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}

                    <div className="flex items-center gap-4">
                        <button type="submit" className="btn btn-primary" disabled={processing}>
                            {processing ? 'Enregistrement…' : 'Enregistrer les préférences'}
                        </button>
                        {recentlySuccessful && (
                            <span className="text-sm text-green-600 dark:text-green-400">Préférences enregistrées ✓</span>
                        )}
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
