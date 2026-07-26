<?php

namespace App\Http\Controllers\SuperAdmin;

use App\Http\Controllers\Controller;
use App\Models\Company;
use App\Models\Webhook;
use App\Models\WebhookDelivery;
use App\Services\WebhookDispatcher;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class WebhookController extends Controller
{
    // ── GET /superadmin/webhooks ────────────────────────────────

    public function index(Request $request): Response
    {
        $query = Webhook::with('company');

        // Filtre par entreprise (SuperAdmin peut voir toutes ou une seule)
        if ($companyId = $request->integer('company_id', 0)) {
            $query->where('company_id', $companyId);
        }

        if ($search = $request->get('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('url', 'like', "%{$search}%");
            });
        }

        $webhooks = $query->latest()->paginate(25)->withQueryString();

        // Livraisons récentes (50 dernières toutes entreprises confondues, ou filtrées)
        $deliveriesQuery = WebhookDelivery::with('webhook.company')
            ->orderByDesc('delivered_at');

        if ($companyId) {
            $deliveriesQuery->whereHas('webhook', fn($q) => $q->where('company_id', $companyId));
        }

        $recentDeliveries = $deliveriesQuery->limit(50)->get();

        return Inertia::render('SuperAdmin/Webhooks/Index', [
            'webhooks' => $webhooks->through(fn($w) => [
                'id'                => $w->id,
                'company_id'        => $w->company_id,
                'company_name'      => $w->company?->name ?? '—',
                'name'              => $w->name,
                'url'               => $w->url,
                'events'            => $w->events,
                'is_active'         => $w->is_active,
                'failure_count'     => $w->failure_count,
                'last_triggered_at' => $w->last_triggered_at?->format('d/m/Y H:i'),
                'created_at'        => $w->created_at->format('d/m/Y'),
            ]),
            'recent_deliveries' => $recentDeliveries->map(fn($d) => [
                'id'              => $d->id,
                'webhook_id'      => $d->webhook_id,
                'webhook_name'    => $d->webhook?->name ?? '—',
                'company_name'    => $d->webhook?->company?->name ?? '—',
                'event_type'      => $d->event_type,
                'response_status' => $d->response_status,
                'success'         => $d->success,
                'delivered_at'    => $d->delivered_at?->format('d/m/Y H:i:s'),
            ]),
            'available_events' => WebhookDispatcher::availableEvents(),
            'companies'        => Company::where('is_active', true)
                ->orderBy('name')
                ->get(['id', 'name']),
            'filters'          => $request->only(['search', 'company_id']),
        ]);
    }

    // ── POST /superadmin/webhooks ───────────────────────────────

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'company_id' => 'required|exists:companies,id',
            'name'       => 'required|string|max:120',
            'url'        => 'required|url|max:500',
            'events'     => 'required|array|min:1',
            'events.*'   => 'string|in:' . implode(',', WebhookDispatcher::availableEvents()),
            'is_active'  => 'boolean',
        ]);

        Webhook::create([
            'company_id' => $validated['company_id'],
            'name'       => $validated['name'],
            'url'        => $validated['url'],
            'secret'     => Str::random(40),
            'events'     => $validated['events'],
            'is_active'  => $validated['is_active'] ?? true,
        ]);

        return back()->with('success', "Webhook « {$validated['name']} » créé.");
    }

    // ── PUT /superadmin/webhooks/{webhook} ──────────────────────

    public function update(Request $request, Webhook $webhook): RedirectResponse
    {
        $validated = $request->validate([
            'name'      => 'required|string|max:120',
            'url'       => 'required|url|max:500',
            'events'    => 'required|array|min:1',
            'events.*'  => 'string|in:' . implode(',', WebhookDispatcher::availableEvents()),
            'is_active' => 'boolean',
        ]);

        $webhook->update([
            'name'      => $validated['name'],
            'url'       => $validated['url'],
            'events'    => $validated['events'],
            'is_active' => $validated['is_active'] ?? $webhook->is_active,
        ]);

        return back()->with('success', "Webhook « {$webhook->name} » mis à jour.");
    }

    // ── DELETE /superadmin/webhooks/{webhook} ───────────────────

    public function destroy(Webhook $webhook): RedirectResponse
    {
        $name = $webhook->name;
        $webhook->delete();

        return back()->with('success', "Webhook « {$name} » supprimé.");
    }

    // ── POST /superadmin/webhooks/{webhook}/regenerate-secret ───

    public function regenerateSecret(Webhook $webhook): RedirectResponse
    {
        $newSecret = Str::random(40);
        $webhook->update(['secret' => $newSecret]);

        // Le secret n'est renvoyé qu'une seule fois via la session flash
        return back()->with('new_secret', $newSecret)
                     ->with('success', "Secret régénéré pour « {$webhook->name} ».");
    }
}
