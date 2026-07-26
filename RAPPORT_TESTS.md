# RAPPORT DE TESTS — CONSTRUIRO ERP
Version testée : 1.5.0 | Date : 2026-07-26

---

## Tests automatisés existants

### tests/Feature/ (16 fichiers)

| Fichier | Périmètre testé |
|---------|----------------|
| `ExampleTest.php` | Test de base Laravel (smoke test) |
| `AuthTest.php` | Authentification globale (login/logout/register) |
| `Auth/AuthenticationTest.php` | Connexion utilisateur |
| `Auth/EmailVerificationTest.php` | Vérification email |
| `Auth/PasswordConfirmationTest.php` | Confirmation de mot de passe |
| `Auth/PasswordResetTest.php` | Réinitialisation de mot de passe |
| `Auth/PasswordUpdateTest.php` | Mise à jour du mot de passe |
| `Auth/RegistrationTest.php` | Inscription d'un nouvel utilisateur |
| `ProfileTest.php` | Édition du profil utilisateur |
| `ProjectTest.php` | CRUD projets + validation |
| `InvoiceTest.php` | CRUD factures + workflow paiement |
| `DemoRequestTest.php` | Formulaire de demande de démo |
| `SubscriptionTest.php` | Abonnement + activation plan |
| `SupportTicketTest.php` | Tickets de support (création/réponse/fermeture) |
| `LicenseGuardTest.php` | Garde anti-fuite licences (CheckSubscription) |
| `DocumentVerifierTest.php` | Vérification QR code documents |
| `MultiTenantIsolationTest.php` | Isolation multi-tenant (company_id scope) |

### tests/Unit/ (1 fichier)

| Fichier | Périmètre testé |
|---------|----------------|
| `ExampleTest.php` | Test unitaire de base |

### tests/TestCase.php
Classe de base partagée par tous les tests Feature/Unit.

**Total : 19 fichiers de test** (18 Feature + 1 Unit)

---

## Résultats campagnes de test manuelles (§46.2)

### Campagne 1 — Infrastructure
| # | Test | Résultat | Notes |
|---|------|----------|-------|
| 1.1 | Connexion DB MySQL | [ ] À vérifier | Tester en staging |
| 1.2 | Envoi email SMTP | [ ] À vérifier | Configurer SMTP depuis SuperAdmin |
| 1.3 | Service worker PWA | [ ] À vérifier | Chrome DevTools > Application |
| 1.4 | Sauvegarde DB manuelle | [ ] À vérifier | `/superadmin/backups` |
| 1.5 | Restauration sauvegarde | [ ] À vérifier | Test en environnement isolé |
| 1.6 | Health check global | [ ] À vérifier | `/superadmin/health` |

### Campagne 2 — Authentification par rôle
| # | Test | Résultat |
|---|------|----------|
| 2.1 | Inscription nouvel utilisateur | [ ] |
| 2.2 | Connexion + vérification email | [ ] |
| 2.3 | Activation 2FA (TOTP) | [ ] |
| 2.4 | Connexion avec 2FA | [ ] |
| 2.5 | Changement de mot de passe | [ ] |
| 2.6 | Réinitialisation mot de passe | [ ] |
| 2.7 | Onboarding post-inscription | [ ] |

### Campagne 3 — RBAC & Permissions
| # | Test | Résultat |
|---|------|----------|
| 3.1 | Rôle Direction Générale — accès tous modules | [ ] |
| 3.2 | Rôle Chef de chantier — accès limité | [ ] |
| 3.3 | Rôle Comptabilité — accès finance uniquement | [ ] |
| 3.4 | Tentative accès module non autorisé → 403 | [ ] |
| 3.5 | Isolation multi-tenant (2 entreprises séparées) | [ ] |

### Campagne 4 — Modules métier pilotage
| # | Test | Résultat |
|---|------|----------|
| 4.1 | Création/édition/suppression projet | [ ] |
| 4.2 | Ajout chantier rattaché à projet | [ ] |
| 4.3 | Planning Gantt — création tâche | [ ] |
| 4.4 | Export PDF liste projets | [ ] |
| 4.5 | Export XLSX projets | [ ] |

### Campagne 5 — Bureau d'études
| # | Test | Résultat |
|---|------|----------|
| 5.1 | Création devis avec lignes | [ ] |
| 5.2 | Génération PDF devis | [ ] |
| 5.3 | BPU — création prix unitaires | [ ] |
| 5.4 | Métré — feuille de calcul | [ ] |
| 5.5 | DQE — export PDF | [ ] |

### Campagne 6 — Commercial & Facturation
| # | Test | Résultat |
|---|------|----------|
| 6.1 | Création client / fournisseur | [ ] |
| 6.2 | Création facture + envoi email | [ ] |
| 6.3 | Paiement Mobile Money (initier) | [ ] |
| 6.4 | QR code facture → vérification publique | [ ] |
| 6.5 | Contrat avec signature électronique | [ ] |

### Campagne 7 — Stocks & Achats
| # | Test | Résultat |
|---|------|----------|
| 7.1 | Création bon de commande | [ ] |
| 7.2 | Confirmation + réception BC | [ ] |
| 7.3 | Mouvement de stock | [ ] |
| 7.4 | Import CSV stocks | [ ] |

### Campagne 8 — RH & Paie
| # | Test | Résultat |
|---|------|----------|
| 8.1 | Création fiche employé | [ ] |
| 8.2 | Pointage quotidien | [ ] |
| 8.3 | Génération bulletin de paie | [ ] |
| 8.4 | Export PDF bulletin | [ ] |
| 8.5 | Vérification QR bulletin (public) | [ ] |

### Campagne 9 — Finances
| # | Test | Résultat |
|---|------|----------|
| 9.1 | Création compte de trésorerie | [ ] |
| 9.2 | Transaction trésorerie + solde | [ ] |
| 9.3 | Saisie écriture comptable (SYSCOHADA) | [ ] |
| 9.4 | Budget + suivi coûts analytiques | [ ] |
| 9.5 | Encaissement / Décaissement | [ ] |

### Campagne 10 — QHSE / Qualité / Labo
| # | Test | Résultat |
|---|------|----------|
| 10.1 | Déclaration incident HSE | [ ] |
| 10.2 | Contrôle qualité | [ ] |
| 10.3 | Test laboratoire (si module actif) | [ ] |

### Campagne 11 — GED & Signature électronique
| # | Test | Résultat |
|---|------|----------|
| 11.1 | Upload document GED | [ ] |
| 11.2 | Téléchargement document | [ ] |
| 11.3 | Demande signature électronique | [ ] |
| 11.4 | Signature et mise à jour statut | [ ] |

### Campagne 12 — SARA IA & RAG
| # | Test | Résultat |
|---|------|----------|
| 12.1 | Chat SARA public (`/api/sara/chat`) | [ ] |
| 12.2 | Chat SARA interne (module:ai) | [ ] |
| 12.3 | Injection RAG base de connaissances | [ ] |
| 12.4 | Journalisation usage IA SuperAdmin | [ ] |
| 12.5 | Changement fournisseur IA (SuperAdmin) | [ ] |

### Campagne 13 — Console SuperAdmin
| # | Test | Résultat |
|---|------|----------|
| 13.1 | Dashboard MRR / KPI | [ ] |
| 13.2 | Activation abonnement client | [ ] |
| 13.3 | Suspension / réactivation client | [ ] |
| 13.4 | Gestion landing page (FAQ, témoignages) | [ ] |
| 13.5 | Test envoi email (SMTP SuperAdmin) | [ ] |
| 13.6 | Publication changelog → notification | [ ] |
| 13.7 | Génération + export vouchers | [ ] |
| 13.8 | Validation preuve paiement | [ ] |
| 13.9 | Analytics visiteurs landing | [ ] |

### Campagne 14 — API v1 Sanctum & Webhooks
| # | Test | Résultat |
|---|------|----------|
| 14.1 | Création token API (self-service) | [ ] |
| 14.2 | GET `/api/v1/projects` avec Bearer token | [ ] |
| 14.3 | POST `/api/v1/contacts` | [ ] |
| 14.4 | GET `/api/v1/invoices` (lecture seule) | [ ] |
| 14.5 | Tentative accès cross-tenant → 403 | [ ] |
| 14.6 | Déclenchement webhook sortant (HMAC) | [ ] |
| 14.7 | Réception webhook Mobile Money entrant | [ ] |

---

## Portes de recette §46.6

| # | Critère | Résultat |
|---|---------|----------|
| G1 | Aucune erreur 500 en navigation de base | [ ] |
| G2 | Multi-tenant : aucune fuite de données inter-entreprise | [ ] |
| G3 | RBAC : toutes les permissions 403 testées | [ ] |
| G4 | 2FA : connexion sans 2FA bloquée si activé | [ ] |
| G5 | Abonnement expiré → redirection billing | [ ] |
| G6 | Export PDF : tous les formats générés sans erreur | [ ] |
| G7 | Email de bienvenue reçu à l'inscription | [ ] |
| G8 | API v1 : 401 sans token, 403 cross-tenant | [ ] |
| G9 | SARA IA répond en < 10 secondes | [ ] |
| G10 | PWA installable sur mobile (score Lighthouse ≥ 90) | [ ] |

---

## Bugs connus

Néant à la date du rapport — à compléter après la campagne de tests en staging.

---

## Actions correctives identifiées

| Priorité | Source | Action | Responsable |
|----------|--------|--------|------------|
| P1 | §7.12 | Configurer URL YouTube depuis SuperAdmin > Landing | Admin IBIG |
| P2 | §21 | Compléter useTrans() sur pages modules secondaires | Dev frontend |
| P3 | §32 | Audit ARIA pages complexes (Gantt, BI, formulaires) | Dev frontend |
| P4 | §28 | Valider Lighthouse score > 80 en staging | DevOps |
| P5 | Campagne 1 | Valider configuration SMTP production | Admin IBIG |
| P6 | Campagne 14 | Documenter Postman Collection API v1 | Dev backend |
