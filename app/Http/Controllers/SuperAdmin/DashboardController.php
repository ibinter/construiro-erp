<?php

namespace App\Http\Controllers\SuperAdmin;

use App\Http\Controllers\Controller;
use App\Models\Company;
use App\Models\Subscription;
use App\Models\SubscriptionInvoice;
use App\Models\User;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(): Response
    {
        $totalCompanies = Company::count();
        $activeSubscriptions = Subscription::whereIn('status', ['active', 'trial'])->count();
        $expiredSubscriptions = Subscription::where('status', 'expired')->count();
        $mrr = SubscriptionInvoice::where('status', 'paid')
            ->whereMonth('paid_at', now()->month)
            ->whereYear('paid_at', now()->year)
            ->sum('amount');

        $recentCompanies = Company::with(['subscriptions' => fn($q) => $q->latest()->limit(1)])->latest()->limit(10)->get();

        $subscriptionsByStatus = Subscription::selectRaw('status, COUNT(*) as count')
            ->groupBy('status')
            ->pluck('count', 'status');

        return Inertia::render('SuperAdmin/Dashboard', [
            'stats' => [
                'total_companies' => $totalCompanies,
                'active_subscriptions' => $activeSubscriptions,
                'expired_subscriptions' => $expiredSubscriptions,
                'mrr' => $mrr,
                'total_users' => User::count(),
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
