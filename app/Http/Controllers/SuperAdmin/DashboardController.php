<?php

namespace App\Http\Controllers\SuperAdmin;

use App\Http\Controllers\Controller;
use App\Models\Company;
use App\Models\Subscription;
use App\Models\SubscriptionInvoice;
use App\Models\SupportTicket;
use App\Models\User;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function mrrHistory(): \Illuminate\Http\JsonResponse
    {
        $months = collect(range(11, 0))->map(function ($i) {
            $month = now()->subMonths($i);
            $start = $month->copy()->startOfMonth();
            $end   = $month->copy()->endOfMonth();

            // MRR = somme des abonnements actifs créés ce mois × prix mensuel normalisé
            $mrr = Subscription::where('status', 'active')
                ->whereBetween('starts_at', [$start, $end])
                ->with('plan:id,price_monthly,price_yearly')
                ->get()
                ->sum(function ($sub) {
                    if (($sub->billing_cycle ?? 'monthly') === 'yearly') {
                        return ($sub->plan?->price_yearly ?? 0) / 12;
                    }
                    return $sub->plan?->price_monthly ?? 0;
                });

            return [
                'month'       => $month->format('M Y'),
                'month_short' => $month->translatedFormat('M'),
                'year'        => $month->year,
                'mrr'         => round($mrr),
            ];
        });

        return response()->json($months);
    }

    public function index(): Response
    {
        $totalCompanies = Company::count();
        $activeSubscriptions = Subscription::whereIn('status', ['active', 'trial'])->count();
        $expiredSubscriptions = Subscription::where('status', 'expired')->count();
        $mrr = SubscriptionInvoice::where('status', 'paid')
            ->whereMonth('paid_at', now()->month)
            ->whereYear('paid_at', now()->year)
            ->sum('amount');

        // KPI 1 — Taux de conversion trial → payant
        $trialTotal = Subscription::whereIn('status', ['trial', 'active'])->count();
        $trialConverted = Subscription::where('status', 'active')
            ->whereNotNull('trial_ends_at')
            ->count();
        $conversionRate = $trialTotal > 0 ? round(($trialConverted / $trialTotal) * 100, 1) : 0;

        // KPI 2 — ARR (Annual Recurring Revenue)
        $arr = Subscription::where('status', 'active')
            ->with('plan:id,price_monthly,price_yearly')
            ->get()
            ->sum(function ($sub) {
                $price = $sub->plan?->price_monthly ?? 0;
                $priceYearly = $sub->plan?->price_yearly ?? 0;
                $cycle = $sub->billing_cycle ?? 'monthly';
                if ($cycle === 'yearly' && $priceYearly > 0) {
                    return $priceYearly;
                }
                return $price * 12;
            });

        // KPI 3 — Tickets ouverts sans réponse depuis > 24h
        $overdueTickets = SupportTicket::whereIn('status', [
                SupportTicket::STATUS_NEW,
                SupportTicket::STATUS_OPEN,
                SupportTicket::STATUS_WAITING_TECH,
            ])
            ->where('created_at', '<', now()->subHours(24))
            ->count();

        $recentCompanies = Company::with(['subscriptions' => fn($q) => $q->latest()->limit(1)])->latest()->limit(10)->get();

        $subscriptionsByStatus = Subscription::selectRaw('status, COUNT(*) as count')
            ->groupBy('status')
            ->pluck('count', 'status');

        return Inertia::render('SuperAdmin/Dashboard', [
            'stats' => [
                'total_companies'     => $totalCompanies,
                'active_subscriptions'=> $activeSubscriptions,
                'expired_subscriptions'=> $expiredSubscriptions,
                'mrr'                 => $mrr,
                'total_users'         => User::count(),
                'conversion_rate'     => $conversionRate,
                'arr'                 => $arr,
                'overdue_tickets'     => $overdueTickets,
            ],
            'subscriptions_by_status' => $subscriptionsByStatus,
            'recent_companies' => $recentCompanies->map(fn($c) => [
                'id' => $c->id,
                'name' => $c->name,
                'country' => $c->country,
                'is_active' => $c->is_active,
                'subscription_status' => $c->subscriptions->first()?->status ?? 'none',
                'created_at' => $c->created_at->format('d/m/Y'),
            ]),
        ]);
    }
}
