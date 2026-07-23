# GUIDE DE DEPLOIEMENT — CONSTRUIRO ERP

**Date :** 2026-07-23
**Serveur cible :** VPS OVH — IP 185.98.139.38 — domaine construiro.com (HTTPS)
**CI/CD :** GitHub Actions (branche `master`)
**Fichier workflow :** `.github/workflows/deploy.yml`

---

## 1. Architecture du déploiement

```
Développeur
    |
    | git push master
    v
GitHub (dépôt)
    |
    | Déclenche GitHub Actions
    v
Runner ubuntu-latest
    |-- npm ci
    |-- npm run build (Vite → public/build/)
    |-- zip public/build/ → assets.zip
    |
    | curl POST deploy-receiver.php  (git pull VPS)
    | curl POST deploy-v2.php        (assets + env + migrations)
    v
VPS 185.98.139.38
    |-- git pull origin master
    |-- unzip assets.zip → public/build/
    |-- mise à jour .env (GROQ_KEY, MAIL_*)
    |-- php artisan migrate --force
    |-- php artisan db:seed --force (si applicable)
    |-- php artisan queue:restart
```

---

## 2. Secrets GitHub requis

| Secret | Usage |
|---|---|
| `DEPLOY_SECRET` | Clé secrète partagée entre GitHub Actions et les scripts PHP du VPS |
| `GROQ_API_KEY` | Clé API Groq pour SARA IA |
| `MAIL_HOST` | Hôte SMTP |
| `MAIL_PORT` | Port SMTP |
| `MAIL_USERNAME` | Utilisateur SMTP |
| `MAIL_PASSWORD` | Mot de passe SMTP |
| `MAIL_ENCRYPTION` | Chiffrement (tls/ssl) |
| `MAIL_FROM_ADDRESS` | Adresse expéditeur |

---

## 3. Etapes détaillées du workflow

### Etape 1 — Checkout
```yaml
uses: actions/checkout@v4
```

### Etape 2 — Setup Node.js 20 (avec cache npm)
```yaml
uses: actions/setup-node@v4
with:
  node-version: '20'
  cache: 'npm'
```

### Etape 3 — Installation dépendances npm
```bash
npm ci
```

### Etape 4 — Build Vite (React + Tailwind)
```bash
npm run build
# Sortie : public/build/ (JS + CSS minifiés, hash de contenu)
```

### Etape 5 — Archivage assets
```bash
cd public && zip -r ../assets.zip build/
```

### Etape 6 — Git pull VPS
```bash
curl -s --max-time 60 \
  --resolve construiro.com:443:185.98.139.38 \
  -X POST \
  -d "secret=$DEPLOY_SECRET" \
  https://construiro.com/deploy-receiver.php
```
Le script `deploy-receiver.php` sur le VPS exécute `git pull origin master`.

### Etape 7 — Déploiement complet (assets + env + migrations)
```bash
curl -s --max-time 180 \
  --resolve construiro.com:443:185.98.139.38 \
  -X POST \
  -F "secret=$DEPLOY_SECRET" \
  -F "groq_key=$GROQ_API_KEY" \
  -F "mail_*=..." \
  -F "assets=@assets.zip" \
  https://construiro.com/deploy-v2.php
```

Le script `deploy-v2.php` sur le VPS :
1. Vérifie le secret
2. Décompresse `assets.zip` → `public/build/`
3. Met à jour `.env` (GROQ_KEY, MAIL_*)
4. Exécute `php artisan migrate --force`
5. Redémarre le worker queue (`php artisan queue:restart`)
6. Retourne `DEPLOY_OK` en cas de succès

### Etape 8 — Vérification
Le workflow vérifie que la réponse contient `DEPLOY_OK`. En cas d'échec : `exit 1` → build rouge.

### Etape 9 — Logs VPS (toujours exécuté)
```bash
curl https://construiro.com/deploy-log.php?secret=$DEPLOY_SECRET | tail -40
```

---

## 4. Déploiement manuel (hors CI/CD)

En cas de besoin de déploiement direct sur le VPS :

```bash
# 1. Build local
npm ci && npm run build

# 2. Upload assets (exemple via scp)
scp -r public/build/ user@185.98.139.38:/var/www/construiro/public/

# 3. Sur le VPS
ssh user@185.98.139.38
cd /var/www/construiro
git pull origin master
php artisan migrate --force
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan queue:restart
```

---

## 5. Variables d'environnement production (.env)

| Variable | Valeur type |
|---|---|
| `APP_ENV` | `production` |
| `APP_DEBUG` | `false` |
| `APP_URL` | `https://construiro.com` |
| `DB_CONNECTION` | `mysql` |
| `DB_HOST` | localhost (VPS local) |
| `QUEUE_CONNECTION` | `database` |
| `MAIL_MAILER` | `smtp` |
| `GROQ_API_KEY` | Injecté par GitHub Actions |
| `SESSION_SECURE_COOKIE` | `true` |

---

## 6. Post-déploiement checklist

- [ ] `php artisan migrate:status` — toutes les migrations marquées `Ran`
- [ ] Accès `https://construiro.com` — page landing s'affiche
- [ ] Connexion admin — dashboard accessible
- [ ] Worker queue actif — `php artisan queue:monitor`
- [ ] Logs Laravel — `storage/logs/laravel.log` sans erreur critique
