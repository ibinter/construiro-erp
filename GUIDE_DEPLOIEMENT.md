# GUIDE DE DÉPLOIEMENT — CONSTRUIRO ERP
Version : 1.5.0 | Date : 2026-07-26
VPS : 185.98.139.38 | Domaine : construiro.com

---

## Architecture de déploiement

```
GitHub (master)
    │
    ▼
GitHub Actions CI/CD
    ├── npm run build (Vite + React 18)
    └── curl deploy-v2.php (VPS 185.98.139.38)
            │
            ▼
        VPS Ubuntu
        ├── Laravel 12 + PHP 8.3
        ├── MySQL 8.0
        ├── Nginx + SSL (Let's Encrypt)
        └── Redis (queues + cache)
```

---

## CI/CD GitHub Actions

### Déclencheur
- Push sur la branche `master`

### Étapes du pipeline
1. Checkout du code
2. Installation des dépendances Node (`npm ci`)
3. Build des assets (`npm run build`) → génère `public/build/`
4. Déploiement via `curl` vers `deploy-v2.php` sur le VPS
5. Le script deploy-v2.php exécute : `git pull`, `composer install --no-dev`, migrations si besoin

---

## Variables d'environnement — GitHub Secrets requis

| Secret | Usage |
|--------|-------|
| `GROQ_API_KEY` | API SARA IA (fournisseur Groq) |
| `DEPLOY_SECRET` | Clé secrète deploy-v2.php |
| `APP_KEY` | Clé de chiffrement Laravel |

### Variables .env VPS supplémentaires (à configurer manuellement)

```env
APP_NAME="CONSTRUIRO ERP"
APP_ENV=production
APP_DEBUG=false
APP_URL=https://construiro.com
APP_VERSION=1.5.0

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=construiro_prod
DB_USERNAME=construiro
DB_PASSWORD=<mot_de_passe_fort>

CACHE_DRIVER=redis
QUEUE_CONNECTION=redis
SESSION_DRIVER=redis

REDIS_HOST=127.0.0.1
REDIS_PORT=6379

MAIL_MAILER=smtp
MAIL_HOST=<smtp_host>
MAIL_PORT=587
MAIL_USERNAME=<smtp_user>
MAIL_PASSWORD=<smtp_password>
MAIL_FROM_ADDRESS=noreply@construiro.com
MAIL_FROM_NAME="CONSTRUIRO ERP"

GROQ_API_KEY=<groq_key>
ANTHROPIC_API_KEY=<anthropic_key_optionnel>

SANCTUM_STATEFUL_DOMAINS=construiro.com
```

---

## Commandes de diagnostic post-déploiement

Via `deploy-v2.php` avec le paramètre `?diag=<action>&secret=<DEPLOY_SECRET>` :

| Commande | Action |
|----------|--------|
| `?diag=migrate` | `php artisan migrate --force` |
| `?diag=seed-kb` | Seed base de connaissances SARA |
| `?diag=seed-payment` | Seed numéros Mobile Money IBIG SARL |
| `?diag=seed-faq` | Seed 100 FAQ internes |
| `?diag=sanctum-setup` | Publier config Sanctum + migrate |
| `?diag=cache-clear` | `php artisan cache:clear config:cache route:cache view:cache` |
| `?diag=queue-restart` | `php artisan queue:restart` |

---

## Checklist déploiement initial (première mise en production)

### Serveur
- [ ] Ubuntu 22.04 LTS + PHP 8.3 + Composer 2 + Node 20 + npm
- [ ] MySQL 8.0 + Redis 7
- [ ] Nginx configuré avec virtualhost construiro.com
- [ ] SSL Let's Encrypt (`certbot --nginx -d construiro.com`)
- [ ] Dossier `/var/www/construiro` + permissions www-data

### Application
- [ ] `git clone https://github.com/ibigsarl/construiro-erp.git`
- [ ] `composer install --no-dev --optimize-autoloader`
- [ ] `npm ci && npm run build`
- [ ] Copier `.env.example` → `.env` et remplir les variables
- [ ] `php artisan key:generate`
- [ ] `php artisan migrate --seed` (seeder complet)
- [ ] `php artisan storage:link`
- [ ] `php artisan config:cache && php artisan route:cache && php artisan view:cache`

### Queue & Scheduler
- [ ] Configurer Supervisor pour `php artisan queue:work --daemon`
- [ ] Ajouter dans crontab : `* * * * * php /var/www/construiro/artisan schedule:run`

### Vérifications post-déploiement
- [ ] Connexion DB fonctionnelle (`/superadmin/health`)
- [ ] Envoi email de test (SuperAdmin > SMTP > Tester)
- [ ] Connexion compte superadmin IBIG Soft
- [ ] Landing page accessible (https://construiro.com)
- [ ] Inscription + onboarding utilisateur test
- [ ] API v1 : `curl -H "Authorization: Bearer <token>" https://construiro.com/api/v1/projects`
- [ ] PWA installable (Chrome > "Ajouter à l'écran d'accueil")
- [ ] SSL valide (renouvellement auto certbot)

---

## Checklist déploiement mise à jour (releases suivantes)

- [ ] Vérifier diff CHANGELOG.md avant push
- [ ] Push sur `master` → CI/CD automatique
- [ ] Surveiller GitHub Actions (build + deploy)
- [ ] Vérifier `/superadmin/health` après déploiement
- [ ] Publier changelog depuis SuperAdmin > Changelogs > Publier
- [ ] Notifier les clients (email auto + notification in-app)

---

## Procédure de rollback

### Rollback rapide via Git
```bash
git revert HEAD~1
git push origin master
# CI/CD redéploie automatiquement la version précédente
```

### Rollback manuel (si CI/CD bloqué)
```bash
ssh deploy@185.98.139.38
cd /var/www/construiro
git log --oneline -5       # identifier le commit cible
git checkout <commit_hash>
composer install --no-dev
php artisan migrate:rollback --step=1  # si migration à annuler
php artisan config:cache && php artisan route:cache
sudo systemctl reload nginx
sudo supervisorctl restart construiro-worker
```

---

## Monitoring & alertes

| Élément | URL / Commande |
|---------|---------------|
| Health check | https://construiro.com/superadmin/health |
| Logs Laravel | `storage/logs/laravel.log` |
| Logs Nginx | `/var/log/nginx/construiro.access.log` |
| Jobs en attente | `php artisan queue:monitor` |
| Espace disque | `df -h /var/www/construiro` |

---

## Sauvegarde automatique (SuperAdmin)

- Sauvegardes manuelles : `/superadmin/backups` > Déclencher
- Stockage local : `storage/app/backups/`
- Recommandation : configurer rclone vers S3/Backblaze pour backup hors-site

---

## Ports & sécurité réseau

| Port | Service | Statut |
|------|---------|--------|
| 22 | SSH | Restreindre aux IPs IBIG |
| 80 | HTTP → redirect HTTPS | Ouvert |
| 443 | HTTPS (Nginx) | Ouvert |
| 3306 | MySQL | Localhost uniquement |
| 6379 | Redis | Localhost uniquement |
