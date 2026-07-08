<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Agency;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Administration des utilisateurs de l'entreprise.
 * Toutes les requêtes sont isolées par entreprise (multi-tenant) et
 * protégées par les permissions « administration.* » via le middleware de route.
 */
class UserController extends Controller
{
    public function index(Request $request): Response
    {
        $auth = $request->user();

        $users = User::where('company_id', $auth->company_id)
            ->when($request->string('search')->toString(), function ($query, $search) {
                $query->where(fn ($q) => $q
                    ->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%"));
            })
            ->orderBy('name')
            ->paginate(10)
            ->withQueryString()
            ->through(fn (User $user) => [
                'id'        => $user->id,
                'name'      => $user->name,
                'email'     => $user->email,
                'job_title' => $user->job_title,
                'is_active' => $user->is_active,
                'roles'     => $user->getRoleNames(),
            ]);

        return Inertia::render('Admin/Users/Index', [
            'users'   => $users,
            'filters' => $request->only('search'),
            'roles'   => $this->roleLabels(),
            'can'     => [
                'create' => $auth->can('administration.create'),
                'update' => $auth->can('administration.update'),
                'delete' => $auth->can('administration.delete'),
            ],
        ]);
    }

    public function create(Request $request): Response
    {
        return Inertia::render('Admin/Users/Create', [
            'roles'    => $this->roleOptions(),
            'agencies' => $this->agencies($request->user()),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $this->validateData($request);

        $user = User::create([
            'company_id'           => $request->user()->company_id,
            'agency_id'            => $data['agency_id'] ?? null,
            'name'                 => $data['name'],
            'email'                => $data['email'],
            'phone'                => $data['phone'] ?? null,
            'job_title'            => $data['job_title'] ?? null,
            'is_active'            => $data['is_active'] ?? true,
            'password'             => Hash::make('password'),
            'must_change_password' => true,
        ]);

        $user->syncRoles([$data['role']]);

        return redirect()->route('admin.users.index')
            ->with('success', 'Utilisateur créé avec succès. Mot de passe initial : « password ».');
    }

    public function edit(Request $request, User $user): Response
    {
        $this->authorizeCompany($request->user(), $user);

        return Inertia::render('Admin/Users/Edit', [
            'user' => [
                'id'        => $user->id,
                'name'      => $user->name,
                'email'     => $user->email,
                'phone'     => $user->phone,
                'job_title' => $user->job_title,
                'agency_id' => $user->agency_id,
                'is_active' => $user->is_active,
                'role'      => $user->getRoleNames()->first(),
            ],
            'roles'    => $this->roleOptions(),
            'agencies' => $this->agencies($request->user()),
        ]);
    }

    public function update(Request $request, User $user): RedirectResponse
    {
        $this->authorizeCompany($request->user(), $user);

        $data = $this->validateData($request, $user);

        $user->update([
            'agency_id' => $data['agency_id'] ?? null,
            'name'      => $data['name'],
            'email'     => $data['email'],
            'phone'     => $data['phone'] ?? null,
            'job_title' => $data['job_title'] ?? null,
            'is_active' => $data['is_active'] ?? true,
        ]);

        $user->syncRoles([$data['role']]);

        return redirect()->route('admin.users.index')
            ->with('success', 'Utilisateur mis à jour.');
    }

    public function destroy(Request $request, User $user): RedirectResponse
    {
        $this->authorizeCompany($request->user(), $user);

        // On ne peut pas supprimer son propre compte.
        abort_if($user->id === $request->user()->id, 403);

        $user->delete();

        return redirect()->route('admin.users.index')
            ->with('success', 'Utilisateur supprimé.');
    }

    /** Validation partagée création / mise à jour. */
    private function validateData(Request $request, ?User $user = null): array
    {
        $companyId = $request->user()->company_id;

        return $request->validate([
            'name'      => ['required', 'string', 'max:255'],
            'email'     => ['required', 'string', 'email', 'max:255', Rule::unique('users')->ignore($user?->id)],
            'phone'     => ['nullable', 'string', 'max:40'],
            'job_title' => ['nullable', 'string', 'max:120'],
            'role'      => ['required', 'string', Rule::in($this->availableRoleKeys())],
            'agency_id' => ['nullable', 'integer', Rule::exists('agencies', 'id')->where('company_id', $companyId)],
            'is_active' => ['boolean'],
        ]);
    }

    /** Liste des agences de l'entreprise. */
    private function agencies(User $user)
    {
        return Agency::where('company_id', $user->company_id)
            ->orderBy('name')
            ->get(['id', 'name']);
    }

    /** Clés des rôles assignables (portails), hors super_admin. */
    private function availableRoleKeys(): array
    {
        return array_values(array_diff(
            array_keys(config('construiro.portals', [])),
            ['super_admin']
        ));
    }

    /** Rôles assignables sous forme [ ['value' => clé, 'label' => libellé FR] ]. */
    private function roleOptions(): array
    {
        $options = [];

        foreach (config('construiro.portals', []) as $key => $def) {
            if ($key === 'super_admin') {
                continue;
            }
            $options[] = [
                'value' => $key,
                'label' => $def['name']['fr'] ?? $key,
            ];
        }

        return $options;
    }

    /** Table de correspondance clé => libellé FR (pour l'affichage en liste). */
    private function roleLabels(): array
    {
        $labels = [];

        foreach (config('construiro.portals', []) as $key => $def) {
            $labels[$key] = $def['name']['fr'] ?? $key;
        }

        return $labels;
    }

    /** Empêche l'accès à un utilisateur d'une autre entreprise. */
    private function authorizeCompany(User $auth, User $target): void
    {
        abort_unless($target->company_id === $auth->company_id, 403);
    }
}
