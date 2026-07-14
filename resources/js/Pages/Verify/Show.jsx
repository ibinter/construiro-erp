import { Head } from '@inertiajs/react';

const STATUS_ICONS = {
    authentic: { emoji: '✅', bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-700', dark: 'dark:bg-green-900/20 dark:border-green-800 dark:text-green-300' },
    cancelled: { emoji: '🚫', bg: 'bg-red-50',   border: 'border-red-200',   text: 'text-red-700',   dark: 'dark:bg-red-900/20 dark:border-red-800 dark:text-red-300' },
    tampered:  { emoji: '⚠️', bg: 'bg-red-50',   border: 'border-red-200',   text: 'text-red-700',   dark: 'dark:bg-red-900/20 dark:border-red-800 dark:text-red-300' },
    not_found: { emoji: '❓', bg: 'bg-slate-50', border: 'border-slate-200', text: 'text-slate-600', dark: 'dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300' },
    invalid:   { emoji: '❌', bg: 'bg-slate-50', border: 'border-slate-200', text: 'text-slate-600', dark: 'dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300' },
};

export default function VerifyShow({ status, label, document_type, reference, issued_at, issuer, hash_short }) {
    const ui = STATUS_ICONS[status] ?? STATUS_ICONS.invalid;

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4">
            <Head title={`Vérification de document — CONSTRUIRO`} />

            <div className="w-full max-w-md">
                {/* Logo */}
                <div className="mb-8 text-center">
                    <span className="text-2xl font-black text-orange-500 tracking-tight">CONSTRUIRO</span>
                    <p className="mt-1 text-xs text-slate-400">Vérification d'authenticité des documents</p>
                </div>

                {/* Statut */}
                <div className={`rounded-2xl border p-8 text-center ${ui.bg} ${ui.border} ${ui.dark}`}>
                    <div className="mb-4 text-6xl">{ui.emoji}</div>
                    <h1 className={`text-xl font-bold mb-2 ${ui.text}`}>
                        {label.fr}
                    </h1>
                    <p className={`text-sm ${ui.text} opacity-75`}>{label.en}</p>

                    {/* Informations du document */}
                    {reference && (
                        <div className="mt-6 space-y-3 border-t border-current/10 pt-6 text-left text-sm">
                            {document_type && (
                                <Row label="Type" value={document_type} />
                            )}
                            {reference && (
                                <Row label="Référence" value={reference} />
                            )}
                            {issued_at && (
                                <Row label="Date d'émission" value={new Date(issued_at).toLocaleDateString('fr-FR', { year:'numeric', month:'long', day:'numeric' })} />
                            )}
                            {issuer && (
                                <Row label="Émetteur" value={issuer} />
                            )}
                            {hash_short && (
                                <Row label="Empreinte" value={<code className="font-mono text-xs">{hash_short}</code>} />
                            )}
                        </div>
                    )}
                </div>

                {/* Mentions */}
                <div className="mt-6 text-center text-xs text-slate-400 leading-relaxed">
                    {status === 'authentic' && (
                        <p>Ce document a été émis par CONSTRUIRO et son intégrité a été vérifiée.<br />
                        Toute modification ultérieure invaliderait cette vérification.</p>
                    )}
                    {status === 'tampered' && (
                        <p className="text-red-500">⚠️ L'intégrité de ce document ne peut pas être confirmée.<br />
                        Le contenu semble avoir été modifié après son émission.</p>
                    )}
                    {status === 'not_found' && (
                        <p>Ce lien ne correspond à aucun document enregistré dans CONSTRUIRO.<br />
                        Vérifiez que le QR code est intact et réessayez.</p>
                    )}
                </div>

                <div className="mt-8 text-center text-xs text-slate-300 dark:text-slate-600">
                    Powered by <strong className="text-orange-400">CONSTRUIRO ERP</strong> · IBIG Soft
                </div>
            </div>
        </div>
    );
}

function Row({ label, value }) {
    return (
        <div className="flex items-start justify-between gap-4">
            <span className="shrink-0 font-medium opacity-60">{label}</span>
            <span className="text-right">{value}</span>
        </div>
    );
}
