import { Link, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { PageHeader, Badge } from '@/Components/UI';

const PRIORITY_COLORS = { low: 'neutral', medium: 'info', high: 'warning', urgent: 'danger' };
const STATUS_COLORS = { new: 'info', open: 'brand', pending: 'warning', resolved: 'success', closed: 'neutral' };
const STATUS_LABELS = { new: 'Nouveau', open: 'Ouvert', pending: 'En attente', resolved: 'Résolu', closed: 'Fermé' };
const PRIORITY_LABELS = { low: 'Basse', medium: 'Moyenne', high: 'Haute', urgent: 'Urgente' };

export default function SupportIndex({ tickets, articles, filters }) {
    const filterByStatus = (s) => router.get('/support', { status: s || undefined }, { replace: true });

    return (
        <AppLayout title="Centre de support">
            <div className="mx-auto max-w-5xl px-4 py-6 space-y-8">
                <PageHeader
                    title="Centre de support"
                    subtitle="Consultez vos tickets ou parcourez la base de connaissances"
                    actions={
                        <Link href="/support/create" className="btn btn-primary">+ Nouveau ticket</Link>
                    }
                />

                {/* Base de connaissances */}
                {articles.length > 0 && (
                    <div className="card">
                        <div className="card-header">
                            <h3 className="font-semibold text-slate-800 dark:text-slate-100">📚 Base de connaissances</h3>
                        </div>
                        <div className="card-body grid sm:grid-cols-2 gap-3">
                            {articles.map((a) => (
                                <Link key={a.id} href={`/support/kb/${a.slug}`}
                                    className="flex items-center gap-3 rounded-lg border border-slate-100 dark:border-slate-700 p-3 hover:border-orange-200 hover:bg-orange-50/30 dark:hover:bg-orange-900/10 transition">
                                    <span className="text-orange-500 shrink-0">📄</span>
                                    <div>
                                        <p className="text-sm font-medium text-slate-800 dark:text-slate-100">{a.title}</p>
                                        {a.category && <p className="text-xs text-slate-400">{a.category}</p>}
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}

                {/* Filtres tickets */}
                <div className="flex gap-2 flex-wrap">
                    {[null, 'new', 'open', 'pending', 'resolved', 'closed'].map((s) => (
                        <button key={s ?? 'all'} onClick={() => filterByStatus(s)}
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${filters.status === s || (!s && !filters.status) ? 'bg-orange-500 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'}`}>
                            {s ? STATUS_LABELS[s] : 'Tous'}
                        </button>
                    ))}
                </div>

                {/* Liste tickets */}
                <div className="card">
                    <div className="card-body divide-y divide-slate-50 dark:divide-slate-800">
                        {tickets.data.length === 0 ? (
                            <div className="py-8 text-center text-slate-400">Aucun ticket trouvé.</div>
                        ) : (
                            tickets.data.map((t) => (
                                <Link key={t.id} href={`/support/${t.id}`}
                                    className="flex items-center justify-between py-4 gap-4 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 -mx-4 px-4 transition">
                                    <div className="min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-xs font-mono text-slate-400">{t.number}</span>
                                            <Badge variant={PRIORITY_COLORS[t.priority]}>{PRIORITY_LABELS[t.priority]}</Badge>
                                        </div>
                                        <p className="font-medium text-slate-800 dark:text-slate-100 truncate">{t.subject}</p>
                                        <p className="text-xs text-slate-400 mt-1">{t.created_at}</p>
                                    </div>
                                    <Badge variant={STATUS_COLORS[t.status]}>{STATUS_LABELS[t.status]}</Badge>
                                </Link>
                            ))
                        )}
                    </div>
                </div>

                {/* Pagination */}
                {tickets.links && (
                    <div className="flex gap-1 flex-wrap">
                        {tickets.links.map((link, i) => (
                            <Link key={i} href={link.url ?? '#'}
                                className={`px-3 py-1 rounded text-sm border ${link.active ? 'bg-orange-500 text-white border-orange-500' : 'border-slate-200 text-slate-600'}`}
                                dangerouslySetInnerHTML={{ __html: link.label }} />
                        ))}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
