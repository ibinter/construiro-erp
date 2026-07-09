<?php

namespace App\Http\Controllers;

use App\Models\Site;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Écran « Chantiers » dédié : liste transversale de tous les chantiers de
 * l'entreprise (tous projets confondus) et fiche chantier en lecture seule.
 *
 * Les chantiers restent créés / modifiés depuis la fiche projet
 * (voir SiteController). Cet écran n'expose que la consultation.
 * Isolation multi-tenant stricte via company_id.
 */
class SiteIndexController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();

        $sites = Site::where('company_id', $user->company_id)
            ->with(['project:id,name', 'siteManager:id,name'])
            ->when($request->string('search')->toString(), function ($query, $search) {
                $query->where(fn ($q) => $q
                    ->where('name', 'like', "%{$search}%")
                    ->orWhere('code', 'like', "%{$search}%")
                    ->orWhereHas('project', fn ($p) => $p->where('name', 'like', "%{$search}%")));
            })
            ->when($request->string('status')->toString(), fn ($q, $status) => $q->where('status', $status))
            ->latest()
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('Sites/Index', [
            'sites'    => $sites,
            'filters'  => $request->only('search', 'status'),
            'statuses' => Site::STATUSES,
            'can'      => [
                'view'   => $user->can('sites.view'),
                'update' => $user->can('sites.update'),
                'delete' => $user->can('sites.delete'),
            ],
        ]);
    }

    public function show(Request $request, Site $site): Response
    {
        $user = $request->user();

        abort_unless($site->company_id === $user->company_id, 403);

        $site->load(['project:id,name', 'siteManager:id,name']);

        return Inertia::render('Sites/Show', [
            'site' => $site,
            'can'  => [
                'update' => $user->can('sites.update'),
                'delete' => $user->can('sites.delete'),
            ],
        ]);
    }
}
