<?php

namespace App\Http\Controllers;

use App\Models\AiConversation;
use App\Models\AiSetting;
use App\Models\Project;
use App\Models\Site;
use App\Services\LlmClient;
use App\Services\SaraGateway;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Schema;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Module Assistant IA. Deux modes selon le paramétrage de l'entreprise :
 *  - Si un fournisseur LLM est configuré (Grok, Claude, OpenAI…) avec la clé de
 *    l'entreprise : l'assistant appelle le modèle en lui fournissant un contexte
 *    calculé sur les données de l'entreprise (isolation multi-tenant stricte).
 *  - Sinon : repli automatique sur le moteur de RÈGLES interne (aucune clé, gratuit).
 *
 * ROBUSTESSE : chaque accès à un modèle métier optionnel (Invoice, PurchaseOrder,
 * Employee, Material...) est gardé par une vérification d'existence de classe et
 * de table, afin de rester fonctionnel sur un périmètre partiel.
 */
class AiAssistantController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();

        // Derniers échanges (ordre chronologique pour affichage type chat).
        $conversations = AiConversation::forUser($user)
            ->latest('id')
            ->take(20)
            ->get(['id', 'question', 'answer', 'created_at'])
            ->reverse()
            ->values();

        $setting = AiSetting::firstWhere('company_id', $user->company_id);

        return Inertia::render('Ai/Index', [
            'conversations' => $conversations,
            'insights'      => $this->insights($user->company_id),
            'provider'      => [
                'operational' => (bool) $setting?->isOperational(),
                'label'       => $setting && $setting->isOperational()
                    ? (AiSetting::PROVIDERS[$setting->provider]['label'] ?? $setting->provider)
                    : 'Moteur de règles interne',
                'canConfigure' => $user->can('administration.update'),
            ],
            'suggestions'   => [
                'Quel est le budget engagé sur les projets actifs ?',
                'Y a-t-il des factures en retard ?',
                'Combien de matériaux sont sous le seuil de stock ?',
                'Quel est l\'avancement moyen des chantiers ?',
                'Quel est l\'effectif actuel de l\'entreprise ?',
                'Quel est le montant total des achats ?',
            ],
        ]);
    }

    public function ask(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'question' => ['required', 'string', 'max:500'],
        ]);

        $user = $request->user();
        $answer = $this->generate($data['question'], $user->company_id);

        AiConversation::create([
            'company_id' => $user->company_id,
            'user_id'    => $user->id,
            'question'   => $data['question'],
            'answer'     => $answer,
        ]);

        return redirect()->route('ai.index')->with('success', 'Réponse générée.');
    }

    /**
     * Aiguille vers le LLM configuré si opérationnel, sinon le moteur de règles.
     * En cas d'erreur d'appel LLM, repli silencieux sur les règles (jamais d'échec visible).
     */
    private function generate(string $question, int $companyId): string
    {
        $setting = AiSetting::firstWhere('company_id', $companyId);

        $systemPrompt = "Tu es l'assistant IA de CONSTRUIRO ERP, un logiciel de gestion "
            . "de chantiers et du BTP. Réponds en français, de façon concise et "
            . "professionnelle, en t'appuyant STRICTEMENT sur les données de "
            . "l'entreprise fournies ci-dessous. Si l'information manque, dis-le. "
            . "Montants en FCFA.\n\n=== DONNÉES DE L'ENTREPRISE ===\n"
            . $this->buildContext($companyId);

        // 1. LLM configuré par l'entreprise (clé propre)
        if ($setting && $setting->isOperational()) {
            try {
                return app(LlmClient::class)->chat($setting, $systemPrompt, $question);
            } catch (\Throwable $e) {
                Log::warning('Assistant IA (LlmClient) : repli ('.$e->getMessage().')');
            }
        }

        // 2. SaraGateway — config plateforme globale (SuperAdmin) comme repli
        $gateway = app(SaraGateway::class);
        if ($gateway->isEnabled()) {
            try {
                return $gateway->chat(
                    [['role' => 'user', 'content' => $question]],
                    $systemPrompt,
                );
            } catch (\Throwable $e) {
                Log::warning('Assistant IA (SaraGateway) : repli ('.$e->getMessage().')');
            }
        }

        // 3. Moteur de règles interne (aucune clé requise)
        return $this->answer($question, $companyId);
    }

    /**
     * Construit un résumé chiffré des données de l'entreprise, fourni comme
     * contexte au LLM. Réutilise les mêmes agrégats que le moteur de règles.
     */
    private function buildContext(int $companyId): string
    {
        $lines = [];

        $projects = Project::where('company_id', $companyId);
        $lines[] = 'Projets : '.(clone $projects)->count()
            .' (en cours : '.(clone $projects)->where('status', 'in_progress')->count()
            .', avancement moyen : '.(int) round((clone $projects)->where('status', 'in_progress')->avg('progress') ?? 0).' %)';
        $lines[] = 'Budget total des projets : '.$this->money((float) (clone $projects)->sum('budget_amount'));
        $lines[] = 'Budget engagé (en cours + en pause) : '.$this->money((float) (clone $projects)->whereIn('status', ['in_progress', 'on_hold'])->sum('budget_amount'));
        $lines[] = 'Chantiers : '.Site::where('company_id', $companyId)->count()
            .' (en cours : '.Site::where('company_id', $companyId)->where('status', 'in_progress')->count().')';

        if ($this->modelReady(\App\Models\Invoice::class, 'invoices')) {
            $base = \App\Models\Invoice::where('company_id', $companyId)->whereNotIn('status', ['cancelled']);
            $invoiced = (float) (clone $base)->sum('total');
            $paid = (float) (clone $base)->sum('amount_paid');
            $overdue = (clone $base)->whereNotIn('status', ['paid'])->whereNotNull('due_date')->whereDate('due_date', '<', now())->count();
            $lines[] = 'Facturation : facturé '.$this->money($invoiced).', encaissé '.$this->money($paid)
                .', reste à recouvrer '.$this->money(max(0, $invoiced - $paid)).', factures en retard : '.$overdue;
        }

        if ($this->modelReady(\App\Models\PurchaseOrder::class, 'purchase_orders')) {
            $total = (float) \App\Models\PurchaseOrder::where('company_id', $companyId)->whereNotIn('status', ['cancelled'])->sum('total');
            $lines[] = 'Achats (bons de commande) : '.$this->money($total);
        }

        if ($this->modelReady(\App\Models\Employee::class, 'employees')) {
            $active = \App\Models\Employee::where('company_id', $companyId)->where('status', 'active')->count();
            $lines[] = 'Effectif actif : '.$active.' employé(s)';
        }

        $low = $this->lowStockCount($companyId);
        if ($low !== null) {
            $lines[] = 'Matériaux sous le seuil de stock : '.$low;
        }

        return implode("\n", $lines);
    }

    /**
     * Insights automatiques calculés depuis les données de l'entreprise.
     * Chaque bloc est gardé pour rester robuste si un modèle/table est absent.
     */
    private function insights(int $companyId): array
    {
        $insights = [];

        // Avancement moyen des projets en cours.
        $avgProgress = (int) round(
            Project::where('company_id', $companyId)
                ->where('status', 'in_progress')
                ->avg('progress') ?? 0
        );
        $insights[] = [
            'icon'  => 'trending-up',
            'label' => "Avancement moyen {$avgProgress} %",
            'tone'  => 'info',
        ];

        // Projets en pause.
        $onHold = Project::where('company_id', $companyId)->where('status', 'on_hold')->count();
        if ($onHold > 0) {
            $insights[] = [
                'icon'  => 'pause-circle',
                'label' => "{$onHold} projet(s) en pause",
                'tone'  => 'warning',
            ];
        }

        // Factures en retard (échéance dépassée, non soldées).
        if ($this->modelReady(\App\Models\Invoice::class, 'invoices')) {
            $overdue = \App\Models\Invoice::where('company_id', $companyId)
                ->whereNotIn('status', ['paid', 'cancelled'])
                ->whereNotNull('due_date')
                ->whereDate('due_date', '<', now())
                ->count();
            if ($overdue > 0) {
                $insights[] = [
                    'icon'  => 'alert-triangle',
                    'label' => "{$overdue} facture(s) en retard",
                    'tone'  => 'danger',
                ];
            }
        }

        // Matériaux sous le seuil de stock.
        $lowStock = $this->lowStockCount($companyId);
        if ($lowStock !== null && $lowStock > 0) {
            $insights[] = [
                'icon'  => 'package',
                'label' => "{$lowStock} matériau(x) sous le seuil",
                'tone'  => 'warning',
            ];
        }

        // Effectif actif.
        if ($this->modelReady(\App\Models\Employee::class, 'employees')) {
            $headcount = \App\Models\Employee::where('company_id', $companyId)
                ->where('status', 'active')
                ->count();
            $insights[] = [
                'icon'  => 'users',
                'label' => "Effectif : {$headcount} employé(s)",
                'tone'  => 'info',
            ];
        }

        return $insights;
    }

    /**
     * Génère une réponse par règles simples selon les mots-clés de la question,
     * en interrogeant les données de l'entreprise. Repli générique sinon.
     */
    private function answer(string $question, int $companyId): string
    {
        $q = mb_strtolower($question);
        $has = fn (array $words) => (bool) collect($words)->first(fn ($w) => str_contains($q, $w));

        // --- Budget ------------------------------------------------------------
        if ($has(['budget', 'engagé', 'engage', 'coût', 'cout', 'montant des projets'])) {
            $engaged = (float) Project::where('company_id', $companyId)
                ->whereIn('status', ['in_progress', 'on_hold'])
                ->sum('budget_amount');
            $total = (float) Project::where('company_id', $companyId)->sum('budget_amount');

            return "Le budget engagé sur les projets actifs (en cours ou en pause) s'élève à "
                . $this->money($engaged) . ". Le budget cumulé de tous les projets est de "
                . $this->money($total) . ".";
        }

        // --- Retard / factures -------------------------------------------------
        if ($has(['retard', 'facture', 'impayé', 'impaye', 'recouvr', 'encaiss'])) {
            if (! $this->modelReady(\App\Models\Invoice::class, 'invoices')) {
                return "Le module Facturation n'est pas encore disponible : je ne peux pas analyser les factures.";
            }

            $base = \App\Models\Invoice::where('company_id', $companyId)->whereNotIn('status', ['cancelled']);
            $invoiced  = (float) (clone $base)->sum('total');
            $collected = (float) (clone $base)->sum('amount_paid');
            $overdue = (clone $base)
                ->whereNotIn('status', ['paid'])
                ->whereNotNull('due_date')
                ->whereDate('due_date', '<', now())
                ->count();

            return "{$overdue} facture(s) sont en retard de paiement. Total facturé : "
                . $this->money($invoiced) . " ; total encaissé : " . $this->money($collected)
                . " ; reste à recouvrer : " . $this->money(max(0, $invoiced - $collected)) . ".";
        }

        // --- Stock / matériaux -------------------------------------------------
        if ($has(['stock', 'matériau', 'materiau', 'seuil', 'approvision', 'rupture'])) {
            $low = $this->lowStockCount($companyId);
            if ($low === null) {
                return "Le module Stocks n'est pas encore disponible : je ne peux pas analyser les niveaux de stock.";
            }

            return $low > 0
                ? "{$low} matériau(x) sont actuellement sous leur seuil minimal de stock. Un réapprovisionnement est recommandé."
                : "Aucun matériau n'est sous son seuil minimal de stock. Les niveaux sont satisfaisants.";
        }

        // --- Effectif / RH -----------------------------------------------------
        if ($has(['effectif', 'employé', 'employe', 'personnel', 'salarié', 'salarie', 'rh', 'ressources humaines'])) {
            if (! $this->modelReady(\App\Models\Employee::class, 'employees')) {
                return "Le module Ressources humaines n'est pas encore disponible : je ne peux pas calculer l'effectif.";
            }

            $active = \App\Models\Employee::where('company_id', $companyId)->where('status', 'active')->count();
            $total  = \App\Models\Employee::where('company_id', $companyId)->count();

            return "L'effectif actif est de {$active} employé(s) (sur {$total} enregistré(s) au total).";
        }

        // --- Achats ------------------------------------------------------------
        if ($has(['achat', 'commande', 'fournisseur', 'approvisionnement'])) {
            if (! $this->modelReady(\App\Models\PurchaseOrder::class, 'purchase_orders')) {
                return "Le module Achats n'est pas encore disponible : je ne peux pas analyser les commandes.";
            }

            $total = (float) \App\Models\PurchaseOrder::where('company_id', $companyId)
                ->whereNotIn('status', ['cancelled'])
                ->sum('total');
            $count = \App\Models\PurchaseOrder::where('company_id', $companyId)
                ->whereNotIn('status', ['cancelled'])
                ->count();

            return "Le montant total des achats (bons de commande hors annulés) s'élève à "
                . $this->money($total) . " sur {$count} commande(s).";
        }

        // --- Avancement / chantiers / projets ---------------------------------
        if ($has(['avancement', 'progression', 'chantier', 'projet', 'combien'])) {
            $projects = Project::where('company_id', $companyId)->count();
            $active   = Project::where('company_id', $companyId)->where('status', 'in_progress')->count();
            $avg      = (int) round(Project::where('company_id', $companyId)->where('status', 'in_progress')->avg('progress') ?? 0);
            $sites    = Site::where('company_id', $companyId)->count();
            $sitesActive = Site::where('company_id', $companyId)->where('status', 'in_progress')->count();

            return "L'entreprise compte {$projects} projet(s) ({$active} en cours, avancement moyen {$avg} %) "
                . "et {$sites} chantier(s) ({$sitesActive} en cours).";
        }

        // --- Repli générique ---------------------------------------------------
        return "Je n'ai pas de réponse précise à cette question. Essayez des mots-clés comme "
            . "« budget », « retard », « stock », « effectif », « achats » ou « avancement ».";
    }

    /**
     * Nombre de matériaux sous leur seuil minimal de stock, calculé à partir des
     * mouvements. Renvoie null si le module Stocks n'est pas disponible.
     */
    private function lowStockCount(int $companyId): ?int
    {
        if (! $this->modelReady(\App\Models\Material::class, 'materials')
            || ! Schema::hasTable('stock_movements')) {
            return null;
        }

        try {
            $materials = \App\Models\Material::where('company_id', $companyId)
                ->where('is_active', true)
                ->get(['id', 'min_stock']);

            $count = 0;
            foreach ($materials as $material) {
                if (method_exists($material, 'currentStock')
                    && $material->currentStock() < (float) $material->min_stock) {
                    $count++;
                }
            }

            return $count;
        } catch (\Throwable $e) {
            return null;
        }
    }

    /** Vrai si le modèle existe ET si sa table est présente en base. */
    private function modelReady(string $modelClass, string $table): bool
    {
        try {
            return class_exists($modelClass) && Schema::hasTable($table);
        } catch (\Throwable $e) {
            return false;
        }
    }

    /** Formate un montant en FCFA / devise de l'entreprise (notation complète). */
    private function money(float $amount): string
    {
        return number_format($amount, 0, ',', ' ') . ' FCFA';
    }
}
