<?php

namespace App\Http\Controllers;

use App\Mail\TicketCreatedMail;
use App\Mail\TicketResolvedMail;
use App\Models\KnowledgeBaseArticle;
use App\Models\SupportMessage;
use App\Models\SupportTicket;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Inertia\Inertia;
use Inertia\Response;

class SupportController extends Controller
{
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
                'id' => $t->id,
                'number' => $t->number,
                'subject' => $t->subject,
                'status' => $t->status,
                'priority' => $t->priority,
                'category' => $t->category,
                'created_at' => $t->created_at->format('d/m/Y H:i'),
                'resolved_at' => $t->resolved_at?->format('d/m/Y'),
            ]),
            'articles' => $articles,
            'filters' => $request->only('status'),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Support/Create');
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'subject'     => 'required|string|max:200',
            'description' => 'required|string|max:5000',
            'priority'    => 'required|in:low,medium,high,urgent',
            'category'    => 'nullable|in:billing,technical,feature_request,other',
        ]);

        $ticket = SupportTicket::create([
            ...$validated,
            'company_id' => $request->user()->company_id,
            'user_id' => $request->user()->id,
        ]);

        try {
            Mail::to($request->user()->email)->send(new TicketCreatedMail(
                userName: $request->user()->name,
                ticketNumber: $ticket->number,
                subject: $ticket->subject,
                priority: $ticket->priority,
            ));
        } catch (\Throwable) {}

        return redirect()->route('support.show', $ticket)->with('success', "Ticket {$ticket->number} créé.");
    }

    public function show(Request $request, SupportTicket $ticket): Response
    {
        abort_if($ticket->company_id !== $request->user()->company_id, 403);

        $ticket->load(['messages.user']);

        return Inertia::render('Support/Show', [
            'ticket' => [
                'id' => $ticket->id,
                'number' => $ticket->number,
                'subject' => $ticket->subject,
                'description' => $ticket->description,
                'status' => $ticket->status,
                'priority' => $ticket->priority,
                'category' => $ticket->category,
                'created_at' => $ticket->created_at->format('d/m/Y H:i'),
                'resolved_at' => $ticket->resolved_at?->format('d/m/Y H:i'),
                'messages' => $ticket->messages
                    ->where('is_internal', false)
                    ->values()
                    ->map(fn($m) => [
                        'id' => $m->id,
                        'body' => $m->body,
                        'is_agent' => $m->is_agent,
                        'user_name' => $m->user?->name ?? 'Support',
                        'created_at' => $m->created_at->format('d/m/Y H:i'),
                    ]),
            ],
        ]);
    }

    public function reply(Request $request, SupportTicket $ticket): RedirectResponse
    {
        abort_if($ticket->company_id !== $request->user()->company_id, 403);
        abort_if(!$ticket->isOpen(), 422, 'Ticket fermé.');

        $validated = $request->validate(['body' => 'required|string|max:5000']);

        SupportMessage::create([
            'ticket_id' => $ticket->id,
            'user_id' => $request->user()->id,
            'body' => $validated['body'],
            'is_internal' => false,
            'is_agent' => false,
        ]);

        $ticket->update(['status' => 'pending']);

        return back()->with('success', 'Message envoyé.');
    }

    public function close(Request $request, SupportTicket $ticket): RedirectResponse
    {
        abort_if($ticket->company_id !== $request->user()->company_id, 403);

        $ticket->update(['status' => 'closed']);

        return back()->with('success', 'Ticket fermé.');
    }
}
