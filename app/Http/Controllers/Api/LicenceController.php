<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Subscription;
use App\Services\LicenseConfig;
use App\Services\LicenseStateResolver;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * État de licence calculé CÔTÉ SERVEUR (cahier §9.4).
 * Appelé au chargement de l'application et périodiquement. Le client n'a
 * jamais autorité : il se conforme à cette réponse.
 */
class LicenceController extends Controller
{
    public function etat(Request $request, LicenseStateResolver $resolver): JsonResponse
    {
        $user = $request->user();
        $sub  = $user?->company_id
            ? Subscription::where('company_id', $user->company_id)->latest()->first()
            : null;

        if (!$sub) {
            return response()->json(['etat' => null]);
        }

        $etat = $resolver->resolve($sub);

        return response()->json([
            'etat'           => $etat,
            'libelle'        => LicenseConfig::libelleEtat($etat),
            'jours_restants' => $sub->daysRemaining(),
            'can_export'     => in_array($etat, Subscription::ETATS_COMPLETS, true),
            'is_decouverte'  => $etat === Subscription::FREE,
            'chantier_cap'   => $sub->chantierCap(),
            'date_fin'       => ($sub->ends_at ?? $sub->trial_ends_at)?->toIso8601String(),
            'date_purge'     => $sub->purge_at?->toIso8601String(),
            'exclusions'     => $etat === Subscription::FREE ? LicenseConfig::exclusionsGratuit() : [],
        ]);
    }
}
