<?php

namespace App\Http\Controllers;

use App\Models\Project;
use App\Models\Site;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(Request $request): Response
    {
        $user      = $request->user();
        $companyId = $user->company_id;
        $currency  = $user->company?->base_currency ?? 'XOF';

        // Cache KPIs 3 minutes par entreprise
        $stats = Cache::remember("dashboard_stats_{$companyId}", 180, function () use ($companyId, $currency) {
            $pq = Project::where('company_id', $companyId);
            $sq = Site::where('company_id', $companyId);

            // Une seule requête agrégée pour tous les KPIs projets
            $agg = (clone $pq)->selectRaw("
                COUNT(*) as total,
                SUM(CASE WHEN status = 'in_progress' THEN 1 ELSE 0 END) as active,
                SUM(CASE WHEN status IN ('in_progress','on_hold') THEN budget_amount ELSE 0 END) as budget,
                AVG(CASE WHEN status = 'in_progress' THEN progress END) as avg_progress
            ")->first();

            $activeSites = $sq->where('status', 'in_progress')->count();

            return [
                ['key' => 'projects', 'label' => __('Projets actifs'),    'value' => (int) $agg->active,                              'icon' => 'folder-kanban', 'trend' => $agg->total . ' ' . __('au total')],
                ['key' => 'sites',    'label' => __('Chantiers en cours'), 'value' => $activeSites,                                    'icon' => 'construction',  'trend' => __('en activité')],
                ['key' => 'budget',   'label' => __('Budget engagé'),      'value' => $this->shortMoney((float) $agg->budget, $currency), 'icon' => 'wallet',     'trend' => __('projets actifs')],
                ['key' => 'progress', 'label' => __('Avancement moyen'),   'value' => ((int) round($agg->avg_progress ?? 0)) . ' %',  'icon' => 'trending-up',   'trend' => __('projets en cours')],
            ];
        });

        // 5 derniers projets (cache 2 minutes)
        $recentProjects = Cache::remember("dashboard_recent_{$companyId}", 120, function () use ($companyId) {
            return Project::where('company_id', $companyId)
                ->latest()
                ->take(5)
                ->get(['id', 'code', 'name', 'status', 'progress', 'budget_amount', 'currency']);
        });

        return Inertia::render('Dashboard', [
            'stats'          => $stats,
            'recentProjects' => $recentProjects,
        ]);
    }

    /** Formate un montant en notation courte (1,2 Md / 850 M). */
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
