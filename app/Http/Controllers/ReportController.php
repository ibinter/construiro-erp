<?php

namespace App\Http\Controllers;

use App\Models\Project;
use App\Models\Site;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Schema;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Module Rapports & BI — tableau de bord analytique transverse.
 *
 * Calcule côté serveur des statistiques agrégées sur l'ensemble des données de
 * l'entreprise de l'utilisateur (isolation multi-tenant stricte via company_id).
 *
 * ROBUSTESSE : certains modules métier peuvent ne pas être installés selon le
 * périmètre déployé. Chaque bloc financier / RH est gardé par une vérification
 * d'existence de classe + de table (class_exists / Schema::hasTable) afin que
 * l'écran reste fonctionnel même si Invoice, PurchaseOrder ou Employee n'existent
 * pas encore. Aucune permission n'est calculée ici : la route porte can:reports.view.
 */
class ReportController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();
        $companyId = $user->company_id;
        $currency = $user->company?->base_currency ?? 'XOF';

        // --- Projets -----------------------------------------------------------
        $projectsQuery = Project::where('company_id', $companyId);

        // Répartition des projets par statut (ordre stable des statuts connus).
        $projectStatusCounts = (clone $projectsQuery)
            ->selectRaw('status, COUNT(*) as total')
            ->groupBy('status')
            ->pluck('total', 'status');

        $projectsByStatus = collect(Project::STATUSES)->map(fn ($status) => [
            'status' => $status,
            'total'  => (int) ($projectStatusCounts[$status] ?? 0),
        ])->values();

        $totalProjects   = (int) (clone $projectsQuery)->count();
        $engagedBudget   = (float) (clone $projectsQuery)
            ->whereIn('status', ['in_progress', 'on_hold'])
            ->sum('budget_amount');
        $totalBudget     = (float) (clone $projectsQuery)->sum('budget_amount');
        $avgProgress     = (int) round((clone $projectsQuery)
            ->where('status', 'in_progress')
            ->avg('progress') ?? 0);

        // Top 5 projets par budget (pour le graphique en barres).
        $topProjects = (clone $projectsQuery)
            ->orderByDesc('budget_amount')
            ->take(5)
            ->get(['id', 'code', 'name', 'status', 'budget_amount', 'currency', 'progress'])
            ->map(fn ($p) => [
                'id'            => $p->id,
                'code'          => $p->code,
                'name'          => $p->name,
                'status'        => $p->status,
                'progress'      => (int) $p->progress,
                'budget_amount' => (float) $p->budget_amount,
                'currency'      => $p->currency,
            ]);

        // --- Chantiers ---------------------------------------------------------
        $siteStatusCounts = Site::where('company_id', $companyId)
            ->selectRaw('status, COUNT(*) as total')
            ->groupBy('status')
            ->pluck('total', 'status');

        $sitesByStatus = collect(Site::STATUSES)->map(fn ($status) => [
            'status' => $status,
            'total'  => (int) ($siteStatusCounts[$status] ?? 0),
        ])->values();

        $totalSites = (int) Site::where('company_id', $companyId)->count();

        // --- Finances (gardes d'existence) -------------------------------------
        $finance = [
            'available'    => false,
            'invoiced'     => 0.0,   // total facturé (TTC)
            'collected'    => 0.0,   // total encaissé
            'outstanding'  => 0.0,   // reste à recouvrer
            'purchases'    => 0.0,   // total achats
            'has_invoices' => false,
            'has_purchases'=> false,
        ];

        if ($this->modelReady(\App\Models\Invoice::class, 'invoices')) {
            $invoices = \App\Models\Invoice::where('company_id', $companyId)
                ->whereNotIn('status', ['cancelled'])
                ->selectRaw('COALESCE(SUM(total),0) as invoiced, COALESCE(SUM(amount_paid),0) as collected')
                ->first();

            $invoiced  = (float) ($invoices->invoiced ?? 0);
            $collected = (float) ($invoices->collected ?? 0);

            $finance['invoiced']     = $invoiced;
            $finance['collected']    = $collected;
            $finance['outstanding']  = max(0, $invoiced - $collected);
            $finance['has_invoices'] = true;
            $finance['available']    = true;
        }

        if ($this->modelReady(\App\Models\PurchaseOrder::class, 'purchase_orders')) {
            $finance['purchases'] = (float) \App\Models\PurchaseOrder::where('company_id', $companyId)
                ->whereNotIn('status', ['cancelled'])
                ->sum('total');
            $finance['has_purchases'] = true;
            $finance['available']     = true;
        }

        // --- RH (garde d'existence) --------------------------------------------
        $hr = ['available' => false, 'headcount' => 0];

        if ($this->modelReady(\App\Models\Employee::class, 'employees')) {
            $hr['headcount'] = (int) \App\Models\Employee::where('company_id', $companyId)
                ->where('status', 'active')
                ->count();
            $hr['available'] = true;
        }

        // --- Cartes KPI de synthèse -------------------------------------------
        $kpis = [
            ['key' => 'projects', 'label' => 'Projets',          'value' => (string) $totalProjects,                        'icon' => 'folder-kanban', 'hint' => 'tous statuts'],
            ['key' => 'sites',    'label' => 'Chantiers',        'value' => (string) $totalSites,                           'icon' => 'construction',  'hint' => 'tous statuts'],
            ['key' => 'budget',   'label' => 'Budget engagé',    'value' => $this->shortMoney($engagedBudget, $currency),   'icon' => 'wallet',        'hint' => 'projets actifs'],
            ['key' => 'progress', 'label' => 'Avancement moyen', 'value' => "{$avgProgress} %",                             'icon' => 'trending-up',   'hint' => 'projets en cours'],
        ];

        if ($finance['has_invoices']) {
            $kpis[] = ['key' => 'invoiced',    'label' => 'Total facturé',   'value' => $this->shortMoney($finance['invoiced'], $currency),    'icon' => 'receipt',            'hint' => 'hors annulées'];
            $kpis[] = ['key' => 'outstanding', 'label' => 'Reste à recouvrer','value' => $this->shortMoney($finance['outstanding'], $currency), 'icon' => 'arrow-down-circle',  'hint' => 'factures'];
        }
        if ($finance['has_purchases']) {
            $kpis[] = ['key' => 'purchases', 'label' => 'Total achats', 'value' => $this->shortMoney($finance['purchases'], $currency), 'icon' => 'shopping-cart', 'hint' => 'bons de commande'];
        }
        if ($hr['available']) {
            $kpis[] = ['key' => 'headcount', 'label' => 'Effectif', 'value' => (string) $hr['headcount'], 'icon' => 'users', 'hint' => 'employés actifs'];
        }

        return Inertia::render('Reports/Index', [
            'currency'         => $currency,
            'kpis'             => $kpis,
            'projectsByStatus' => $projectsByStatus,
            'sitesByStatus'    => $sitesByStatus,
            'topProjects'      => $topProjects,
            'totals'           => [
                'projects'      => $totalProjects,
                'sites'         => $totalSites,
                'engagedBudget' => $engagedBudget,
                'totalBudget'   => $totalBudget,
                'avgProgress'   => $avgProgress,
            ],
            'finance'          => $finance,
            'hr'               => $hr,
        ]);
    }

    /** Vrai si le modèle Eloquent existe ET si sa table est présente en base. */
    private function modelReady(string $modelClass, string $table): bool
    {
        try {
            return class_exists($modelClass) && Schema::hasTable($table);
        } catch (\Throwable $e) {
            return false;
        }
    }

    /** Formate un montant en notation courte (1,2 Md / 850 M / 12 k). */
    private function shortMoney(float $amount, string $currency): string
    {
        $suffix = $currency === 'XOF' || $currency === 'XAF' ? ' FCFA' : " {$currency}";

        return match (true) {
            $amount >= 1_000_000_000 => number_format($amount / 1_000_000_000, 1, ',', ' ') . ' Md' . $suffix,
            $amount >= 1_000_000     => number_format($amount / 1_000_000, 0, ',', ' ') . ' M' . $suffix,
            $amount >= 1_000         => number_format($amount / 1_000, 0, ',', ' ') . ' k' . $suffix,
            default                  => number_format($amount, 0, ',', ' ') . $suffix,
        };
    }
}
