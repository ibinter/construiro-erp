<?php

namespace App\Http\Controllers\SuperAdmin;

use App\Http\Controllers\Controller;
use App\Jobs\SendMailJob;
use App\Mail\RelanceCampaignMail;
use App\Models\CustomOffer;
use App\Models\DemoRequest;
use App\Models\RelanceCampaign;
use App\Models\RelanceCampaignRecipient;
use App\Models\Subscription;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class RelanceCampaignController extends Controller
{
    // -----------------------------------------------------------------------
    //  INDEX — liste des campagnes avec KPIs
    // -----------------------------------------------------------------------
    public function index(): Response
    {
        $campaigns = RelanceCampaign::latest()->paginate(20);

        // KPIs globaux
        $totalSentThisMonth = RelanceCampaign::whereMonth('created_at', now()->month)
            ->whereYear('created_at', now()->year)
            ->sum('sent_count');

        $activeCount = RelanceCampaign::where('status', 'running')->count();

        $avgOpenRate = RelanceCampaign::where('sent_count', '>', 0)
            ->selectRaw('AVG(opened_count / sent_count * 100) as avg')
            ->value('avg') ?? 0;

        return Inertia::render('SuperAdmin/Relances/Index', [
            'campaigns' => $campaigns->through(fn ($c) => $this->formatCampaign($c)),
            'kpis' => [
                'active_count'        => $activeCount,
                'sent_this_month'     => $totalSentThisMonth,
                'avg_open_rate'       => round($avgOpenRate, 1),
            ],
        ]);
    }

    // -----------------------------------------------------------------------
    //  STORE — créer une campagne
    // -----------------------------------------------------------------------
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name'         => 'required|string|max:255',
            'type'         => 'required|in:trial_expiring,demo_no_response,offer_pending,inactive_users,custom',
            'subject'      => 'required|string|max:255',
            'body_html'    => 'required|string',
            'scheduled_at' => 'nullable|date|after:now',
            'filters'      => 'nullable|array',
        ]);

        // Calcul du nombre de destinataires potentiels
        $targets      = $this->resolveTargets($validated['filters'] ?? [], $validated['type']);
        $targetCount  = count($targets);

        $campaign = RelanceCampaign::create([
            ...$validated,
            'target_count' => $targetCount,
            'status'       => 'draft',
            'created_by'   => $request->user()->name ?? $request->user()->email,
        ]);

        // Pré-remplir les destinataires
        foreach ($targets as $t) {
            RelanceCampaignRecipient::create([
                'campaign_id'    => $campaign->id,
                'email'          => $t['email'],
                'name'           => $t['name'] ?? null,
                'company_name'   => $t['company_name'] ?? null,
                'tracking_token' => Str::random(40),
            ]);
        }

        return back()->with('success', "Campagne « {$campaign->name} » créée avec {$targetCount} destinataire(s).");
    }

    // -----------------------------------------------------------------------
    //  SHOW — détail d'une campagne
    // -----------------------------------------------------------------------
    public function show(RelanceCampaign $relance): Response
    {
        $recipients = $relance->recipients()
            ->orderBy('status')
            ->orderBy('email')
            ->paginate(50);

        return Inertia::render('SuperAdmin/Relances/Show', [
            'campaign'   => $this->formatCampaign($relance),
            'recipients' => $recipients->through(fn ($r) => [
                'id'          => $r->id,
                'email'       => $r->email,
                'name'        => $r->name,
                'company'     => $r->company_name,
                'status'      => $r->status,
                'sent_at'     => $r->sent_at?->format('d/m/Y H:i'),
                'opened_at'   => $r->opened_at?->format('d/m/Y H:i'),
            ]),
        ]);
    }

    // -----------------------------------------------------------------------
    //  UPDATE
    // -----------------------------------------------------------------------
    public function update(Request $request, RelanceCampaign $relance): RedirectResponse
    {
        if (in_array($relance->status, ['running', 'completed'])) {
            return back()->with('error', 'Une campagne en cours ou terminée ne peut pas être modifiée.');
        }

        $validated = $request->validate([
            'name'         => 'required|string|max:255',
            'subject'      => 'required|string|max:255',
            'body_html'    => 'required|string',
            'scheduled_at' => 'nullable|date',
        ]);

        $relance->update($validated);

        return back()->with('success', 'Campagne mise à jour.');
    }

    // -----------------------------------------------------------------------
    //  LAUNCH — lancer l'envoi
    // -----------------------------------------------------------------------
    public function launch(RelanceCampaign $relance): RedirectResponse
    {
        // BUG C3 — verrou pessimiste + transaction pour éviter les double-envois
        $sentCount = DB::transaction(function () use ($relance) {
            // Recharger la campagne avec verrou exclusif
            $relance = RelanceCampaign::lockForUpdate()->findOrFail($relance->id);

            if (!in_array($relance->status, ['draft', 'paused', 'scheduled'])) {
                return null; // signal d'annulation
            }

            $relance->update(['status' => 'running']);

            $pendingRecipients = $relance->recipients()->where('status', 'pending')->get();

            foreach ($pendingRecipients as $recipient) {
                try {
                    dispatch(new SendMailJob(
                        $recipient->email,
                        new RelanceCampaignMail(
                            recipientName:   $recipient->name ?? $recipient->email,
                            campaignSubject: $relance->subject,
                            bodyHtml:        $relance->body_html,
                            trackingToken:   $recipient->tracking_token ?? '',
                            unsubscribeUrl:  url('/unsubscribe/' . $recipient->tracking_token),
                        )
                    ));

                    $recipient->update([
                        'status'  => 'sent',
                        'sent_at' => now(),
                    ]);
                } catch (\Exception $e) {
                    Log::warning("RelanceCampaignMail failed for {$recipient->email}: " . $e->getMessage());
                    $recipient->update(['status' => 'bounced']);
                }
            }

            // BUG M5 — ne pas marquer 'completed' ici ; c'est le job SendRelanceMail
            // qui effectuera la transition après le dernier envoi
            $count = $relance->recipients()->where('status', 'sent')->count();
            $relance->update(['sent_count' => $count]);

            return $count;
        });

        if ($sentCount === null) {
            return back()->with('error', 'Cette campagne ne peut pas être lancée dans son état actuel.');
        }

        return back()->with('success', "Campagne lancée : {$sentCount} email(s) envoyé(s).");
    }

    // -----------------------------------------------------------------------
    //  PAUSE
    // -----------------------------------------------------------------------
    public function pause(RelanceCampaign $relance): RedirectResponse
    {
        if ($relance->status !== 'running') {
            return back()->with('error', 'Seule une campagne en cours peut être mise en pause.');
        }

        $relance->update(['status' => 'paused']);

        return back()->with('success', 'Campagne mise en pause.');
    }

    // -----------------------------------------------------------------------
    //  DESTROY
    // -----------------------------------------------------------------------
    public function destroy(RelanceCampaign $relance): RedirectResponse
    {
        if (in_array($relance->status, ['running', 'completed'])) {
            return back()->with('error', 'Impossible de supprimer une campagne en cours ou terminée.');
        }

        $relance->delete();

        return redirect()->route('superadmin.relances.index')
            ->with('success', 'Campagne supprimée.');
    }

    // -----------------------------------------------------------------------
    //  PRIVATE HELPERS
    // -----------------------------------------------------------------------

    /**
     * Retourne la liste des cibles selon le type de campagne.
     * Chaque entrée : ['email' => ..., 'name' => ..., 'company_name' => ...]
     */
    private function resolveTargets(array $filters, string $type): array
    {
        return match ($type) {
            'trial_expiring'   => $this->targetTrialExpiring(),
            'demo_no_response' => $this->targetDemoNoResponse(),
            'offer_pending'    => $this->targetOfferPending(),
            'inactive_users'   => $this->targetInactiveUsers(),
            'custom'           => $this->targetCustom($filters),
            default            => [],
        };
    }

    /** Subscriptions en trial qui expirent dans 3 jours. */
    private function targetTrialExpiring(): array
    {
        return Subscription::with('company.users')
            ->where('status', 'trial')
            ->whereBetween('trial_ends_at', [now(), now()->addDays(3)])
            ->get()
            ->flatMap(function ($sub) {
                return $sub->company?->users?->map(fn ($u) => [
                    'email'        => $u->email,
                    'name'         => $u->name,
                    'company_name' => $sub->company->name ?? '',
                ]) ?? collect();
            })
            ->unique('email')
            ->values()
            ->toArray();
    }

    /** DemoRequests sans DemoSession créée après 48 h. */
    private function targetDemoNoResponse(): array
    {
        return DemoRequest::whereDoesntHave('demoSession')
            ->where('created_at', '<=', now()->subHours(48))
            ->get()
            ->map(fn ($d) => [
                'email'        => $d->email,
                'name'         => $d->name,
                'company_name' => $d->company ?? '',
            ])
            ->unique('email')
            ->values()
            ->toArray();
    }

    /** CustomOffers en statut pending depuis 72 h. */
    private function targetOfferPending(): array
    {
        return CustomOffer::with('company.users')
            ->where('status', 'pending')
            ->where('updated_at', '<=', now()->subHours(72))
            ->get()
            ->flatMap(function ($offer) {
                return $offer->company?->users?->map(fn ($u) => [
                    'email'        => $u->email,
                    'name'         => $u->name,
                    'company_name' => $offer->company->name ?? '',
                ]) ?? collect();
            })
            ->unique('email')
            ->values()
            ->toArray();
    }

    /** Users non connectés depuis 30 jours. */
    private function targetInactiveUsers(): array
    {
        return User::where(function ($q) {
            $q->whereNull('last_login_at')
              ->orWhere('last_login_at', '<=', now()->subDays(30));
        })
            ->where('created_at', '<=', now()->subDays(30))
            ->get()
            ->map(fn ($u) => [
                'email'        => $u->email,
                'name'         => $u->name,
                'company_name' => '',
            ])
            ->unique('email')
            ->values()
            ->toArray();
    }

    /** Cibles custom depuis les filtres (liste d'emails directs). */
    private function targetCustom(array $filters): array
    {
        $emails = $filters['emails'] ?? [];

        return collect($emails)
            ->filter(fn ($e) => filter_var($e, FILTER_VALIDATE_EMAIL))
            ->map(fn ($e) => ['email' => $e, 'name' => null, 'company_name' => null])
            ->values()
            ->toArray();
    }

    private function formatCampaign(RelanceCampaign $c): array
    {
        return [
            'id'                 => $c->id,
            'name'               => $c->name,
            'type'               => $c->type,
            'subject'            => $c->subject,
            'body_html'          => $c->body_html,
            'status'             => $c->status,
            'target_count'       => $c->target_count,
            'sent_count'         => $c->sent_count,
            'opened_count'       => $c->opened_count,
            'clicked_count'      => $c->clicked_count,
            'unsubscribed_count' => $c->unsubscribed_count,
            'open_rate'          => $c->open_rate,
            'click_rate'         => $c->click_rate,
            'scheduled_at'       => $c->scheduled_at?->format('d/m/Y H:i'),
            'completed_at'       => $c->completed_at?->format('d/m/Y H:i'),
            'created_by'         => $c->created_by,
            'created_at'         => $c->created_at->format('d/m/Y'),
            'filters'            => $c->filters,
        ];
    }
}
