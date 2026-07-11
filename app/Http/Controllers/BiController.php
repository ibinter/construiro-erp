<?php

namespace App\Http\Controllers;

use App\Models\Employee;
use App\Models\Invoice;
use App\Models\Project;
use App\Models\PurchaseOrder;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Tableau de bord analytique (BI).
 * Agrège les données clés de l'entreprise sur 12 mois glissants.
 * Isolation multi-tenant assurée par le scope forUser().
 */
class BiController extends Controller
{
    public function index(): Response
    {
        $user = auth()->user();

        // 1. CA mensuel sur 12 mois glissants (toutes factures hors brouillon).
        $caByMonth = Invoice::forUser($user)
            ->where('status', '!=', 'draft')
            ->where('issue_date', '>=', now()->subMonths(11)->startOfMonth())
            ->selectRaw("DATE_FORMAT(issue_date, '%Y-%m') as month, SUM(total) as total")
            ->groupBy('month')
            ->orderBy('month')
            ->get();

        // 2. Dépenses par mois sur 12 mois (bons de commande réceptionnés).
        $depensesByMonth = PurchaseOrder::forUser($user)
            ->where('status', 'received')
            ->where('order_date', '>=', now()->subMonths(11)->startOfMonth())
            ->selectRaw("DATE_FORMAT(order_date, '%Y-%m') as month, SUM(total) as total")
            ->groupBy('month')
            ->orderBy('month')
            ->get();

        // 3. Répartition des projets par statut.
        $projetsByStatus = Project::forUser($user)
            ->selectRaw('status, COUNT(*) as count')
            ->groupBy('status')
            ->get();

        // 4. Avancement moyen par projet (top 10 projets actifs).
        $projetsAvancement = Project::forUser($user)
            ->where('status', 'in_progress')
            ->orderByDesc('progress')
            ->limit(10)
            ->get(['id', 'name', 'progress', 'budget_amount', 'currency']);

        // 5. KPIs globaux.
        $kpis = [
            'ca_total'         => Invoice::forUser($user)->where('status', '!=', 'draft')->sum('total'),
            'ca_encaisse'      => Invoice::forUser($user)->where('status', 'paid')->sum('total'),
            'depenses_total'   => PurchaseOrder::forUser($user)->where('status', 'received')->sum('total'),
            'projets_actifs'   => Project::forUser($user)->where('status', 'in_progress')->count(),
            'factures_impayees'=> Invoice::forUser($user)->whereIn('status', ['sent', 'overdue'])->count(),
            'employes'         => Employee::forUser($user)->where('status', 'active')->count(),
        ];

        return Inertia::render('Bi/Dashboard', [
            'caByMonth'        => $caByMonth,
            'depensesByMonth'  => $depensesByMonth,
            'projetsByStatus'  => $projetsByStatus,
            'projetsAvancement'=> $projetsAvancement,
            'kpis'             => $kpis,
        ]);
    }
}
