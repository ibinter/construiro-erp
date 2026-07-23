# AUDIT LICENCES & ABONNEMENTS — CONSTRUIRO ERP

**Date :** 2026-07-23
**Fichiers clés :**
- `app/Http/Middleware/CheckSubscription.php`
- `app/Services/LicenseGuard.php`
- `app/Http/Controllers/BillingController.php`
- `app/Http/Controllers/PaymentGatewayController.php`
- `database/migrations/2026_07_12_000005_create_subscription_plans_table.php`

---

## 1. Statuts d'abonnement

| Statut | Description | Comportement |
|---|---|---|
| `trial` | Période d'essai en cours | Accès complet ; transition → `grace` à expiration |
| `active` | Abonnement payant actif | Accès complet ; transition → `grace` à expiration |
| `grace` | Délai de grâce 7 jours | Accès complet + bannière d'alerte ; transition → `expired` |
| `expired` | Expiré (hors délai de grâce) | Blocage : page `Subscription/Expired` (HTTP 402) |
| `cancelled` | Résilié manuellement | Géré par SuperAdmin via `suspend`/`reactivate` |

**Transitions automatiques (dans `CheckSubscription.php`) :**
```
trial  → expires → grace (grace_ends_at = now + 7j)
active → expires → grace (grace_ends_at = now + 7j)
grace  → expires → expired
```

---

## 2. Middleware CheckSubscription

**Fichier :** `app/Http/Middleware/CheckSubscription.php`

Routes exemptées (toujours accessibles) :
- `billing` — pour renouveler
- `dashboard` — pour voir les alertes
- `notifications` — alertes internes
- `profile` — modification profil
- `support` — tickets support
- `aide` — centre d'aide
- `onboarding` — wizard post-inscription
- `locale` — changement langue
- `superadmin` — console IBIG Soft

**Comportement en cas d'expiration :**
- Requête Inertia → rendu `Subscription/Expired` avec statut HTTP 402
- Requête API JSON → `{"error": "subscription_expired"}` HTTP 402

**Partage état Inertia :** le middleware injecte `subscription.status`, `subscription.days_remaining`, `subscription.is_grace` dans la réponse Inertia pour affichage des bannières.

---

## 3. LicenseGuard — Limites du plan

**Fichier :** `app/Services/LicenseGuard.php`

| Méthode | Vérification | Action si dépassement |
|---|---|---|
| `checkUserLimit(companyId)` | `User::where('company_id')->where('is_active', true)->count() >= max_users` | `abort(402, "Limite d'utilisateurs atteinte")` |
| `checkProjectLimit(companyId)` | `Project::where('company_id')->count() >= max_projects` | `abort(402, "Limite de projets atteinte")` |
| `usage(companyId)` | Retourne usage courant pour page Billing | Lecture seule |

**Convention plan illimité :** `max_users = null` ou `max_users >= 9999` → pas de limite imposée.

Les statuts actifs pour la vérification : `trial`, `active`, `grace`. Un abonnement `expired` ou `cancelled` n'impose pas de limite (l'accès est déjà bloqué par `CheckSubscription`).

---

## 4. Plans d'abonnement (SubscriptionPlan)

Champs clés de la table `subscription_plans` :
- `name` — nom du plan
- `description` — description
- `price_monthly` — prix mensuel
- `price_yearly` — prix annuel
- `max_users` — limite utilisateurs (null = illimité)
- `max_projects` — limite projets (null = illimité)
- `trial_days` — durée de l'essai
- `is_active` — visibilité sur landing
- `sort_order` — ordre d'affichage

---

## 5. Activation & contrôle anti-fuite §18.5

| Point de contrôle | Mécanisme | État |
|---|---|---|
| Activation abonnement | `BillingController::activate()` — uniquement via action SuperAdmin `grantSubscription` ou paiement confirmé | **Conforme** |
| Paiement virement + preuve | `PaymentGatewayController::uploadProof()` → en attente validation SuperAdmin | **Conforme** |
| Paiement CinetPay | Webhook `WebhookPaymentController::cinetpay()` → activation après confirmation opérateur | **Conforme** |
| Vouchers prépayés | `PaymentGatewayController::redeemVoucher()` → validation code + activation | **Conforme** |
| Suspension compte | `SuperAdmin::ClientController::suspend()` — bloque l'accès | **Conforme** |
| Réactivation | `SuperAdmin::ClientController::reactivate()` — requiert intervention manuelle IBIG Soft | **Conforme** |
| Offres personnalisées | `SuperAdmin::CustomOfferController` — plans sur mesure créés par SuperAdmin | **Conforme** |

---

## 6. Méthodes de paiement configurées

| Méthode | Contrôleur | Mode |
|---|---|---|
| CinetPay | `WebhookPaymentController` | Webhook automatique |
| Orange Money / MTN / Wave | `MobileMoneyController` | Webhook opérateur |
| Virement bancaire | `PaymentGatewayController::uploadProof()` | Manuel (validation SuperAdmin) |
| Voucher prépayé | `PaymentGatewayController::redeemVoucher()` | Automatique (code unique) |

Configuration des méthodes activées/désactivées : `SuperAdmin::PaymentConfigController` (`payment_method_configs` table).

---

## 7. Tableau de bord SuperAdmin (MRR)

Le `SuperAdmin::DashboardController` expose :
- MRR (Monthly Recurring Revenue) calculé en temps réel
- Historique MRR via `/superadmin/mrr-history`
- Nombre de clients actifs / en trial / expirés
- Ordres de paiement en attente de validation
