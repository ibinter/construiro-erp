# AUDIT PERFORMANCE — CONSTRUIRO ERP
Date : 2026-07-26

## Index DB ajoutés
- projects: (company_id, status)
- invoices: (company_id, status)
- audit_logs: (company_id, created_at)
- analytics_events: (event_type, occurred_at) — déjà dans migration §33

## N+1 corrigés
- ProjectController::index() — with('manager:id,name') + withCount('sites') déjà en place
- ProjectController::show() — load(['manager:id,name', 'sites']) déjà en place
- InvoiceController::index() — with(['client:id,name', 'project:id,name']) déjà en place
- EmployeeController::index() — with('site:id,name') + withCount('attendances') déjà en place
- QuoteController::index() — with('project:id,name') en place ; client_name est colonne directe (pas de relation)

## Middlewares cache
- SetCacheHeaders — headers HTTP cache stratégiques (web group)
- CachePublicResponse — cache Redis/File landing page visiteurs (à appliquer sur les routes publiques au besoin)

## Recommandations futures
- Activer Laravel Octane (Swoole/RoadRunner) pour VPS 185.98.139.38
- Configurer Redis comme driver cache en production
- Activer query caching sur les rapports lourds
