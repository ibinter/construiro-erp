<?php

namespace App\Services;

use App\Models\Company;
use App\Models\Subscription;
use App\Models\User;

/**
 * Vérifications des limites du plan d'abonnement côté serveur.
 * Toujours appeler ces méthodes avant toute création de ressource limitée.
 */
class LicenseGuard
{
    /**
     * Vérifie que la société peut ajouter un utilisateur supplémentaire.
     *
     * @throws \Symfony\Component\HttpKernel\Exception\HttpException (402)
     */
    public static function checkUserLimit(int $companyId): void
    {
        $sub = Subscription::where('company_id', $companyId)->latest()->first();

        // Fail-closed : aucune licence, ou espace en lecture seule (EXPIRED).
        if (!$sub || $sub->status === Subscription::EXPIRED) {
            abort(402, "Aucun abonnement actif. Régularisez votre abonnement pour ajouter des utilisateurs.");
        }

        // Découverte / Demo : plafond gratuit (mono-utilisateur — cahier §3.2).
        if ($sub->isDecouverte() || $sub->isDemo()) {
            $limit = LicenseConfig::quotaGratuit('utilisateurs') ?? 1;
        } else {
            $plan = $sub->plan;
            if (!$plan) {
                abort(402, "Aucune formule active. Régularisez votre abonnement pour ajouter des utilisateurs.");
            }
            $limit = self::normalizeLimit($plan->max_users);
        }

        if ($limit === null) {
            return; // illimité
        }

        $current = User::where('company_id', $companyId)->where('is_active', true)->count();

        if ($current >= $limit) {
            abort(402, "Limite d'utilisateurs atteinte ({$current}/{$limit}). Passez à une formule supérieure.");
        }
    }

    /**
     * Vérifie que la société peut créer un projet supplémentaire.
     *
     * @throws \Symfony\Component\HttpKernel\Exception\HttpException (402)
     */
    public static function checkProjectLimit(int $companyId): void
    {
        $plan = self::activePlan($companyId);
        if (!$plan) {
            // Fail-closed : aucune licence active ⇒ aucune création (anti-fuite de licence).
            abort(402, "Aucun abonnement actif. Régularisez votre abonnement pour créer un projet.");
        }

        $limit = self::normalizeLimit($plan->max_projects);
        if ($limit === null) {
            return; // plan illimité
        }

        // On compare à tous les projets (pas seulement actifs) pour éviter la création sans fin
        $current = \App\Models\Project::where('company_id', $companyId)->count();

        if ($current >= $limit) {
            abort(402, "Limite de projets atteinte ({$current}/{$limit}). Passez à un plan supérieur.");
        }
    }

    /**
     * Vérifie que la société peut créer un chantier (modèle Site) supplémentaire.
     * C'est le COMPTEUR MÉTIER de CONSTRUIRO (cahier §6 : plafond Découverte = 1 chantier).
     * Le plafond vient de licence.config.json via Subscription::chantierCap().
     *
     * @throws \Symfony\Component\HttpKernel\Exception\HttpException (402)
     */
    public static function checkChantierLimit(int $companyId): void
    {
        $subscription = Subscription::where('company_id', $companyId)->latest()->first();

        // Aucune licence, ou espace en lecture seule (EXPIRED) : création bloquée (fail-closed).
        if (!$subscription || $subscription->status === Subscription::EXPIRED) {
            abort(402, "Aucun abonnement actif. Régularisez votre abonnement pour créer un chantier.");
        }

        $cap = $subscription->chantierCap(); // null = illimité
        if ($cap === null) {
            return;
        }

        $current = \App\Models\Site::where('company_id', $companyId)->count();

        if ($current >= $cap) {
            $mot = $cap > 1 ? 'chantiers' : 'chantier';
            abort(402, "Limite du palier Découverte atteinte ({$current}/{$cap} {$mot}). "
                . "Vos données restent accessibles et modifiables. "
                . "Passez à une formule payante pour ajouter des chantiers.");
        }
    }

    /**
     * Retourne les infos de consommation pour la page Billing.
     */
    public static function usage(int $companyId): array
    {
        $subscription = Subscription::where('company_id', $companyId)->latest()->first();
        $plan = $subscription?->plan;

        $userCount     = User::where('company_id', $companyId)->where('is_active', true)->count();
        $projectCount  = \App\Models\Project::where('company_id', $companyId)->count();
        $chantierCount = \App\Models\Site::where('company_id', $companyId)->count();

        $maxUsers    = $plan?->max_users;
        $maxProjects = $plan?->max_projects;
        $maxChantier = $subscription?->chantierCap();

        return [
            'users'     => ['used' => $userCount,     'max' => $maxUsers,    'unlimited' => $maxUsers    === null || $maxUsers    >= 9999],
            'projects'  => ['used' => $projectCount,  'max' => $maxProjects, 'unlimited' => $maxProjects === null || $maxProjects >= 9999],
            'chantiers' => ['used' => $chantierCount, 'max' => $maxChantier, 'unlimited' => $maxChantier === null],
            'plan'      => $plan?->name ?? ($subscription?->isDecouverte() ? 'Découverte' : null),
        ];
    }

    // ── Helpers ────────────────────────────────────────────────────────────────

    /**
     * Retourne le plan de l'abonnement actif (trial/active/grace), ou null
     * si la société n'a aucune licence en cours de validité.
     */
    private static function activePlan(int $companyId): ?\App\Models\SubscriptionPlan
    {
        $subscription = Subscription::where('company_id', $companyId)
            ->whereIn('status', ['trial', 'active', 'grace'])
            ->latest()
            ->first();

        return $subscription?->plan;
    }

    /**
     * Normalise une limite de plan : null ou ≥ 9999 (convention CONSTRUIRO)
     * signifie « illimité » ⇒ retourne null. Sinon la valeur entière.
     */
    private static function normalizeLimit($value): ?int
    {
        if ($value === null || $value >= 9999) {
            return null;
        }

        return (int) $value;
    }
}
