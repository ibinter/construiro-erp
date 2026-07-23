<?php

namespace App\Http\Controllers\SuperAdmin;

use App\Http\Controllers\Controller;
use App\Models\AiUsageLog;
use App\Models\Company;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AiUsageController extends Controller
{
    public function index(Request $request): \Inertia\Response
    {
        $logs = AiUsageLog::with(['company', 'user'])
            ->when($request->company_id, fn ($q, $c) => $q->where('company_id', $c))
            ->orderByDesc('created_at')
            ->paginate(50);

        // Stats du mois courant par fournisseur
        $monthStats = AiUsageLog::thisMonth()
            ->selectRaw('provider, SUM(total_tokens) as tokens, COUNT(*) as calls, AVG(response_time_ms) as avg_ms')
            ->groupBy('provider')
            ->get();

        // Totaux globaux du mois (toutes lignes confondues)
        $monthTotals = AiUsageLog::thisMonth()
            ->selectRaw('
                COUNT(*) as total_calls,
                SUM(total_tokens) as total_tokens,
                ROUND(AVG(response_time_ms)) as avg_ms,
                SUM(CASE WHEN success = 0 THEN 1 ELSE 0 END) as total_errors
            ')
            ->first();

        // Liste des sociétés pour le filtre
        $companies = Company::orderBy('name')->get(['id', 'name']);

        return Inertia::render('SuperAdmin/AiUsage/Index', [
            'logs' => $logs->through(fn ($l) => [
                'id'         => $l->id,
                'company'    => $l->company?->name ?? 'Public',
                'user'       => $l->user?->name ?? 'Anonyme',
                'context'    => $l->context,
                'provider'   => $l->provider,
                'model'      => $l->model,
                'tokens'     => $l->total_tokens,
                'ms'         => $l->response_time_ms,
                'success'    => $l->success,
                'error'      => $l->error_message,
                'created_at' => $l->created_at->format('d/m/Y H:i'),
            ]),
            'month_stats'  => $monthStats,
            'month_totals' => $monthTotals,
            'companies'    => $companies,
            'filters'      => $request->only('company_id'),
        ]);
    }
}
