# AUDIT SÉCURITÉ — CONSTRUIRO ERP
Version : 1.5.0 | Date : 2026-07-26

---

## Résumé exécutif

| Indicateur | Valeur |
|-----------|--------|
| Vulnérabilités critiques | 0 |
| Vulnérabilités connues | 0 |
| Couches de sécurité actives | 8 |
| Tests de sécurité automatisés | 3 |
| Score global sécurité | Satisfaisant (à valider OWASP en staging) |

---

## 1. Middleware de sécurité

### 1.1 Middleware HTTP globaux

| Middleware | Protection | Statut |
|-----------|-----------|--------|
| `SecurityHeaders` | HSTS, CSP, X-Frame-Options, X-Content-Type-Options, Referrer-Policy | ✅ Actif |
| `VerifyCsrfToken` | Protection CSRF sur toutes les routes POST/PUT/PATCH/DELETE | ✅ Actif |
| `TrackPageView` | Tracking analytics (non-sécurité, pas d'impact) | ✅ Actif |

### 1.2 Middleware d'accès

| Middleware | Protection | Routes concernées |
|-----------|-----------|------------------|
| `auth` | Authentification requise | Espace interne |
| `verified` | Email vérifié obligatoire | Espace interne |
| `subscription` (`CheckSubscription`) | Abonnement actif requis | Espace interne |
| `two-factor` (`RequiresTwoFactorAuthentication`) | 2FA activé obligatoire (si configuré) | Espace interne |
| `superadmin` (`SuperAdminOnly`) | Rôle `ibig_superadmin` requis | Console SuperAdmin |
| `can:*` (Spatie Gates) | Permission RBAC granulaire | Tous les modules |
| `module:*` (`CheckModuleAccess`) | Accès module abonné requis | Modules optionnels |

### 1.3 Middleware webhook

| Middleware | Protection |
|-----------|-----------|
| Exemption CSRF webhooks entrants | Routes `/webhooks/*` — signature HMAC vérifiée côté code |
| HMAC SHA-256 webhooks sortants | Signature calculée + header `X-Webhook-Signature` |

---

## 2. Authentification & gestion des sessions

| Mécanisme | Implémentation | Statut |
|-----------|---------------|--------|
| Login email/mot de passe | Laravel Breeze + Bcrypt | ✅ |
| 2FA TOTP | `two_factor_secret` + `two_factor_confirmed_at` (migration 2026-07-21) | ✅ |
| Vérification email obligatoire | `MustVerifyEmail` + middleware `verified` | ✅ |
| Réinitialisation mot de passe | Token haché + expiration 60 min | ✅ |
| Session expiration | Driver Redis + rotation CSRF | ✅ |
| Tokens API Sanctum | `personal_access_tokens` + `auth:sanctum` | ✅ |
| Révocation tokens | Endpoint DELETE `/api/v1/tokens/{id}` | ✅ |

---

## 3. Isolation multi-tenant

| Mécanisme | Description | Statut |
|-----------|------------|--------|
| `company_id` obligatoire | Présent sur toutes les tables métier | ✅ |
| `GlobalScope` company | Injecté automatiquement sur tous les modèles | ✅ |
| Scoping API Sanctum | Token lié à l'entreprise → isolation totale | ✅ |
| Test d'isolation | `MultiTenantIsolationTest.php` (Feature test) | ✅ |

### Tables avec isolation company_id (extrait)
projects, sites, clients, quotes, invoices, contracts, suppliers, subcontractors,
purchase_orders, materials, warehouses, stock_movements, equipment, employees,
attendances, payslips, tasks, treasury_transactions, hse_incidents, quality_controls,
lab_tests, documents, opportunities, tenders, budgets, cost_entries, journal_entries,
incoming_payments, outgoing_payments, ai_conversations, ai_usage_logs, import_logs,
backup_logs, integrations, signature_requests, fuel_logs, maintenance_records…

---

## 4. Contrôle d'accès (RBAC)

| Élément | Détail |
|---------|--------|
| Package | Spatie Laravel Permission v6 |
| Modèle | Rôles + Permissions nommées (ex: `projects.create`) |
| Granularité | 42 modules × 5 actions par défaut = 200+ permissions |
| Portails | 29 portails rôles (16 internes + 13 externes) |
| SuperAdmin | Rôle `ibig_superadmin` — accès console IBIG uniquement |
| Seeder | `RolePermissionSeeder.php` — source de vérité |

---

## 5. Protection des données financières

| Mesure | Détail |
|--------|--------|
| API factures en lecture seule | Endpoints `/api/v1/invoices` = `only(['index', 'show'])` |
| API stocks en lecture seule | Endpoints `/api/v1/stock-items` = `only(['index', 'show'])` |
| Preuves de paiement | Upload protégé + téléchargement via route authentifiée SuperAdmin |
| Données Mobile Money | Stockées hashées / masquées côté affichage |

---

## 6. En-têtes HTTP de sécurité

| En-tête | Valeur configurée |
|---------|------------------|
| `Strict-Transport-Security` | `max-age=31536000; includeSubDomains` |
| `Content-Security-Policy` | Politique restrictive (scripts inline contrôlés) |
| `X-Frame-Options` | `SAMEORIGIN` (anti-clickjacking) |
| `X-Content-Type-Options` | `nosniff` |
| `Referrer-Policy` | `strict-origin-when-cross-origin` |

---

## 7. Sécurité API

| Mesure | Détail |
|--------|--------|
| Authentification | Bearer token Sanctum (pas de cookie) |
| Rate limiting SARA | `throttle:30,1` (30 req/min) |
| Isolation tenant | Scope automatique company du token |
| Signature webhooks sortants | HMAC SHA-256 — clé régénérable depuis SuperAdmin |
| CORS | Configuré via `config/cors.php` (domaines autorisés) |

---

## 8. Audit et traçabilité

| Élément | Détail | Migration |
|---------|--------|-----------|
| `audit_logs` table | Toutes les actions CRUD tracées | 2026-07-12 |
| Interface consultation | SuperAdmin + Admin entreprise (`/admin/audit-logs`) | ✅ |
| `email_logs` table | Historique envois emails | 2026-07-12 |
| `ai_usage_logs` table | Journalisation usage SARA par utilisateur | 2026-07-23 |
| `import_logs` table | Traçabilité imports CSV/XLSX | 2026-07-23 |
| `analytics_events` table | Tracking visiteurs landing (non PII) | 2026-07-26 |

---

## 9. Tests de sécurité automatisés

| Fichier | Périmètre |
|---------|-----------|
| `tests/Feature/LicenseGuardTest.php` | Vérification garde CheckSubscription |
| `tests/Feature/MultiTenantIsolationTest.php` | Isolation multi-tenant (cross-tenant = 403) |
| `tests/Feature/DocumentVerifierTest.php` | Vérification intégrité documents (QR token) |

---

## 10. Vérification publique des documents (QR anti-falsification)

| Document | URI de vérification | Champ vérifié |
|---------|---------------------|--------------|
| Documents GED | `/verify/{token}` | `qr_token` (UUID unique) |
| Devis | `/verify/{token}` | `qr_token` |
| Factures | `/verify/{token}` | `qr_token` |
| Bons de commande | `/verify/po/{code}` | `code` |
| Bulletins de paie | `/verify/payslip/{id}` | `id` |

---

## 11. Recommandations

| Priorité | Recommandation | Fréquence |
|----------|---------------|-----------|
| P1 | `npm audit` + `composer audit` — scanner les dépendances | Avant chaque release |
| P2 | Scanner OWASP ZAP après chaque version majeure | Après v1.x.0 |
| P3 | Renouvellement SSL Let's Encrypt automatique (certbot) | Auto (à vérifier) |
| P4 | Rotation des clés API Sanctum — politique annuelle | Annuelle |
| P5 | Restreindre accès SSH aux IPs IBIG uniquement | Infrastructure |
| P6 | Activer le pare-feu VPS (ufw) — ports 22/80/443 uniquement | Infrastructure |
| P7 | Configurer fail2ban sur SSH et Nginx | Infrastructure |
| P8 | Sauvegardes hors-site chiffrées (rclone → S3/Backblaze) | Quotidien |

---

## 12. Vulnérabilités connues

**Aucune vulnérabilité connue à la date de l'audit (2026-07-26).**

---

## 13. Historique des audits

| Date | Version | Résultat | Auditeur |
|------|---------|----------|---------|
| 2026-07-26 | 1.5.0 | RAS — 0 vulnérabilité critique | IBIG Soft / Interne |
