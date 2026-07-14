<?php

namespace App\Http\Controllers;

use App\Models\LegalPage;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class LegalController extends Controller
{
    public function show(string $slug): Response
    {
        $page = LegalPage::where('slug', $slug)
            ->where('is_published', true)
            ->firstOrFail();

        $locale    = app()->getLocale();
        $allPages  = LegalPage::where('is_published', true)
            ->orderBy('slug')
            ->get(['slug', 'title_fr', 'title_en'])
            ->map(fn($p) => [
                'slug'  => $p->slug,
                'title' => ($locale === 'en' && $p->title_en) ? $p->title_en : $p->title_fr,
            ])->toArray();

        return Inertia::render('Legal/Show', [
            'page' => [
                'slug'       => $page->slug,
                'title'      => $page->title(),
                'content'    => Str::markdown($page->content(), ['html_input' => 'allow']),
                'updated_at' => $page->last_updated_at?->format('d/m/Y'),
            ],
            'allPages' => $allPages,
        ]);
    }

    // ─── Admin ───────────────────────────────────────────────────────

    public function adminIndex(): Response
    {
        $this->authorize('administration.view');
        $pages = LegalPage::orderBy('slug')->get();

        return Inertia::render('Admin/LegalPages/Index', compact('pages'));
    }

    public function adminEdit(string $slug): Response
    {
        $this->authorize('administration.update');
        $page = LegalPage::where('slug', $slug)->firstOrFail();

        return Inertia::render('Admin/LegalPages/Edit', compact('page'));
    }

    public function adminUpdate(Request $request, string $slug): \Illuminate\Http\RedirectResponse
    {
        $this->authorize('administration.update');

        $page = LegalPage::where('slug', $slug)->firstOrFail();

        $data = $request->validate([
            'title_fr'     => 'required|string|max:255',
            'title_en'     => 'required|string|max:255',
            'content_fr'   => 'required|string',
            'content_en'   => 'required|string',
            'is_published' => 'boolean',
        ]);

        $page->update(array_merge($data, ['last_updated_at' => now()]));

        return back()->with('success', 'Page légale mise à jour.');
    }
}
