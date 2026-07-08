<?php

namespace App\Http\Controllers;

use App\Models\Project;
use App\Models\Site;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();
        $companyId = $user->company_id;

        // KPIs réels calculés sur les données de l'entreprise de l'utilisateur.
        $projectsQuery = Project::where('company_id', $companyId);
        $sitesQuery    = Site::where('company_id', $companyId);

        $activeProjects = (clone $projectsQuery)->where('status', 'in_progress')->count();
        $totalProjects  = (clone $projectsQuery)->count();
        $activeSites    = (clone $sitesQuery)->where('status', 'in_progress')->count();
        $engagedBudget  = (clone $projectsQuery)->whereIn('status', ['in_progress', 'on_hold'])->sum('budget_amount');
        $avgProgress    = (int) round((clone $projectsQuery)->where('status', 'in_progress')->avg('progress') ?? 0);

        $currency = $user->company?->base_currency ?? 'XOF';

        $stats = [
            ['key' => 'projects', 'label' => 'Projets actifs',     'value' => $activeProjects,                       'icon' => 'folder-kanban', 'trend' => "{$totalProjects} au total"],
            ['key' => 'sites',    'label' => 'Chantiers en cours',  'value' => $activeSites,                          'icon' => 'construction',  'trend' => 'en activité'],
            ['key' => 'budget',   'label' => 'Budget engagé',       'value' => $this->shortMoney($engagedBudget, $currency), 'icon' => 'wallet',  'trend' => 'projets actifs'],
            ['key' => 'progress', 'label' => 'Avancement moyen',    'value' => "{$avgProgress} %",                    'icon' => 'trending-up',   'trend' => 'projets en cours'],
        ];

        // 5 derniers projets pour un aperçu rapide.
        $recentProjects = (clone $projectsQuery)
            ->latest()
            ->take(5)
            ->get(['id', 'code', 'name', 'status', 'progress', 'budget_amount', 'currency']);

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
