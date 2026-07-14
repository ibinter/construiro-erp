<?php

namespace App\Services;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

/**
 * Gestion des tokens de vérification et empreintes des documents officiels.
 * Les tokens sont aléatoires, non prévisibles et stockés côté serveur.
 */
class DocumentVerifier
{
    /**
     * Génère un token unique et calcule l'empreinte du document.
     * À appeler à chaque génération de PDF ou validation du document.
     */
    public static function stamp(Model $document): void
    {
        $token = $document->verify_token ?? Str::random(48);
        $hash  = self::computeHash($document);

        $document->updateQuietly([
            'verify_token'  => $token,
            'document_hash' => $hash,
        ]);
    }

    /**
     * Calcule le hash SHA-256 des champs significatifs du document.
     */
    public static function computeHash(Model $document): string
    {
        $significant = self::significantFields($document);
        return hash('sha256', json_encode($significant, JSON_UNESCAPED_UNICODE));
    }

    /**
     * Vérifie l'intégrité d'un document par recalcul du hash.
     */
    public static function verify(Model $document): bool
    {
        if (!$document->verify_token || !$document->document_hash) {
            return false;
        }
        return hash_equals($document->document_hash, self::computeHash($document));
    }

    /**
     * Résout un token vers le document correspondant (tous types).
     */
    public static function resolveByToken(string $token): ?array
    {
        $models = [
            'invoice'  => \App\Models\Invoice::class,
            'quote'    => \App\Models\Quote::class,
            'contract' => \App\Models\Contract::class,
        ];

        foreach ($models as $type => $class) {
            $doc = $class::where('verify_token', $token)->first();
            if ($doc) {
                return ['type' => $type, 'document' => $doc];
            }
        }

        return null;
    }

    // ── Helpers ──────────────────────────────────────────────────────────────

    private static function significantFields(Model $doc): array
    {
        $class = get_class($doc);

        return match (true) {
            str_contains($class, 'Invoice') => [
                'code'       => $doc->code,
                'client_id'  => $doc->client_id,
                'total'      => (string) $doc->total,
                'issue_date' => (string) $doc->issue_date,
                'due_date'   => (string) $doc->due_date,
                'status'     => $doc->status,
            ],
            str_contains($class, 'Quote') => [
                'code'       => $doc->code,
                'client_id'  => $doc->client_id,
                'total'      => (string) $doc->total,
                'issue_date' => (string) $doc->issue_date,
                'status'     => $doc->status,
            ],
            str_contains($class, 'Contract') => [
                'reference'  => $doc->reference ?? $doc->id,
                'party_name' => $doc->party_name,
                'type'       => $doc->type,
                'status'     => $doc->status,
            ],
            default => ['id' => $doc->id, 'updated_at' => (string) $doc->updated_at],
        };
    }
}
