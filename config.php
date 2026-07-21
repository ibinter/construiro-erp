<?php
/* ===========================================================
   Zelivry — Configuration
   Modifiez UNIQUEMENT ce fichier après l'installation sur cPanel.

   🔐 SECRETS : les valeurs sensibles ci-dessous peuvent être surchargées
   par des variables d'environnement (cPanel → "Environment Variables" ou
   SetEnv dans .htaccess). Si la variable d'env existe, elle a la priorité ;
   sinon la valeur écrite ici sert de repli. Recommandé en production :
   définir les variables d'env puis VIDER les valeurs en clair ci-dessous.
   Voir SECURITE_SECRETS.md.
   =========================================================== */

// Lit une variable d'environnement, sinon renvoie la valeur de repli.
if (!function_exists('zenv')) {
    function zenv(string $k, string $def = ''): string {
        $v = getenv($k);
        return ($v === false || $v === '') ? $def : $v;
    }
}

// --- Base de données MySQL (cPanel → MySQL Databases) ---
define('DB_HOST', zenv('ZLV_DB_HOST', '127.0.0.1'));
define('DB_NAME', zenv('ZLV_DB_NAME', 'ibigs2689720_52tki'));     // nom de la base
define('DB_USER', zenv('ZLV_DB_USER', 'ibigs2689720_52tki'));     // utilisateur MySQL
define('DB_PASS', zenv('ZLV_DB_PASS', 'eP2-Q9Rt2D-RF9n'));        // mot de passe MySQL

// --- Application ---
define('APP_NAME', "Zelivry");
// URL de base — DÉTECTÉE AUTOMATIQUEMENT (racine = '', sous-dossier = '/app').
define('BASE_URL', rtrim(str_replace('\\', '/', dirname($_SERVER['SCRIPT_NAME'] ?? '/')), '/'));
define('DEVISE', 'FCFA');
// URL publique complète (e-mails CRON, sans navigateur)
define('APP_URL', 'https://zelivry.com');

// --- Contact (page publique) ---
define('CONTACT_EMAIL',    'contact@zelivry.com');
define('CONTACT_PHONE',    '+225 07 78 88 25 92');
define('CONTACT_WHATSAPP', '2250778882592');   // sans + ni espaces (pour wa.me)

// --- Listes de référence ---
define('STATUTS',   ['En attente','En cours','Livré','Retourné','Retardé','Annulé']);
define('PRIORITES', ['Normale','Urgente','Express']);
define('PAIEMENTS', ['Espèces','Mobile Money','Carte bancaire','Virement','À la livraison']);
define('VEHICULES', ['Moto','Tricycle','Voiture','Camionnette']);
define('CATEGORIES',['Alimentation','Boissons','Électronique','Beauté','Pharmacie','Maison','Autre']);

// Fuseau
date_default_timezone_set('Africa/Abidjan');

// --- Notifications d'échéance de licence ---
define('ADMIN_EMAIL', 'contact@zelivry.com');    // reçoit les alertes d'échéance
define('MAIL_FROM',   'contact@zelivry.com');    // expéditeur (= compte SMTP)

// --- Envoi des e-mails ---
// 'smtp' = authentifié (arrive en inbox) ; repli automatique sur mail() si échec.
define('MAIL_METHOD',      'smtp');
define('MAIL_SMTP_HOST',   'mail.zelivry.com');
define('MAIL_SMTP_PORT',   465);
define('MAIL_SMTP_SECURE', 'ssl');               // 'ssl' (465) ou 'tls' (587)
define('MAIL_SMTP_USER',   'contact@zelivry.com');
// ⚠️ À REMPLIR : mot de passe de la boîte contact@zelivry.com (vide => repli mail(), souvent en spam).
define('MAIL_SMTP_PASS',   zenv('ZLV_SMTP_PASS', 'tT2_w!7fZFsbxzH'));
define('MAIL_SMTP_VERIFY', false);               // LWS mutualisé : false

// Jeton secret du script automatique (cron + migrate.php?token=). À garder secret.
define('CRON_TOKEN',  zenv('ZLV_CRON_TOKEN', 'zlv_66a3749871f17b3ce7c43bb4586542f9'));
define('RAPPEL_JOURS', [15, 7, 1]);

// --- VOTRE Moneroo (encaissement des LICENCES que vous vendez) ---
// Vide = paiement de licence en ligne désactivé (renouvellement manuel).
define('PLATFORM_MONEROO_KEY', zenv('ZLV_MONEROO_KEY', ''));

// --- Tarifs (FCFA) ---
// Rétro-compatibilité (= Starter)
define('LICENCE_PRIX_AN',   49000);
define('LICENCE_PRIX_MOIS',  4900);
// 4 formules — Annuel = 2 mois offerts
define('PRIX_STARTER_MOIS',    4900);  define('PRIX_STARTER_AN',     49000);
define('PRIX_ESSENTIEL_MOIS',  9900);  define('PRIX_ESSENTIEL_AN',   99000);
define('PRIX_PREMIUM_MOIS',   19900);  define('PRIX_PREMIUM_AN',    199000);
define('PRIX_EXPERT_MOIS',    39900);  define('PRIX_EXPERT_AN',     399000);

// --- Inscription libre-service ---
define('TRIAL_DAYS', 15);
define('SIGNUP_OPEN', true);

// --- Assistant IA interne (Claude) ---
// Vide = assistant gratuit local actif. Mettez votre clé pour le mode IA avancé (Premium+).
define('CLAUDE_API_KEY', zenv('ZLV_CLAUDE_KEY', ''));
define('ASSISTANT_MODEL', 'claude-opus-4-8');   // ou 'claude-haiku-4-5' (~5× moins cher)

// --- Notifications Push Web (VAPID) ---
// ⚠️ Régénérez vos propres clés sur https://vapidkeys.com/ avant la production.
define('VAPID_PUBLIC_KEY',  zenv('ZLV_VAPID_PUBLIC',  'BJCCFhdSXhrOtKY4D6hu8ojAV8XYxWWmPIBxzUutR7wV39QbvGx2zBDqp0GWqbyQdlBXGVAHsWTZc85u2bL5Tzk'));
define('VAPID_PRIVATE_KEY', zenv('ZLV_VAPID_PRIVATE', 'BHHSxLbjW8_frhz3UUpU0EF5_bZIHLiPqRReWqSe_SM'));

// Affichage des erreurs : FALSE en production.
define('APP_DEBUG', false);