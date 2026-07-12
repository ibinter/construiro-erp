import { useForm, Link, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Badge } from '@/Components/UI';

const STATUS_COLORS = { new: 'info', open: 'brand', pending: 'warning', resolved: 'success', closed: 'neutral' };
const STATUS_LABELS = { new: 'Nouveau', open: 'Ouvert', pending: 'En attente', resolved: 'Résolu', closed: 'Fermé' };
const PRIORITY_COLORS = { low: 'neutral', medium: 'info', high: 'warning', urgent: 'danger' };
const PRIORITY_LABELS = { low: 'Basse', medium: 'Moyenne', high: 'Haute', urgent: 'Urgente' };

export default function SupportShow({ ticket }) {
    const { data, setData, post, processing, reset } = useForm({ body: '' });

    const submit = (e) => {
        e.preventDefault();
        post(`/support/${ticket.id}/reply`, { onSuccess: () => reset('body') });
    };

    const close = () => {
        if (confirm('Fermer ce ticket ?')) {
            router.post(`/support/${ticket.id}/close`);
        }
    };

    const isOpen = ['new', 'open', 'pending'].includes(ticket.status);

    return (
        <AppLayout title={`Ticket ${ticket.number}`}>
            <div className="mx-auto max-w-3xl px-4 py-6 space-y-6">
                {/* Header */}
                <div className="flex items-start gap-4">
                    <Link href="/support" className="btn btn-secondary btn-sm mt-1">← Retour</Link>
                    <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                            <span className="font-mono text-sm text-slate-400">{ticket.number}</span>
                            <Badge variant={STATUS_COLORS[ticket.status]}>{STATUS_LABELS[ticket.status]}</Badge>
                            <Badge variant={PRIORITY_COLORS[ticket.priority]}>{PRIORITY_LABELS[ticket.priority]}</Badge>
                        </div>
                        <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">{ticket.subject}</h1>
                        <p className="text-xs text-slate-400 mt-1">Créé le {ticket.created_at}</p>
                    </div>
                    {isOpen && (
                        <button onClick={close} className="btn btn-secondary btn-sm shrink-0">Fermer le ticket</button>
                    )}
                </div>

                {/* Description initiale */}
                <div className="card">
                    <div className="card-header">
                        <span className="text-sm font-medium text-slate-600 dark:text-slate-300">Description initiale</span>
                    </div>
                    <div className="card-body">
                        <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap">{ticket.description}</p>
                    </div>
                </div>

                {/* Échanges */}
                {ticket.messages.length > 0 && (
                    <div className="space-y-3">
                        {ticket.messages.map((m) => (
                            <div key={m.id} className={`flex gap-3 ${m.is_agent ? '' : 'flex-row-reverse'}`}>
                                <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${m.is_agent ? 'bg-orange-100 text-orange-600' : 'bg-slate-100 text-slate-600'}`}>
                                    {m.is_agent ? '🎧' : m.user_name[0]}
                                </div>
                                <div className={`max-w-prose rounded-xl px-4 py-3 text-sm ${m.is_agent ? 'bg-orange-50 dark:bg-orange-900/20' : 'bg-slate-50 dark:bg-slate-800'}`}>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="font-semibold text-slate-800 dark:text-slate-100 text-xs">{m.user_name}</span>
                                        <span className="text-slate-400 text-xs">{m.created_at}</span>
                                    </div>
                                    <p className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap">{m.body}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Répondre */}
                {isOpen && (
                    <form onSubmit={submit} className="card">
                        <div className="card-body space-y-3">
                            <label className="form-label">Votre réponse</label>
                            <textarea className="form-textarea" rows={4} value={data.body}
                                onChange={e => setData('body', e.target.value)}
                                placeholder="Ajoutez des précisions ou répondez à l'agent de support…" />
                            <button type="submit" className="btn btn-primary" disabled={processing}>
                                {processing ? 'Envoi…' : 'Envoyer'}
                            </button>
                        </div>
                    </form>
                )}

                {!isOpen && (
                    <div className="alert alert-info text-sm">
                        Ce ticket est {STATUS_LABELS[ticket.status].toLowerCase()}. Créez un nouveau ticket si besoin.
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
