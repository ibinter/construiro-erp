# Guide de la console SuperAdmin IBIG Soft — CONSTRUIRO ERP

## 1. Accès

La console SuperAdmin est réservée au rôle `ibig_superadmin`. Aucun utilisateur client ne peut y accéder.

URL de connexion :

```
https://construiro.com/login
```

Se connecter avec le compte portant le rôle `ibig_superadmin`, puis naviguer vers :

```
https://construiro.com/superadmin
```

---

## 2. Créer un compte SuperAdmin

### Via le script de déploiement (recommandé)

Assigner le rôle `ibig_superadmin` à un utilisateur existant :

```
https://construiro.com/deploy-v2.php?secret=XXX&diag=make-superadmin&email=admin@ibigsoft.com
```

### Via artisan (accès SSH)

```bash
php artisan tinker --no-interaction --execute="
  \$u = App\Models\User::where('email','admin@ibigsoft.com')->firstOrFail();
  \$u->syncRoles(['ibig_superadmin']);
  echo 'Role assigné à '.\$u->email;
"
```

---

## 3. Fonctionnalités disponibles

### Gestion des clients

| Écran | Description |
|---|---|
| Clients | Liste toutes les entreprises clientes, statut abonnement, quota utilisateurs |
| Licences | Voir/modifier le plan de chaque client, prolonger un essai |
| Prospects | Contacts issus du formulaire de la landing page |
| Offres personnalisées | Créer des devis sur mesure pour les grands comptes |

### Paiements

| Écran | Description |
|---|---|
| Méthodes de paiement | Activer/désactiver et configurer les 11 familles de paiement |
| Ordres de paiement | Suivi de toutes les transactions (en attente, réussies, expirées) |
| Vouchers | Générer des lots de codes prépayés, exporter en CSV |

### IA — SARA

| Écran | Description |
|---|---|
| Configuration IA | Choisir le fournisseur, la clé API, le modèle, les quotas |
| Journal IA | Historique des appels SARA par entreprise et par utilisateur |

### Landing page

| Écran | Description |
|---|---|
| Contenu landing | Modifier les textes, FAQ, témoignages, fonctionnalités affichés |
| Changelog | Publier les notes de version |
| Academy | Gérer les formations et tutoriels |

### Infrastructure

| Écran | Description |
|---|---|
| Sauvegardes | Déclencher / télécharger les sauvegardes BDD et fichiers |
| Configuration SMTP | Modifier les paramètres d'envoi d'emails |
| Templates emails | Éditer les mails transactionnels (trial, abonnement, bienvenue…) |
| Sessions de support | Voir les sessions de support actives entre clients et l'équipe IBIG Soft |

---

## 4. Diagnostics deploy-v2.php

Le script `public/deploy-v2.php` expose des diagnostics accessibles via GET (authentifié par le paramètre `secret`).

> Secret de production : défini dans le script (`construiro_deploy_2026` par défaut — à changer en production).

| Paramètre `diag` | Description |
|---|---|
| `make-superadmin&email=X` | Assigne le rôle `ibig_superadmin` à l'email X |
| `migrate` | Exécute `php artisan migrate --force` |
| `status` | Affiche `php artisan migrate:status` |
| `git` | Affiche les 5 derniers commits |
| `seed-payment` | Initialise les 11 méthodes de paiement |
| `seed-demo` | Charge les données de démonstration |
| `seed-permissions` | Recharge les rôles et permissions |
| `seed-faq` | Initialise les 190 entrées FAQ |
| `laravel-log` | Affiche les 100 dernières lignes du log Laravel |
| `laravel-error` | Affiche la dernière entrée ERROR du log |
| `check-mail` | Vérifie la config SMTP et les jobs en attente |
| `send-test&to=X` | Envoie un email de test à l'adresse X |
| `fix-mail` | Écrit la config SMTP dans le `.env` |
| `run-jobs` | Traite les jobs de queue en attente (60 s) |
| `start-worker` | Démarre le worker de queue en arrière-plan |
| `restart-worker` | Redémarre le worker (après déploiement) |
| `worker-logs` | Affiche les 50 dernières lignes du log worker |
| `fix-drivers` | Passe `SESSION_DRIVER` et `CACHE_STORE` à `file` |
| `optimize` | Vide et recrée les caches Laravel |
| `reset-opcache` | Vide l'OPcache et recrée les caches |
| `perf` | Diagnostic performance (OPcache, assets Vite, caches) |
| `artisan-about` | Affiche `php artisan about` |
| `php-error` | Détecte les erreurs PHP au bootstrap |

---

## 5. Bonnes pratiques

- Ne jamais partager l'URL `deploy-v2.php` avec des tiers.
- Changer le `secret` par défaut avant la mise en production.
- Toute modification sensible (rôles, licences, SMTP) est tracée dans les logs Laravel.
- Les sauvegardes automatiques tournent à 02h00 (BDD) et dimanche 03h00 (complète) — vérifier leur bon déroulement via **SuperAdmin → Sauvegardes**.
