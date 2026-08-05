<?php

namespace App\Http\Controllers\SuperAdmin;

use App\Http\Controllers\Controller;
use App\Models\GuideRevisionFlag;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Console SuperAdmin — Révisions du guide utilisateur.
 *
 * Les flags sont créés automatiquement par le listener MarkGuideForRevision
 * lorsqu'une fonctionnalité change de plan (le guide correspondant peut être
 * obsolète). Cette page permet à l'équipe IBIG de suivre et clôturer ces
 * révisions une fois le guide mis à jour.
 */
class GuideRevisionFlagController extends Controller
{
    public function index(): Response
    {
        $flags = GuideRevisionFlag::orderByDesc('needs_revision')
            ->orderByDesc('flagged_at')
            ->orderByDesc('created_at')
            ->get()
            ->map(fn (GuideRevisionFlag $f) => [
                'id'             => $f->id,
                'module_key'     => $f->module_key,
                'needs_revision' => $f->needs_revision,
                'reason'         => $f->reason,
                'flagged_by'     => $f->flagged_by,
                'flagged_at'     => $f->flagged_at?->format('d/m/Y H:i'),
                'resolved_at'    => $f->resolved_at?->format('d/m/Y H:i'),
            ]);

        return Inertia::render('SuperAdmin/GuideRevisions/Index', [
            'flags' => $flags,
            'stats' => [
                'pending'  => $flags->where('needs_revision', true)->count(),
                'resolved' => $flags->where('needs_revision', false)->count(),
                'total'    => $flags->count(),
            ],
        ]);
    }

    public function resolve(GuideRevisionFlag $guideRevisionFlag): RedirectResponse
    {
        $guideRevisionFlag->resolve();

        return redirect()
            ->route('superadmin.guide-revisions.index')
            ->with('success', "Module « {$guideRevisionFlag->module_key} » marqué comme révisé.");
    }

    public function reopen(GuideRevisionFlag $guideRevisionFlag): RedirectResponse
    {
        $guideRevisionFlag->update([
            'needs_revision' => true,
            'resolved_at'    => null,
            'flagged_at'     => now(),
        ]);

        return redirect()
            ->route('superadmin.guide-revisions.index')
            ->with('success', "Révision du module « {$guideRevisionFlag->module_key} » rouverte.");
    }

    public function destroy(GuideRevisionFlag $guideRevisionFlag): RedirectResponse
    {
        $key = $guideRevisionFlag->module_key;
        $guideRevisionFlag->delete();

        return redirect()
            ->route('superadmin.guide-revisions.index')
            ->with('success', "Alerte de révision « {$key} » supprimée.");
    }
}
