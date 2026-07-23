# Guide des tâches CRON — CONSTRUIRO ERP

## 1. Configuration du cron serveur

Ajouter la ligne suivante dans la crontab du serveur (`crontab -e`) :

```bash
* * * * * php /chemin/vers/votre/projet/artisan schedule:run >> /dev/null 2>&1
```

Exemple sur un hébergement mutualisé LWS avec le chemin réel du projet :

```bash
* * * * * php /home/ibigsoft/www/artisan schedule:run >> /dev/null 2>&1
```

> Cette commande s'exécute chaque minute et délègue l'orchestration à Laravel, qui n'exécutera que les tâches dont l'heure est venue.

---

## 2. Tâches planifiées CONSTRUIRO

| Signature artisan | Fréquence | Heure | Description |
|---|---|---|---|
| `construiro:trial-reminders` | Quotidienne | 08h00 | Rappels expiration période d'essai (J-7, J-3, J-1, J+1) |
| `construiro:subscription-reminders` | Quotidienne | 08h00 | Rappels expiration abonnement payant |
| `construiro:expire-payment-orders` | Toutes les heures | — | Expire les ordres de paiement de plus de 48 h |
| `construiro:backup --type=database` | Quotidienne | 02h00 | Sauvegarde base de données (dump SQL) |
| `construiro:backup --type=full` | Hebdomadaire | Dimanche 03h00 | Sauvegarde complète fichiers + BDD |

---

## 3. Vérifier les tâches planifiées

```bash
php artisan schedule:list
```

Pour tester une tâche immédiatement (sans attendre l'heure planifiée) :

```bash
php artisan schedule:run --verbose
```

Lancer une commande manuellement :

```bash
php artisan construiro:trial-reminders
php artisan construiro:subscription-reminders
php artisan construiro:expire-payment-orders
php artisan construiro:backup --type=database
php artisan construiro:backup --type=full
```

---

## 4. Worker de queue (emails asynchrones)

Les emails sont envoyés via la queue Laravel. Un worker doit être actif en permanence.

### Démarrer le worker en arrière-plan

```bash
php artisan queue:work --sleep=3 --tries=3 --timeout=60 --daemon \
  > storage/logs/queue-worker.log 2>&1 &
```

### Vérifier que le worker tourne

```bash
ps aux | grep "queue:work"
```

### Surveiller les jobs via le script de déploiement

| URL diagnostique | Action |
|---|---|
| `deploy-v2.php?secret=XXX&diag=worker-logs` | Affiche les 50 dernières lignes du log worker |
| `deploy-v2.php?secret=XXX&diag=restart-worker` | Redémarre le worker (après un déploiement) |
| `deploy-v2.php?secret=XXX&diag=start-worker` | Démarre un worker si aucun n'est actif |
| `deploy-v2.php?secret=XXX&diag=run-jobs` | Traite les jobs en attente (passe unique, 60 s) |
| `deploy-v2.php?secret=XXX&diag=check-mail` | Vérifie la config SMTP et le nombre de jobs en attente |

### Relancer après un déploiement

Le script GitHub Actions appelle automatiquement `?diag=restart-worker` à la fin du déploiement. En cas de problème manuel :

```bash
# Envoyer le signal de redémarrage au worker en cours
php artisan queue:restart
```

---

## 5. Superviser avec un process manager (production recommandée)

Pour une production robuste, remplacer le `--daemon` par **Supervisor** :

```ini
[program:construiro-worker]
command=php /home/ibigsoft/www/artisan queue:work --sleep=3 --tries=3 --timeout=60
autostart=true
autorestart=true
stderr_logfile=/var/log/construiro-worker.err.log
stdout_logfile=/var/log/construiro-worker.out.log
```

```bash
supervisorctl reread
supervisorctl update
supervisorctl start construiro-worker
```

---

## 6. Jobs échoués

```bash
# Lister les jobs échoués
php artisan queue:failed

# Relancer tous les jobs échoués
php artisan queue:retry all

# Supprimer les jobs échoués
php artisan queue:flush
```
