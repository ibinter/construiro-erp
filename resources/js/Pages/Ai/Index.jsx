import { useEffect, useRef } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import Icon from '@/Components/Icon';
import { Head, useForm } from '@inertiajs/react';

// Styles des tonalités d'insight.
const TONE = {
    info:    'bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300',
    warning: 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300',
    danger:  'bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-300',
};

export default function AiIndex({ conversations = [], insights = [], suggestions = [] }) {
    const { data, setData, post, processing, reset } = useForm({ question: '' });
    const scrollRef = useRef(null);

    // Défilement automatique vers le dernier échange.
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [conversations.length]);

    const submit = (e) => {
        e.preventDefault();
        if (!data.question.trim()) return;
        post(route('ai.ask'), {
            preserveScroll: true,
            onSuccess: () => reset('question'),
        });
    };

    const askSuggestion = (question) => {
        setData('question', question);
        post(route('ai.ask'), {
            preserveScroll: true,
            data: { question },
            onSuccess: () => reset('question'),
        });
    };

    return (
        <AppLayout header="Assistant IA">
            <Head title="Assistant IA" />

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                {/* Colonne chat -------------------------------------------------- */}
                <div className="flex flex-col rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 lg:col-span-2">
                    <div className="flex items-center gap-2 border-b border-slate-100 px-6 py-4 dark:border-slate-800">
                        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-orange-100 text-orange-600 dark:bg-orange-500/10">
                            <Icon name="sparkles" className="h-5 w-5" />
                        </span>
                        <div>
                            <h2 className="font-semibold text-slate-800 dark:text-slate-100">
                                Assistant d'analyse
                            </h2>
                            <p className="text-xs text-slate-400">
                                Réponses calculées depuis vos données (règles, sans IA externe).
                            </p>
                        </div>
                    </div>

                    {/* Fil des échanges */}
                    <div
                        ref={scrollRef}
                        className="flex-1 space-y-4 overflow-y-auto px-6 py-4"
                        style={{ maxHeight: '55vh', minHeight: '320px' }}
                    >
                        {conversations.length === 0 && (
                            <div className="flex h-full flex-col items-center justify-center py-12 text-center text-slate-400">
                                <Icon name="message-circle" className="mb-2 h-8 w-8" />
                                <p className="text-sm">
                                    Posez une question sur vos projets, factures, stocks ou effectifs.
                                </p>
                            </div>
                        )}

                        {conversations.map((c) => (
                            <div key={c.id} className="space-y-2">
                                {/* Question utilisateur */}
                                <div className="flex justify-end">
                                    <div className="max-w-[80%] rounded-2xl rounded-br-sm bg-orange-500 px-4 py-2 text-sm text-white">
                                        {c.question}
                                    </div>
                                </div>
                                {/* Réponse assistant */}
                                <div className="flex justify-start gap-2">
                                    <span className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-100 text-orange-500 dark:bg-slate-800">
                                        <Icon name="sparkles" className="h-4 w-4" />
                                    </span>
                                    <div className="max-w-[80%] rounded-2xl rounded-bl-sm bg-slate-100 px-4 py-2 text-sm text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                                        {c.answer}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Zone de saisie */}
                    <form
                        onSubmit={submit}
                        className="flex items-center gap-2 border-t border-slate-100 px-6 py-4 dark:border-slate-800"
                    >
                        <input
                            type="text"
                            value={data.question}
                            onChange={(e) => setData('question', e.target.value)}
                            placeholder="Posez votre question…"
                            className="flex-1 rounded-lg border-slate-300 bg-white text-sm text-slate-700 focus:border-orange-500 focus:ring-orange-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                        />
                        <button
                            type="submit"
                            disabled={processing || !data.question.trim()}
                            className="inline-flex items-center gap-1.5 rounded-lg bg-orange-500 px-4 py-2 text-sm font-medium text-white hover:bg-orange-600 disabled:opacity-50"
                        >
                            <Icon name="send" className="h-4 w-4" />
                            Envoyer
                        </button>
                    </form>
                </div>

                {/* Colonne latérale : insights + suggestions --------------------- */}
                <div className="space-y-4">
                    {/* Insights automatiques */}
                    <section className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
                        <h3 className="mb-3 flex items-center gap-2 font-semibold text-slate-800 dark:text-slate-100">
                            <Icon name="activity" className="h-4 w-4 text-orange-500" />
                            Observations
                        </h3>
                        <ul className="space-y-2">
                            {insights.map((ins, i) => (
                                <li
                                    key={i}
                                    className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm ${TONE[ins.tone] ?? TONE.info}`}
                                >
                                    <Icon name={ins.icon} className="h-4 w-4 shrink-0" />
                                    {ins.label}
                                </li>
                            ))}
                            {insights.length === 0 && (
                                <li className="py-4 text-center text-sm text-slate-400">
                                    Aucune observation disponible.
                                </li>
                            )}
                        </ul>
                    </section>

                    {/* Suggestions de questions */}
                    <section className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
                        <h3 className="mb-3 flex items-center gap-2 font-semibold text-slate-800 dark:text-slate-100">
                            <Icon name="lightbulb" className="h-4 w-4 text-orange-500" />
                            Questions suggérées
                        </h3>
                        <div className="flex flex-col gap-2">
                            {suggestions.map((s, i) => (
                                <button
                                    key={i}
                                    onClick={() => askSuggestion(s)}
                                    disabled={processing}
                                    className="rounded-lg border border-slate-200 px-3 py-2 text-left text-sm text-slate-600 transition hover:border-orange-300 hover:bg-orange-50 disabled:opacity-50 dark:border-slate-700 dark:text-slate-300 dark:hover:border-orange-500/40 dark:hover:bg-orange-500/10"
                                >
                                    {s}
                                </button>
                            ))}
                        </div>
                    </section>
                </div>
            </div>
        </AppLayout>
    );
}
