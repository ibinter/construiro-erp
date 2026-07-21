<?php

namespace App\Http\Controllers;

use App\Mail\TicketCreatedMail;
use App\Mail\TicketResolvedMail;
use App\Models\KnowledgeBaseArticle;
use App\Models\SupportMessage;
use App\Models\SupportTicket;
use App\Jobs\SendMailJob;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class SupportController extends Controller
{
    // -----------------------------------------------------------------------
    // Durées SLA par défaut (en heures)
    // -----------------------------------------------------------------------
    private const SLA_FIRST_RESPONSE_H = 4;
    private const SLA_RESOLVE_H        = 48;

    // -----------------------------------------------------------------------
    // Liste / Formulaire de création
    // -----------------------------------------------------------------------

    public function index(Request $request): Response
    {
        $tickets = SupportTicket::where('company_id', $request->user()->company_id)
            ->when($request->get('status'), fn($q, $s) => $q->where('status', $s))
            ->latest()
            ->paginate(15)
            ->withQueryString();

        $articles = KnowledgeBaseArticle::where('is_published', true)
            ->orderByDesc('view_count')
            ->limit(6)
            ->get(['id', 'title', 'slug', 'category']);

        return Inertia::render('Support/Index', [
            'tickets' => $tickets->through(fn($t) => [
                'id'          => $t->id,
                'number'      => $t->number,
                'subject'     => $t->subject,
                'status'      => $t->status,
                'priority'    => $t->priority,
                'category'    => $t->category,
                'sla_breached'=> $t->sla_breached,
                'created_at'  => $t->created_at->format('d/m/Y H:i'),
                'resolved_at' => $t->resolved_at?->format('d/m/Y'),
            ]),
            'articles' => $articles,
            'filters'  => $request->only('status'),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Support/Create');
    }

    // -----------------------------------------------------------------------
    // Création d'un ticket
    // -----------------------------------------------------------------------

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'subject'       => 'required|string|max:200',
            'description'   => 'required|string|max:5000',
            'priority'      => 'required|in:low,medium,high,urgent',
            'category'      => 'nullable|in:billing,technical,feature_request,other',
            'attachments'   => 'nullable|array|max:5',
            'attachments.*' => 'file|max:10240|mimes:jpg,jpeg,png,gif,pdf,doc,docx,xls,xlsx,txt,zip',
        ]);

        // Upload pièces jointes
        $attachmentPaths = [];
        if ($request->hasFile('attachments')) {
            foreach ($request->file('attachments') as $file) {
                $path = $file->store('support/attachments', 'public');
                $attachmentPaths[] = [
                    'path'         => $path,
                    'original_name'=> $file->getClientOriginalName(),
                    'size'         => $file->getSize(),
                    'mime'         => $file->getMimeType(),
                ];
            }
        }

        $ticket = SupportTicket::create([
            'subject'                   => $validated['subject'],
            'description'               => $validated['description'],
            'priority'                  => $validated['priority'],
            'category'                  => $validated['category'] ?? null,
            'company_id'                => $request->user()->company_id,
            'user_id'                   => $request->user()->id,
            'attachments'               => $attachmentPaths ?: null,
            'first_response_target_at'  => now()->addHours(self::SLA_FIRST_RESPONSE_H),
            'resolved_target_at'        => now()->addHours(self::SLA_RESOLVE_H),
        ]);

        dispatch(new SendMailJob(
            $request->user()->email,
            new TicketCreatedMail(
                userName:     $request->user()->name,
                ticketNumber: $ticket->number,
                subject:      $ticket->subject,
                priority:     $ticket->priority,
            ),
        ));

        return redirect()->route('support.show', $ticket)->with('success', "Ticket {$ticket->number} créé.");
    }

    // -----------------------------------------------------------------------
    // Détail d'un ticket
    // -----------------------------------------------------------------------

    public function show(Request $request, SupportTicket $ticket): Response
    {
        abort_if($ticket->company_id !== $request->user()->company_id, 403);

        $ticket->load(['messages.user']);

        $user = $request->user();
        // Un agent est quelqu'un qui a le rôle admin/agent OU qui n'est pas le créateur du ticket
        $canManage = $user->id !== $ticket->user_id;

        return Inertia::render('Support/Show', [
            'ticket'     => [
                'id'                       => $ticket->id,
                'number'                   => $ticket->number,
                'subject'                  => $ticket->subject,
                'description'              => $ticket->description,
                'status'                   => $ticket->status,
                'priority'                 => $ticket->priority,
                'category'                 => $ticket->category,
                'attachments'              => $ticket->attachments ?? [],
                'created_at'               => $ticket->created_at->format('d/m/Y H:i'),
                'resolved_at'              => $ticket->resolved_at?->format('d/m/Y H:i'),
                // SLA
                'first_response_target_at' => $ticket->first_response_target_at?->toIso8601String(),
                'resolved_target_at'       => $ticket->resolved_target_at?->toIso8601String(),
                'sla_breached'             => $ticket->sla_breached || $ticket->isSlaBreached(),
                'sla_resolved_percent'     => $ticket->slaResolvedPercent(),
                // Messages (hors internes pour les non-agents)
                'messages' => $ticket->messages
                    ->when(!$canManage, fn($c) => $c->where('is_internal', false))
                    ->values()
                    ->map(fn($m) => [
                        'id'          => $m->id,
                        'body'        => $m->body,
                        'is_agent'    => $m->is_agent,
                        'is_internal' => $m->is_internal,
                        'user_name'   => $m->user?->name ?? 'Support',
                        'attachments' => $m->attachments ?? [],
                        'created_at'  => $m->created_at->format('d/m/Y H:i'),
                    ]),
            ],
            'can_manage' => $canManage,
            'statuses'   => SupportTicket::STATUSES,
        ]);
    }

    // -----------------------------------------------------------------------
    // Réponse à un ticket (client)
    // -----------------------------------------------------------------------

    public function reply(Request $request, SupportTicket $ticket): RedirectResponse
    {
        abort_if($ticket->company_id !== $request->user()->company_id, 403);
        abort_if(!$ticket->isOpen(), 422, 'Ticket fermé.');

        $validated = $request->validate(['body' => 'required|string|max:5000']);

        SupportMessage::create([
            'ticket_id'  => $ticket->id,
            'user_id'    => $request->user()->id,
            'body'       => $validated['body'],
            'is_internal'=> false,
            'is_agent'   => false,
        ]);

        $ticket->update(['status' => SupportTicket::STATUS_PENDING]);

        return back()->with('success', 'Message envoyé.');
    }

    // -----------------------------------------------------------------------
    // Ajout d'un message avec pièces jointes (agent ou client)
    // -----------------------------------------------------------------------

    public function addMessage(Request $request, SupportTicket $ticket): RedirectResponse
    {
        abort_if($ticket->company_id !== $request->user()->company_id, 403);
        abort_if(!$ticket->isOpen(), 422, 'Ticket fermé.');

        $validated = $request->validate([
            'body'          => 'required|string|max:10000',
            'is_internal'   => 'boolean',
            'attachments'   => 'nullable|array|max:5',
            'attachments.*' => 'file|max:10240|mimes:jpg,jpeg,png,gif,pdf,doc,docx,xls,xlsx,txt,zip',
        ]);

        $user    = $request->user();
        $isAgent = $user->id !== $ticket->user_id;

        // Upload pièces jointes
        $attachmentPaths = [];
        if ($request->hasFile('attachments')) {
            foreach ($request->file('attachments') as $file) {
                $path = $file->store('support/attachments', 'public');
                $attachmentPaths[] = [
                    'path'          => $path,
                    'original_name' => $file->getClientOriginalName(),
                    'size'          => $file->getSize(),
                    'mime'          => $file->getMimeType(),
                ];
            }
        }

        $message = SupportMessage::create([
            'ticket_id'   => $ticket->id,
            'user_id'     => $user->id,
            'body'        => $validated['body'],
            'is_internal' => $isAgent && ($validated['is_internal'] ?? false),
            'is_agent'    => $isAgent,
            'attachments' => $attachmentPaths ?: null,
        ]);

        // Première réponse de l'agent
        $updates = [];
        if ($isAgent && is_null($ticket->first_response_at)) {
            $updates['first_response_at'] = now();
        }

        // Mise à jour du statut
        if ($isAgent) {
            if (!($validated['is_internal'] ?? false)) {
                $updates['status'] = SupportTicket::STATUS_IN_PROGRESS;
            }
        } else {
            $updates['status'] = SupportTicket::STATUS_WAITING_TECH;
        }

        if ($updates) {
            $ticket->update($updates);
        }

        return back()->with('success', 'Message envoyé.');
    }

    // -----------------------------------------------------------------------
    // Mise à jour du statut (agent)
    // -----------------------------------------------------------------------

    public function updateStatus(Request $request, SupportTicket $ticket): RedirectResponse
    {
        abort_if($ticket->company_id !== $request->user()->company_id, 403);

        $validated = $request->validate([
            'status'      => 'required|in:' . implode(',', SupportTicket::STATUSES),
            'assigned_to' => 'nullable|exists:users,id',
        ]);

        $updates = ['status' => $validated['status']];

        if ($validated['status'] === SupportTicket::STATUS_ASSIGNED && isset($validated['assigned_to'])) {
            $updates['assigned_to'] = $validated['assigned_to'];
        }

        if ($validated['status'] === SupportTicket::STATUS_RESOLVED) {
            $updates['resolved_at'] = now();
        }

        $ticket->update($updates);

        return back()->with('success', 'Statut mis à jour.');
    }

    // -----------------------------------------------------------------------
    // Réouverture d'un ticket
    // -----------------------------------------------------------------------

    public function reopen(Request $request, SupportTicket $ticket): RedirectResponse
    {
        abort_if($ticket->company_id !== $request->user()->company_id, 403);

        $ticket->update([
            'status'      => SupportTicket::STATUS_REOPENED,
            'resolved_at' => null,
            'sla_breached'=> false,
            // Nouveau SLA de résolution : 48 h à partir de maintenant
            'resolved_target_at' => now()->addHours(self::SLA_RESOLVE_H),
        ]);

        // Log d'audit (si la table audit_logs existe)
        if (\Schema::hasTable('audit_logs')) {
            \DB::table('audit_logs')->insert([
                'user_id'      => $request->user()->id,
                'action'       => 'ticket.reopened',
                'model'        => 'SupportTicket',
                'model_id'     => $ticket->id,
                'description'  => "Ticket {$ticket->number} réouvert.",
                'created_at'   => now(),
                'updated_at'   => now(),
            ]);
        }

        return back()->with('success', "Ticket {$ticket->number} réouvert.");
    }

    // -----------------------------------------------------------------------
    // Fermeture d'un ticket
    // -----------------------------------------------------------------------

    public function close(Request $request, SupportTicket $ticket): RedirectResponse
    {
        abort_if($ticket->company_id !== $request->user()->company_id, 403);

        $ticket->update([
            'status'      => SupportTicket::STATUS_CLOSED,
            'resolved_at' => now(),
        ]);

        $ticket->loadMissing('user');

        $recipient     = $ticket->user?->email ?? $request->user()->email;
        $recipientName = $ticket->user?->name ?? $request->user()->name;
        dispatch(new SendMailJob(
            $recipient,
            new TicketResolvedMail(
                userName:     $recipientName,
                ticketNumber: $ticket->number,
                subject:      $ticket->subject,
                resolution:   'Votre ticket a été fermé par notre équipe.',
                ticketUrl:    route('support.show', $ticket),
            ),
        ));

        return back()->with('success', 'Ticket fermé.');
    }
}
