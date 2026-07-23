# AUDIT GLOBAL — CONSTRUIRO ERP

**Date :** 2026-07-23
**Auditeur :** IBIG Soft — Patrice Kouakou
**Version produit :** 1.0.0 (branche `master`)
**Serveur :** VPS 185.98.139.38 — construiro.com

---

## 1. Architecture technique

| Couche | Technologie | Version |
|---|---|---|
| Framework backend | Laravel | 12.x (PHP 8.2+) |
| Frontend SPA | React | 18.2 |
| Protocole SPA | Inertia.js | 2.x |
| CSS / UI | Tailwind CSS | 3.x + Headless UI 2.x |
| Base de données | MySQL | 8.x |
| File d'attente | Laravel Queue (driver: database) | — |
| Export PDF | DomPDF (barryvdh) | 3.x |
| Export Excel | PhpSpreadsheet | 5.x |
| QR codes | simple-qrcode | 4.x |
| RBAC | Spatie laravel-permission | 6.x |
| Build front | Vite + @vitejs/plugin-react | 7.x |
| Charts | Recharts | 3.x |
| CI/CD | GitHub Actions | — |

**Pattern multi-tenant :** toutes les tables métier portent `company_id` avec index dédié. Le cloisonnement est assuré par scoping systématique dans chaque contrôleur et par des index de performance ajoutés via migration dédiée (`2026_07_13_000001_add_performance_indexes.php`).

---

## 2. Etat général du projet

**Tables en base :** 70+ migrations exécutées (date de démarrage : 08/07/2026).

**Contrôleurs :** 104 fichiers dans `app/Http/Controllers/`.

**Services métier :**
- `LicenseGuard` — vérification max_users / max_projects par plan
- `TotpService` — MFA TOTP RFC 6238 (secrets 160 bits)
- `QrCodeService` — génération QR vérification documents
- `DocumentVerifier` — vérification SHA-256 preuves
- `SaraGateway` — proxy multi-fournisseur LLM (SARA IA)
- `BackupService` — sauvegardes automatisées
- `PayrollEngine` — moteur de paie
- `NotificationService` — notifications internes + email

---

## 3. Modules et fonctionnalités opérationnels

### Vague 1 — Core
| Module | Fonctionnalités |
|---|---|
| Authentification | Inscription, connexion, vérification email, reset password, 2FA TOTP (RFC 6238) |
| Gestion sociétés | Multi-tenant company_id, onboarding wizard 4 étapes |
| Gestion utilisateurs | CRUD, rôles Spatie, limite plan (LicenseGuard) |
| Dashboard | KPI temps réel, graphiques Recharts, alertes abonnement |

### Vague 2 — Modules métier BTP
| Module | Fonctionnalités |
|---|---|
| Projets | CRUD complet, chantiers rattachés, PDF liste/fiche, export Excel |
| Devis | CRUD, lignes, statuts, PDF, QR code, signature électronique, email |
| Facturation | CRUD, lignes, enregistrement paiement, mark-paid, envoi email, Mobile Money |
| Clients | CRUD, fiche PDF, export |
| Fournisseurs | CRUD, export |
| Matériaux | CRUD, catalogue |
| Magasins | CRUD, gestion multi-entrepôts |
| Stocks | Niveaux, mouvements entrée/sortie, seuil alerte |
| Contrats | CRUD, statuts, PDF, signature électronique |
| Achats | Bons de commande CRUD, confirmation, réception, QR |
| Équipements | CRUD, fiches maintenance |
| Sous-traitants | CRUD |

### Vague 3 — RH, Planning, Finance
| Module | Fonctionnalités |
|---|---|
| RH / Employés | CRUD, fiche PDF, export Excel |
| Pointage | Enregistrement présences, historique |
| Paie | Génération bulletins, moteur PayrollEngine, PDF, statuts |
| Planning / Gantt | Tâches, dates, Gantt React |
| Trésorerie | Comptes, transactions, solde |
| QHSE | Incidents HSE CRUD, statuts |
| Qualité | Contrôles qualité CRUD |

### Vague 4 — Modules avancés
| Module | Fonctionnalités |
|---|---|
| Bureau d'études (module:design_office) | BPU, Métré (Takeoff), DQE (BOQ), Registre études |
| CRM (module:crm) | Opportunités pipeline, Appels d'offres / Tenders |
| Parc roulant | Engins, Véhicules (vues filtrées), Carburant, Maintenance |
| Comptabilité analytique | Imputation analytique par projet |
| Comptabilité générale | Journal SYSCOHADA, plan comptable |
| Encaissements | Paiements entrants CRUD |
| Décaissements | Paiements sortants CRUD |
| Laboratoire (module:laboratory) | Essais labo CRUD |
| GED | Documents CRUD, stockage privé, téléchargement sécurisé |
| Signature électronique (module:e_signature) | Flux signature, statuts, vérification |

### Vague 5 — SaaS, IA, Platform
| Module | Fonctionnalités |
|---|---|
| Budget | Budgets CRUD, lignes, suivi écart |
| BI & Rapports (module:bi) | Tableaux de bord BI, rapports PDF |
| Assistant IA SARA (module:ai) | Chat IA multi-fournisseur (Groq/OpenAI/Anthropic) |
| Abonnement / Billing | Plans trial/active/grace/expired, vouchers prépayés |
| Paiement | CinetPay (webhook), Mobile Money (Orange/MTN/Wave), virement + preuve, voucher |
| SuperAdmin | Tableau de bord MRR, gestion clients, licences, paiements, SARA config, backups |
| Académie | Ressources formation, progression, CRUD SuperAdmin |
| Landing page | Page publique dynamique (plans, FAQ, témoignages) gérée depuis SuperAdmin |
| Notifications | Cloche interne, préférences canal, envoi email |
| Import universel | Projets, devis, factures, stocks, équipements (CSV/Excel) |
| Export universel | Excel + PDF pour 15 modules |
| Support tickets | CRUD tickets, messages, statuts, rouverture |
| Onboarding | Wizard post-inscription (société, logo, paramètres) |
| Audit log | 17 champs, journalisation systématique des actions |
| Changelog | Publication versions (SuperAdmin CRUD + affichage public) |
| Vérification documents | QR public `/verify/{token}` + `/verify/{type}/{number}` |
| Intégrations | Webhooks tiers, configuration par type/provider |
| Sauvegardes | Déclenchement manuel/automatique, téléchargement, restauration |
| Recherche globale | `/search` cross-modules |
| Pages légales | CGU/CGV/politique vie privée, éditables SuperAdmin |
| Préférences utilisateur | Langue, thème, densité, format date/devise |

---

## 4. Fonctionnalités partielles ou absentes

| Fonctionnalité | État | Note |
|---|---|---|
| PWA / Service Worker | Absent | Pas de manifest.json ni SW enregistré |
| Notifications push navigateur | Absent | Uniquement notifications internes + email |
| Application mobile native | Absent | Hors périmètre V1 |
| Comptabilité — Balance/Grand livre | Partiel | Journal SYSCOHADA implémenté, états récapitulatifs à compléter |
| Facturation récurrente automatique | Absent | Génération manuelle uniquement |
| Module e-commerce / boutique | Absent | Hors périmètre |
| SSO OAuth (Google, Azure) | Absent | Authentification email/password + 2FA uniquement |
| API REST publique documentée | Absent | Seuls les webhooks entrants sont exposés |

---

## 5. Risques connus

| Risque | Niveau | Mitigation |
|---|---|---|
| Point de défaillance unique — VPS OVH | Moyen | Sauvegardes automatisées + restauration testée |
| Absence de tests automatisés | Moyen | PHPUnit configuré mais couverture quasi nulle — priorité V1.1 |
| SMTP unique (pas de fallback) | Faible | Configuration SMTP SuperAdmin, file d'attente database |
| QR Code via service externe (qrserver.com) | Faible | Dépendance réseau pour TOTP QR — envisager génération locale |
| CSP `style-src unsafe-inline` en prod | Faible | Nécessaire pour Tailwind CSS inline — acceptable en V1 |
| Montée en charge multi-tenants | Moyen | Index company_id en place ; pas de cache distribué (Redis) |
