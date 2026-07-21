import { useRef, useState } from 'react';
import { useForm, Link, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Badge } from '@/Components/UI';

// ─── Libellés et couleurs ────────────────────────────────────────────────────

const STATUS_COLORS = {
    new:            'info',
    open:           'brand',
    pending:        'warning',
    assigned:       'brand',
    in_progress:    'brand',
    waiting_client: 'warning',
    waiting_tech:   'warning',
    escalated:      'danger',
    reopened:       'warning',
    resolved:       'success',
    closed:         'neutral',
};

const STATUS_LABELS = {
    new:            'Nouveau',
    open:           'Ouvert',
    pending:        'En attente',
    assigned:       'Assigné',
    in_progress:    'En cours',
    waiting_client: 'Attente client',
    waiting_tech:   'Attente tech',
    escalated:      'Escaladé',
    reopened:       'Réouvert',
    resolved:       'Résolu',
    closed:         'Fermé',
};

const PRIORITY_COLORS = { low: 'neutral', medium: 'info', high: 'warning', urgent: 'danger' };
const PRIORITY_LABELS = { low: 'Basse', medium: 'Moyenne', high: 'Haute', urgent: 'Urgente' };

// ─── Barre SLA ───────────────────────────────────────────────────────────────

function SlaBar({ percent, breached, resolvedTargetAt }) {
    if (!resolvedTargetAt) return null;

    const color = breached || percent >= 100
        ? '#ef4444'   // rouge
        : percent >= 80
            ? '#f97316' // orange
            : '#22c55e'; // vert

    const label = breached
        ? 'SLA dépassé !'
        : percent >= 100
            ? 'SLA expiré'
            : `SLA résolution : ${percent}% consommé`;

    return (
        <div className="rounded-lg border border-slate-200 dark:border-slate-700 p-3 space-y-1">
            <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
                <span>⏱ {label}</span>
                <span>Échéance : {new Date(resolvedTargetAt).toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
            </div>
            <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden">
                <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, percent)}%`, backgroundColor: color }}
                />
            </div>
        </div>
    );
}

// ─── Pièce jointe (affichage) ─────────────────────────────────────────────────

function AttachmentList({ attachments }) {
    if (!attachments || attachments.length === 0) return null;
    return (
        <div className="flex flex-wrap gap-2 mt-2">
            {attachments.map((a, i) => {
                const url = `/storage/${a.path}`;
                const isImage = /\.(jpg|jpeg|png|gif)$/i.test(a.original_name ?? a.path);
                return (
                    <a
                        key={i}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 rounded-md border border-slate-200 dark:border-slate-600 px-2 py-1 text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition"
                    >
                        {isImage ? '🖼' : '📎'} {a.original_name ?? 'Fichier'}
                    </a>
                );
            })}
        </div>
    );
}

// ─── Composant principal ─────────────────────────────────────────────────────

export default function SupportShow({ ticket, can_manage, statuses }) {
    const fileInputRef = useRef(null);
    const [fileList, setFileList] = useState([]);

    const { data, setData, post, processing, reset, errors } = useForm({
        body:        '',
        is_internal: false,
        attachments: [],
    });

    // Formulaire de réponse avec upload
    const submit = (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('body', data.body);
        formData.append('is_internal', data.is_internal ? '1' : '0');
        fileList.forEach(f => formData.append('attachments[]', f));

        router.post(`/support/${ticket.id}/message`, formData, {
            forceFormData: true,
            onSuccess: () => {
                reset('body', 'is_internal');
                setFileList([]);
                if (fileInputRef.current) fileInputRef.current.value = '';
            },
        });
    };

    // Mise à jour du statut (agent)
    const handleStatusChange = (newStatus) => {
        if (confirm(`Changer le statut en « ${STATUS_LABELS[newStatus] ?? newStatus} » ?`)) {
            router.patch(`/support/${ticket.id}/status`, { status: newStatus });
        }
    };

    // Fermeture
    const close = () => {
        if (confirm('Fermer ce ticket définitivement ?')) {
            router.post(`/support/${ticket.id}/close`);
        }
    };

    // Réouverture
    const reopen = () => {
        if (confirm('Réouvrir ce ticket ?')) {
            router.post(`/support/${ticket.id}/reopen`);
        }
    };

    const isOpen    = ticket.status !== 'closed' && ticket.status !== 'resolved';
    const isClosed  = ticket.status === 'closed' || ticket.status === 'resolved';

    return (
        <AppLayout title={`Ticket ${ticket.number}`}>
            <div className="mx-auto max-w-3xl px-4 py-6 space-y-6">

                {/* ─── En-tête ─────────────────────────────────────────────── */}
                <div className="flex items-start gap-4">
                    <Link href="/support" className="btn btn-secondary btn-sm mt-1">← Retour</Link>
                    <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                            <span className="font-mono text-sm text-slate-400">{ticket.number}</span>
                            <Badge variant={STATUS_COLORS[ticket.status] ?? 'neutral'}>
                                {STATUS_LABELS[ticket.status] ?? ticket.status}
                            </Badge>
                            <Badge variant={PRIORITY_COLORS[ticket.priority]}>
                                {PRIORITY_LABELS[ticket.priority]}
                            </Badge>
                            {ticket.sla_breached && (
                                <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-600 dark:bg-red-900/30 dark:text-red-400">
                                    SLA Breach
                                </span>
                            )}
                        </div>
                        <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100 truncate">{ticket.subject}</h1>
                        <p className="text-xs text-slate-400 mt-1">Créé le {ticket.created_at}</p>
                        {ticket.resolved_at && (
                            <p className="text-xs text-slate-400">Résolu le {ticket.resolved_at}</p>
                        )}
                    </div>

                    {/* Boutons d'action */}
                    <div className="flex gap-2 shrink-0">
                        {isOpen && (
                            <button onClick={close} className="btn btn-secondary btn-sm">
                                Fermer
                            </button>
                        )}
                        {isClosed && (
                            <button onClick={reopen} className="btn btn-secondary btn-sm">
                                Réouvrir
                            </button>
                        )}
                    </div>
                </div>

                {/* ─── Barre SLA ───────────────────────────────────────────── */}
                <SlaBar
                    percent={ticket.sla_resolved_percent}
                    breached={ticket.sla_breached}
                    resolvedTargetAt={ticket.resolved_target_at}
                />

                {/* ─── Panel agent : changement de statut ───────────────────── */}
                {can_manage && (
                    <div className="card">
                        <div className="card-body">
                            <label className="form-label text-xs text-slate-500 mb-1 block">
                                Changer le statut (agent)
                            </label>
                            <select
                                className="form-select text-sm"
                                value={ticket.status}
                                onChange={e => handleStatusChange(e.target.value)}
                            >
                                {(statuses ?? []).map(s => (
                                    <option key={s} value={s}>{STATUS_LABELS[s] ?? s}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                )}

                {/* ─── Description initiale ───────────────────────────────── */}
                <div className="card">
                    <div className="card-header">
                        <span className="text-sm font-medium text-slate-600 dark:text-slate-300">Description initiale</span>
                    </div>
                    <div className="card-body">
                        <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap">{ticket.description}</p>
                        <AttachmentList attachments={ticket.attachments} />
                    </div>
                </div>

                {/* ─── Échanges ──────────────────────────────────────────── */}
                {ticket.messages.length > 0 && (
                    <div className="space-y-3">
                        {ticket.messages.map((m) => (
                            <div key={m.id} className={`flex gap-3 ${m.is_agent ? '' : 'flex-row-reverse'}`}>
                                <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                                    m.is_agent
                                        ? 'bg-orange-100 text-orange-600 dark:bg-orange-900/30'
                                        : 'bg-slate-100 text-slate-600 dark:bg-slate-700'
                                }`}>
                                    {m.is_agent ? '🎧' : (m.user_name?.[0] ?? '?')}
                                </div>
                                <div className={`max-w-prose rounded-xl px-4 py-3 text-sm ${
                                    m.is_internal
                                        ? 'bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700'
                                        : m.is_agent
                                            ? 'bg-orange-50 dark:bg-orange-900/20'
                                            : 'bg-slate-50 dark:bg-slate-800'
                                }`}>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="font-semibold text-slate-800 dark:text-slate-100 text-xs">{m.user_name}</span>
                                        {m.is_internal && (
                                            <span className="rounded px-1 py-0.5 bg-yellow-200 dark:bg-yellow-800 text-yellow-800 dark:text-yellow-200 text-[10px] font-semibold">
                                                Note interne
                                            </span>
                                        )}
                                        <span className="text-slate-400 text-xs">{m.created_at}</span>
                                    </div>
                                    <p className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap">{m.body}</p>
                                    <AttachmentList attachments={m.attachments} />
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* ─── Formulaire de réponse ──────────────────────────────── */}
                {isOpen ? (
                    <form onSubmit={submit} className="card">
                        <div className="card-body space-y-3">
                            <label className="form-label">Votre réponse</label>
                            <textarea
                                className={`form-textarea ${errors.body ? 'border-red-400' : ''}`}
                                rows={4}
                                value={data.body}
                                onChange={e => setData('body', e.target.value)}
                                placeholder="Ajoutez des précisions ou répondez à l'agent de support…"
                            />
                            {errors.body && (
                                <p className="text-xs text-red-500">{errors.body}</p>
                            )}

                            {/* Pièces jointes */}
                            <div>
                                <label className="form-label text-xs text-slate-500">
                                    Pièces jointes (max 5 × 10 Mo — jpg, png, pdf, doc, xlsx, txt, zip)
                                </label>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    multiple
                                    accept=".jpg,.jpeg,.png,.gif,.pdf,.doc,.docx,.xls,.xlsx,.txt,.zip"
                                    className="block w-full text-sm text-slate-500 dark:text-slate-400
                                               file:mr-4 file:py-1 file:px-3 file:rounded-full file:border-0
                                               file:text-xs file:font-semibold file:bg-orange-50 file:text-orange-600
                                               hover:file:bg-orange-100 dark:file:bg-orange-900/20 dark:file:text-orange-400"
                                    onChange={e => setFileList(Array.from(e.target.files ?? []))}
                                />
                                {fileList.length > 0 && (
                                    <ul className="mt-1 space-y-0.5">
                                        {fileList.map((f, i) => (
                                            <li key={i} className="text-xs text-slate-500">
                                                📎 {f.name} ({(f.size / 1024).toFixed(0)} Ko)
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>

                            {/* Note interne — agents uniquement */}
                            {can_manage && (
                                <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="form-checkbox"
                                        checked={data.is_internal}
                                        onChange={e => setData('is_internal', e.target.checked)}
                                    />
                                    Note interne (non visible par le client)
                                </label>
                            )}

                            <button type="submit" className="btn btn-primary" disabled={processing}>
                                {processing ? 'Envoi…' : 'Envoyer'}
                            </button>
                        </div>
                    </form>
                ) : (
                    <div className="alert alert-info text-sm">
                        Ce ticket est {STATUS_LABELS[ticket.status]?.toLowerCase() ?? ticket.status}.
                        {isClosed && ' Cliquez « Réouvrir » si vous avez besoin de plus d'aide.'}
                    </div>
                )}

            </div>
        </AppLayout>
    );
}
