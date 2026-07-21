<?php

namespace App\Http\Controllers\SuperAdmin;

use App\Http\Controllers\Controller;
use App\Models\Changelog;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ChangelogController extends Controller
{
    public function index(): Response
    {
        $entries = Changelog::orderByDesc('published_at')
            ->orderByDesc('created_at')
            ->paginate(20);

        return Inertia::render('SuperAdmin/Changelog/Index', [
            'entries' => $entries,
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('SuperAdmin/Changelog/Form', [
            'changelog' => null,
            'types'     => Changelog::TYPES,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $this->validateChangelog($request);

        $publish = $request->boolean('publish_now');

        $entry = Changelog::create(array_merge($validated, [
            'is_published' => $publish,
            'published_at' => $publish ? now() : null,
        ]));

        return redirect()
            ->route('superadmin.changelogs.index')
            ->with('success', "Version {$entry->version} créée.");
    }

    public function edit(Changelog $changelog): Response
    {
        return Inertia::render('SuperAdmin/Changelog/Form', [
            'changelog' => $changelog,
            'types'     => Changelog::TYPES,
        ]);
    }

    public function update(Request $request, Changelog $changelog): RedirectResponse
    {
        $validated = $this->validateChangelog($request);

        $publish = $request->boolean('publish_now');

        $changelog->update(array_merge($validated, [
            'is_published' => $publish || $changelog->is_published,
            'published_at' => $publish && !$changelog->published_at ? now() : $changelog->published_at,
        ]));

        return redirect()
            ->route('superadmin.changelogs.index')
            ->with('success', "Version {$changelog->version} mise à jour.");
    }

    public function destroy(Changelog $changelog): RedirectResponse
    {
        $version = $changelog->version;
        $changelog->delete();

        return redirect()
            ->route('superadmin.changelogs.index')
            ->with('success', "Version {$version} supprimée.");
    }

    public function publish(Changelog $changelog): RedirectResponse
    {
        $changelog->publish();

        return back()->with('success', "Version {$changelog->version} publiée.");
    }

    private function validateChangelog(Request $request): array
    {
        return $request->validate([
            'version' => 'required|string|max:20',
            'title'   => 'required|string|max:255',
            'body'    => 'required|string',
            'type'    => 'required|in:feature,fix,improvement,security',
        ]);
    }
}
