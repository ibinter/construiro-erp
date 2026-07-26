# INVENTAIRE COMPLET DES ROUTES — CONSTRUIRO ERP
Généré le : 2026-07-26 | Version : 1.5.0

---

## Routes publiques (landing & SEO)

| Méthode | URI | Contrôleur | Notes |
|---------|-----|------------|-------|
| GET | `/` | Closure (Welcome) | Landing page, cache 10 min, TrackPageView |
| GET | `/changelog` | Closure (Changelog) | Changelog public (entrées publiées) |
| GET | `/sitemap.xml` | SitemapController@index | SEO |
| GET | `/legal/{slug}` | LegalController@show | Pages légales (CGU, CGV, confidentialité…) |
| GET | `/aide` | AideController@index | Centre d'aide public |
| GET | `/aide/{section}` | AideController@index | Sections : guide\|docs\|nouveautes\|faq |
| GET | `/guide/{locale}` | UserGuideController@download | Téléchargement guide PDF (fr\|en) |
| GET | `/verify/{token}` | DocumentVerifyController@show | Vérification QR code document |
| GET | `/verify/{type}/{number}` | Closure | Vérification bon de commande / bulletin de paie |
| GET | `/blog` | redirect → ibigsoft.com | 301 |
| GET | `/statut` | redirect → ibigsoft.com | 301 |

---

## Routes auth (inscription / connexion / 2FA)

Définies dans `routes/auth.php` (inclus via `require`).

| Méthode | URI | Contrôleur |
|---------|-----|------------|
| GET/POST | `/login` | AuthenticatedSessionController |
| POST | `/logout` | AuthenticatedSessionController@destroy |
| GET/POST | `/register` | RegisteredUserController |
| GET/POST | `/forgot-password` | PasswordResetLinkController |
| GET/POST | `/reset-password/{token}` | NewPasswordController |
| GET/POST | `/verify-email` | EmailVerificationPromptController |
| GET | `/verify-email/{id}/{hash}` | VerifyEmailController |
| POST | `/email/verification-notification` | EmailVerificationNotificationController |
| GET/POST | `/confirm-password` | ConfirmablePasswordController |
| PUT | `/password` | PasswordController |
| GET/POST | `/two-factor` | TwoFactorController |
| POST | `/two-factor/challenge` | TwoFactorChallengeController |

---

## Routes changement de langue

| Méthode | URI | Contrôleur |
|---------|-----|------------|
| GET/POST | `/locale/{locale}` | LocaleController@update |

---

## Routes profil utilisateur (auth)

Middleware : `auth`

| Méthode | URI | Contrôleur |
|---------|-----|------------|
| GET | `/profile` | ProfileController@edit |
| PATCH | `/profile` | ProfileController@update |
| DELETE | `/profile` | ProfileController@destroy |

---

## Routes espace interne (authentifié + vérifié + abonné + 2FA)

Middleware : `auth`, `verified`, `subscription`, `two-factor`

### Tableau de bord
| Méthode | URI | Contrôleur | Permission |
|---------|-----|------------|-----------|
| GET | `/dashboard` | DashboardController@index | — |

### Notifications internes
| Méthode | URI | Contrôleur |
|---------|-----|------------|
| GET | `/notifications` | NotificationController@index |
| PATCH | `/notifications/{id}/read` | NotificationController@markRead |
| POST | `/notifications/read-all` | NotificationController@markAllRead |
| GET | `/notifications/preferences` | NotificationPreferenceController@edit |
| PUT | `/notifications/preferences` | NotificationPreferenceController@update |

### Abonnement & Facturation
| Méthode | URI | Contrôleur |
|---------|-----|------------|
| GET | `/billing` | BillingController@index |
| POST | `/billing/activate` | BillingController@activate |
| GET | `/billing/payment` | PaymentGatewayController@index |
| POST | `/billing/payment/initiate` | PaymentGatewayController@initiate |
| GET | `/billing/payment/order/{ref}` | PaymentGatewayController@showOrder |
| POST | `/billing/payment/order/{ref}/proof` | PaymentGatewayController@uploadProof |
| GET | `/billing/payment/voucher` | PaymentGatewayController@voucherPage |
| POST | `/billing/payment/voucher/redeem` | PaymentGatewayController@redeemVoucher |
| GET | `/billing/payment/return/{ref}` | PaymentGatewayController@gatewayReturn |

### Onboarding post-inscription
| Méthode | URI | Contrôleur |
|---------|-----|------------|
| GET | `/onboarding` | OnboardingController@index |
| POST | `/onboarding/company` | OnboardingController@saveCompany |
| POST | `/onboarding/logo` | OnboardingController@saveLogo |
| POST | `/onboarding/settings` | OnboardingController@saveSettings |
| POST | `/onboarding/complete` | OnboardingController@complete |

### Centre de support
| Méthode | URI | Contrôleur |
|---------|-----|------------|
| GET | `/support` | SupportController@index |
| GET | `/support/create` | SupportController@create |
| POST | `/support` | SupportController@store |
| GET | `/support/{ticket}` | SupportController@show |
| POST | `/support/{ticket}/reply` | SupportController@reply |
| POST | `/support/{ticket}/close` | SupportController@close |
| POST | `/support/{ticket}/message` | SupportController@addMessage |
| PATCH | `/support/{ticket}/status` | SupportController@updateStatus |
| POST | `/support/{ticket}/reopen` | SupportController@reopen |

### Import universel
| Méthode | URI | Contrôleur | Permission |
|---------|-----|------------|-----------|
| GET | `/import` | ImportController@index | — |
| POST | `/import/preview` | ImportController@preview | — |
| POST | `/import/validate` | ImportController@validateMapping | — |
| POST | `/import/execute` | ImportController@execute | — |
| POST | `/import/run` | ImportController@run | — |
| GET | `/import/template/{module}` | ImportController@template | — |
| POST | `/import/projects` | ImportController@projects | projects.create |
| POST | `/import/quotes` | ImportController@quotes | quotes.create |
| POST | `/import/invoices` | ImportController@invoices | invoicing.create |
| POST | `/import/stocks` | ImportController@stocks | stocks.edit |
| POST | `/import/equipment` | ImportController@equipment | equipment.create |

### Sauvegardes (permission : administration.view)
| Méthode | URI | Contrôleur |
|---------|-----|------------|
| GET | `/backup` | BackupController@index |
| POST | `/backup` | BackupController@store |
| GET | `/backup/{filename}/download` | BackupController@download |
| POST | `/backup/{filename}/restore` | BackupController@restore |
| DELETE | `/backup/{filename}` | BackupController@destroy |

### Paramètres société (permission : administration.view)
| Méthode | URI | Contrôleur |
|---------|-----|------------|
| GET | `/settings` | SettingsController@index |
| PUT | `/settings/organization` | SettingsController@updateOrganization |
| PUT | `/settings/documents` | SettingsController@updateDocuments |
| PUT | `/settings/notifications` | SettingsController@updateNotifications |
| PUT | `/preferences` | PreferencesController@update |

### Académie / Formation
| Méthode | URI | Contrôleur |
|---------|-----|------------|
| GET | `/academy` | AcademyController@index |
| POST | `/academy/resources/{id}/progress` | AcademyController@markProgress |

### Recherche globale & Changelog interne
| Méthode | URI | Contrôleur |
|---------|-----|------------|
| GET | `/search` | GlobalSearchController@index |
| GET | `/changelog` | ChangelogController@index |

### Intégrations (permission : administration.view)
| Méthode | URI | Contrôleur |
|---------|-----|------------|
| GET | `/integrations` | IntegrationController@index |
| PUT | `/integrations/{type}/{provider}` | IntegrationController@update |
| POST | `/integrations/{type}/{provider}/test` | IntegrationController@test |

### Administration entreprise (permission : administration.*)
| Méthode | URI | Contrôleur |
|---------|-----|------------|
| GET | `/admin/users` | UserController@index |
| GET/POST | `/admin/users/create` | UserController@create/store |
| GET/PUT | `/admin/users/{user}/edit` | UserController@edit/update |
| DELETE | `/admin/users/{user}` | UserController@destroy |
| GET/PUT | `/admin/company` | CompanyController@edit/update |
| GET | `/admin/audit-logs` | AuditLogController@index |
| GET | `/admin/legal` | LegalController@adminIndex |
| GET/PUT | `/admin/legal/{slug}/edit` | LegalController@adminEdit/Update |
| GET/PUT | `/admin/ai-settings` | AiSettingController@edit/update |
| POST | `/admin/ai-settings/test` | AiSettingController@test |

### Modules métier (avec permissions RBAC)

#### Projets & Chantiers
| Méthode | URI | Contrôleur | Permission |
|---------|-----|------------|-----------|
| GET | `/projects` | ProjectController@index | projects.view |
| GET/POST | `/projects/create` | ProjectController@create/store | projects.create |
| GET | `/projects/{id}` | ProjectController@show | projects.view |
| GET/PUT | `/projects/{id}/edit` | ProjectController@edit/update | projects.update |
| DELETE | `/projects/{id}` | ProjectController@destroy | projects.delete |
| POST | `/projects/{id}/sites` | SiteController@store | sites.create |
| PUT | `/projects/{id}/sites/{site}` | SiteController@update | sites.update |
| DELETE | `/projects/{id}/sites/{site}` | SiteController@destroy | sites.delete |
| GET | `/sites` | SiteIndexController@index | sites.view |
| GET | `/sites/{site}` | SiteIndexController@show | sites.view |

#### Devis
| Méthode | URI | Permission |
|---------|-----|-----------|
| GET/POST | `/quotes` | quotes.view / quotes.create |
| GET/PUT | `/quotes/{id}/edit` | quotes.update |
| DELETE | `/quotes/{id}` | quotes.delete |
| GET | `/quotes/{id}/pdf` | quotes.view |

#### Facturation
| Méthode | URI | Permission |
|---------|-----|-----------|
| GET/POST | `/invoices` | invoicing.view / invoicing.create |
| GET/PUT | `/invoices/{id}/edit` | invoicing.update |
| DELETE | `/invoices/{id}` | invoicing.delete |
| POST | `/invoices/{id}/payment` | invoicing.update |
| POST | `/invoices/{id}/mark-paid` | invoicing.update |
| POST | `/invoices/{id}/send-email` | invoicing.update |
| POST | `/invoices/{id}/mobile-money` | invoicing.update |
| GET | `/invoices/{id}/pdf` | invoicing.view |

#### Matériaux, Magasins, Stocks
| Module | Méthodes | Permission |
|--------|----------|-----------|
| `/materials` | CRUD complet | materials.* |
| `/warehouses` | CRUD complet | warehouses.* |
| `/stocks` | index, movements, storeMovement | stocks.* |

#### Contrats, Achats
| Module | Méthodes | Permission |
|--------|----------|-----------|
| `/contracts` | CRUD + PDF | contracts.* |
| `/purchases` | CRUD + confirm + mark-received + PDF | purchases.* |

#### Parc matériel
| Module | Méthodes | Permission |
|--------|----------|-----------|
| `/equipment` | CRUD + maintenance | equipment.* |
| `/machinery` | index, show | machinery.view |
| `/vehicles` | index, show | vehicles.view |
| `/fuel` | CRUD | fuel.* |
| `/maintenance` | CRUD | maintenance.* |

#### Sous-traitants, Fournisseurs, Clients
| Module | Méthodes | Permission |
|--------|----------|-----------|
| `/subcontractors` | CRUD | subcontractors.* |
| `/suppliers` | CRUD | suppliers.* |
| `/clients` | CRUD + PDF | clients.* |

#### RH, Pointage, Paie
| Module | Méthodes | Permission |
|--------|----------|-----------|
| `/hr` | CRUD + PDF | hr.* |
| `/attendance` | CRUD | attendance.* |
| `/payroll` | index, store, generateAll, status, destroy, pdf | payroll.* |

#### Planning
| Méthode | URI | Permission |
|---------|-----|-----------|
| GET/POST | `/planning` | planning.view / planning.create |
| PUT/DELETE | `/planning/{task}` | planning.update / planning.delete |

#### Trésorerie, Comptabilité, Encaissements/Décaissements
| Module | Méthodes |
|--------|----------|
| `/treasury` | index, storeAccount, showAccount, transactions CRUD |
| `/accounting` | index, accounts CRUD, journal CRUD |
| `/cost-accounting` | index, store, edit, update |
| `/incoming-payments` | CRUD complet |
| `/outgoing-payments` | CRUD complet |
| `/budget` | CRUD complet |

#### QHSE / Qualité
| Module | Méthodes | Permission |
|--------|----------|-----------|
| `/hse` | CRUD | qhse.* |
| `/quality` | CRUD | quality.* |

#### Bureau d'études (middleware : module:design_office)
| Module | Méthodes |
|--------|----------|
| `/unit-prices` | CRUD |
| `/takeoff` | CRUD |
| `/boq` | CRUD + PDF |
| `/design-office` | CRUD |

#### CRM (middleware : module:crm)
| Module | Méthodes |
|--------|----------|
| `/crm` | CRUD (Opportunités) |
| `/tenders` | CRUD (Appels d'offres) |

#### Laboratoire (middleware : module:laboratory)
| Module | Méthodes |
|--------|----------|
| `/laboratory` | CRUD |

#### GED & Signature électronique
| Module | Méthodes | Permission |
|--------|----------|-----------|
| `/documents` | CRUD + download | documents.* |
| `/e-signature` | index, store, status (module:e_signature) | e_signature.* |
| POST `/sign/{model}/{id}` | SignatureController@sign | e_signature.create |

#### BI, Rapports, Assistant IA (modules optionnels)
| Module | Méthodes |
|--------|----------|
| `/bi` (module:bi) | index, pdf |
| `/reports` (module:bi) | index |
| `/ai` (module:ai) | index, ask |

#### Exports PDF & Excel
| Type | URIs | Modules couverts |
|------|------|-----------------|
| PDF individuel | `/quotes/{id}/pdf`, `/invoices/{id}/pdf`, `/purchases/{id}/pdf`, `/payroll/{id}/pdf`, `/boq/{id}/pdf`, `/projects/{id}/pdf`, `/clients/{id}/pdf`, `/hr/{id}/pdf`, `/contracts/{id}/pdf` | 9 modules |
| PDF liste | `/pdf/projects`, `/pdf/clients`, `/pdf/quotes`, `/pdf/invoices`, `/pdf/employees`, `/pdf/contracts`, `/pdf/stocks`, `/pdf/suppliers`, `/pdf/subcontractors`, `/pdf/equipment`, `/pdf/purchases`, `/pdf/budgets`, `/pdf/treasury`, `/pdf/payslips` | 14 modules |
| Excel XLSX | `/export/projects`, `/export/invoices`, `/export/quotes`, `/export/clients`, `/export/employees`, `/export/contracts`, `/export/stocks`, `/export/suppliers`, `/export/subcontractors`, `/export/equipment`, `/export/purchases`, `/export/budgets`, `/export/treasury`, `/export/payslips` | 14 modules |

---

## Routes SuperAdmin IBIG Soft

Prefix : `/superadmin` | Middleware : `auth`, `verified`, `subscription`, `two-factor`, `superadmin`

| Groupe | URIs | Contrôleur |
|--------|------|------------|
| Dashboard | `/superadmin` | SuperAdmin\DashboardController@index |
| MRR | `/superadmin/mrr-history` | SuperAdmin\DashboardController@mrrHistory |
| Clients | `/superadmin/clients` + CRUD + grant/toggle/suspend/reactivate | SuperAdmin\ClientController |
| Offres custom | `/superadmin/offers` CRUD | SuperAdmin\CustomOfferController |
| Prospects/Démos | `/superadmin/prospects` + `/superadmin/demos` CRUD | ProspectController, DemoController |
| Sessions support | `/superadmin/support-sessions` create/end | SupportSessionController |
| Templates email | `/superadmin/email-templates` CRUD + preview | EmailTemplateController |
| Landing page | `/superadmin/landing` FAQs/témoignages/settings/plans/legal | LandingController |
| SMTP | `/superadmin/smtp` show/update/test | SmtpController |
| Changelog | `/superadmin/changelogs` CRUD + publish | ChangelogController |
| Paiement config | `/superadmin/payment-config` toggle/update | PaymentConfigController |
| Ordres paiement | `/superadmin/payment-orders` index + proof/confirm/reject | PaymentOrderController |
| Vouchers | `/superadmin/vouchers` generate/export | VoucherController |
| Config IA (SARA) | `/superadmin/ai-setting` edit/update | SuperAdmin\AiSettingController |
| Journal IA | `/superadmin/ai-usage` | AiUsageController |
| Académie | `/superadmin/academy` CRUD + publish | SuperAdmin\AcademyController |
| Base connaissances | `/superadmin/knowledge-base` CRUD | KnowledgeBaseController |
| Sauvegardes | `/superadmin/backups` run/download/destroy | SuperAdmin\BackupController |
| Analytics | `/superadmin/analytics` | AnalyticsController |
| Santé système | `/superadmin/health` | HealthController |
| Webhooks sortants | `/superadmin/webhooks` CRUD + regenerate-secret | WebhookController |
| Clés API | `/superadmin/api-keys` | ApiKeysController |
| Checklist recette | `/superadmin/recette` | Closure (Inertia) |

---

## Routes API v1 — Sanctum (Bearer token)

Prefix : `/api` | Middleware : `auth:sanctum` (sauf SARA)

### SARA — Assistant IA public

| Méthode | URI | Middleware | Contrôleur |
|---------|-----|-----------|------------|
| POST | `/api/sara/chat` | `throttle:30,1` | SaraController@chat |

### API v1 (authentifiée — scope entreprise multi-tenant)

| Méthode | URI | Contrôleur | Accès |
|---------|-----|------------|-------|
| GET/POST | `/api/v1/projects` | Api\V1\ProjectController | CRUD complet |
| GET/PUT/DELETE | `/api/v1/projects/{id}` | Api\V1\ProjectController | CRUD complet |
| GET/POST | `/api/v1/contacts` | Api\V1\ContactController | CRUD complet |
| GET/PUT/DELETE | `/api/v1/contacts/{id}` | Api\V1\ContactController | CRUD complet |
| GET | `/api/v1/invoices` | Api\V1\InvoiceController | Lecture seule |
| GET | `/api/v1/invoices/{id}` | Api\V1\InvoiceController | Lecture seule |
| GET | `/api/v1/stock-items` | Api\V1\StockItemController | Lecture seule |
| GET | `/api/v1/stock-items/{id}` | Api\V1\StockItemController | Lecture seule |
| GET/POST | `/api/v1/tokens` | Api\ApiTokenController | Gestion tokens self-service |
| DELETE | `/api/v1/tokens/{id}` | Api\ApiTokenController | Révocation token |

---

## Routes webhooks entrants (publiques, hors CSRF)

| Méthode | URI | Contrôleur | Notes |
|---------|-----|------------|-------|
| POST | `/webhooks/mobile-money/{operator}` | MobileMoneyController@webhook | Exemption CSRF explicite |
| POST | `/webhooks/cinetpay` | WebhookPaymentController@cinetpay | Exemption CSRF via bootstrap/app.php |

---

## Routes de demande de démo (publique)

| Méthode | URI | Contrôleur |
|---------|-----|------------|
| POST | `/demo-request` | DemoRequestController@store |

---

## Statistiques routes

| Catégorie | Nombre estimé |
|-----------|--------------|
| Routes publiques (landing/SEO/docs) | ~15 |
| Routes auth (Breeze + 2FA) | ~12 |
| Routes espace interne (modules métier) | ~180+ |
| Routes SuperAdmin | ~60 |
| Routes API v1 Sanctum | ~11 |
| Routes webhooks entrants | 2 |
| **Total** | **~280** |
