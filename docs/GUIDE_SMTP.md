# Guide de configuration SMTP — CONSTRUIRO ERP

## 1. Configuration recommandée (LWS / hébergement mutualisé)

Variables à définir dans le `.env` du serveur :

```env
MAIL_MAILER=smtp
MAIL_HOST=mail.ibigsoft.com
MAIL_PORT=465
MAIL_USERNAME=construiro@ibigsoft.com
MAIL_PASSWORD=votre_mot_de_passe
MAIL_ENCRYPTION=ssl
MAIL_FROM_ADDRESS=construiro@ibigsoft.com
MAIL_FROM_NAME="CONSTRUIRO ERP"
QUEUE_CONNECTION=database
```

> Port 465 avec `ssl` est le standard LWS. Sur d'autres hébergeurs, vous pouvez utiliser le port 587 avec `tls`.

---

## 2. Appliquer la configuration SMTP via le script de déploiement

Pour modifier le SMTP directement sur le serveur sans accès SSH, utilisez le diag `fix-mail` :

```
https://construiro.com/deploy-v2.php?secret=XXX&diag=fix-mail
  &host=mail.ibigsoft.com
  &port=465
  &user=construiro@ibigsoft.com
  &pass=votre_mot_de_passe
  &from=construiro@ibigsoft.com
  &from_name=CONSTRUIRO+ERP
  &encryption=ssl
  &mailer=smtp
```

Ce diag écrit directement dans le `.env` et exécute `php artisan config:clear`.

---

## 3. Vérifier la configuration SMTP active

```
https://construiro.com/deploy-v2.php?secret=XXX&diag=check-mail
```

Affiche les variables MAIL actuelles (sans le mot de passe), le nombre de jobs en attente et le nombre de jobs échoués.

---

## 4. Envoyer un email de test

```
https://construiro.com/deploy-v2.php?secret=XXX&diag=send-test&to=votre@email.com
```

Retourne `EMAIL_SENT_OK` en cas de succès ou `EMAIL_ERROR: ...` avec le message d'erreur.

---

## 5. Traiter la file d'emails en attente

Si des emails sont restés bloqués en queue (worker arrêté, problème SMTP intermittent) :

```
https://construiro.com/deploy-v2.php?secret=XXX&diag=run-jobs
```

Effectue une passe unique de 60 secondes sur la queue `database`.

En ligne de commande :

```bash
# Traiter tous les jobs en attente (une passe)
php artisan queue:work --once --timeout=30 --tries=3

# Traiter en continu
php artisan queue:work --sleep=3 --tries=3 --timeout=60
```

---

## 6. Diagnostics supplémentaires

```bash
# Vérifier la config mail depuis artisan
php artisan tinker
>>> config('mail')

# Voir les dernières lignes du log Laravel
tail -100 storage/logs/laravel.log

# Compter les jobs en attente / échoués
php artisan tinker --execute="echo DB::table('jobs')->count().' en attente | '.DB::table('failed_jobs')->count().' échoués';"
```

---

## 7. Problèmes courants

| Symptôme | Cause probable | Solution |
|---|---|---|
| `EMAIL_ERROR: Connection refused` | Mauvais host ou port | Vérifier `MAIL_HOST`, `MAIL_PORT`, `MAIL_ENCRYPTION` |
| `EMAIL_ERROR: Authentication failed` | Mauvaises credentials | Vérifier `MAIL_USERNAME` / `MAIL_PASSWORD` |
| Emails dans la queue mais non envoyés | Worker arrêté | Appeler `?diag=restart-worker` ou `?diag=run-jobs` |
| Email dans spam | SPF/DKIM non configurés | Configurer les enregistrements DNS SPF et DKIM chez LWS |
| `MAIL_MAILER=log` | Config de dev actuelle | Passer `MAIL_MAILER=smtp` et reconfigurer |

---

## 8. Configuration via SuperAdmin (alternative)

Le SuperAdmin dispose d'une interface SMTP graphique :

**SuperAdmin → Configuration SMTP**

Cette interface est gérée par `App\Http\Controllers\SuperAdmin\SmtpController` et écrit dans le `.env` via la même logique que `fix-mail`.
