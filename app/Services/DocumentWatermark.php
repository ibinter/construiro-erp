<?php

namespace App\Services;

use App\Models\Subscription;

/**
 * Filigrane des documents générés (cahier §3.5, §11.5).
 *
 * « Généré avec CONSTRUIRO — ibigsoft.com » apparaît en pied des documents
 * produits aux paliers DEMO et Découverte (contrepartie du gratuit, canal
 * d'acquisition). Retiré automatiquement dès le premier paiement (ACTIVE).
 */
class DocumentWatermark
{
    public static function shouldStamp(?int $companyId): bool
    {
        if (!$companyId) {
            return false;
        }

        $sub = Subscription::where('company_id', $companyId)->latest()->first();

        return $sub !== null && LicenseConfig::filigranePourEtat($sub->status);
    }

    public static function text(): string
    {
        return LicenseConfig::filigraneTexte();
    }

    /** Texte du filigrane si applicable à la société, sinon null. */
    public static function forCompany(?int $companyId): ?string
    {
        return self::shouldStamp($companyId) ? self::text() : null;
    }
}
