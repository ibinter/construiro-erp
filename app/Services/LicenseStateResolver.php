<?php

namespace App\Services;

use App\Models\Subscription;
use Carbon\Carbon;

/**
 * Calcul PUR de l'état de licence effectif à partir des dates + config.
 *
 * Ne modifie JAMAIS la base : l'état est dérivé (cahier §2 « l'état est calculé
 * côté serveur à chaque requête »). La matérialisation des transitions en base
 * est faite par la commande planifiée RecalculateLicenseStates (hors trafic HTTP).
 */
class LicenseStateResolver
{
    /**
     * Retourne l'état effectif d'un abonnement à l'instant présent, sans écriture.
     * Transitions du cahier :
     *   TRIAL  --fin--------> FREE (Découverte), sans coupure
     *   ACTIVE --échéance---> GRACE (grace_jours)
     *   GRACE  --fin--------> EXPIRED
     */
    public function resolve(Subscription $sub, ?Carbon $now = null): string
    {
        $now = $now ?: now();

        return match ($sub->status) {
            Subscription::DEMO  => Subscription::DEMO,
            Subscription::FREE  => Subscription::FREE,

            Subscription::TRIAL => ($sub->trial_ends_at && $sub->trial_ends_at->lte($now))
                ? Subscription::FREE                        // bascule automatique en Découverte
                : Subscription::TRIAL,

            Subscription::ACTIVE => $this->resolveActive($sub, $now),

            Subscription::GRACE => ($sub->grace_ends_at && $sub->grace_ends_at->lte($now))
                ? Subscription::EXPIRED
                : Subscription::GRACE,

            default => $sub->status ?: Subscription::EXPIRED, // legacy (cancelled…) → inchangé
        };
    }

    private function resolveActive(Subscription $sub, Carbon $now): string
    {
        if (!$sub->ends_at || $sub->ends_at->gt($now)) {
            return Subscription::ACTIVE;
        }
        $graceEnd = $sub->grace_ends_at ?: $sub->ends_at->copy()->addDays(LicenseConfig::graceJours());

        return $graceEnd->gt($now) ? Subscription::GRACE : Subscription::EXPIRED;
    }

    /**
     * Champs à écrire lors de la matérialisation d'une transition (dates dérivées).
     * Utilisé par la commande planifiée. Retourne [] si aucun changement.
     */
    public function transitionAttributes(Subscription $sub, ?Carbon $now = null): array
    {
        $now    = $now ?: now();
        $target = $this->resolve($sub, $now);
        if ($target === $sub->status) {
            return [];
        }

        $attrs = ['status' => $target];

        if ($target === Subscription::GRACE && !$sub->grace_ends_at) {
            $attrs['grace_ends_at'] = ($sub->ends_at ?: $now)->copy()->addDays(LicenseConfig::graceJours());
        }

        if ($target === Subscription::EXPIRED && !$sub->purge_at) {
            $attrs['purge_at'] = $now->copy()->addDays(LicenseConfig::retentionJours());
        }

        // Passage ESSAI → Découverte : plus de date de fin (gratuit à vie)
        if ($target === Subscription::FREE) {
            $attrs['ends_at'] = null;
        }

        return $attrs;
    }
}
