<?php

namespace App\Http\Controllers;

use App\Services\DocumentVerifier;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Page publique de vérification d'authenticité des documents CONSTRUIRO.
 * URL : /verify/{token}
 * Ne révèle aucune donnée confidentielle.
 */
class DocumentVerifyController extends Controller
{
    private const TYPE_LABELS = [
        'invoice'  => 'Facture',
        'quote'    => 'Devis',
        'contract' => 'Contrat',
    ];

    public function show(Request $request, string $token): Response
    {
        // Token invalide (format)
        if (strlen($token) < 16 || strlen($token) > 64) {
            return $this->result('invalid', null, null);
        }

        $resolved = DocumentVerifier::resolveByToken($token);

        if (!$resolved) {
            return $this->result('not_found', null, null);
        }

        ['type' => $type, 'document' => $doc] = $resolved;

        // Vérification de l'intégrité (hash)
        $intact = DocumentVerifier::verify($doc);

        // Déterminer le statut d'affichage
        $displayStatus = match ($doc->status) {
            'cancelled', 'annulé'  => 'cancelled',
            default                => $intact ? 'authentic' : 'tampered',
        };

        return $this->result($displayStatus, $type, $doc);
    }

    // ── Helper ───────────────────────────────────────────────────────────────

    private function result(string $status, ?string $type, $doc): Response
    {
        $labels = [
            'authentic'  => ['fr' => 'Document authentique', 'en' => 'Authentic document',   'color' => 'green'],
            'cancelled'  => ['fr' => 'Document annulé',      'en' => 'Cancelled document',    'color' => 'red'],
            'tampered'   => ['fr' => 'Document modifié',     'en' => 'Modified document',     'color' => 'red'],
            'not_found'  => ['fr' => 'Document introuvable', 'en' => 'Document not found',    'color' => 'slate'],
            'invalid'    => ['fr' => 'Lien invalide',        'en' => 'Invalid link',          'color' => 'slate'],
        ];

        $info = $labels[$status] ?? $labels['invalid'];

        return Inertia::render('Verify/Show', [
            'status'       => $status,
            'label'        => $info,
            'document_type'=> $type ? (self::TYPE_LABELS[$type] ?? $type) : null,
            'reference'    => $doc?->code ?? null,
            'issued_at'    => $doc?->issue_date ? (string) $doc->issue_date : null,
            'issuer'       => $doc?->company?->name ?? null,
            'hash_short'   => $doc?->document_hash ? substr($doc->document_hash, 0, 16) . '…' : null,
        ]);
    }
}
