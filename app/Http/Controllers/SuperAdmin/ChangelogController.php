<?php

namespace App\Http\Controllers\SuperAdmin;

use App\Http\Controllers\Controller;
use App\Mail\NewVersionMail;
use App\Models\Changelog;
use App\Models\User;
use App\Notifications\NewVersionNotification;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
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

        if ($publish) {
            $this->notifyAdmins($entry);
        }

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

        $wasAlreadyPublished = $changelog->is_published;

        $changelog->update(array_merge($validated, [
            'is_published' => $publish || $changelog->is_published,
            'published_at' => $publish && !$changelog->published_at ? now() : $changelog->published_at,
        ]));

        if ($publish && !$wasAlreadyPublished) {
            $this->notifyAdmins($changelog);
        }

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
        $alreadyPublished = $changelog->is_published;

        $changelog->publish();

        \Log::info('[Changelog] Version publiée', [
            'version'      => $changelog->version,
            'title'        => $changelog->title,
            'published_at' => $changelog->published_at,
        ]);

        if (!$alreadyPublished) {
            $this->notifyAdmins($changelog);
        }

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

    /**
     * Envoie un email queued + notification in-app à tous les admins
     * des entreprises actives (status: trial, active, grace).
     */
    private function notifyAdmins(Changelog $changelog): void
    {
        $adminUsers = User::whereHas('company', fn ($q) =>
            $q->whereIn('status', ['trial', 'active', 'grace'])
        )->whereHas('roles', fn ($q) =>
            $q->whereIn('name', ['direction_generale', 'admin', 'super_admin'])
        )->limit(500)->get();

        foreach ($adminUsers as $user) {
            try {
                Mail::to($user->email)->queue(new NewVersionMail($changelog));
                $user->notify(new NewVersionNotification($changelog));
            } catch (\Throwable) {
                // On ne bloque pas la publication si une notification échoue.
            }
        }

        \Log::info('[Changelog] Notifications envoyées', [
            'version'    => $changelog->version,
            'recipients' => $adminUsers->count(),
        ]);
    }
}
