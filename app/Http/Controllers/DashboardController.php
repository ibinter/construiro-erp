<?php

namespace App\Http\Controllers;

use App\Models\CostEntry;
use App\Models\Employee;
use App\Models\Equipment;
use App\Models\Invoice;
use App\Models\Project;
use App\Models\Site;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(Request $request): Response
    {
        $user      = $request->user();
        $companyId = $user->company_id;
        $currency  = $user->company?->base_currency ?? 'XOF';

        // ── KPI cards (cache 3 min) ───────────────────────────────────────────
        $kpis = Cache::remember("dashboard_kpis_{$companyId}", 180, function () use ($companyId, $currency) {
            $now   = Carbon::now();
            $month = $now->month;
            $year  = $now->year;

            // CA du mois en cours (factures non draft/cancelled émises ce mois).
            $caMois = (float) Invoice::where('company_id', $companyId)
                ->whereMonth('issue_date', $month)
                ->whereYear('issue_date', $year)
                ->whereNotIn('status', ['draft', 'cancelled'])
                ->sum('total');

            // Factures impayées (envoyées, partielles ou en retard).
            $unpaidRow = Invoice::where('company_id', $companyId)
                ->whereIn('status', ['sent', 'partial', 'overdue'])
                ->selectRaw('COUNT(*) as cnt, SUM(total - amount_paid) as amount')
                ->first();

            $unpaidCount  = (int) ($unpaidRow->cnt ?? 0);
            $unpaidAmount = (float) ($unpaidRow->amount ?? 0);

            // Projets actifs.
            $projetsActifs = Project::where('company_id', $companyId)
                ->where('status', 'in_progress')
                ->count();

            // Employés actifs.
            $employes = Employee::where('company_id', $companyId)
                ->where('status', 'active')
                ->count();

            // Matériel en maintenance.
            $materielMaintenance = Equipment::where('company_id', $companyId)
                ->where('status', 'maintenance')
                ->count();

            // Dépenses du mois (charges analytiques).
            $depensesMois = (float) CostEntry::where('company_id', $companyId)
                ->where('type', 'charge')
                ->whereMonth('date', $month)
                ->whereYear('date', $year)
                ->sum('amount');

            return [
                [
                    'key'   => 'ca_mois',
                    'label' => 'CA du mois',
                    'value' => self::shortMoney($caMois, $currency),
                    'raw'   => $caMois,
                    'icon'  => 'trending-up',
                    'color' => 'emerald',
                    'trend' => 'factures émises ce mois',
                ],
                [
                    'key'   => 'factures_impayees',
                    'label' => 'Factures impayées',
                    'value' => self::shortMoney($unpaidAmount, $currency),
                    'raw'   => $unpaidAmount,
                    'icon'  => 'alert-circle',
                    'color' => $unpaidCount > 0 ? 'red' : 'slate',
                    'trend' => "{$unpaidCount} facture(s) en attente",
                ],
                [
                    'key'   => 'projets_actifs',
                    'label' => 'Projets actifs',
                    'value' => $projetsActifs,
                    'raw'   => $projetsActifs,
                    'icon'  => 'folder-kanban',
                    'color' => 'orange',
                    'trend' => 'en cours',
                ],
                [
                    'key'   => 'employes',
                    'label' => 'Employés',
                    'value' => $employes,
                    'raw'   => $employes,
                    'icon'  => 'users',
                    'color' => 'blue',
                    'trend' => 'actifs',
                ],
                [
                    'key'   => 'materiel_maintenance',
                    'label' => 'Matériel en maintenance',
                    'value' => $materielMaintenance,
                    'raw'   => $materielMaintenance,
                    'icon'  => 'wrench',
                    'color' => $materielMaintenance > 0 ? 'amber' : 'slate',
                    'trend' => 'unité(s) immobilisée(s)',
                ],
                [
                    'key'   => 'depenses_mois',
                    'label' => 'Dépenses du mois',
                    'value' => self::shortMoney($depensesMois, $currency),
                    'raw'   => $depensesMois,
                    'icon'  => 'wallet',
                    'color' => 'violet',
                    'trend' => 'charges analytiques',
                ],
            ];
        });

        // ── Mini graphique en barres : CA des 6 derniers mois ────────────────
        $chartData = Cache::remember("dashboard_chart_{$companyId}", 300, function () use ($companyId) {
            $data = [];
            for ($i = 5; $i >= 0; $i--) {
                $date = Carbon::now()->subMonths($i);
                $ca   = (float) Invoice::where('company_id', $companyId)
                    ->whereYear('issue_date', $date->year)
                    ->whereMonth('issue_date', $date->month)
                    ->whereNotIn('status', ['draft', 'cancelled'])
                    ->sum('total');

                $data[] = [
                    'label' => $date->translatedFormat('M'),
                    'month' => $date->month,
                    'year'  => $date->year,
                    'value' => $ca,
                ];
            }
            return $data;
        });

        // ── 5 projets avec progression budgétaire ────────────────────────────
        $projectsBudget = Cache::remember("dashboard_projects_budget_{$companyId}", 180, function () use ($companyId) {
            $projects = Project::where('company_id', $companyId)
                ->whereIn('status', ['in_progress', 'on_hold', 'planning'])
                ->orderByRaw("FIELD(status,'in_progress','on_hold','planning')")
                ->orderBy('name')
                ->take(5)
                ->get(['id', 'code', 'name', 'status', 'progress', 'budget_amount', 'currency']);

            // Calcul du montant dépensé (charges analytiques) par projet.
            $projectIds = $projects->pluck('id')->toArray();

            $spent = [];
            if (!empty($projectIds)) {
                $rows = CostEntry::whereIn('project_id', $projectIds)
                    ->where('type', 'charge')
                    ->selectRaw('project_id, SUM(amount) as total')
                    ->groupBy('project_id')
                    ->pluck('total', 'project_id');

                foreach ($rows as $pid => $total) {
                    $spent[$pid] = (float) $total;
                }
            }

            return $projects->map(function ($p) use ($spent) {
                $budget   = (float) ($p->budget_amount ?? 0);
                $depense  = $spent[$p->id] ?? 0;
                $pct      = $budget > 0 ? min(100, round($depense / $budget * 100)) : 0;

                return [
                    'id'           => $p->id,
                    'code'         => $p->code,
                    'name'         => $p->name,
                    'status'       => $p->status,
                    'progress'     => (int) ($p->progress ?? 0),
                    'budget'       => $budget,
                    'spent'        => $depense,
                    'budget_pct'   => $pct,
                    'currency'     => $p->currency,
                ];
            })->toArray();
        });

        // ── Alerte factures en retard (> 30 jours sans paiement) ────────────
        $overdueAlert = Cache::remember("dashboard_overdue_{$companyId}", 120, function () use ($companyId) {
            $count = Invoice::where('company_id', $companyId)
                ->where(function ($q) {
                    $q->where('status', 'overdue')
                      ->orWhere(function ($q2) {
                          $q2->whereIn('status', ['sent', 'partial'])
                             ->where('due_date', '<', Carbon::now()->subDays(30));
                      });
                })
                ->count();

            return $count;
        });

        // Visite guidée : true si c'est le tout premier accès au dashboard.
        $isFirstLogin = $user->last_login_at === null;

        return Inertia::render('Dashboard', [
            'kpis'          => $kpis,
            'chartData'     => $chartData,
            'projectsBudget' => $projectsBudget,
            'overdueAlert'  => $overdueAlert,
            'isFirstLogin'  => $isFirstLogin,
            // Compatibilité ascendante avec les composants qui utilisent encore `stats`.
            'stats'          => $kpis,
            'recentProjects' => array_map(fn ($p) => [
                'id'            => $p['id'],
                'code'          => $p['code'],
                'name'          => $p['name'],
                'status'        => $p['status'],
                'progress'      => $p['progress'],
                'budget_amount' => $p['budget'],
                'currency'      => $p['currency'],
            ], $projectsBudget),
        ]);
    }

    /** Formate un montant en notation courte (1,2 Md / 850 M). */
    private static function shortMoney(float $amount, string $currency): string
    {
        $suffix = in_array($currency, ['XOF', 'XAF']) ? ' FCFA' : " {$currency}";

        return match (true) {
            $amount >= 1_000_000_000 => number_format($amount / 1_000_000_000, 1, ',', ' ') . ' Md' . $suffix,
            $amount >= 1_000_000     => number_format($amount / 1_000_000, 1, ',', ' ') . ' M' . $suffix,
            $amount >= 1_000         => number_format($amount / 1_000, 0, ',', ' ') . ' k' . $suffix,
            default                  => number_format($amount, 0, ',', ' ') . $suffix,
        };
    }
}
