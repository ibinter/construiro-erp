# AUDIT SECURITE — CONSTRUIRO ERP

**Date :** 2026-07-23
**Référentiel :** OWASP Top 10, RGPD (données personnelles africaines), Script Universel §18
**Fichier source principal :** `app/Http/Middleware/SecurityHeaders.php`

---

## 1. En-têtes HTTP de sécurité

Implémentés dans `SecurityHeaders.php` (middleware global appliqué sur toutes les routes).

| En-tête | Valeur production | État |
|---|---|---|
| `Content-Security-Policy` | `default-src 'self'; script-src 'self' 'nonce-{nonce}'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https:; font-src 'self' data:; connect-src 'self' https://api.groq.com wss:; media-src 'none'; object-src 'none'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'; upgrade-insecure-requests` | **Conforme** |
| `Strict-Transport-Security` | `max-age=31536000; includeSubDomains; preload` (prod uniquement) | **Conforme** |
| `X-Frame-Options` | `DENY` | **Conforme** |
| `X-Content-Type-Options` | `nosniff` | **Conforme** |
| `X-XSS-Protection` | `1; mode=block` | **Conforme** |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | **Conforme** |
| `Permissions-Policy` | `camera=(), microphone=(), geolocation=(self), payment=()` | **Conforme** |
| `X-Powered-By` | Supprimé | **Conforme** |
| `Server` | Supprimé | **Conforme** |

**Nonce CSP :** généré par `base64_encode(random_bytes(16))` à chaque requête. Injecté dans `app()->instance('csp-nonce', $nonce)` avant le rendu Blade.

---

## 2. Authentification & MFA

| Point de contrôle | Implémentation | État |
|---|---|---|
| Hash passwords | Bcrypt (Laravel default) | **Conforme** |
| Vérification email obligatoire | Middleware `verified` sur groupe auth | **Conforme** |
| 2FA TOTP RFC 6238 | `TotpService.php` — secret 160 bits Base32, HMAC-SHA1, tolérance ±1 intervalle | **Conforme** |
| Middleware two-factor | `RequiresTwoFactorAuthentication.php` | **Conforme** |
| Secrets TOTP 160 bits | Longueur 32 caractères Base32 = 160 bits (RFC 4226 recommande ≥ 128 bits) | **Conforme** |
| Vérification TOTP time-safe | `hash_equals()` — protection timing attacks | **Conforme** |
| QR Code TOTP | URL `otpauth://` via `TotpService::getQrCodeUrl()` | **Conforme** |
| Session Laravel sécurisée | CSRF token systématique (VerifyCsrfToken, exemptions explicites) | **Conforme** |

---

## 3. Contrôle d'accès (RBAC)

| Point de contrôle | Implémentation | État |
|---|---|---|
| RBAC Spatie laravel-permission | Rôles + permissions par ressource (can:module.action) | **Conforme** |
| Middleware `can:` sur chaque route | Vérification granulaire (view/create/update/delete/export) | **Conforme** |
| SuperAdmin isolé | `SuperAdminOnly.php` middleware + groupe dédié | **Conforme** |
| Cloisonnement multi-tenant | `company_id` sur toutes les requêtes — scoping contrôleur | **Conforme** |
| CheckModuleAccess | `CheckModuleAccess.php` — vérifie activation plan (module:xxx) | **Conforme** |

---

## 4. Isolation multi-tenant (company_id scoping)

- Chaque modèle métier porte `company_id` (foreign key + index).
- Chaque contrôleur filtre systématiquement `->where('company_id', auth()->user()->company_id)`.
- Migration dédiée `2026_07_13_000001_add_performance_indexes.php` : index `company_id` sur 38 tables + index composites `(company_id, status)` sur tables critiques.
- **Résultat :** aucune fuite inter-tenant possible par les routes déclarées.

---

## 5. Journal d'audit (17 champs)

Table `audit_logs` — migration `2026_07_12_000001_create_audit_logs_table.php`.

| # | Champ | Description |
|---|---|---|
| 1 | `id` | Identifiant unique |
| 2 | `user_id` | Référence utilisateur (nullable si système) |
| 3 | `company_id` | Société |
| 4 | `user_name` | Nom au moment de l'action |
| 5 | `user_email` | Email au moment de l'action |
| 6 | `action` | Type : created, updated, deleted, login, export… |
| 7 | `module` | Module concerné |
| 8 | `model_type` | Classe Eloquent (ex: App\Models\Project) |
| 9 | `model_id` | Identifiant de l'objet modifié |
| 10 | `description` | Description lisible |
| 11 | `old_values` | JSON avant modification |
| 12 | `new_values` | JSON après modification |
| 13 | `ip_address` | IP client (IPv4/IPv6) |
| 14 | `user_agent` | Navigateur/Agent |
| 15 | `url` | Route appelée |
| 16 | `method` | Verbe HTTP |
| 17 | `is_support_session` | Flag prise en main SuperAdmin |
| + | `support_user_email` | Email du SuperAdmin en session |

Index : `(company_id, created_at)`, `(model_type, model_id)`, `(user_id, action)`.

---

## 6. Anti-fuite licence (§18.5)

| Mécanisme | Implémentation | État |
|---|---|---|
| Vérification statut abonnement | `CheckSubscription.php` — gère trial/active/grace/expired | **Conforme** |
| Limite utilisateurs | `LicenseGuard::checkUserLimit()` — HTTP 402 si dépassement | **Conforme** |
| Limite projets | `LicenseGuard::checkProjectLimit()` — HTTP 402 si dépassement | **Conforme** |
| Activation par webhook seulement | `BillingController::activate()` — pas d'auto-activation client | **Conforme** |
| Plans convention 9999=illimité | `LicenseGuard::getLimit()` — null retourné si ≥ 9999 | **Conforme** |

---

## 7. Sécurité paiements & webhooks

| Point de contrôle | Implémentation | État |
|---|---|---|
| Webhook CinetPay | `WebhookPaymentController::cinetpay()` — vérification signature opérateur | **Conforme** |
| Webhook Mobile Money | `MobileMoneyController::webhook()` — CSRF exempt, traitement sécurisé | **Conforme** |
| Preuve de virement | Hash SHA-256 déduplication dans `DocumentVerifier.php` | **Conforme** |
| Stockage preuves/pièces jointes | `storage/app/private/` — accès via route authentifiée uniquement | **Conforme** |
| Fichiers GED | Route `/documents/{id}/download` protégée par `can:documents.view` | **Conforme** |

---

## 8. Points d'attention résiduels

| Risque | Détail | Recommandation |
|---|---|---|
| `style-src 'unsafe-inline'` en CSP | Nécessaire pour Tailwind CSS — acceptable V1 | Migrer vers hashing CSS en V1.1 |
| QR TOTP via qrserver.com | Dépendance externe réseau pour affichage | Générer localement avec simple-qrcode en V1.1 |
| Rate limiting login | Non documenté dans le code audité | Vérifier `throttle:6,1` sur routes auth |
| Pas de SIEM centralisé | Logs audit en base uniquement | Exporter vers service tiers en V1.2 |
