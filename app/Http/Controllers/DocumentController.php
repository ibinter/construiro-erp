<?php

namespace App\Http\Controllers;

use App\Models\Document;
use App\Models\Project;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Module Gestion documentaire (GED).
 * Enregistre uniquement les MÉTADONNÉES des documents (pas d'upload réel :
 * le chemin ou l'URL est saisi manuellement). Toutes les requêtes sont
 * isolées par entreprise (multi-tenant) et protégées par les permissions
 * « documents.* » via le middleware de route.
 */
class DocumentController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();

        $documents = Document::forUser($user)
            ->with('project:id,name')
            ->when($request->string('search')->toString(), function ($query, $search) {
                $query->where(fn ($q) => $q
                    ->where('title', 'like', "%{$search}%")
                    ->orWhere('code', 'like', "%{$search}%")
                    ->orWhere('file_name', 'like', "%{$search}%"));
            })
            ->when($request->string('category')->toString(), fn ($q, $category) => $q->where('category', $category))
            ->latest()
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('Documents/Index', [
            'documents'  => $documents,
            'filters'    => $request->only('search', 'category'),
            'categories' => Document::CATEGORIES,
            'can'        => [
                'create' => $user->can('documents.create'),
                'update' => $user->can('documents.update'),
                'delete' => $user->can('documents.delete'),
            ],
        ]);
    }

    public function create(Request $request): Response
    {
        return Inertia::render('Documents/Create', [
            'projects'   => $this->projects($request->user()),
            'categories' => Document::CATEGORIES,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        // Enregistre les métadonnées uniquement (chemin/URL saisi manuellement).
        $data = $this->validateData($request);
        $data['company_id'] = $request->user()->company_id;

        $document = Document::create($data);

        return redirect()->route('documents.show', $document)
            ->with('success', 'Document enregistré avec succès.');
    }

    public function show(Request $request, Document $document): Response
    {
        $this->authorizeCompany($request->user(), $document);

        $document->load('project:id,name');

        return Inertia::render('Documents/Show', [
            'document' => $document,
            'can'      => [
                'update' => $request->user()->can('documents.update'),
                'delete' => $request->user()->can('documents.delete'),
            ],
        ]);
    }

    public function edit(Request $request, Document $document): Response
    {
        $this->authorizeCompany($request->user(), $document);

        return Inertia::render('Documents/Edit', [
            'document'   => $document,
            'projects'   => $this->projects($request->user()),
            'categories' => Document::CATEGORIES,
        ]);
    }

    public function update(Request $request, Document $document): RedirectResponse
    {
        $this->authorizeCompany($request->user(), $document);

        $document->update($this->validateData($request, $document));

        return redirect()->route('documents.show', $document)
            ->with('success', 'Document mis à jour.');
    }

    public function destroy(Request $request, Document $document): RedirectResponse
    {
        $this->authorizeCompany($request->user(), $document);

        $document->delete();

        return redirect()->route('documents.index')
            ->with('success', 'Document supprimé.');
    }

    /** Validation partagée création/mise à jour (métadonnées). */
    private function validateData(Request $request, ?Document $document = null): array
    {
        $companyId = $request->user()->company_id;

        return $request->validate([
            'code'        => ['required', 'string', 'max:50', Rule::unique('documents')->where('company_id', $companyId)->ignore($document?->id)],
            'title'       => ['required', 'string', 'max:255'],
            'category'    => ['required', Rule::in(Document::CATEGORIES)],
            'file_name'   => ['nullable', 'string', 'max:255'],
            'file_path'   => ['nullable', 'string', 'max:2048'],
            'mime_type'   => ['nullable', 'string', 'max:120'],
            'size_kb'     => ['nullable', 'integer', 'min:0'],
            'version'     => ['required', 'string', 'max:20'],
            'uploaded_by' => ['nullable', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'project_id'  => ['nullable', 'integer', Rule::exists('projects', 'id')->where('company_id', $companyId)],
        ]);
    }

    /** Liste des projets de l'entreprise pour le rattachement. */
    private function projects(User $user)
    {
        return Project::where('company_id', $user->company_id)
            ->orderBy('name')
            ->get(['id', 'name', 'code']);
    }

    /** Empêche l'accès à un document d'une autre entreprise. */
    private function authorizeCompany(User $user, Document $document): void
    {
        abort_unless($document->company_id === $user->company_id, 403);
    }
}
