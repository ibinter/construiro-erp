<?php

namespace App\Http\Controllers\SuperAdmin;

use App\Http\Controllers\Controller;
use App\Models\TrainingCategory;
use App\Models\TrainingResource;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AcademyController extends Controller
{
    /**
     * GET /superadmin/academy
     * Tableau de bord : toutes les catégories + ressources (publiées et brouillons).
     */
    public function index(): Response
    {
        $categories = TrainingCategory::with([
            'resources' => fn ($q) => $q->orderBy('sort_order'),
        ])
        ->orderBy('sort_order')
        ->get()
        ->map(fn ($cat) => [
            'id'         => $cat->id,
            'slug'       => $cat->slug,
            'name_fr'    => $cat->name_fr,
            'name_en'    => $cat->name_en,
            'icon'       => $cat->icon,
            'color'      => $cat->color,
            'is_active'  => $cat->is_active,
            'sort_order' => $cat->sort_order,
            'resources'  => $cat->resources->map(fn ($r) => [
                'id'               => $r->id,
                'type'             => $r->type,
                'title_fr'         => $r->title_fr,
                'title_en'         => $r->title_en,
                'description_fr'   => $r->description_fr,
                'description_en'   => $r->description_en,
                'url'              => $r->url,
                'thumbnail'        => $r->thumbnail,
                'duration_minutes' => $r->duration_minutes,
                'level'            => $r->level,
                'role_restriction' => $r->role_restriction,
                'is_published'     => $r->is_published,
                'sort_order'       => $r->sort_order,
                'view_count'       => $r->view_count,
            ]),
        ]);

        return Inertia::render('SuperAdmin/Academy/Index', [
            'categories' => $categories,
        ]);
    }

    /**
     * POST /superadmin/academy
     * Créer une nouvelle ressource.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $this->validateResource($request);

        TrainingResource::create($validated);

        return redirect()
            ->route('superadmin.academy.index')
            ->with('success', 'Ressource créée avec succès.');
    }

    /**
     * PUT /superadmin/academy/{academy}
     * Mettre à jour une ressource.
     */
    public function update(Request $request, TrainingResource $academy): RedirectResponse
    {
        $validated = $this->validateResource($request);

        $academy->update($validated);

        return redirect()
            ->route('superadmin.academy.index')
            ->with('success', 'Ressource mise à jour.');
    }

    /**
     * DELETE /superadmin/academy/{academy}
     * Supprimer une ressource.
     */
    public function destroy(TrainingResource $academy): RedirectResponse
    {
        $title = $academy->title_fr;
        $academy->delete();

        return redirect()
            ->route('superadmin.academy.index')
            ->with('success', "Ressource « {$title} » supprimée.");
    }

    /**
     * POST /superadmin/academy/{academy}/publish
     * Publier / dépublier une ressource.
     */
    public function publish(TrainingResource $academy): RedirectResponse
    {
        $academy->update(['is_published' => ! $academy->is_published]);

        $label = $academy->is_published ? 'publiée' : 'dépubliée';

        return back()->with('success', "Ressource {$label}.");
    }

    // ─── Validation ──────────────────────────────────────────────────────────

    private function validateResource(Request $request): array
    {
        return $request->validate([
            'category_id'      => 'required|exists:training_categories,id',
            'type'             => 'required|in:video,document,quiz',
            'title_fr'         => 'required|string|max:255',
            'title_en'         => 'nullable|string|max:255',
            'description_fr'   => 'nullable|string',
            'description_en'   => 'nullable|string',
            'url'              => 'nullable|string|max:500',
            'thumbnail'        => 'nullable|string|max:500',
            'duration_minutes' => 'nullable|integer|min:1|max:600',
            'level'            => 'required|in:beginner,intermediate,advanced',
            'role_restriction' => 'nullable|string|max:100',
            'is_published'     => 'boolean',
            'sort_order'       => 'integer|min:0',
        ]);
    }
}
