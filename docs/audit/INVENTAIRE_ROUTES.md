# INVENTAIRE DES ROUTES — CONSTRUIRO ERP

**Date :** 2026-07-23
**Fichier source :** `routes/web.php` + `routes/auth.php`
**Total routes :** ~200 routes nommées

---

## 1. Routes publiques (sans authentification)

| Méthode | URI | Nom | Description |
|---|---|---|---|
| GET | `/` | — | Landing page (plans, FAQ, témoignages) |
| GET | `/changelog` | `changelog` | Changelog public |
| GET | `/sitemap.xml` | `sitemap` | Sitemap SEO |
| GET | `/legal/{slug}` | `legal.show` | Pages légales (CGU, CGV, etc.) |
| POST | `/demo-request` | `demo.request` | Formulaire demande de démo |
| GET | `/aide` | `aide.index` | Centre d'aide public |
| GET | `/aide/{section}` | `aide.section` | Section aide (guide, docs, nouveautes, faq) |
| GET | `/guide/{locale}` | `guide.download` | Téléchargement guide utilisateur PDF (fr/en) |
| GET | `/verify/{token}` | `verify.document` | Vérification document par token QR |
| GET | `/verify/{type}/{number}` | `verify.typed` | Vérification bon commande / bulletin paie |
| GET/POST | `/locale/{locale}` | `locale.update` | Changement de langue |
| GET | `/blog` | — | Redirect → ibigsoft.com |
| GET | `/statut` | — | Redirect → ibigsoft.com |

### Webhooks publics (CSRF exempt)

| Méthode | URI | Nom | Description |
|---|---|---|---|
| POST | `/webhooks/mobile-money/{operator}` | `mobile-money.webhook` | Webhook Mobile Money (Orange/MTN/Wave) |
| POST | `/webhooks/cinetpay` | `webhooks.cinetpay` | Webhook CinetPay |

---

## 2. Routes d'authentification

Source : `routes/auth.php` (Laravel Breeze)

| Méthode | URI | Nom | Description |
|---|---|---|---|
| GET | `/register` | `register` | Formulaire inscription |
| POST | `/register` | — | Traitement inscription |
| GET | `/login` | `login` | Formulaire connexion |
| POST | `/login` | — | Traitement connexion |
| POST | `/logout` | `logout` | Déconnexion |
| GET | `/forgot-password` | `password.request` | Demande reset mot de passe |
| POST | `/forgot-password` | `password.email` | Envoi email reset |
| GET | `/reset-password/{token}` | `password.reset` | Formulaire reset |
| POST | `/reset-password` | `password.store` | Traitement reset |
| GET | `/verify-email` | `verification.notice` | Invite vérification email |
| GET | `/verify-email/{id}/{hash}` | `verification.verify` | Lien vérification |
| POST | `/email/verification-notification` | `verification.send` | Renvoyer email vérification |
| GET | `/confirm-password` | `password.confirm` | Confirmation mot de passe |
| POST | `/confirm-password` | — | Traitement confirmation |
| GET | `/two-factor` | `two-factor.show` | Page challenge 2FA |
| POST | `/two-factor` | `two-factor.verify` | Vérification code TOTP |
| GET | `/two-factor/setup` | `two-factor.setup` | Configuration 2FA |
| POST | `/two-factor/enable` | `two-factor.enable` | Activer 2FA |
| DELETE | `/two-factor` | `two-factor.disable` | Désactiver 2FA |

---

## 3. Routes authentifiées — modules métier

Middleware stack : `auth, verified, subscription, two-factor`

### Core

| Méthode | URI | Permission requise | Description |
|---|---|---|---|
| GET | `/dashboard` | — | Tableau de bord principal |
| GET | `/profile` | — | Profil utilisateur |
| PATCH | `/profile` | — | Mise à jour profil |
| PUT | `/preferences` | — | Préférences utilisateur |
| GET | `/search` | — | Recherche globale |
| GET | `/notifications` | — | Liste notifications |
| GET | `/academy` | — | Académie formation |
| GET | `/changelog` | — | Changelog (version auth) |

### Projets & Chantiers

| Méthode | URI | Permission | Description |
|---|---|---|---|
| GET | `/projects` | `projects.view` | Liste projets |
| GET/POST | `/projects/create` | `projects.create` | Créer projet |
| GET | `/projects/{id}` | `projects.view` | Fiche projet |
| GET | `/projects/{id}/pdf` | `projects.view` | PDF fiche projet |
| GET | `/sites` | `sites.view` | Vue transversale chantiers |
| GET | `/sites/{id}` | `sites.view` | Fiche chantier |

### Commercial

| Méthode | URI | Permission | Description |
|---|---|---|---|
| GET | `/clients` | `clients.view` | Liste clients |
| GET | `/quotes` | `quotes.view` | Liste devis |
| GET | `/contracts` | `contracts.view` | Liste contrats |
| GET | `/invoices` | `invoicing.view` | Liste factures |
| POST | `/invoices/{id}/send-email` | `invoicing.update` | Envoyer facture par email |
| POST | `/invoices/{id}/mobile-money` | `invoicing.update` | Paiement Mobile Money |

### Achats & Logistique

| Méthode | URI | Permission | Description |
|---|---|---|---|
| GET | `/purchases` | `purchases.view` | Bons de commande |
| GET | `/suppliers` | `suppliers.view` | Fournisseurs |
| GET | `/materials` | `materials.view` | Catalogue matériaux |
| GET | `/warehouses` | `warehouses.view` | Magasins |
| GET | `/stocks` | `stocks.view` | Niveaux de stock |
| GET | `/stocks/movements` | `stocks.view` | Mouvements de stock |
| GET | `/subcontractors` | `subcontractors.view` | Sous-traitants |

### Equipements & Parc roulant

| Méthode | URI | Permission | Description |
|---|---|---|---|
| GET | `/equipment` | `equipment.view` | Parc matériel |
| GET | `/machinery` | `machinery.view` | Engins (filtre) |
| GET | `/vehicles` | `vehicles.view` | Véhicules (filtre) |
| GET | `/fuel` | `fuel.view` | Journal carburant |
| GET | `/maintenance` | `maintenance.view` | Maintenance |

### RH & Paie

| Méthode | URI | Permission | Description |
|---|---|---|---|
| GET | `/hr` | `hr.view` | Employés |
| GET | `/attendance` | `attendance.view` | Pointage |
| GET | `/payroll` | `payroll.view` | Paie / Bulletins |
| GET | `/planning` | `planning.view` | Planning / Gantt |

### Finance & Comptabilité

| Méthode | URI | Permission | Description |
|---|---|---|---|
| GET | `/treasury` | `treasury.view` | Trésorerie |
| GET | `/incoming-payments` | `incoming_payments.view` | Encaissements |
| GET | `/outgoing-payments` | `outgoing_payments.view` | Décaissements |
| GET | `/budget` | `budget.view` | Budgets |
| GET | `/cost-accounting` | `cost_accounting.view` | Comptabilité analytique |
| GET | `/accounting` | `accounting.view` | Journal général SYSCOHADA |

### QHSE & Qualité

| Méthode | URI | Permission | Description |
|---|---|---|---|
| GET | `/hse` | `qhse.view` | Incidents HSE |
| GET | `/quality` | `quality.view` | Contrôles qualité |

### Modules optionnels (plan requis)

| Méthode | URI | Module plan | Description |
|---|---|---|---|
| GET | `/unit-prices` | `design_office` | BPU |
| GET | `/takeoff` | `design_office` | Métré |
| GET | `/boq` | `design_office` | BOQ/DQE |
| GET | `/design-office` | `design_office` | Registre études |
| GET | `/crm` | `crm` | Opportunités |
| GET | `/tenders` | `crm` | Appels d'offres |
| GET | `/laboratory` | `laboratory` | Essais laboratoire |
| GET | `/e-signature` | `e_signature` | Signature électronique |
| GET | `/bi` | `bi` | BI & Analytics |
| GET | `/reports` | `bi` | Rapports |
| GET | `/ai` | `ai` | Assistant IA SARA |

### Exports & Documents

| Méthode | URI | Description |
|---|---|---|
| GET | `/export/projects` | Export Excel projets |
| GET | `/export/invoices` | Export Excel factures |
| GET | `/pdf/projects` | PDF liste projets |
| GET | `/pdf/invoices` | PDF liste factures |
| GET | `/quotes/{id}/pdf` | PDF devis |
| GET | `/invoices/{id}/pdf` | PDF facture |
| GET | `/purchases/{id}/pdf` | PDF bon commande |
| GET | `/payroll/{id}/pdf` | PDF bulletin paie |

### Billing & Abonnement

| Méthode | URI | Description |
|---|---|---|
| GET | `/billing` | Page abonnement |
| POST | `/billing/activate` | Activer abonnement |
| GET | `/billing/payment` | Choix méthode paiement |
| POST | `/billing/payment/initiate` | Initier paiement |
| GET | `/billing/payment/voucher` | Page voucher |
| POST | `/billing/payment/voucher/redeem` | Utiliser voucher |

### Administration société

| Méthode | URI | Permission | Description |
|---|---|---|---|
| GET | `/admin/users` | `administration.view` | Gestion utilisateurs |
| GET | `/admin/company` | `administration.view` | Paramètres société |
| GET | `/admin/audit-logs` | `administration.view` | Journal d'audit |
| GET | `/settings` | `administration.view` | Paramètres globaux |
| GET | `/backup` | `administration.view` | Sauvegardes |
| GET | `/integrations` | `administration.view` | Intégrations |

---

## 4. Routes SuperAdmin (middleware: superadmin)

Accès réservé au compte `ibig_superadmin`.

| URI | Description |
|---|---|
| `/superadmin` | Dashboard MRR |
| `/superadmin/clients` | Gestion clients / sociétés |
| `/superadmin/clients/{id}` | Fiche client + octroi licence |
| `/superadmin/offers` | Offres personnalisées |
| `/superadmin/prospects` | Demandes de démo |
| `/superadmin/support-sessions` | Sessions de support actives |
| `/superadmin/email-templates` | Templates emails transactionnels |
| `/superadmin/landing` | Gestion landing page (plans, FAQ, témoignages) |
| `/superadmin/smtp` | Configuration SMTP plateforme |
| `/superadmin/mrr-history` | Historique MRR |
| `/superadmin/changelogs` | CRUD changelog |
| `/superadmin/payment-config` | Méthodes de paiement (activer/configurer) |
| `/superadmin/payment-orders` | Validation preuves de virement |
| `/superadmin/vouchers` | Génération/export vouchers prépayés |
| `/superadmin/ai-setting` | Config IA multi-fournisseur (SARA) |
| `/superadmin/academy` | CRUD contenu formation |
| `/superadmin/backups` | Sauvegardes globales |
