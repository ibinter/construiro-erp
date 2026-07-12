<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AuditLogController extends Controller
{
    public function index(Request $request): Response
    {
        $this->authorize('administration.view');

        $logs = AuditLog::with('user')
            ->where('company_id', auth()->user()->company_id)
            ->when($request->search, fn ($q, $s) =>
                $q->where(fn ($q2) =>
                    $q2->where('description', 'like', "%{$s}%")
                       ->orWhere('user_email', 'like', "%{$s}%")
                       ->orWhere('action', 'like', "%{$s}%")
                       ->orWhere('module', 'like', "%{$s}%")
                )
            )
            ->when($request->action,  fn ($q, $a) => $q->where('action', $a))
            ->when($request->module,  fn ($q, $m) => $q->where('module', $m))
            ->when($request->from,    fn ($q, $d) => $q->whereDate('created_at', '>=', $d))
            ->when($request->to,      fn ($q, $d) => $q->whereDate('created_at', '<=', $d))
            ->latest()
            ->paginate(50)
            ->withQueryString();

        $modules = AuditLog::where('company_id', auth()->user()->company_id)
            ->distinct()->pluck('module')->filter()->values();

        return Inertia::render('Admin/AuditLogs/Index', [
            'logs'    => $logs,
            'modules' => $modules,
            'filters' => $request->only(['search', 'action', 'module', 'from', 'to']),
        ]);
    }
}
