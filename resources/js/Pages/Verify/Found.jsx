import { Head, Link } from '@inertiajs/react';

/**
 * Page de confirmation d'authenticité d'un document CONSTRUIRO.
 * Rendue par la route GET /verify/{type}/{number} lorsque le document est trouvé.
 */
export default function Found({ type, number, date, status }) {
    return (
        <>
            <Head title="Document authentique — CONSTRUIRO" />

            <div style={styles.page}>
                <div style={styles.card}>
                    {/* Icône de succès */}
                    <div style={styles.iconWrap}>
                        <svg viewBox="0 0 24 24" fill="none" style={styles.icon}>
                            <circle cx="12" cy="12" r="12" fill="#dcfce7" />
                            <path
                                d="M7 12.5l3.5 3.5 6.5-7"
                                stroke="#16a34a"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        </svg>
                    </div>

                    <h1 style={styles.title}>Document authentique</h1>
                    <p style={styles.subtitle}>Ce document a été émis par CONSTRUIRO ERP et est valide.</p>

                    {/* Détails */}
                    <dl style={styles.dl}>
                        <div style={styles.row}>
                            <dt style={styles.dt}>Type</dt>
                            <dd style={styles.dd}>{type}</dd>
                        </div>
                        <div style={styles.row}>
                            <dt style={styles.dt}>Référence</dt>
                            <dd style={styles.dd}>{number}</dd>
                        </div>
                        {date && (
                            <div style={styles.row}>
                                <dt style={styles.dt}>Date d'émission</dt>
                                <dd style={styles.dd}>{date}</dd>
                            </div>
                        )}
                        {status && (
                            <div style={styles.row}>
                                <dt style={styles.dt}>Statut</dt>
                                <dd style={{ ...styles.dd, textTransform: 'capitalize' }}>{status}</dd>
                            </div>
                        )}
                    </dl>

                    {/* Pied */}
                    <div style={styles.footer}>
                        <Link href="/" style={styles.link}>
                            Retour à l'accueil CONSTRUIRO
                        </Link>
                    </div>
                </div>
            </div>
        </>
    );
}

const styles = {
    page: {
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f8fafc',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        padding: '24px',
    },
    card: {
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        boxShadow: '0 4px 24px rgba(0,0,0,.08)',
        padding: '40px 48px',
        maxWidth: '480px',
        width: '100%',
        textAlign: 'center',
    },
    iconWrap: {
        display: 'flex',
        justifyContent: 'center',
        marginBottom: '20px',
    },
    icon: {
        width: '64px',
        height: '64px',
    },
    title: {
        fontSize: '22px',
        fontWeight: '700',
        color: '#0f172a',
        margin: '0 0 8px',
    },
    subtitle: {
        fontSize: '14px',
        color: '#64748b',
        margin: '0 0 28px',
    },
    dl: {
        textAlign: 'left',
        borderTop: '1px solid #e2e8f0',
        paddingTop: '20px',
        margin: '0 0 28px',
    },
    row: {
        display: 'flex',
        justifyContent: 'space-between',
        padding: '8px 0',
        borderBottom: '1px solid #f1f5f9',
    },
    dt: {
        fontSize: '13px',
        color: '#64748b',
        fontWeight: '500',
    },
    dd: {
        fontSize: '13px',
        color: '#0f172a',
        fontWeight: '600',
        margin: 0,
    },
    footer: {
        paddingTop: '4px',
    },
    link: {
        fontSize: '13px',
        color: '#f97316',
        textDecoration: 'none',
        fontWeight: '600',
    },
};
