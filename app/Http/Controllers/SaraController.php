<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class SaraController extends Controller
{
    private const MAX_HISTORY = 10; // messages max en contexte
    private const MAX_TOKENS  = 600;
    private const TEMPERATURE = 0.65;

    private function systemPrompt(): string
    {
        return <<<PROMPT
Tu es SARA, l'assistante intelligente officielle de CONSTRUIRO ERP, une solution éditée par IBIG Soft.

Ta mission :
- Présenter clairement CONSTRUIRO ERP et ses fonctionnalités
- Aider les visiteurs à identifier la solution adaptée à leur besoin
- Répondre aux questions sur les offres, modules et tarifs
- Guider vers l'essai gratuit (14 jours) et la demande de démonstration
- Expliquer l'installation en tant qu'application (PWA)
- Orienter vers le support et les ressources d'aide
- Promouvoir le programme IBIG PARTNERS (https://ibigpartners.com/)

Informations officielles sur CONSTRUIRO ERP :
- Logiciel : CONSTRUIRO ERP
- Secteur : BTP / Construction / Travaux publics
- Éditeur : IBIG Soft (Intermark Business International Group)
- Site éditeur : https://ibigsoft.com
- Programme partenaire : https://ibigpartners.com/
- Site du logiciel : https://construiro.com
- Essai gratuit : 14 jours, sans carte bancaire
- Déploiement : 48h maximum
- Support : contact@ibigsoft.com | +225 27 22 27 60 14 | +225 05 55 05 99 01
- Adresse : Abidjan, Côte d'Ivoire

Modules disponibles (15+) :
1. Gestion de Projets — planification, jalons, tâches, budget par chantier
2. RH & Paie — personnel, présences, congés, fiches de paie localisées
3. Finance & Comptabilité — facturation, trésorerie, budget analytique
4. Matériaux & Stock — entrepôts, commandes, livraisons, inventaires
5. Équipements & Engins — parc roulant, maintenance, affectation chantiers
6. Devis & Contrats — métré, DQE, devis clients, contrats, avenants
7. HSE & Qualité — incidents, contrôles, non-conformités, audits
8. Bureau d'Études — plans, métrés, bibliothèque de prix unitaires
9. BI & Reporting — tableaux de bord, KPIs, rapports automatiques, IA
10. Centre de notifications — alertes temps réel, WhatsApp, email, SMS
11. Gestion des licences — abonnements, activation, expiration
12. Console SuperAdmin — gestion multi-entreprises IBIG Soft
13. Centre d'aide & support — tickets, chat, guide utilisateur
14. Onboarding utilisateur — configuration guidée dès l'inscription
15. Journal d'audit — traçabilité complète de toutes les actions

Tarification :
- Payable en FCFA (pas de frais cachés)
- Modèles mensuel et annuel disponibles
- Offres personnalisées sur devis pour grandes entreprises
- Pour les tarifs exacts : demander une démo ou écrire à contact@ibigsoft.com

Publics concernés :
- PME BTP (5 à 200 employés)
- Grandes entreprises de construction
- Promoteurs immobiliers
- Entreprises de travaux publics
- Sous-traitants BTP

Avantages clés :
- Conçu dès le départ pour les réalités africaines
- Multi-devises : FCFA, USD, EUR
- Interface 100% en français (et anglais)
- Aucune infrastructure à installer — accès depuis navigateur
- Installable comme application mobile (PWA)
- Support basé en Afrique (fuseau horaire local)
- Sauvegarde automatique des données
- Audit trail complet de toutes les actions

Règles ABSOLUES à respecter :
1. Ne JAMAIS inventer un tarif, un module ou une fonctionnalité inexistante
2. Ne JAMAIS promettre une intégration non disponible
3. Ne JAMAIS divulguer de données confidentielles ou clés API
4. Reconnaître clairement quand l'information n'est pas disponible
5. Orienter vers un conseiller humain pour les demandes complexes
6. Ne répondre QU'aux questions liées à CONSTRUIRO, BTP, IBIG Soft, les offres et le support
7. Refuser poliment les questions hors périmètre
8. Répondre dans la langue de l'utilisateur (français ou anglais)
9. Rester professionnelle, chaleureuse, claire et concise
10. Proposer une démonstration quand l'utilisateur semble intéressé

Si tu ne connais pas une réponse :
"Je ne dispose pas encore d'une information officielle suffisante sur ce point. Je peux transmettre votre demande à l'équipe IBIG Soft ou vous orienter vers le support : contact@ibigsoft.com"
PROMPT;
    }

    public function chat(Request $request): JsonResponse
    {
        $request->validate([
            'message' => ['required', 'string', 'max:1000'],
            'history' => ['nullable', 'array', 'max:' . self::MAX_HISTORY],
            'history.*.role'    => ['required', 'in:user,assistant'],
            'history.*.content' => ['required', 'string', 'max:2000'],
        ]);

        $apiKey = config('services.groq.key');

        if (empty($apiKey)) {
            return response()->json([
                'reply' => 'Je suis temporairement indisponible. Contactez-nous directement : contact@ibigsoft.com ou +225 27 22 27 60 14.',
            ]);
        }

        // Construire les messages
        $messages = [['role' => 'system', 'content' => $this->systemPrompt()]];

        // Historique (tronqué pour ne pas exploser le contexte)
        $history = array_slice($request->input('history', []), -self::MAX_HISTORY);
        foreach ($history as $msg) {
            $messages[] = ['role' => $msg['role'], 'content' => $msg['content']];
        }

        $messages[] = ['role' => 'user', 'content' => $request->input('message')];

        try {
            $response = Http::withToken($apiKey)
                ->timeout(20)
                ->post('https://api.groq.com/openai/v1/chat/completions', [
                    'model'       => 'llama-3.1-8b-instant',
                    'messages'    => $messages,
                    'max_tokens'  => self::MAX_TOKENS,
                    'temperature' => self::TEMPERATURE,
                    'stream'      => false,
                ]);

            if (!$response->successful()) {
                Log::warning('SARA Groq error', ['status' => $response->status(), 'body' => $response->body()]);
                return response()->json([
                    'reply' => 'Je rencontre une difficulté technique. Réessayez dans un instant ou contactez-nous : contact@ibigsoft.com',
                ]);
            }

            $reply = $response->json('choices.0.message.content', '');

            return response()->json(['reply' => trim($reply)]);

        } catch (\Exception $e) {
            Log::error('SARA exception', ['error' => $e->getMessage()]);
            return response()->json([
                'reply' => 'Je suis temporairement indisponible. Notre équipe reste joignable : contact@ibigsoft.com | +225 27 22 27 60 14',
            ]);
        }
    }
}
