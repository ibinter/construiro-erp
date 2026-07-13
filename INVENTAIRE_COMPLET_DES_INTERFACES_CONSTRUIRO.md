# INVENTAIRE COMPLET DES INTERFACES — CONSTRUIRO ERP

> **Version** : 1.0 — Généré le 2026-07-13  
> **Statut** : Audit en cours — corrections responsiveness  
> **Légende statut** : ✅ OK · ⚠️ Partiel · ❌ Non responsive · 🔧 Corrigé · ➖ N/A (PDF/print)

---

## A — ESPACE PUBLIC / COMMERCIAL

| Espace | Page / Route | Rôle | Mobile | Tablette | Ordinateur | PWA | Statut |
|---|---|---|---|---|---|---|---|
| Public | Landing `/` | Visiteur | ⚠️ | ✅ | ✅ | ✅ | ⚠️ |
| Public | Page légale `/legal/{slug}` | Visiteur | ✅ | ✅ | ✅ | ✅ | 🔧 |
| Public | Centre d'aide `/aide` | Visiteur | ❌ | ⚠️ | ✅ | ⚠️ | ❌ |
| Public | Sitemap `/sitemap.xml` | Bot | ➖ | ➖ | ➖ | ➖ | ➖ |
| Public | Erreur 404 | Visiteur | ❌ | ⚠️ | ✅ | ⚠️ | ❌ |
| Public | Erreur 500 | Visiteur | ❌ | ⚠️ | ✅ | ⚠️ | ❌ |

---

## B — AUTHENTIFICATION

| Espace | Page / Route | Rôle | Mobile | Tablette | Ordinateur | PWA | Statut |
|---|---|---|---|---|---|---|---|
| Auth | Connexion `/login` | Tous | ⚠️ | ✅ | ✅ | ✅ | ⚠️ |
| Auth | Inscription `/register` | Tous | ⚠️ | ✅ | ✅ | ✅ | ⚠️ |
| Auth | Mot de passe oublié `/forgot-password` | Tous | ⚠️ | ✅ | ✅ | ✅ | ⚠️ |
| Auth | Réinitialisation `/reset-password` | Tous | ⚠️ | ✅ | ✅ | ✅ | ⚠️ |
| Auth | Vérification email `/verify-email` | Tous | ⚠️ | ✅ | ✅ | ✅ | ⚠️ |
| Auth | Confirmation MDP `/confirm-password` | Tous | ⚠️ | ✅ | ✅ | ✅ | ⚠️ |
| Auth | Onboarding `/onboarding` | Nouveau | ❌ | ⚠️ | ✅ | ⚠️ | ❌ |

---

## C — ESPACE INTERNE (PARTAGÉ)

| Espace | Page / Route | Rôle | Mobile | Tablette | Ordinateur | PWA | Statut |
|---|---|---|---|---|---|---|---|
| Interne | **Sidebar** (composant) | Tous | ❌ | ⚠️ | ✅ | ❌ | 🔧 |
| Interne | **AppLayout** (header) | Tous | ❌ | ⚠️ | ✅ | ❌ | 🔧 |
| Interne | Dashboard `/dashboard` | Tous | ⚠️ | ✅ | ✅ | ✅ | ⚠️ |
| Interne | Profil `/profile` | Tous | ⚠️ | ✅ | ✅ | ✅ | ⚠️ |
| Interne | Notifications `/notifications` | Tous | ❌ | ⚠️ | ✅ | ⚠️ | ❌ |
| Interne | Préf. notifications `/notifications/preferences` | Tous | ❌ | ⚠️ | ✅ | ⚠️ | ❌ |
| Interne | Facturation `/billing` | Admin | ⚠️ | ✅ | ✅ | ✅ | ⚠️ |
| Interne | Module générique `/app/{module}` | Tous | ❌ | ⚠️ | ✅ | ⚠️ | ❌ |

---

## D — MODULES MÉTIER

### D1 — Projets & Chantiers

| Espace | Page / Route | Rôle | Mobile | Tablette | Ordinateur | PWA | Statut |
|---|---|---|---|---|---|---|---|
| Projets | Liste `/projects` | Chef projet | ❌ | ⚠️ | ✅ | ❌ | 🔧 |
| Projets | Créer `/projects/create` | Chef projet | ⚠️ | ✅ | ✅ | ⚠️ | ⚠️ |
| Projets | Éditer `/projects/{id}/edit` | Chef projet | ⚠️ | ✅ | ✅ | ⚠️ | ⚠️ |
| Projets | Détail `/projects/{id}` | Chef projet | ❌ | ⚠️ | ✅ | ❌ | ❌ |
| Chantiers | Liste `/sites` | Chef chantier | ❌ | ⚠️ | ✅ | ❌ | ❌ |
| Chantiers | Détail `/sites/{id}` | Chef chantier | ❌ | ⚠️ | ✅ | ❌ | ❌ |

### D2 — Commercial

| Espace | Page / Route | Rôle | Mobile | Tablette | Ordinateur | PWA | Statut |
|---|---|---|---|---|---|---|---|
| Devis | Liste `/quotes` | Commercial | ❌ | ⚠️ | ✅ | ❌ | 🔧 |
| Devis | Créer `/quotes/create` | Commercial | ⚠️ | ✅ | ✅ | ⚠️ | ⚠️ |
| Devis | Éditer `/quotes/{id}/edit` | Commercial | ⚠️ | ✅ | ✅ | ⚠️ | ⚠️ |
| Devis | Détail `/quotes/{id}` | Commercial | ❌ | ⚠️ | ✅ | ❌ | ❌ |
| Devis | PDF `/quotes/{id}/pdf` | Commercial | ➖ | ➖ | ➖ | ➖ | ➖ |
| Factures | Liste `/invoices` | Comptable | ❌ | ⚠️ | ✅ | ❌ | 🔧 |
| Factures | Créer `/invoices/create` | Comptable | ⚠️ | ✅ | ✅ | ⚠️ | ⚠️ |
| Factures | Éditer `/invoices/{id}/edit` | Comptable | ⚠️ | ✅ | ✅ | ⚠️ | ⚠️ |
| Factures | Détail `/invoices/{id}` | Comptable | ❌ | ⚠️ | ✅ | ❌ | ❌ |
| Clients | Liste `/clients` | Commercial | ❌ | ⚠️ | ✅ | ❌ | 🔧 |
| Clients | Créer `/clients/create` | Commercial | ⚠️ | ✅ | ✅ | ⚠️ | ⚠️ |
| Clients | Éditer `/clients/{id}/edit` | Commercial | ⚠️ | ✅ | ✅ | ⚠️ | ⚠️ |
| Clients | Détail `/clients/{id}` | Commercial | ❌ | ⚠️ | ✅ | ❌ | ❌ |
| CRM | Liste `/crm` | Commercial | ❌ | ⚠️ | ✅ | ❌ | ❌ |
| CRM | Créer `/crm/create` | Commercial | ⚠️ | ✅ | ✅ | ⚠️ | ⚠️ |
| CRM | Détail `/crm/{id}` | Commercial | ❌ | ⚠️ | ✅ | ❌ | ❌ |
| Appels d'offres | Liste `/tenders` | Commercial | ❌ | ⚠️ | ✅ | ❌ | ❌ |
| Appels d'offres | Détail `/tenders/{id}` | Commercial | ❌ | ⚠️ | ✅ | ❌ | ❌ |
| Contrats | Liste `/contracts` | Juridique | ❌ | ⚠️ | ✅ | ❌ | 🔧 |
| Contrats | Détail `/contracts/{id}` | Juridique | ❌ | ⚠️ | ✅ | ❌ | ❌ |

### D3 — Achats & Stock

| Espace | Page / Route | Rôle | Mobile | Tablette | Ordinateur | PWA | Statut |
|---|---|---|---|---|---|---|---|
| Achats | Liste `/purchases` | Acheteur | ❌ | ⚠️ | ✅ | ❌ | 🔧 |
| Achats | Créer `/purchases/create` | Acheteur | ⚠️ | ✅ | ✅ | ⚠️ | ⚠️ |
| Achats | Détail `/purchases/{id}` | Acheteur | ❌ | ⚠️ | ✅ | ❌ | ❌ |
| Matériaux | Liste `/materials` | Magasinier | ❌ | ⚠️ | ✅ | ❌ | 🔧 |
| Matériaux | Créer `/materials/create` | Magasinier | ⚠️ | ✅ | ✅ | ⚠️ | ⚠️ |
| Magasins | Liste `/warehouses` | Magasinier | ❌ | ⚠️ | ✅ | ❌ | ❌ |
| Stocks | Inventaire `/stocks` | Magasinier | ❌ | ⚠️ | ✅ | ❌ | ❌ |
| Stocks | Mouvements `/stocks/movements` | Magasinier | ❌ | ⚠️ | ✅ | ❌ | ❌ |
| Fournisseurs | Liste `/suppliers` | Acheteur | ❌ | ⚠️ | ✅ | ❌ | 🔧 |
| Fournisseurs | Détail `/suppliers/{id}` | Acheteur | ❌ | ⚠️ | ✅ | ❌ | ❌ |

### D4 — RH & Paie

| Espace | Page / Route | Rôle | Mobile | Tablette | Ordinateur | PWA | Statut |
|---|---|---|---|---|---|---|---|
| Employés | Liste `/hr` | DRH | ❌ | ⚠️ | ✅ | ❌ | 🔧 |
| Employés | Créer `/hr/create` | DRH | ⚠️ | ✅ | ✅ | ⚠️ | ⚠️ |
| Employés | Détail `/hr/{id}` | DRH | ❌ | ⚠️ | ✅ | ❌ | ❌ |
| Pointage | `/attendance` | DRH | ❌ | ⚠️ | ✅ | ❌ | ❌ |
| Paie | `/payroll` | DRH | ❌ | ⚠️ | ✅ | ❌ | 🔧 |

### D5 — Équipements & Matériel

| Espace | Page / Route | Rôle | Mobile | Tablette | Ordinateur | PWA | Statut |
|---|---|---|---|---|---|---|---|
| Équipement | Liste `/equipment` | Chef matériel | ❌ | ⚠️ | ✅ | ❌ | 🔧 |
| Équipement | Détail `/equipment/{id}` | Chef matériel | ❌ | ⚠️ | ✅ | ❌ | ❌ |
| Parc roulant | `/machinery` | Chef matériel | ❌ | ⚠️ | ✅ | ❌ | ❌ |
| Véhicules | `/vehicles` | Chef matériel | ❌ | ⚠️ | ✅ | ❌ | ❌ |
| Carburant | `/fuel` | Chef matériel | ❌ | ⚠️ | ✅ | ❌ | ❌ |
| Maintenance | `/maintenance` | Chef matériel | ❌ | ⚠️ | ✅ | ❌ | ❌ |
| Sous-traitants | `/subcontractors` | Chef chantier | ❌ | ⚠️ | ✅ | ❌ | 🔧 |

### D6 — Bureau d'études

| Espace | Page / Route | Rôle | Mobile | Tablette | Ordinateur | PWA | Statut |
|---|---|---|---|---|---|---|---|
| BPU | `/unit-prices` | Ingénieur | ❌ | ⚠️ | ✅ | ❌ | ❌ |
| Métré | `/takeoff` | Ingénieur | ❌ | ⚠️ | ✅ | ❌ | ❌ |
| DQE/BOQ | `/boq` | Ingénieur | ❌ | ⚠️ | ✅ | ❌ | ❌ |
| Études | `/design-office` | Ingénieur | ❌ | ⚠️ | ✅ | ❌ | ❌ |
| Planning/Gantt | `/planning` | Chef projet | ❌ | ⚠️ | ✅ | ❌ | ❌ |

### D7 — QHSE

| Espace | Page / Route | Rôle | Mobile | Tablette | Ordinateur | PWA | Statut |
|---|---|---|---|---|---|---|---|
| HSE Incidents | `/hse` | QHSE | ❌ | ⚠️ | ✅ | ❌ | ❌ |
| Qualité | `/quality` | QHSE | ❌ | ⚠️ | ✅ | ❌ | ❌ |
| Laboratoire | `/laboratory` | Labo | ❌ | ⚠️ | ✅ | ❌ | ❌ |

### D8 — Finance & Comptabilité

| Espace | Page / Route | Rôle | Mobile | Tablette | Ordinateur | PWA | Statut |
|---|---|---|---|---|---|---|---|
| Trésorerie | `/treasury` | DAF | ❌ | ⚠️ | ✅ | ❌ | ❌ |
| Compte tréso | `/treasury/accounts/{id}` | DAF | ❌ | ⚠️ | ✅ | ❌ | ❌ |
| Encaissements | `/incoming-payments` | Comptable | ❌ | ⚠️ | ✅ | ❌ | 🔧 |
| Décaissements | `/outgoing-payments` | Comptable | ❌ | ⚠️ | ✅ | ❌ | 🔧 |
| Compta analytique | `/cost-accounting` | Comptable | ❌ | ⚠️ | ✅ | ❌ | ❌ |
| Compta générale | `/accounting` | Comptable | ❌ | ⚠️ | ✅ | ❌ | ❌ |
| Plans de comptes | `/accounting/accounts` | Comptable | ❌ | ⚠️ | ✅ | ❌ | ❌ |
| Budget | `/budget` | DAF | ❌ | ⚠️ | ✅ | ❌ | ❌ |

### D9 — GED & Documents

| Espace | Page / Route | Rôle | Mobile | Tablette | Ordinateur | PWA | Statut |
|---|---|---|---|---|---|---|---|
| Documents | `/documents` | Tous | ❌ | ⚠️ | ✅ | ❌ | ❌ |
| Signature élec. | `/e-signature` | Tous | ❌ | ⚠️ | ✅ | ❌ | ❌ |

### D10 — BI & IA

| Espace | Page / Route | Rôle | Mobile | Tablette | Ordinateur | PWA | Statut |
|---|---|---|---|---|---|---|---|
| BI / Rapports | `/bi` | Direction | ❌ | ⚠️ | ✅ | ❌ | ❌ |
| Rapports | `/reports` | Tous | ❌ | ⚠️ | ✅ | ❌ | ❌ |
| Assistant IA | `/ai` | Tous | ❌ | ⚠️ | ✅ | ❌ | ❌ |

---

## E — ESPACE ADMIN SOCIÉTÉ

| Espace | Page / Route | Rôle | Mobile | Tablette | Ordinateur | PWA | Statut |
|---|---|---|---|---|---|---|---|
| Admin | Utilisateurs `/admin/users` | Admin | ❌ | ⚠️ | ✅ | ❌ | ❌ |
| Admin | Créer utilisateur `/admin/users/create` | Admin | ⚠️ | ✅ | ✅ | ⚠️ | ⚠️ |
| Admin | Paramètres société `/admin/company` | Admin | ⚠️ | ✅ | ✅ | ⚠️ | ⚠️ |
| Admin | Journal d'audit `/admin/audit-logs` | Admin | ❌ | ⚠️ | ✅ | ❌ | ❌ |
| Admin | Paramètres IA `/admin/ai-settings` | Admin | ⚠️ | ✅ | ✅ | ⚠️ | ⚠️ |
| Admin | Pages légales `/admin/legal/{slug}` | Admin | ⚠️ | ✅ | ✅ | ⚠️ | ⚠️ |

---

## F — ESPACE SUPERADMIN

| Espace | Page / Route | Rôle | Mobile | Tablette | Ordinateur | PWA | Statut |
|---|---|---|---|---|---|---|---|
| SuperAdmin | Dashboard `/superadmin` | SuperAdmin | ❌ | ⚠️ | ✅ | ❌ | ❌ |
| SuperAdmin | Clients `/superadmin/clients` | SuperAdmin | ❌ | ⚠️ | ✅ | ❌ | ❌ |
| SuperAdmin | Détail client `/superadmin/clients/{id}` | SuperAdmin | ❌ | ⚠️ | ✅ | ❌ | ❌ |
| SuperAdmin | Prospects `/superadmin/prospects` | SuperAdmin | ❌ | ⚠️ | ✅ | ❌ | ❌ |
| SuperAdmin | Sessions support `/superadmin/support-sessions` | SuperAdmin | ❌ | ⚠️ | ✅ | ❌ | ❌ |
| SuperAdmin | Gestion landing `/superadmin/landing` | SuperAdmin | ❌ | ⚠️ | ✅ | ❌ | ❌ |

---

## G — PORTAILS SPÉCIALISÉS

| Espace | Page / Route | Rôle | Mobile | Tablette | Ordinateur | PWA | Statut |
|---|---|---|---|---|---|---|---|
| Support | Liste tickets `/support` | Tous | ❌ | ⚠️ | ✅ | ❌ | ❌ |
| Support | Créer ticket `/support/create` | Tous | ⚠️ | ✅ | ✅ | ⚠️ | ⚠️ |
| Support | Détail ticket `/support/{id}` | Tous | ❌ | ⚠️ | ✅ | ❌ | ❌ |

---

## H — AIDE & ASSISTANT IA

| Espace | Page / Route | Rôle | Mobile | Tablette | Ordinateur | PWA | Statut |
|---|---|---|---|---|---|---|---|
| Aide | Centre d'aide `/aide` | Tous | ❌ | ⚠️ | ✅ | ❌ | ❌ |
| IA | Assistant SARA `/ai` | Tous | ❌ | ⚠️ | ✅ | ❌ | ❌ |
| IA | SARA flottant (composant) | Tous | ⚠️ | ✅ | ✅ | ⚠️ | ⚠️ |

---

## I — DOCUMENTS & EXPORTS

| Espace | Page / Route | Rôle | Mobile | Tablette | Ordinateur | PWA | Statut |
|---|---|---|---|---|---|---|---|
| PDF | Devis PDF `/quotes/{id}/pdf` | Commercial | ➖ | ➖ | ➖ | ➖ | ➖ |
| PDF | Facture PDF `/invoices/{id}/pdf` | Comptable | ➖ | ➖ | ➖ | ➖ | ➖ |
| PDF | Bon achat PDF `/purchases/{id}/pdf` | Acheteur | ➖ | ➖ | ➖ | ➖ | ➖ |
| PDF | Bulletin paie PDF `/payroll/{id}/pdf` | DRH | ➖ | ➖ | ➖ | ➖ | ➖ |
| PDF | DQE/BOQ PDF `/boq/{id}/pdf` | Ingénieur | ➖ | ➖ | ➖ | ➖ | ➖ |
| PDF | BI PDF `/bi/pdf` | Direction | ➖ | ➖ | ➖ | ➖ | ➖ |
| Excel | Export projets `/export/projects` | Tous | ➖ | ➖ | ➖ | ➖ | ➖ |
| Excel | Export factures `/export/invoices` | Tous | ➖ | ➖ | ➖ | ➖ | ➖ |
| Excel | Export clients `/export/clients` | Tous | ➖ | ➖ | ➖ | ➖ | ➖ |
| Excel | Export employés `/export/employees` | Tous | ➖ | ➖ | ➖ | ➖ | ➖ |
| Excel | Export stocks `/export/stocks` | Tous | ➖ | ➖ | ➖ | ➖ | ➖ |

---

## RÉSUMÉ DES CORRECTIONS PRIORITAIRES

### Niveau 1 — Impact maximal (composants partagés)
- [x] **AppLayout** : sidebar overlay mobile + backdrop ← 🔧
- [x] **Sidebar** : fixed overlay mobile, sticky desktop ← 🔧
- [ ] **Tables** : wrapper `overflow-x-auto` sur toutes les pages liste
- [ ] **Barres de filtres** : largeurs fixes → `w-full sm:w-auto`
- [ ] **Modals** : responsive sur petits écrans

### Niveau 2 — Pages métier critiques (CRUD fréquents)
- [x] Projects/Index ← 🔧
- [x] Invoices/Index ← 🔧
- [x] Clients/Index ← 🔧
- [x] Contracts/Index ← 🔧
- [x] Purchases/Index ← 🔧
- [x] Materials/Index ← 🔧
- [x] Employees/Index ← 🔧
- [x] Payroll/Index ← 🔧
- [x] Equipment/Index ← 🔧
- [x] Suppliers/Index ← 🔧
- [x] Subcontractors/Index ← 🔧
- [x] Quotes/Index ← 🔧
- [x] IncomingPayments/Index ← 🔧
- [x] OutgoingPayments/Index ← 🔧

### Niveau 3 — Pages spécialisées
- [ ] Planning / Gantt
- [ ] BI Dashboard
- [ ] Trésorerie
- [ ] SuperAdmin

---

*Ce document est mis à jour au fil des corrections.*
