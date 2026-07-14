<?php

namespace App\Http\Controllers;

use App\Models\Client;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Gestion des clients (maîtres d'ouvrage).
 * Toutes les requêtes sont isolées par entreprise (multi-tenant) et
 * protégées par les permissions « clients.* » via le middleware de route.
 */
class ClientController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();

        $clients = Client::forUser($user)
            ->when($request->string('search')->toString(), function ($query, $search) {
                $query->where(fn ($q) => $q
                    ->where('name', 'like', "%{$search}%")
                    ->orWhere('code', 'like', "%{$search}%")
                    ->orWhere('contact_name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('phone', 'like', "%{$search}%"));
            })
            ->when($request->string('type')->toString(), fn ($q, $type) => $q->where('type', $type))
            ->latest()
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('Clients/Index', [
            'clients' => $clients,
            'filters' => $request->only('search', 'type'),
            'types'   => Client::TYPES,
            'can'     => [
                'create' => $user->can('clients.create'),
                'update' => $user->can('clients.update'),
                'delete' => $user->can('clients.delete'),
                'export' => $user->can('clients.export'),
            ],
        ]);
    }

    public function create(Request $request): Response
    {
        return Inertia::render('Clients/Create', [
            'types' => Client::TYPES,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $this->validateData($request);
        $data['company_id'] = $request->user()->company_id;

        $client = Client::create($data);

        return redirect()->route('clients.show', $client)
            ->with('success', 'Client créé avec succès.');
    }

    public function show(Request $request, Client $client): Response
    {
        $this->authorizeCompany($request->user(), $client);

        return Inertia::render('Clients/Show', [
            'client' => $client,
            'can'    => [
                'update' => $request->user()->can('clients.update'),
                'delete' => $request->user()->can('clients.delete'),
            ],
        ]);
    }

    public function edit(Request $request, Client $client): Response
    {
        $this->authorizeCompany($request->user(), $client);

        return Inertia::render('Clients/Edit', [
            'client' => $client,
            'types'  => Client::TYPES,
        ]);
    }

    public function update(Request $request, Client $client): RedirectResponse
    {
        $this->authorizeCompany($request->user(), $client);

        $client->update($this->validateData($request, $client));

        return redirect()->route('clients.show', $client)
            ->with('success', 'Client mis à jour.');
    }

    public function destroy(Request $request, Client $client): RedirectResponse
    {
        $this->authorizeCompany($request->user(), $client);

        $client->delete();

        return redirect()->route('clients.index')
            ->with('success', 'Client supprimé.');
    }

    /** Validation partagée création/mise à jour. */
    private function validateData(Request $request, ?Client $client = null): array
    {
        $companyId = $request->user()->company_id;

        return $request->validate([
            'code'         => ['required', 'string', 'max:50', Rule::unique('clients')->where('company_id', $companyId)->ignore($client?->id)],
            'type'         => ['required', Rule::in(Client::TYPES)],
            'name'         => ['required', 'string', 'max:255'],
            'contact_name' => ['nullable', 'string', 'max:255'],
            'phone'        => ['nullable', 'string', 'max:50'],
            'email'        => ['nullable', 'email', 'max:255'],
            'address'      => ['nullable', 'string', 'max:255'],
            'city'         => ['nullable', 'string', 'max:120'],
            'tax_id'       => ['nullable', 'string', 'max:50'],
            'notes'        => ['nullable', 'string'],
            'is_active'    => ['boolean'],
        ]);
    }

    /** Empêche l'accès à un client d'une autre entreprise. */
    private function authorizeCompany(User $user, Client $client): void
    {
        abort_unless($client->company_id === $user->company_id, 403);
    }
}
