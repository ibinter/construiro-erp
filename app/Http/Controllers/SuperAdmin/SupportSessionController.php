<?php

namespace App\Http\Controllers\SuperAdmin;

use App\Http\Controllers\Controller;
use App\Models\Company;
use App\Models\SupportSession;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class SupportSessionController extends Controller
{
    public function index(): Response
    {
        $sessions = SupportSession::with(['company', 'supportUser'])
            ->latest()
            ->limit(50)
            ->get()
            ->map(fn($s) => [
                'id' => $s->id,
                'company' => $s->company?->name,
                'support_user' => $s->supportUser?->name,
                'reason' => $s->reason,
                'expires_at' => $s->expires_at->format('d/m/Y H:i'),
                'ended_at' => $s->ended_at?->format('d/m/Y H:i'),
                'is_active' => $s->isActive(),
            ]);

        return Inertia::render('SuperAdmin/SupportSessions/Index', [
            'sessions' => $sessions,
            'companies' => Company::where('is_active', true)->get(['id', 'name']),
        ]);
    }

    public function create(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'company_id' => 'required|exists:companies,id',
            'reason'     => 'required|string|max:500',
            'duration_hours' => 'required|integer|min:1|max:24',
        ]);

        SupportSession::create([
            'company_id' => $validated['company_id'],
            'support_user_id' => $request->user()->id,
            'reason' => $validated['reason'],
            'expires_at' => now()->addHours($validated['duration_hours']),
            'token' => Str::random(64),
        ]);

        return back()->with('success', 'Session de support créée et tracée dans l\'audit.');
    }

    public function end(SupportSession $session): RedirectResponse
    {
        if ($session->isActive()) {
            $session->update(['ended_at' => now()]);
        }

        return back()->with('success', 'Session de support terminée.');
    }
}
