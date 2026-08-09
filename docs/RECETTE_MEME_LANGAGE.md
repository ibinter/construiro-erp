# Fiche de recette — « Test du même langage »

**Solution :** CONSTRUIRO ERP · **Cahier :** IBIG-LICENCE-UNIVERSEL v1.1 §12.9 · **Version fiche :** 1.0

## Objet

Vérifier qu'**aucune surface du produit ne contredit une autre** sur les règles de licence.
On pose les **10 questions** ci-dessous à **6 canaux** ; les 6 réponses doivent donner **les mêmes chiffres**.

> **Une seule divergence = porte ROUGE : la solution n'est pas publiable.**

Les 6 canaux : **① Page de vente** · **② Guide utilisateur** · **③ Application** (bannières/écrans) ·
**④ SARA** · **⑤ Console SuperAdmin** · **⑥ Équipe support**.

Source unique de vérité des valeurs : `licence.config.json` (essai 30 j, grâce 7 j, rétention 90 j,
Découverte = 1 chantier, prolongation 15 j × 1).

---

## Réponses canoniques attendues (CONSTRUIRO)

| # | Question | Réponse canonique attendue |
|---|----------|----------------------------|
| Q1 | Combien de temps dure l'essai ? | **30 jours** (sur la formule **Pro** complète). |
| Q2 | Faut-il une carte bancaire pour essayer ? | **Non** — sans carte bancaire, sans engagement. |
| Q3 | Que se passe-t-il exactement à la fin de l'essai ? | Bascule **automatique** en **Découverte**, **aucune donnée supprimée** ; l'usage au-delà de 1 chantier passe en **lecture seule**. |
| Q4 | Combien de chantiers au palier Découverte ? | **1 chantier**. |
| Q5 | Le palier Découverte expire-t-il un jour ? | **Non** — gratuit **à vie**. |
| Q6 | Peut-on exporter ses données au palier Découverte ? | **Non** — l'export (CSV/Excel/PDF) est réservé aux formules payantes et à l'essai. |
| Q7 | Combien de temps mes données sont-elles conservées après expiration ? | **90 jours** (lecture seule), puis purge après **2 avertissements**. |
| Q8 | Existe-t-il une licence à vie ou perpétuelle ? | **Non** — aucune licence perpétuelle ; toute clé a une date de fin (hors DEMO/Découverte). |
| Q9 | L'essai peut-il être prolongé, et combien de fois ? | **15 jours maximum, une seule fois**, accordée manuellement (prise de contact commerciale). |
| Q10 | Comment retirer le filigrane des documents ? | En **passant à une formule payante** : le filigrane est retiré **dès le premier paiement**. |

---

## Grille de validation (à cocher lors de la recette)

Pour chaque question, consigner ✅ (conforme) / ❌ (divergent) par canaux.
Toute case ❌ → noter la divergence exacte et **bloquer la publication** jusqu'à correction.

| # | ① Vente | ② Guide | ③ App | ④ SARA | ⑤ SuperAdmin | ⑥ Support |
|---|:---:|:---:|:---:|:---:|:---:|:---:|
| Q1 |  |  |  |  |  |  |
| Q2 |  |  |  |  |  |  |
| Q3 |  |  |  |  |  |  |
| Q4 |  |  |  |  |  |  |
| Q5 |  |  |  |  |  |  |
| Q6 |  |  |  |  |  |  |
| Q7 |  |  |  |  |  |  |
| Q8 |  |  |  |  |  |  |
| Q9 |  |  |  |  |  |  |
| Q10 |  |  |  |  |  |  |

**Où vérifier chaque canal :**
- **① Page de vente** : `construiro.com` (hero, cartes tarifs, FAQ, CTA, mentions bas de page).
- **② Guide utilisateur** : `/guide/fr` (chapitres licences).
- **③ Application** : bannières d'état in-app (`LicenseBanner`), page abonnement, écrans de blocage au plafond.
- **④ SARA** : poser les 10 questions à l'assistant sur la landing.
- **⑤ Console SuperAdmin** : fiche client (états, quotas), page Abonnements/Plans.
- **⑥ Équipe support** : script de réponse / centre d'aide (`/aide`, FAQ interne).

---

## Garde-fous automatisés déjà en place (complètent la recette manuelle)

- `tests/Feature/LicenceGlossaireTest.php` : aucune durée d'essai périmée (14) ni terme banni dans les contenus.
- `tests/Feature/LicenseFoundationTest.php` : source unique, bascule essai→Découverte, plafond chantier.
- `licence.config.json` : valeurs injectées partout (SARA, e-mails, seeder, inscription) — jamais en dur.

## Contrôles en base (cahier §12.8)

```sql
-- Aucune licence sans date de fin hors DEMO/Découverte
SELECT id, company_id, status FROM subscriptions
WHERE ends_at IS NULL AND trial_ends_at IS NULL AND status NOT IN ('demo','free');

-- Aucune durée d'essai non conforme (doit être 30)
SELECT id, DATEDIFF(trial_ends_at, starts_at) AS duree FROM subscriptions
WHERE status = 'trial' HAVING duree NOT IN (30);
```

---

## Résultat de la recette

| Champ | Valeur |
|-------|--------|
| Date | ____________ |
| Recetteur | ____________ |
| Porte finale | ⬜ VERTE (publiable) · ⬜ ROUGE (divergence(s) à corriger) |
| Divergences relevées | ____________ |
