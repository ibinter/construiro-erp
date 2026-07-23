<?php

namespace App\Http\Controllers\SuperAdmin;

use App\Http\Controllers\Controller;
use App\Models\KnowledgeBase;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class KnowledgeBaseController extends Controller
{
    /**
     * GET /superadmin/knowledge-base
     * Liste paginée avec filtre catégorie.
     */
    public function index(Request $request): Response
    {
        $category = $request->get('category');

        $query = KnowledgeBase::query()
            ->when($category, fn ($q) => $q->where('category', $category))
            ->orderByDesc('priority')
            ->orderBy('title_fr');

        $entries    = $query->paginate(20)->withQueryString();
        $totalActive   = KnowledgeBase::where('is_active', true)->count();
        $totalInactive = KnowledgeBase::where('is_active', false)->count();

        return Inertia::render('SuperAdmin/KnowledgeBase/Index', [
            'entries'       => $entries,
            'totalActive'   => $totalActive,
            'totalInactive' => $totalInactive,
            'filters'       => ['category' => $category],
        ]);
    }

    /**
     * POST /superadmin/knowledge-base
     * Créer une nouvelle entrée.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $this->validateEntry($request);

        KnowledgeBase::create($validated);

        return redirect()
            ->route('superadmin.knowledge-base.index')
            ->with('success', 'Entrée créée avec succès.');
    }

    /**
     * PUT /superadmin/knowledge-base/{knowledgeBase}
     * Modifier une entrée existante.
     */
    public function update(Request $request, KnowledgeBase $knowledgeBase): RedirectResponse
    {
        $validated = $this->validateEntry($request);

        $knowledgeBase->update($validated);

        return redirect()
            ->route('superadmin.knowledge-base.index')
            ->with('success', 'Entrée mise à jour.');
    }

    /**
     * DELETE /superadmin/knowledge-base/{knowledgeBase}
     * Supprimer une entrée.
     */
    public function destroy(KnowledgeBase $knowledgeBase): RedirectResponse
    {
        $title = $knowledgeBase->title_fr;
        $knowledgeBase->delete();

        return redirect()
            ->route('superadmin.knowledge-base.index')
            ->with('success', "Entrée « {$title} » supprimée.");
    }

    // ─── Validation ──────────────────────────────────────────────────────────

    private function validateEntry(Request $request): array
    {
        return $request->validate([
            'category'   => 'required|in:general,pricing,modules,support,faq',
            'title_fr'   => 'required|string|max:255',
            'title_en'   => 'nullable|string|max:255',
            'content_fr' => 'required|string',
            'content_en' => 'nullable|string',
            'keywords'   => 'nullable|array',
            'keywords.*' => 'string|max:100',
            'is_active'  => 'boolean',
            'priority'   => 'integer|in:0,10,20',
        ]);
    }
}
