import { Head, Link } from '@inertiajs/react';

/**
 * Page d'erreur de vérification d'un document CONSTRUIRO.
 * Rendue par la route GET /verify/{type}/{number} lorsque le document est introuvable.
 */
export default function NotFound({ number }) {
    return (
        <>
            <Head title="Document introuvable — CONSTRUIRO" />

            <div style={styles.page}>
                <div style={styles.card}>
                    {/* Icône d'avertissement */}
                    <div style={styles.iconWrap}>
                        <svg viewBox="0 0 24 24" fill="none" style={styles.icon}>
                            <circle cx="12" cy="12" r="12" fill="#fff7ed" />
                            <path
                                d="M12 8v4m0 4h.01"
                                stroke="#f97316"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                            <path
                                d="M10.29 4.86L2.82 17a2 2 0 001.71 3h15a2 2 0 001.71-3L13.71 4.86a2 2 0 00-3.42 0z"
                                stroke="#f97316"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        </svg>
                    </div>

                    <h1 style={styles.title}>Document introuvable</h1>
                    <p style={styles.subtitle}>
                        Aucun document avec la référence{' '}
                        <strong style={{ color: '#0f172a' }}>« {number} »</strong>{' '}
                        n'a été trouvé dans notre système.
                    </p>

                    {/* Conseils */}
                    <div style={styles.box}>
                        <p style={styles.boxTitle}>Que vérifier ?</p>
                        <ul style={styles.list}>
                            <li>Le QR code a bien été scanné entièrement</li>
                            <li>Le document provient bien d'un logiciel CONSTRUIRO ERP</li>
                            <li>Le document n'a pas été falsifié ou altéré</li>
                        </ul>
                    </div>

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
        margin: '0 0 24px',
        lineHeight: '1.6',
    },
    box: {
        backgroundColor: '#fff7ed',
        borderRadius: '8px',
        padding: '16px 20px',
        textAlign: 'left',
        marginBottom: '28px',
    },
    boxTitle: {
        fontSize: '12px',
        fontWeight: '700',
        color: '#f97316',
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
        margin: '0 0 8px',
    },
    list: {
        margin: 0,
        paddingLeft: '18px',
        fontSize: '13px',
        color: '#475569',
        lineHeight: '1.8',
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
