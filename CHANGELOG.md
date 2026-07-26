# CHANGELOG — CONSTRUIRO ERP
Format : [Semver](https://semver.org) | Projet : IBIG Soft

---

## [1.5.0] — 2026-07-26

### Ajouté
- API REST v1 (Sanctum) : projets, contacts, factures, stocks — multi-tenant scopé
- Gestion self-service des tokens API (`/api/v1/tokens`)
- Webhooks sortants avec signature HMAC SHA-256 (SuperAdmin > Webhooks)
- Base de connaissances SARA — FULLTEXT search + injection RAG (§14.4)
- Analytics marketing — tracking visiteurs landing, dashboard SuperAdmin
- Santé système SuperAdmin — DB, SMTP, queues, disque, cache (`/superadmin/health`)
- CRM Démos — planification + gestion des démonstrations produit
- 100 FAQ internes navigables (LandingFaqSeeder)
- Propagation automatique des évolutions — Events + Listeners + module_features
- Notification email + in-app à chaque publication de nouvelle version
- Numéros Mobile Money IBIG SARL préconfigurés (PaymentMethodSeeder)
- Version sémantique dynamique (`APP_VERSION` + `config/construiro.php`)
- Changelog BDD → page publique synchronisée (`/changelog`)
- Accessibilité ARIA sur composants partagés
- Performance : cache headers, index DB supplémentaires, corrections N+1
- Module Features — propagation automatique des améliorations par module
- Demo Sessions — sessions de démo traçables (migration 2026-07-26)
- Contrôleur ModuleFeatureController (SuperAdmin)

### Modifié
- Footer landing — réseaux sociaux + contacts complets, sans listing logiciels
- SARA — passage multi-fournisseur (Groq / Anthropic / OpenAI configurables)
- SuperAdmin Dashboard — MRR historique + KPI abonnements enrichis

### Corrections
- Isolation multi-tenant renforcée sur les endpoints API
- Correction N+1 sur listing projets, factures et stocks

---

## [1.4.0] — 2026-07-23

### Ajouté
- Vouchers prépayés — génération par lot + export CSV (SuperAdmin)
- Configuration méthodes de paiement — 11 familles activables/désactivables
- Ordres de paiement — validation preuves (virement/Mobile Money)
- Sauvegardes SuperAdmin — déclenchement + téléchargement + suppression
- Académie / Formation — CRUD contenus + suivi progression utilisateurs
- Import universel enrichi — projets, devis, factures, stocks, équipements
- Journal d'utilisation IA + quotas SARA (SuperAdmin)
- Logs d'imports (`import_logs` table)
- Données de démo isolées (`is_demo` flag sur companies)

### Modifié
- Paiement Gateway — support CinetPay + virement manuel + Mobile Money unifié
- Interface SuperAdmin — navigation enrichie (13 nouveaux menus)

---

## [1.3.0] — 2026-07-21

### Ajouté
- 2FA TOTP — authentification à deux facteurs obligatoire configurable
- Suspension / réactivation clients (SuperAdmin)
- Offres personnalisées (SuperAdmin > Offers)
- Templates emails personnalisables via interface (SuperAdmin)
- Configuration SMTP SuperAdmin (sans accès .env)
- Gestion Changelog depuis l'interface SuperAdmin
- Mobile Money — intégration Orange, MTN, Wave, Moov
- Améliorations tickets support (statuts enrichis, messages internes)
- Champs suspension sur companies

### Corrections
- Correction référence externe Mobile Money (transactions)
- Amélioration garde 2FA (middleware RequiresTwoFactorAuthentication)

---

## [1.2.0] — 2026-07-15

### Ajouté
- Catégories FAQ landing page
- Intégrations tierces configurables (`integrations` table)
- QR token sur devis et factures (vérification publique)
- Préférences utilisateur (langue, notifications, thème)
- Module Changelog interne (vue utilisateur)

### Modifié
- Refactorisation index de performance DB (migration dédiée)

---

## [1.1.0] — 2026-07-12

### Ajouté
- Audit logs — traçabilité toutes les actions métier
- Pages légales administrables (CGU, CGV, confidentialité)
- Logs emails (suivi envois SMTP)
- Préférences notifications par canal (email / in-app)
- Plans d'abonnement (Starter, Pro, Business)
- Demandes de démo (landing + pipeline SuperAdmin)
- Tickets de support (création, réponse, fermeture)
- Sessions de support superviseur (prise en main client)
- Landing page — FAQs, témoignages, plans tarifaires (tables dédiées)
- Onboarding post-inscription (société + logo + paramètres)
- Notifications in-app (cloche + préférences)

### Modifié
- Middleware CheckSubscription — états trial/active/grace/expired
- Routes auth — ajout vérification email obligatoire

---

## [1.0.0] — 2026-07-08

### Ajouté — Version initiale (5 vagues de développement parallèle)

#### Socle technique
- Laravel 12 + React 18 + Inertia.js + Vite
- MySQL 8.0 + Spatie Laravel Permission v6
- Multi-tenant : company_id + GlobalScope sur tous les modèles métier
- RBAC : 42 modules × 5 actions = 200+ permissions granulaires
- 29 portails rôles (16 internes + 13 externes)

#### Modules métier (42 modules)
- **Pilotage** : Dashboard, Projets, Chantiers, Planning Gantt
- **Bureau d'études** : BPU, Métré (Takeoff), DQE (BoQ), Études, Devis
- **Commercial** : CRM Opportunités, Appels d'offres, Clients, Fournisseurs, Sous-traitants, Contrats
- **Achats & Stocks** : Bons de commande, Matériaux, Magasins, Stocks
- **Parc matériel** : Équipements, Engins, Véhicules, Carburant, Maintenance
- **RH** : Employés, Pointage, Paie (OHADA)
- **Finance** : Budget, Comptabilité analytique, Comptabilité générale SYSCOHADA, Trésorerie, Facturation, Encaissements, Décaissements
- **QHSE / Qualité** : Incidents HSE, Contrôle qualité, Laboratoire
- **Transverse** : GED, Signature électronique, BI & Rapports, Assistant IA, Administration
- **Outils** : Académie, Import de données

#### Infrastructure
- Exports PDF (9 documents individuels + 14 listes)
- Exports Excel XLSX (14 modules)
- Import CSV universel
- Vérification publique QR code (documents + bulletins de paie)
- PWA (service worker + manifest)
- Sitemap XML
- Pages légales publiques
- Centre d'aide public
- Guide utilisateur PDF FR/EN
- Assistant SARA IA (Groq)
- Changelog public

---

## Roadmap v1.6.0 (prévue)

- [ ] Compléter traductions EN sur pages modules secondaires (§21)
- [ ] Audit WCAG 2.1 — accessibilité pages complexes (§32)
- [ ] Postman Collection API v1 publiée
- [ ] Endpoints API v1 supplémentaires : mouvements stocks, devis, employés
- [ ] Intégration passerelle paiement additionnelle (Stripe / PayDunya)
- [ ] Application mobile React Native (MVP)
