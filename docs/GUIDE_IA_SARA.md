# Guide de configuration SARA (Assistant IA) — CONSTRUIRO ERP

## 1. Présentation

SARA (Smart Assistant for Resource & Administration) est l'assistant IA intégré à CONSTRUIRO ERP. Elle est disponible :

- Sur la **landing page publique** (chatbot de préqualification)
- Dans l'**interface interne** de chaque entreprise cliente (assistant métier BTP)

SARA est multi-fournisseur : elle peut être basculée d'un LLM à un autre sans redémarrage.

---

## 2. Accès à la configuration

**SuperAdmin → Configuration IA**

Géré par `App\Http\Controllers\SuperAdmin\AiSettingController`.

---

## 3. Fournisseurs disponibles

| Fournisseur | Constante | Modèle par défaut | Coût |
|---|---|---|---|
| **Groq** (défaut) | `groq` | `llama-3.1-8b-instant` | Gratuit (quota généreux) |
| OpenAI | `openai` | `gpt-4o-mini` | Payant |
| Anthropic | `anthropic` | `claude-haiku-4-5-20251001` | Payant |
| Google Gemini | `google` | `gemini-1.5-flash` | Gratuit limité |
| Mistral | `mistral` | `mistral-small-latest` | Payant |
| Grok (xAI) | `grok` | `grok-2-latest` | Payant |

---

## 4. Configuration de la clé API Groq (fournisseur par défaut)

### Obtenir une clé Groq

1. Créer un compte sur [https://console.groq.com](https://console.groq.com)
2. **API Keys → Create API Key**
3. Copier la clé (commence par `gsk_...`)

### Déclarer la clé en production

**Méthode 1 — Variable d'environnement (recommandée)**

```bash
# Dans le .env du VPS
GROQ_API_KEY=gsk_votre_cle_groq
```

Si vous utilisez GitHub Actions pour le déploiement, stocker la clé comme **GitHub Secret** (`GROQ_API_KEY`) et l'injecter lors du déploiement.

**Méthode 2 — Via le SuperAdmin (sans accès SSH)**

1. **SuperAdmin → Configuration IA → Éditer**
2. Renseigner la clé API dans le champ prévu
3. Enregistrer — la clé est stockée chiffrée en BDD

La résolution de la clé suit cet ordre de priorité :
1. Champ `api_key` du modèle `AiSetting` (BDD)
2. Variable `GROQ_API_KEY` dans le `.env`
3. Valeur dans `config/services.php`

---

## 5. Basculer de fournisseur

### Via le SuperAdmin

1. **SuperAdmin → Configuration IA → Éditer**
2. Modifier le champ **Fournisseur** (sélecteur)
3. Renseigner la clé API du nouveau fournisseur
4. Sélectionner le modèle souhaité
5. Enregistrer — l'effet est immédiat, sans redémarrage

### Via tinker (accès SSH)

```bash
php artisan tinker --no-interaction --execute="
  \$s = App\Models\AiSetting::current();
  \$s->provider = 'openai';
  \$s->model    = 'gpt-4o-mini';
  \$s->api_key  = 'sk-...';
  \$s->save();
  echo 'Fournisseur changé : '.\$s->provider;
"
```

---

## 6. Paramètres configurables

| Paramètre | Description | Valeur par défaut |
|---|---|---|
| `provider` | Fournisseur actif | `groq` |
| `model` | Modèle LLM | Dépend du fournisseur |
| `max_tokens` | Longueur maximale de la réponse | 1024 |
| `temperature` | Créativité (0.0 à 1.0) | 0.7 |
| `sara_enabled` | Activer/désactiver SARA globalement | `true` |
| `daily_limit_per_company` | Quota d'appels journaliers par entreprise | configurable |

---

## 7. Journal d'utilisation

**SuperAdmin → Journal IA**

Le journal enregistre chaque appel SARA :
- Entreprise (company)
- Utilisateur
- Fournisseur utilisé
- Nombre de tokens consommés
- Horodatage

Utile pour suivre la consommation et détecter les abus.

---

## 8. Quotas

Configurer `daily_limit_per_company` dans **SuperAdmin → Configuration IA** pour limiter le nombre d'appels quotidiens par entreprise. Lorsqu'une entreprise atteint son quota, SARA répond avec un message d'avertissement plutôt que d'appeler l'API.

---

## 9. Désactiver SARA

Pour désactiver SARA globalement (maintenance, dépassement de quota facturation) :

**SuperAdmin → Configuration IA → Désactiver SARA**

Ou via tinker :

```bash
php artisan tinker --no-interaction --execute="
  App\Models\AiSetting::current()->update(['sara_enabled' => false]);
  echo 'SARA désactivée.';
"
```

Lorsque `sara_enabled = false`, SARA répond : *"SARA est temporairement désactivée."*

---

## 10. Variables d'environnement optionnelles

Ces variables sont utilisées en **fallback** si aucune clé n'est configurée en BDD :

```env
# Fournisseur par défaut (obligatoire si pas de config BDD)
GROQ_API_KEY=gsk_...

# Fournisseurs alternatifs (optionnels)
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
GOOGLE_AI_API_KEY=AIza...
MISTRAL_API_KEY=...
```

En production, **préférer la configuration via le SuperAdmin** (BDD chiffrée) plutôt que le `.env`, afin de pouvoir basculer de fournisseur sans redéploiement.
