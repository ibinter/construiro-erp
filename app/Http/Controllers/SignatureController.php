<?php

namespace App\Http\Controllers;

use App\Models\Contract;
use App\Models\Document;
use App\Models\Quote;
use App\Models\SignatureRequest;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Module Signature électronique.
 * Modélise le WORKFLOW de signature (statut) sans signature cryptographique
 * réelle. Toutes les requêtes sont isolées par entreprise (multi-tenant) et
 * protégées par les permissions « e_signature.* » via le middleware de route.
 */
class SignatureController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();

        $requests = SignatureRequest::forUser($user)
            ->with('document:id,title,code')
            ->when($request->string('status')->toString(), fn ($q, $status) => $q->where('status', $status))
            ->latest()
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('Signatures/Index', [
            'requests'  => $requests,
            'filters'   => $request->only('status'),
            'statuses'  => SignatureRequest::STATUSES,
            'documents' => $this->documents($user),
            'can'       => [
                'create' => $user->can('e_signature.create'),
                'update' => $user->can('e_signature.update'),
            ],
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $user = $request->user();
        $companyId = $user->company_id;

        $data = $request->validate([
            'title'        => ['required', 'string', 'max:255'],
            'signer_name'  => ['required', 'string', 'max:255'],
            'signer_email' => ['nullable', 'email', 'max:255'],
            'document_id'  => ['nullable', 'integer', Rule::exists('documents', 'id')->where('company_id', $companyId)],
            'notes'        => ['nullable', 'string'],
        ]);

        SignatureRequest::create(array_merge($data, [
            'company_id' => $companyId,
            'status'     => 'pending',
            'sent_at'    => now()->toDateString(),
        ]));

        return redirect()->route('e_signature.index')
            ->with('success', 'Demande de signature créée.');
    }

    /**
     * Simule le workflow : marque la demande comme signée ou refusée.
     * Attend un champ « action » ∈ {sign, refuse}.
     */
    public function updateStatus(Request $request, SignatureRequest $signatureRequest): RedirectResponse
    {
        $this->authorizeCompany($request->user(), $signatureRequest);

        $data = $request->validate([
            'action' => ['required', Rule::in(['sign', 'refuse'])],
        ]);

        $signatureRequest->update([
            'status'    => $data['action'] === 'sign' ? 'signed' : 'refused',
            'signed_at' => now()->toDateString(),
        ]);

        $message = $data['action'] === 'sign'
            ? 'Demande marquée comme signée.'
            : 'Demande marquée comme refusée.';

        return redirect()->route('e_signature.index')->with('success', $message);
    }

    /**
     * Signature électronique simple côté serveur (SHA-256 + horodatage + nom).
     * Modèle attendu : 'quote' ou 'contract'.
     */
    public function sign(Request $request, string $model, int $id): RedirectResponse
    {
        $record = match ($model) {
            'quote'    => Quote::findOrFail($id),
            'contract' => Contract::findOrFail($id),
            default    => abort(404),
        };

        abort_if($record->company_id !== $request->user()->company_id, 403);
        abort_if($record->signed_at !== null, 422, 'Déjà signé');

        $request->validate(['signed_by' => 'required|string|max:255']);

        $hash = hash('sha256', implode('|', [
            $model, $id, $record->company_id,
            $request->signed_by, now()->toISOString(),
            config('app.key'),
        ]));

        $record->update([
            'signed_at'      => now(),
            'signed_by'      => $request->signed_by,
            'signature_hash' => $hash,
            'signature_ip'   => $request->ip(),
        ]);

        return back()->with('success', 'Document signé avec succès.');
    }

    /** Documents de l'entreprise, candidats à une demande de signature. */
    private function documents(User $user)
    {
        return Document::where('company_id', $user->company_id)
            ->orderBy('title')
            ->get(['id', 'title', 'code']);
    }

    /** Empêche l'accès à une demande d'une autre entreprise. */
    private function authorizeCompany(User $user, SignatureRequest $signatureRequest): void
    {
        abort_unless($signatureRequest->company_id === $user->company_id, 403);
    }
}
