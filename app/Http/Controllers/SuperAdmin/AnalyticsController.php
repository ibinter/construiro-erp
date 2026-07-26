<?php

namespace App\Http\Controllers\SuperAdmin;

use App\Http\Controllers\Controller;
use App\Models\AnalyticsEvent;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AnalyticsController extends Controller
{
    public function index(Request $request): Response
    {
        $days = (int) $request->input('days', 30);
        $from = now()->subDays($days);

        // KPIs
        $totalVisits   = AnalyticsEvent::where('event_type', 'page_view')
                            ->where('occurred_at', '>=', $from)->count();
        $demoRequests  = AnalyticsEvent::where('event_type', 'demo_request')
                            ->where('occurred_at', '>=', $from)->count();
        $signups       = AnalyticsEvent::where('event_type', 'signup')
                            ->where('occurred_at', '>=', $from)->count();

        // Visites par jour (sparkline)
        $visitsByDay = AnalyticsEvent::where('event_type', 'page_view')
            ->where('occurred_at', '>=', $from)
            ->selectRaw('DATE(occurred_at) as date, COUNT(*) as count')
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        // Top sources UTM
        $topSources = AnalyticsEvent::where('occurred_at', '>=', $from)
            ->whereNotNull('source')
            ->selectRaw('source, COUNT(*) as count')
            ->groupBy('source')
            ->orderByDesc('count')
            ->limit(5)
            ->get();

        // Top pages
        $topPages = AnalyticsEvent::where('event_type', 'page_view')
            ->where('occurred_at', '>=', $from)
            ->selectRaw('page, COUNT(*) as count')
            ->groupBy('page')
            ->orderByDesc('count')
            ->limit(10)
            ->get();

        // Répartition des devices
        $devices = AnalyticsEvent::where('occurred_at', '>=', $from)
            ->whereNotNull('device')
            ->selectRaw('device, COUNT(*) as count')
            ->groupBy('device')
            ->get();

        return Inertia::render('SuperAdmin/Analytics/Index', compact(
            'totalVisits', 'demoRequests', 'signups',
            'visitsByDay', 'topSources', 'topPages', 'devices', 'days'
        ));
    }
}
