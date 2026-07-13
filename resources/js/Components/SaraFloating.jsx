import { useState, useRef, useEffect, useCallback } from 'react';

const BRAND = '#F58220';
const NAVY  = '#1E1E1E';

const QUICK_QUESTIONS = [
    'Que fait CONSTRUIRO ERP ?',
    'Quels sont les modules disponibles ?',
    'Combien coûte la licence ?',
    'Puis-je essayer gratuitement ?',
    'Comment installer l\'application ?',
    'Comment demander une démo ?',
];

const WELCOME_MSG = {
    role: 'assistant',
    content: 'Bonjour ! Je suis **SARA**, l\'assistante intelligente de CONSTRUIRO ERP. Je peux vous présenter la solution, vous aider à choisir une formule ou organiser une démonstration. Comment puis-je vous aider ?',
};

function renderMarkdown(text) {
    return text
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/\n/g, '<br/>');
}

/* ── Bulle de message ──────────────────────────────────────────── */
function Bubble({ msg }) {
    const isUser = msg.role === 'user';
    return (
        <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-3`}>
            {!isUser && (
                <div className="w-7 h-7 rounded-full flex items-center justify-center font-black text-white text-xs mr-2 flex-shrink-0 mt-1"
                    style={{ background: BRAND }}>S</div>
            )}
            <div
                className="max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed"
                style={isUser
                    ? { background: BRAND, color: '#fff', borderBottomRightRadius: 4 }
                    : { background: 'rgba(255,255,255,0.08)', color: '#e2e8f0', borderBottomLeftRadius: 4 }}
                dangerouslySetInnerHTML={{ __html: renderMarkdown(msg.content) }}
            />
        </div>
    );
}

/* ── Indicateur "SARA écrit…" ─────────────────────────────────── */
function TypingIndicator() {
    return (
        <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 rounded-full flex items-center justify-center font-black text-white text-xs flex-shrink-0"
                style={{ background: BRAND }}>S</div>
            <div className="rounded-2xl px-4 py-3 flex gap-1 items-center"
                style={{ background: 'rgba(255,255,255,0.08)', borderBottomLeftRadius: 4 }}>
                {[0, 1, 2].map(i => (
                    <span key={i} className="w-1.5 h-1.5 rounded-full bg-gray-400"
                        style={{ animation: `saraPulse 1.2s ease-in-out ${i * 0.2}s infinite` }}/>
                ))}
            </div>
        </div>
    );
}

/* ── Fenêtre de chat SARA ────────────────────────────────────── */
function SaraWindow({ onClose }) {
    const [messages, setMessages]   = useState([WELCOME_MSG]);
    const [input, setInput]         = useState('');
    const [loading, setLoading]     = useState(false);
    const [showQuick, setShowQuick] = useState(true);
    const [expanded, setExpanded]   = useState(false);
    const bottomRef = useRef(null);
    const inputRef  = useRef(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, loading]);

    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    const send = useCallback(async (text) => {
        const msg = (text || input).trim();
        if (!msg || loading) return;

        setInput('');
        setShowQuick(false);
        setMessages(prev => [...prev, { role: 'user', content: msg }]);
        setLoading(true);

        try {
            const history = messages
                .filter(m => m.role !== 'system')
                .slice(-8)
                .map(m => ({ role: m.role, content: m.content }));

            const res = await fetch('/api/sara/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content || '',
                    'Accept': 'application/json',
                },
                body: JSON.stringify({ message: msg, history }),
            });

            const data = await res.json();
            setMessages(prev => [...prev, { role: 'assistant', content: data.reply || 'Désolée, je n\'ai pas pu générer une réponse.' }]);
        } catch {
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: 'Une erreur s\'est produite. Contactez-nous directement : **contact@ibigsoft.com** ou **+225 27 22 27 60 14**',
            }]);
        } finally {
            setLoading(false);
        }
    }, [input, loading, messages]);

    const handleKey = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
    };

    const reset = () => {
        setMessages([WELCOME_MSG]);
        setInput('');
        setShowQuick(true);
        setLoading(false);
    };

    return (
        <div
            className="flex flex-col rounded-2xl overflow-hidden shadow-2xl"
            style={{
                width: expanded ? 'min(460px, calc(100vw - 24px))' : 'min(360px, calc(100vw - 24px))',
                height: expanded ? 600 : 500,
                background: '#0f172a',
                border: '1px solid rgba(255,255,255,0.12)',
                transition: 'width 0.2s, height 0.2s',
            }}>

            {/* Header */}
            <div className="flex items-center gap-3 px-4 py-3 flex-shrink-0"
                style={{ background: 'rgba(245,130,32,0.15)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                <div className="w-9 h-9 rounded-full flex items-center justify-center font-black text-white text-sm flex-shrink-0"
                    style={{ background: BRAND }}>S</div>
                <div className="flex-1 min-w-0">
                    <p className="text-white font-bold text-sm leading-none">SARA</p>
                    <p className="text-xs text-green-400 flex items-center gap-1 mt-0.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block"/>
                        Assistante CONSTRUIRO · En ligne
                    </p>
                </div>
                <div className="flex items-center gap-1">
                    <button onClick={reset} title="Recommencer"
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-3.5"/>
                        </svg>
                    </button>
                    <button onClick={() => setExpanded(e => !e)} title={expanded ? 'Réduire' : 'Agrandir'}
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            {expanded
                                ? <><polyline points="4 14 10 14 10 20"/><polyline points="20 10 14 10 14 4"/><line x1="10" y1="14" x2="21" y2="3"/><line x1="3" y1="21" x2="14" y2="10"/></>
                                : <><polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/></>
                            }
                        </svg>
                    </button>
                    <button onClick={onClose} title="Fermer"
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                        </svg>
                    </button>
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-4 min-h-0">
                {messages.map((m, i) => <Bubble key={i} msg={m} />)}
                {loading && <TypingIndicator />}

                {/* Questions rapides */}
                {showQuick && !loading && (
                    <div className="mt-2">
                        <p className="text-xs text-gray-600 mb-2 font-medium">Questions fréquentes :</p>
                        <div className="flex flex-wrap gap-1.5">
                            {QUICK_QUESTIONS.map(q => (
                                <button key={q} onClick={() => send(q)}
                                    className="text-xs px-3 py-1.5 rounded-full transition hover:opacity-80"
                                    style={{ background: 'rgba(245,130,32,0.12)', color: BRAND, border: `1px solid rgba(245,130,32,0.25)` }}>
                                    {q}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
                <div ref={bottomRef}/>
            </div>

            {/* Input */}
            <div className="px-3 py-3 flex-shrink-0" style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
                <div className="flex gap-2 items-end">
                    <textarea
                        ref={inputRef}
                        rows={1}
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        onKeyDown={handleKey}
                        placeholder="Écrivez votre message…"
                        disabled={loading}
                        className="flex-1 rounded-xl px-3 py-2.5 text-sm resize-none outline-none text-gray-200 placeholder-gray-600 disabled:opacity-50"
                        style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)', maxHeight: 80 }}
                    />
                    <button onClick={() => send()}
                        disabled={!input.trim() || loading}
                        className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition disabled:opacity-40"
                        style={{ background: BRAND }}>
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                            <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
                        </svg>
                    </button>
                </div>
                <p className="text-xs text-gray-700 mt-2 text-center">
                    SARA peut faire des erreurs · Vérifiez les informations importantes
                </p>
            </div>
        </div>
    );
}

/* ── Bouton flottant SARA ────────────────────────────────────── */
export default function SaraFloating() {
    const [open, setOpen] = useState(false);
    const [showTooltip, setShowTooltip] = useState(true);

    useEffect(() => {
        const t = setTimeout(() => setShowTooltip(false), 5000);
        return () => clearTimeout(t);
    }, []);

    return (
        <>
            <style>{`
                @keyframes saraPulse {
                    0%, 80%, 100% { transform: scale(0); opacity: 0.5; }
                    40% { transform: scale(1); opacity: 1; }
                }
                @keyframes saraRing {
                    0% { transform: scale(1); opacity: 0.6; }
                    100% { transform: scale(1.8); opacity: 0; }
                }
                @keyframes saraSlideUp {
                    from { opacity: 0; transform: translateY(16px) scale(0.95); }
                    to   { opacity: 1; transform: translateY(0) scale(1); }
                }
            `}</style>

            {/* Fenêtre chat */}
            {open && (
                <div className="fixed z-[9999]"
                    style={{
                        bottom: 'calc(80px + env(safe-area-inset-bottom, 0px))',
                        right: 16,
                        animation: 'saraSlideUp 0.25s ease both',
                        maxHeight: 'calc(100dvh - 120px)',
                        display: 'flex',
                        flexDirection: 'column',
                    }}>
                    <SaraWindow onClose={() => setOpen(false)} />
                </div>
            )}

            {/* WhatsApp — bas GAUCHE */}
            <a href="https://wa.me/2252722276014?text=Bonjour%20IBIG%20Soft%2C%20je%20souhaite%20obtenir%20des%20informations%20sur%20CONSTRUIRO%20ERP."
                target="_blank" rel="noopener noreferrer"
                className="group fixed left-4 z-[9999] w-14 h-14 rounded-full flex items-center justify-center shadow-xl transition hover:scale-110"
                style={{ bottom: 'calc(16px + env(safe-area-inset-bottom, 0px))', background: '#25D366', boxShadow: '0 8px 32px rgba(37,211,102,0.4)' }}
                title="Contacter via WhatsApp">
                <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                <span className="absolute left-16 whitespace-nowrap bg-gray-900 text-white text-xs px-2.5 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition pointer-events-none"
                    style={{ border: '1px solid rgba(255,255,255,0.1)' }}>
                    WhatsApp
                </span>
            </a>

            {/* SARA — bas DROITE */}
            <div className="fixed right-4 z-[9999] flex flex-col items-end gap-3"
                style={{ bottom: 'calc(16px + env(safe-area-inset-bottom, 0px))' }}>

                {/* SARA */}
                <div className="relative">
                    {/* Cercle de pulsation (seulement quand fermé) */}
                    {!open && (
                        <span className="absolute inset-0 rounded-full"
                            style={{ background: BRAND, animation: 'saraRing 2s ease-out infinite' }}/>
                    )}
                    <button
                        id="sara-chat"
                        onClick={() => setOpen(o => !o)}
                        className="relative w-14 h-14 rounded-full flex items-center justify-center shadow-xl transition hover:scale-110 focus:outline-none"
                        style={{ background: BRAND, boxShadow: `0 8px 32px rgba(245,130,32,0.45)` }}
                        aria-label={open ? 'Fermer SARA' : 'Ouvrir SARA'}>
                        {open ? (
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                            </svg>
                        ) : (
                            <span className="text-white font-black text-lg select-none">S</span>
                        )}
                    </button>

                    {/* Tooltip — visible 5s puis disparaît */}
                    {!open && showTooltip && (
                        <div className="absolute bottom-full right-0 mb-2 pointer-events-none"
                            style={{ animation: 'saraSlideUp 0.3s ease both', whiteSpace: 'nowrap' }}>
                            <div className="flex items-center gap-1.5 bg-gray-900 text-white text-xs px-3 py-1.5 rounded-xl"
                                style={{ border: '1px solid rgba(255,255,255,0.12)' }}>
                                <span className="w-1.5 h-1.5 rounded-full bg-green-400 flex-shrink-0"/>
                                SARA — Besoin d'aide ?
                            </div>
                            <button className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-gray-700 text-white flex items-center justify-center pointer-events-auto"
                                style={{ fontSize: 8, lineHeight: 1 }}
                                onClick={() => setShowTooltip(false)}>✕</button>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
