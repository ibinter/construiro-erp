# GUIDE DE ROLLBACK — CONSTRUIRO ERP

**Date :** 2026-07-23
**Serveur :** VPS 185.98.139.38 — construiro.com

---

## Principe général

Un rollback complet comporte trois volets :
1. **Code** — revenir à un commit stable
2. **Base de données** — annuler les migrations problématiques
3. **Assets front-end** — redéployer le build correspondant au commit stable

Effectuer ces opérations dans cet ordre pour maintenir la cohérence schema/code.

---

## 1. Identifier le commit stable

```bash
# Sur le VPS ou en local
git log --oneline -20
```

Repérer le hash du dernier commit stable avant le déploiement problématique.
Exemple : `7dd8f0a feat(erp): ...`

---

## 2. Rollback code (git revert)

**Méthode recommandée — revert (non-destructif) :**
```bash
# Crée un commit d'annulation sans réécrire l'historique
git revert <hash_du_commit_problematique> --no-edit
git push origin master
```

Cela déclenche automatiquement le pipeline CI/CD → redéploiement propre.

**Méthode alternative — reset (destructif, utiliser avec précaution) :**
```bash
# ATTENTION : réécrit l'historique — ne jamais faire sur master partagé
git reset --hard <hash_stable>
git push --force origin master
```

N'utiliser le reset forcé qu'en urgence absolue et après accord explicite de l'équipe.

---

## 3. Rollback base de données

### Annuler la dernière migration
```bash
php artisan migrate:rollback
# Annule le dernier batch de migrations
```

### Annuler plusieurs batches
```bash
php artisan migrate:rollback --step=3
# Annule les 3 derniers batches
```

### Vérifier l'état des migrations
```bash
php artisan migrate:status
# Affiche toutes les migrations et leur état (Ran / Pending)
```

### Revenir à une migration précise
```bash
# Identifier le batch cible dans la table 'migrations' en base
mysql -u root -p construiro_prod -e "SELECT * FROM migrations ORDER BY batch DESC LIMIT 20;"

# Rollback jusqu'au batch voulu
php artisan migrate:rollback --step=N
```

---

## 4. Restauration depuis sauvegarde

En cas de corruption de données, restaurer depuis une sauvegarde complète.

### Via l'interface SuperAdmin
1. Accéder à `/superadmin/backups`
2. Sélectionner la sauvegarde antérieure au problème
3. Cliquer "Restaurer"

### Via la ligne de commande (VPS)

```bash
# Lister les sauvegardes disponibles
ls -lh /var/www/construiro/storage/app/backups/

# Restaurer une sauvegarde MySQL
mysql -u root -p construiro_prod < /var/www/construiro/storage/app/backups/backup_YYYY-MM-DD.sql

# Vérifier l'intégrité
mysql -u root -p construiro_prod -e "SHOW TABLES;" | wc -l
```

### Via BackupService (artisan)
```bash
php artisan backup:restore --file=backup_YYYY-MM-DD.zip
```

---

## 5. Rollback assets front-end

Après avoir revert le code, forcer le rebuild des assets :

```bash
# En local — sur le commit stable
git checkout <hash_stable>
npm ci && npm run build

# Upload manuel vers VPS
scp -r public/build/ user@185.98.139.38:/var/www/construiro/public/
```

Ou laisser GitHub Actions redéployer automatiquement après le `git revert` pushé.

---

## 6. Post-rollback checklist

- [ ] `php artisan migrate:status` — état cohérent avec le code en place
- [ ] `https://construiro.com` accessible et fonctionnel
- [ ] Connexion admin — aucune erreur 500
- [ ] Worker queue redémarré : `php artisan queue:restart`
- [ ] Vider les caches : `php artisan cache:clear && php artisan config:clear && php artisan route:clear`
- [ ] Vérifier `storage/logs/laravel.log` — absence d'erreurs critiques
- [ ] Notifier les utilisateurs si interruption > 5 minutes

---

## 7. Contacts d'urgence

| Rôle | Contact |
|---|---|
| Développeur principal | Patrice Kouakou — patriceky@gmail.com |
| Hébergeur VPS | OVH Support — support.ovh.com |
| Fournisseur paiement | CinetPay support |
