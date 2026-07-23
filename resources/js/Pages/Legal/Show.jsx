import { useEffect, useRef, useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import { useTrans } from '@/i18n';

const BRAND = '#F58220';

/* ─── Extrait les titres H2 du HTML pour construire la table des matières ─── */
function extractHeadings(html) {
    const div = document.createElement('div');
    div.innerHTML = html;
    const headings = [];
    div.querySelectorAll('h2').forEach((el, i) => {
        const id = 'section-' + i;
        el.id = id;
        headings.push({ id, text: el.textContent.trim() });
    });
    return { html: div.innerHTML, headings };
}

export default function LegalShow({ page, allPages = [] }) {
    const { t } = useTrans();
    const [activeId, setActiveId] = useState('');
    const [tocOpen, setTocOpen] = useState(false);
    const [processedHtml, setProcessedHtml] = useState(page.content || '');
    const [headings, setHeadings] = useState([]);
    const contentRef = useRef(null);

    /* Injecter les ancres et extraire la TOC côté client */
    useEffect(() => {
        if (typeof document !== 'undefined') {
            const { html, headings: h } = extractHeadings(page.content || '');
            setProcessedHtml(html);
            setHeadings(h);
        }
    }, [page.content]);

    /* Surligner la section active au scroll */
    useEffect(() => {
        if (!headings.length) return;
        const observer = new IntersectionObserver(
            (entries) => {
                for (const entry of entries) {
                    if (entry.isIntersecting) {
                        setActiveId(entry.target.id);
                        break;
                    }
                }
            },
            { rootMargin: '-20% 0% -60% 0%', threshold: 0 }
        );
        headings.forEach(({ id }) => {
            const el = document.getElementById(id);
            if (el) observer.observe(el);
        });
        return () => observer.disconnect();
    }, [headings]);

    const scrollTo = (id) => {
        const el = document.getElementById(id);
        if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'start' });
            setTocOpen(false);
        }
    };

    return (
        <>
            <Head title={page.title + ' — CONSTRUIRO ERP'} />

            <div className="min-h-screen" style={{ background: '#f8f7f5', fontFamily: "'Segoe UI', system-ui, sans-serif" }}>

                {/* ── Barre de nav ── */}
                <nav style={{ background: '#fff', borderBottom: '1px solid #e8e4e0' }} className="sticky top-0 z-40 px-6 py-4 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2 no-underline">
                        <span style={{ color: BRAND, fontWeight: 900, fontSize: '1.2rem', letterSpacing: '-0.02em' }}>🏗️ CONSTRUIRO</span>
                        <span style={{ background: BRAND, color: '#fff', fontSize: '0.6rem', fontWeight: 700, padding: '2px 6px', borderRadius: 4 }}>ERP</span>
                    </Link>
                    <div className="flex items-center gap-4">
                        {/* TOC mobile */}
                        {headings.length > 0 && (
                            <button
                                onClick={() => setTocOpen(!tocOpen)}
                                className="lg:hidden text-sm font-medium flex items-center gap-1"
                                style={{ color: BRAND }}
                            >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                    <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="16" y2="12"/><line x1="3" y1="18" x2="12" y2="18"/>
                                </svg>
                                {t('Sommaire')}
                            </button>
                        )}
                        <Link href={route('login')} className="text-sm font-medium no-underline" style={{ color: '#64748b' }}>
                            {t('Se connecter')} →
                        </Link>
                    </div>
                </nav>

                {/* ── TOC mobile déroulant ── */}
                {tocOpen && headings.length > 0 && (
                    <div style={{ background: '#fff', borderBottom: `2px solid ${BRAND}`, padding: '1rem 1.5rem' }} className="lg:hidden">
                        <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: '#94a3b8' }}>{t('Dans cet document')}</p>
                        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 4 }}>
                            {headings.map(h => (
                                <li key={h.id}>
                                    <button
                                        onClick={() => scrollTo(h.id)}
                                        className="text-left w-full text-sm py-1"
                                        style={{ color: activeId === h.id ? BRAND : '#475569', fontWeight: activeId === h.id ? 700 : 400 }}
                                    >
                                        {h.text}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* ── Layout principal ── */}
                <div className="max-w-6xl mx-auto px-4 lg:px-8 py-10 flex gap-12">

                    {/* Sidebar TOC desktop */}
                    {headings.length > 0 && (
                        <aside className="hidden lg:block w-56 flex-shrink-0">
                            <div style={{ position: 'sticky', top: '5rem' }}>
                                <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: '#94a3b8' }}>{t('Sommaire')}</p>
                                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                                    {headings.map(h => (
                                        <li key={h.id} style={{ marginBottom: 2 }}>
                                            <button
                                                onClick={() => scrollTo(h.id)}
                                                className="text-left w-full text-sm py-1.5 pl-3 rounded transition-all"
                                                style={{
                                                    color: activeId === h.id ? BRAND : '#64748b',
                                                    fontWeight: activeId === h.id ? 700 : 400,
                                                    borderLeft: activeId === h.id ? `3px solid ${BRAND}` : '3px solid transparent',
                                                    background: activeId === h.id ? '#fff8f3' : 'transparent',
                                                }}
                                            >
                                                {h.text}
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </aside>
                    )}

                    {/* Contenu principal */}
                    <main style={{ flex: 1, minWidth: 0 }}>

                        {/* Fil d'Ariane */}
                        <div className="flex items-center gap-2 text-xs mb-8" style={{ color: '#94a3b8' }}>
                            <Link href="/" style={{ color: BRAND }} className="no-underline hover:underline">Accueil</Link>
                            <span>›</span>
                            <span>{t('Documents légaux')}</span>
                            <span>›</span>
                            <span style={{ color: '#475569' }}>{page.title}</span>
                        </div>

                        {/* En-tête du document */}
                        <div style={{ background: '#fff', borderRadius: 16, padding: '2rem 2.5rem', marginBottom: '2rem', borderTop: `4px solid ${BRAND}` }}>
                            <div className="flex items-start justify-between gap-4 flex-wrap">
                                <div>
                                    <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: BRAND }}>
                                        {t('Document légal')}
                                    </p>
                                    <h1 className="text-3xl font-black mb-3" style={{ color: '#1e1e1e', letterSpacing: '-0.02em', lineHeight: 1.2 }}>
                                        {page.title}
                                    </h1>
                                    {page.updated_at && (
                                        <p className="text-sm" style={{ color: '#94a3b8' }}>
                                            {t('Dernière mise à jour')} : <strong style={{ color: '#64748b' }}>{page.updated_at}</strong>
                                        </p>
                                    )}
                                </div>
                                <div style={{ background: '#f8f7f5', borderRadius: 10, padding: '0.75rem 1rem', minWidth: 140 }}>
                                    <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: '#94a3b8' }}>Éditeur</p>
                                    <p className="text-sm font-bold" style={{ color: '#1e1e1e' }}>IBIG Soft</p>
                                    <p className="text-xs" style={{ color: '#64748b' }}>CONSTRUIRO ERP</p>
                                </div>
                            </div>
                        </div>

                        {/* Corps du document */}
                        <article
                            ref={contentRef}
                            style={{ background: '#fff', borderRadius: 16, padding: '2.5rem', lineHeight: 1.9 }}
                            className="legal-content"
                            dangerouslySetInnerHTML={{ __html: processedHtml }}
                        />

                        {/* Navigation entre pages légales */}
                        {allPages.length > 1 && (
                            <div style={{ background: '#fff', borderRadius: 16, padding: '1.5rem 2rem', marginTop: '2rem' }}>
                                <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: '#94a3b8' }}>{t('Autres documents')}</p>
                                <div className="flex flex-wrap gap-3">
                                    {allPages.map(p => (
                                        <Link
                                            key={p.slug}
                                            href={route('legal.show', p.slug)}
                                            className="no-underline text-sm font-medium px-4 py-2 rounded-lg transition-all"
                                            style={p.slug === page.slug
                                                ? { background: BRAND, color: '#fff' }
                                                : { background: '#f1f5f9', color: '#475569' }}
                                        >
                                            {p.title}
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        )}
                    </main>
                </div>

                {/* Footer */}
                <footer style={{ borderTop: '1px solid #e8e4e0', background: '#fff', padding: '2rem', textAlign: 'center' }}>
                    <p className="text-xs" style={{ color: '#94a3b8' }}>
                        © {new Date().getFullYear()} <strong style={{ color: '#475569' }}>IBIG Soft</strong> — CONSTRUIRO ERP · Abidjan, Côte d'Ivoire
                    </p>
                </footer>
            </div>

            {/* ── Styles prose injectés globalement ── */}
            <style>{`
                .legal-content {
                    color: #374151;
                    font-size: 0.9375rem;
                }
                .legal-content h1 {
                    font-size: 1.5rem;
                    font-weight: 800;
                    color: #111827;
                    margin: 2.5rem 0 1rem;
                    padding-bottom: 0.5rem;
                    border-bottom: 2px solid #f1f5f9;
                    letter-spacing: -0.01em;
                }
                .legal-content h2 {
                    font-size: 1.125rem;
                    font-weight: 700;
                    color: #1f2937;
                    margin: 2.5rem 0 0.75rem;
                    padding-left: 1rem;
                    border-left: 3px solid ${BRAND};
                    scroll-margin-top: 5rem;
                }
                .legal-content h3 {
                    font-size: 0.9375rem;
                    font-weight: 700;
                    color: #374151;
                    margin: 1.5rem 0 0.5rem;
                    text-transform: uppercase;
                    letter-spacing: 0.04em;
                    font-size: 0.8rem;
                    color: #6b7280;
                }
                .legal-content p {
                    margin: 0 0 1rem;
                    color: #4b5563;
                    line-height: 1.85;
                }
                .legal-content ul, .legal-content ol {
                    margin: 0 0 1rem 1.25rem;
                    padding: 0;
                }
                .legal-content li {
                    margin-bottom: 0.4rem;
                    color: #4b5563;
                    line-height: 1.7;
                }
                .legal-content ul li::marker {
                    color: ${BRAND};
                }
                .legal-content ol li::marker {
                    color: ${BRAND};
                    font-weight: 700;
                }
                .legal-content strong, .legal-content b {
                    font-weight: 700;
                    color: #1f2937;
                }
                .legal-content a {
                    color: ${BRAND};
                    text-decoration: none;
                }
                .legal-content a:hover {
                    text-decoration: underline;
                }
                .legal-content blockquote {
                    border-left: 4px solid ${BRAND};
                    background: #fff8f3;
                    margin: 1.5rem 0;
                    padding: 1rem 1.5rem;
                    border-radius: 0 8px 8px 0;
                    color: #92400e;
                    font-style: italic;
                }
                .legal-content table {
                    width: 100%;
                    border-collapse: collapse;
                    margin: 1.5rem 0;
                    font-size: 0.875rem;
                    border-radius: 8px;
                    overflow: hidden;
                }
                .legal-content th {
                    background: #f8f7f5;
                    font-weight: 700;
                    color: #374151;
                    text-align: left;
                    padding: 0.75rem 1rem;
                    border-bottom: 2px solid #e5e7eb;
                }
                .legal-content td {
                    padding: 0.65rem 1rem;
                    border-bottom: 1px solid #f3f4f6;
                    color: #4b5563;
                }
                .legal-content tr:last-child td {
                    border-bottom: none;
                }
                .legal-content tr:nth-child(even) td {
                    background: #fafafa;
                }
                .legal-content hr {
                    border: none;
                    border-top: 1px solid #e5e7eb;
                    margin: 2rem 0;
                }
                .legal-content code {
                    background: #f3f4f6;
                    padding: 2px 6px;
                    border-radius: 4px;
                    font-size: 0.85em;
                    color: #374151;
                }
                @media (max-width: 640px) {
                    .legal-content { padding: 1.5rem !important; }
                    .legal-content h1 { font-size: 1.25rem; }
                    .legal-content h2 { font-size: 1rem; }
                }
            `}</style>
        </>
    );
}
