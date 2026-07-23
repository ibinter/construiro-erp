# Guide du module de paiement — CONSTRUIRO ERP

## 1. Architecture

Le module de paiement repose sur la table `payment_method_configs` (modèle `PaymentMethodConfig`). Chaque ligne représente une méthode de paiement avec ses clés API stockées chiffrées en base de données. Aucune clé API sensible ne doit figurer en clair dans le `.env` en production.

---

## 2. Les 11 familles de méthodes configurables

| Constante | Type | Exemples |
|---|---|---|
| `mobile_money` | Mobile Money | CinetPay Mobile, Orange Money, MTN MoMo, Wave |
| `bank_transfer_national` | Virement bancaire national | Banques locales UEMOA |
| `bank_transfer_international` | Virement international | SWIFT, SEPA |
| `electronic` | Paiement électronique | CinetPay carte, PayDunya |
| `money_transfer` | Transfert d'argent | Western Union, MoneyGram |
| `cash_agency` | Agence cash | Point Xpress, Wave Agency |
| `check` | Chèque | Chèque bancaire |
| `crypto` | Crypto-monnaie | USDT, BTC |
| `voucher` | Voucher prépayé | Codes générés depuis SuperAdmin |
| `cash_on_delivery` | Paiement à la livraison | Espèces à réception |
| `wire_transfer` | Virement wire | International haut montant |

---

## 3. Activer / désactiver une méthode de paiement

1. Se connecter en tant que `ibig_superadmin`
2. Naviguer vers **SuperAdmin → Méthodes de paiement**
3. Cliquer sur le toggle **Actif/Inactif** de la méthode souhaitée
4. La modification est immédiate (pas de redémarrage requis)

---

## 4. Configurer les clés API

Les clés API sont stockées chiffrées dans la colonne `config` (JSON) de `payment_method_configs`.

1. **SuperAdmin → Méthodes de paiement → Éditer**
2. Renseigner les champs propres à chaque fournisseur
3. Enregistrer — les valeurs sont masquées à l'affichage après sauvegarde

### Initialiser les 11 méthodes (première installation)

```bash
php artisan db:seed --class="Database\\Seeders\\PaymentMethodSeeder" --force
```

Ou via le script de déploiement :

```
https://construiro.com/deploy-v2.php?secret=XXX&diag=seed-payment
```

---

## 5. Configuration spécifique : CinetPay

CinetPay est la passerelle principale pour la Côte d'Ivoire et la zone CEMAC.

Champs à renseigner dans **SuperAdmin → Méthodes de paiement → CinetPay** :

| Champ | Variable | Description |
|---|---|---|
| API Key | `cinetpay_api_key` | Clé API fournie par CinetPay |
| Site ID | `cinetpay_site_id` | Identifiant du site marchand |
| Secret | `cinetpay_secret` | Clé secrète pour la vérification HMAC des webhooks |

Webhook CinetPay à déclarer dans votre tableau de bord CinetPay :

```
https://construiro.com/api/payment/webhook/cinetpay
```

---

## 6. Configuration spécifique : Orange Money CI

| Champ | Variable `.env` (dev) | Description |
|---|---|---|
| Merchant Key | `ORANGE_MONEY_MERCHANT_KEY` | Clé marchande |
| Login | `ORANGE_MONEY_LOGIN` | Identifiant API |
| PIN | `ORANGE_MONEY_PIN` | Code PIN marchand |
| Webhook Secret | `ORANGE_MONEY_WEBHOOK_SECRET` | Secret de vérification webhook |
| Notification URL | `ORANGE_MONEY_NOTIF_URL` | URL de callback |
| Return URL | `ORANGE_MONEY_RETURN_URL` | URL de retour client |

---

## 7. Configuration spécifique : MTN Mobile Money

| Champ | Variable `.env` (dev) | Description |
|---|---|---|
| Environment | `MTN_MOMO_ENVIRONMENT` | `sandbox` ou `production` |
| Subscription Key | `MTN_MOMO_SUBSCRIPTION_KEY` | Clé d'abonnement API |
| API User | `MTN_MOMO_API_USER` | UUID utilisateur API |
| API Key | `MTN_MOMO_API_KEY` | Clé API |
| Callback Host | `MTN_MOMO_CALLBACK_HOST` | Domaine pour les callbacks |
| Webhook Secret | `MTN_MOMO_WEBHOOK_SECRET` | Secret de vérification |

---

## 8. Sécurité des webhooks

Toutes les passerelles vérifient l'authenticité des webhooks entrants via **HMAC** avant d'activer ou modifier un abonnement.

- Le traitement d'un paiement ne peut être déclenché **que par un webhook signé valide** ou par une **action manuelle** du SuperAdmin.
- Les clés secrètes de webhook (`*_WEBHOOK_SECRET`) ne doivent jamais être exposées côté client.
- En cas de doute sur une transaction, consulter **SuperAdmin → Ordres de paiement**.

---

## 9. Module Vouchers (codes prépayés)

Les vouchers permettent d'activer ou renouveler un abonnement sans passer par une passerelle de paiement.

### Générer un lot de vouchers

1. **SuperAdmin → Vouchers → Générer un lot**
2. Choisir : montant, nombre de codes, durée de validité, plan d'abonnement associé
3. Cliquer **Générer**

### Exporter les vouchers en CSV

1. **SuperAdmin → Vouchers**
2. Filtrer si nécessaire (lot, statut)
3. Cliquer **Exporter CSV**

Le fichier CSV contient : code, montant, statut (`unused` / `used`), date d'utilisation, entreprise ayant utilisé le code.

### Utilisation par le client

Le client saisit son code dans **Mon Abonnement → Payer avec un voucher**. Le système vérifie le code, l'expire et active immédiatement l'abonnement.

---

## 10. Suivi des paiements

| Écran | Chemin | Description |
|---|---|---|
| Ordres de paiement | SuperAdmin → Ordres de paiement | Tous les paiements initiés (en attente, réussis, expirés) |
| Historique client | SuperAdmin → Clients → [client] → Paiements | Historique par entreprise |
| Expire automatique | `construiro:expire-payment-orders` (horaire) | Passe les ordres de +48 h à `expired` |
