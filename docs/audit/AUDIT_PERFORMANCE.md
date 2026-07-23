# AUDIT PERFORMANCE — CONSTRUIRO ERP

**Date :** 2026-07-23
**Environnement audité :** Production — VPS OVH 185.98.139.38

---

## 1. Problème N+1 — Eager loading

Les problèmes N+1 ont été corrigés par l'utilisation systématique de `with()` (eager loading Eloquent) dans les contrôleurs.

| Module | Relation eager-loadée | Méthode |
|---|---|---|
| Projets | sites, client, tasks | `with(['sites', 'client'])` |
| Devis | client, lines | `with(['client', 'lines'])` |
| Factures | client, lines, payments | `with(['client', 'lines'])` |
| Achats | supplier, lines | `with(['supplier', 'lines'])` |
| Employés | attendances, payslips | `with(['company'])` |
| Équipements | maintenanceRecords | `with(['maintenanceRecords'])` |
| BOQ | lines, project | `with(['lines', 'project'])` |
| Contrats | client, signatures | `with(['client'])` |
| Audit logs | user, company | `with(['user'])` |

**Résultat :** nombre de requêtes par page réduit de N+1 à 2-3 requêtes constantes.

---

## 2. Index de performance multi-tenant

Migration dédiée : `2026_07_13_000001_add_performance_indexes.php`

**38 tables indexées** sur `company_id`. Index composites sur les colonnes à haute cardinalité :

| Table | Index |
|---|---|
| `projects` | `(company_id)`, `(company_id, status)` |
| `quotes` | `(company_id)`, `(company_id, status)` |
| `invoices` | `(company_id)`, `(company_id, status)` |
| `contracts` | `(company_id)`, `(company_id, status)` |
| `purchase_orders` | `(company_id)`, `(company_id, status)` |
| `employees` | `(company_id)`, `(company_id, status)` |
| `tasks` | `(company_id)`, `(company_id, project_id)`, `(company_id, status)` |
| `attendances` | `(company_id)`, `(company_id, employee_id)` |
| `payslips` | `(company_id)`, `(company_id, employee_id)` |
| `stock_movements` | `(company_id)`, `(company_id, material_id)` |
| `audit_logs` | `(company_id, created_at)`, `(model_type, model_id)`, `(user_id, action)` |
| Autres 27 tables | `(company_id)` |

**Impact :** les requêtes filtrées par `company_id` utilisent l'index au lieu d'un full-table-scan, quel que soit le nombre de tenants.

---

## 3. Pagination Laravel

Toutes les listes utilisent `->paginate(N)` (jamais `->get()` sans limite sur les tables volumineuses).

| Module | Taille de page par défaut |
|---|---|
| Projets | 15 |
| Factures | 15 |
| Devis | 15 |
| Employés | 15 |
| Audit logs | 20 |
| Autres modules | 15 |

---

## 4. File d'attente (Queue) — emails asynchrones

- **Driver :** `database` (table `jobs`)
- **Worker :** démarré via `php artisan queue:work` sur le VPS
- **Redémarrage post-déploiement :** `php artisan queue:restart` (déclenché par `deploy-v2.php`)

Emails concernés par la queue :
- Email de bienvenue à l'inscription
- Envoi de facture au client
- Notifications d'alertes (stock, expiration abonnement)
- Reset password

**Impact :** aucune requête HTTP ne bloque sur l'envoi email — temps de réponse des actions indépendant du SMTP.

---

## 5. Cache applicatif

| Donnée cachée | Durée | Implémentation |
|---|---|---|
| Plans d'abonnement (landing) | 600 s | `Cache::remember('landing:plans', 600, ...)` |
| FAQs landing (par locale) | 600 s | `Cache::remember("landing:faqs:{$locale}", 600, ...)` |
| Témoignages landing (par locale) | 600 s | `Cache::remember("landing:temoignages:{$locale}", 600, ...)` |

**Driver cache :** `file` (production). Évolution possible vers Redis en V1.1.

---

## 6. OPcache PHP

OPcache activé sur le VPS (configuration PHP standard OVH) :
- Bytecode PHP compilé mis en cache mémoire
- Rechargement automatique si `opcache.validate_timestamps=1`
- Post-déploiement : `deploy-v2.php` déclenche un reset OPcache via `opcache_reset()`

---

## 7. Optimisations Vite (front-end)

| Optimisation | Détail |
|---|---|
| Tree-shaking | Vite supprime le code mort React |
| Code splitting | Chunks par route Inertia |
| Hash de contenu | `public/build/manifest.json` — cache navigateur permanent |
| Minification | Terser (JS) + cssnano (CSS) |
| Tailwind PurgeCSS | Uniquement les classes utilisées dans les composants |

---

## 8. Recommandations pour V1.1

| Action | Impact attendu | Priorité |
|---|---|---|
| Redis pour cache + sessions + queue | Performances +30%, scalabilité horizontale | Haute |
| `php artisan route:cache` en prod | Chargement routes -50% | Moyenne |
| `php artisan config:cache` en prod | Chargement config -40% | Moyenne |
| Lazy loading images (front) | LCP amélioré | Faible |
| CDN pour assets statiques | Latence Afrique réduite | Haute |
