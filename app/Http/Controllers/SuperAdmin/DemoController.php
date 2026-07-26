<?php

namespace App\Http\Controllers\SuperAdmin;

use App\Http\Controllers\Controller;
use App\Models\DemoRequest;
use App\Models\DemoSession;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DemoController extends Controller
{
    public function index(Request $request): Response
    {
        $status = $request->input('status');

        $demos = DemoSession::with('demoRequest')
            ->when($status, fn ($q) => $q->where('status', $status))
            ->orderByRaw("CASE WHEN scheduled_at IS NULL THEN 1 ELSE 0 END")
            ->orderBy('scheduled_at', 'asc')
            ->paginate(20)
            ->withQueryString()
            ->through(fn ($d) => [
                'id'               => $d->id,
                'prospect_name'    => $d->prospect_name,
                'prospect_email'   => $d->prospect_email,
                'prospect_company' => $d->prospect_company,
                'assigned_to'      => $d->assigned_to,
                'scheduled_at'     => $d->scheduled_at?->format('Y-m-d H:i'),
                'scheduled_at_fr'  => $d->scheduled_at?->translatedFormat('D d M Y H:i'),
                'duration_minutes' => $d->duration_minutes,
                'status'           => $d->status,
                'meeting_url'      => $d->meeting_url,
                'notes'            => $d->notes,
                'demo_request_id'  => $d->demo_request_id,
                'created_at'       => $d->created_at->format('d/m/Y'),
            ]);

        // KPIs par statut
        $counts = DemoSession::selectRaw('status, COUNT(*) as count')
            ->groupBy('status')
            ->pluck('count', 'status')
            ->toArray();

        // Demandes sans session planifiée (max 15)
        $pendingRequests = DemoRequest::whereDoesntHave('demoSession')
            ->orderBy('created_at', 'desc')
            ->limit(15)
            ->get()
            ->map(fn ($r) => [
                'id'         => $r->id,
                'name'       => $r->name,
                'email'      => $r->email,
                'company'    => $r->company,
                'sector'     => $r->sector,
                'status'     => $r->status,
                'created_at' => $r->created_at->format('d/m/Y'),
            ]);

        return Inertia::render('SuperAdmin/Demos/Index', [
            'demos'           => $demos,
            'counts'          => $counts,
            'pendingRequests' => $pendingRequests,
            'filters'         => $request->only(['status']),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'prospect_name'    => 'required|string|max:100',
            'prospect_email'   => 'required|email|max:150',
            'prospect_company' => 'nullable|string|max:100',
            'demo_request_id'  => 'nullable|exists:demo_requests,id',
            'assigned_to'      => 'nullable|email|max:150',
            'scheduled_at'     => 'nullable|date',
            'duration_minutes' => 'integer|min:15|max:120',
            'meeting_url'      => 'nullable|url|max:500',
            'notes'            => 'nullable|string|max:2000',
        ]);

        $validated['status'] = $validated['scheduled_at'] ? 'scheduled' : 'to_schedule';

        DemoSession::create($validated);

        return back()->with('success', 'Démo créée avec succès.');
    }

    public function update(Request $request, DemoSession $demo): RedirectResponse
    {
        $validated = $request->validate([
            'status'           => 'sometimes|in:to_schedule,scheduled,done,cancelled,no_show',
            'scheduled_at'     => 'nullable|date',
            'meeting_url'      => 'nullable|url|max:500',
            'notes'            => 'nullable|string|max:2000',
            'assigned_to'      => 'nullable|email|max:150',
            'duration_minutes' => 'sometimes|integer|min:15|max:120',
        ]);

        // Auto-status: si on set scheduled_at et que le statut était to_schedule, on passe à scheduled
        if (
            isset($validated['scheduled_at']) &&
            $validated['scheduled_at'] &&
            ($validated['status'] ?? $demo->status) === 'to_schedule'
        ) {
            $validated['status'] = 'scheduled';
        }

        $demo->update($validated);

        return back()->with('success', 'Démo mise à jour.');
    }

    public function destroy(DemoSession $demo): RedirectResponse
    {
        $demo->delete();

        return back()->with('success', 'Démo supprimée.');
    }
}
