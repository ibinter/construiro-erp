<?php

namespace App\Http\Controllers;

use App\Models\Document;
use App\Models\Project;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Symfony\Component\HttpFoundation\StreamedResponse;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Module Gestion documentaire (GED).
 * Gère l'upload réel des fichiers sur le disque « public » ainsi que leurs
 * métadonnées. Toutes les requêtes sont isolées par entreprise (multi-tenant)
 * et protégées par les permissions « documents.* » via le middleware de route.
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
        $companyId = $request->user()->company_id;

        $data = $this->validateData($request);
        $data['company_id'] = $companyId;

        // Upload réel optionnel : écrase les métadonnées de fichier saisies.
        $this->applyUploadedFile($request, $data, $companyId);

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

        $companyId = $request->user()->company_id;
        $data = $this->validateData($request, $document);

        // Nouveau fichier : supprime l'ancien du disque avant remplacement.
        if ($request->hasFile('file')) {
            if ($document->file_path && Storage::disk('public')->exists($document->file_path)) {
                Storage::disk('public')->delete($document->file_path);
            }
            $this->applyUploadedFile($request, $data, $companyId);
        }

        $document->update($data);

        return redirect()->route('documents.show', $document)
            ->with('success', 'Document mis à jour.');
    }

    public function download(Request $request, Document $document): StreamedResponse
    {
        $user = $request->user();

        abort_unless($document->company_id === $user->company_id && $user->can('documents.view'), 403);
        abort_unless($document->file_path && Storage::disk('public')->exists($document->file_path), 404);

        return Storage::disk('public')->download($document->file_path, $document->file_name);
    }

    public function destroy(Request $request, Document $document): RedirectResponse
    {
        $this->authorizeCompany($request->user(), $document);

        if ($document->file_path && Storage::disk('public')->exists($document->file_path)) {
            Storage::disk('public')->delete($document->file_path);
        }

        $document->delete();

        return redirect()->route('documents.index')
            ->with('success', 'Document supprimé.');
    }

    /** Validation partagée création/mise à jour (métadonnées). */
    private function validateData(Request $request, ?Document $document = null): array
    {
        $companyId = $request->user()->company_id;

        $validated = $request->validate([
            'code'        => ['required', 'string', 'max:50', Rule::unique('documents')->where('company_id', $companyId)->ignore($document?->id)],
            'title'       => ['required', 'string', 'max:255'],
            'category'    => ['required', Rule::in(Document::CATEGORIES)],
            'file'        => ['nullable', 'file', 'max:20480'], // 20 Mo — upload réel optionnel
            'file_name'   => ['nullable', 'string', 'max:255'],
            'file_path'   => ['nullable', 'string', 'max:2048'],
            'mime_type'   => ['nullable', 'string', 'max:120'],
            'size_kb'     => ['nullable', 'integer', 'min:0'],
            'version'     => ['required', 'string', 'max:20'],
            'uploaded_by' => ['nullable', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'project_id'  => ['nullable', 'integer', Rule::exists('projects', 'id')->where('company_id', $companyId)],
        ]);

        // Le fichier lui-même n'est pas une colonne : géré séparément.
        unset($validated['file']);

        return $validated;
    }

    /**
     * Si un fichier est présent dans la requête, le stocke sur le disque public
     * (dossier isolé par entreprise) et renseigne les métadonnées associées.
     */
    private function applyUploadedFile(Request $request, array &$data, int $companyId): void
    {
        if (! $request->hasFile('file')) {
            return;
        }

        $file = $request->file('file');

        $data['file_path'] = Storage::disk('public')->putFile('documents/'.$companyId, $file);
        $data['file_name'] = $file->getClientOriginalName();
        $data['mime_type'] = $file->getMimeType();
        $data['size_kb']   = intval($file->getSize() / 1024);
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
