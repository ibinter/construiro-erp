<?php

namespace App\Http\Controllers;

use App\Models\TrainingCategory;
use App\Models\TrainingProgress;
use App\Models\TrainingResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AcademyController extends Controller
{
    /**
     * GET /academy
     * Page principale : catégories + ressources publiées + progression utilisateur.
     */
    public function index(Request $request): Response
    {
        $categories = TrainingCategory::active()
            ->with([
                'resources' => fn ($q) => $q->orderBy('sort_order'),
            ])
            ->orderBy('sort_order')
            ->get();

        $userProgress = auth()->check()
            ? TrainingProgress::where('user_id', auth()->id())
                ->pluck('resource_id')
                ->toArray()
            : [];

        $mappedCategories = $categories->map(function ($cat) {
            return [
                'id'         => $cat->id,
                'slug'       => $cat->slug,
                'name_fr'    => $cat->name_fr,
                'name_en'    => $cat->name_en,
                'icon'       => $cat->icon,
                'color'      => $cat->color,
                'sort_order' => $cat->sort_order,
                'resources'  => $cat->resources->map(fn ($r) => [
                    'id'               => $r->id,
                    'type'             => $r->type,
                    'title_fr'         => $r->title_fr,
                    'title_en'         => $r->title_en,
                    'description_fr'   => $r->description_fr,
                    'duration_minutes' => $r->duration_minutes,
                    'level'            => $r->level,
                    'is_published'     => $r->is_published,
                    'sort_order'       => $r->sort_order,
                    'view_count'       => $r->view_count,
                ]),
            ];
        });

        return Inertia::render('Academy/Index', [
            'categories'    => $mappedCategories,
            'completed_ids' => $userProgress,
        ]);
    }

    /**
     * POST /academy/resources/{resource}/progress
     * Marquer une ressource comme vue / complétée.
     */
    public function markProgress(Request $request, TrainingResource $resource): JsonResponse
    {
        TrainingProgress::updateOrCreate(
            ['user_id' => auth()->id(), 'resource_id' => $resource->id],
            ['completed' => $request->boolean('completed'), 'last_viewed_at' => now()]
        );

        $resource->increment('view_count');

        return response()->json(['ok' => true]);
    }
}
