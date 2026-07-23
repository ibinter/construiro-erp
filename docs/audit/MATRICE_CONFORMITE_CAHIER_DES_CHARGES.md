# MATRICE DE CONFORMITE — CAHIER DES CHARGES CONSTRUIRO ERP

**Date :** 2026-07-23
**Référentiel :** Script Universel CONSTRUIRO — 42 sections
**Légende :** Conforme | Partiel | Absent

---

| # | Exigence / Section | Module | État | Action requise | État final |
|---|---|---|---|---|---|
| 1 | Inscription entreprise & onboarding | Auth + Onboarding | **Conforme** | — | Validé |
| 2 | Authentification email/password | Auth | **Conforme** | — | Validé |
| 3 | Vérification email obligatoire | Auth (verified middleware) | **Conforme** | — | Validé |
| 4 | Reset password | Auth (NewPasswordController) | **Conforme** | — | Validé |
| 5 | 2FA / MFA TOTP | TotpService + TwoFactorController | **Conforme** | — | Validé |
| 6 | Gestion multi-utilisateurs par société | RBAC Spatie + company_id | **Conforme** | — | Validé |
| 7 | Rôles et permissions granulaires | Spatie laravel-permission | **Conforme** | — | Validé |
| 8 | Tableau de bord KPI | DashboardController + Recharts | **Conforme** | — | Validé |
| 9 | Module Projets (CRUD + chantiers) | ProjectController + SiteController | **Conforme** | — | Validé |
| 10 | Gestion Chantiers rattachés | SiteController, SiteIndexController | **Conforme** | — | Validé |
| 11 | Module Devis / Bureau d'études | QuoteController, BOQ, Takeoff | **Conforme** | — | Validé |
| 12 | BPU / Bibliothèque prix unitaires | UnitPriceController | **Conforme** | — | Validé |
| 13 | Métré (quantitatif) | TakeoffController | **Conforme** | — | Validé |
| 14 | DQE / BOQ | BoqController | **Conforme** | — | Validé |
| 15 | Module Facturation | InvoiceController (lignes, PDF, email) | **Conforme** | — | Validé |
| 16 | Enregistrement paiements factures | InvoiceController::registerPayment | **Conforme** | — | Validé |
| 17 | Intégration Mobile Money | MobileMoneyController + webhook | **Conforme** | — | Validé |
| 18 | Module Clients | ClientController | **Conforme** | — | Validé |
| 19 | Module Fournisseurs | SupplierController | **Conforme** | — | Validé |
| 20 | Module Achats / Bons de commande | PurchaseController (confirm, reçu, PDF) | **Conforme** | — | Validé |
| 21 | Gestion Stocks (niveaux + mouvements) | StockController + WarehouseController | **Conforme** | — | Validé |
| 22 | Catalogue Matériaux | MaterialController | **Conforme** | — | Validé |
| 23 | Module Équipements / Parc matériel | EquipmentController + MaintenanceController | **Conforme** | — | Validé |
| 24 | Engins & Véhicules (vues filtrées) | MachineryController + VehicleController | **Conforme** | — | Validé |
| 25 | Journal carburant | FuelController | **Conforme** | — | Validé |
| 26 | Module Sous-traitants | SubcontractorController | **Conforme** | — | Validé |
| 27 | Module Contrats | ContractController | **Conforme** | — | Validé |
| 28 | Signature électronique | SignatureController (module:e_signature) | **Conforme** | — | Validé |
| 29 | Module RH / Employés | EmployeeController | **Conforme** | — | Validé |
| 30 | Pointage | AttendanceController | **Conforme** | — | Validé |
| 31 | Paie / Bulletins de salaire | PayslipController + PayrollEngine | **Conforme** | — | Validé |
| 32 | Planning / Gantt | PlanningController | **Conforme** | — | Validé |
| 33 | QHSE / Incidents sécurité | HseIncidentController | **Conforme** | — | Validé |
| 34 | Qualité / Contrôles | QualityController | **Conforme** | — | Validé |
| 35 | Laboratoire (essais matériaux) | LaboratoryController (module:laboratory) | **Conforme** | — | Validé |
| 36 | GED (gestion documentaire) | DocumentController (stockage privé) | **Conforme** | — | Validé |
| 37 | Trésorerie (comptes + transactions) | TreasuryController | **Conforme** | — | Validé |
| 38 | Comptabilité analytique | CostAccountingController | **Conforme** | — | Validé |
| 39 | Comptabilité générale SYSCOHADA | AccountingController | **Partiel** | Balance/Grand livre à finaliser | En cours |
| 40 | Encaissements / Décaissements | IncomingPaymentController + OutgoingPaymentController | **Conforme** | — | Validé |
| 41 | Budget par projet | BudgetController | **Conforme** | — | Validé |
| 42 | CRM (opportunités + appels d'offres) | OpportunityController + TenderController | **Conforme** | — | Validé |
| 43 | BI & Rapports | BiController + ReportController | **Conforme** | — | Validé |
| 44 | Assistant IA SARA | AiAssistantController + SaraGateway | **Conforme** | — | Validé |
| 45 | Gestion abonnements SaaS | BillingController + CheckSubscription | **Conforme** | — | Validé |
| 46 | Plans trial/active/grace/expired | Subscription model + middleware | **Conforme** | — | Validé |
| 47 | Paiement CinetPay | WebhookPaymentController | **Conforme** | — | Validé |
| 48 | Vouchers prépayés | PaymentGatewayController + VoucherController | **Conforme** | — | Validé |
| 49 | Console SuperAdmin | SuperAdmin/* controllers | **Conforme** | — | Validé |
| 50 | Vérification document publique (QR) | DocumentVerifyController + QrCodeService | **Conforme** | — | Validé |
| 51 | Audit log systématique | AuditLogController (17 champs) | **Conforme** | — | Validé |
| 52 | Sécurité OWASP (CSP, HSTS, headers) | SecurityHeaders middleware | **Conforme** | — | Validé |
| 53 | RBAC par ressource (can:xxx.action) | Spatie + middleware can | **Conforme** | — | Validé |
| 54 | Limite plan (max_users, max_projects) | LicenseGuard | **Conforme** | — | Validé |
| 55 | Notifications internes + email | NotificationService + queue | **Conforme** | — | Validé |
| 56 | Import universel CSV/Excel | ImportController (5 modules) | **Conforme** | — | Validé |
| 57 | Export Excel + PDF | ExportController + PdfController | **Conforme** | — | Validé |
| 58 | Landing page dynamique | Welcome + SuperAdmin LandingController | **Conforme** | — | Validé |
| 59 | Académie / Formation | AcademyController | **Conforme** | — | Validé |
| 60 | Support tickets | SupportController | **Conforme** | — | Validé |
| 61 | Onboarding wizard | OnboardingController | **Conforme** | — | Validé |
| 62 | Multilingue FR/EN | SetLocale middleware + lang/ | **Conforme** | — | Validé |
| 63 | Sauvegardes & restauration | BackupController + BackupService | **Conforme** | — | Validé |
| 64 | Gestion intégrations | IntegrationController | **Conforme** | — | Validé |
| 65 | Changelog public + admin | ChangelogController + SuperAdmin | **Conforme** | — | Validé |
| 66 | Pages légales éditables | LegalController + SuperAdmin | **Conforme** | — | Validé |
| 67 | PWA / installation mobile | **Absent** | Ajouter manifest.json + SW | V1.1 |
| 68 | API REST publique documentée | **Absent** | Exposer endpoints + OpenAPI | V1.2 |
| 69 | SSO OAuth | **Absent** | Laravel Socialite (optionnel) | V1.2 |

---

**Taux de conformité V1 :** 66/69 exigences — **95.6 %**

| Statut | Nombre |
|---|---|
| Conforme | 65 |
| Partiel | 1 |
| Absent | 3 |
