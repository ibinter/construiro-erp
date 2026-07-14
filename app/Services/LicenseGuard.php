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
        $limit = self::getLimit($companyId, 'max_users');
        if ($limit === null) {
            return; // illimité
        }

        $current = User::where('company_id', $companyId)->where('is_active', true)->count();

        if ($current >= $limit) {
            abort(402, "Limite d'utilisateurs atteinte ({$current}/{$limit}). Passez à un plan supérieur.");
        }
    }

    /**
     * Vérifie que la société peut créer un projet supplémentaire.
     *
     * @throws \Symfony\Component\HttpKernel\Exception\HttpException (402)
     */
    public static function checkProjectLimit(int $companyId): void
    {
        $limit = self::getLimit($companyId, 'max_projects');
        if ($limit === null) {
            return;
        }

        // On compare à tous les projets (pas seulement actifs) pour éviter la création sans fin
        $current = \App\Models\Project::where('company_id', $companyId)->count();

        if ($current >= $limit) {
            abort(402, "Limite de projets atteinte ({$current}/{$limit}). Passez à un plan supérieur.");
        }
    }

    /**
     * Retourne les infos de consommation pour la page Billing.
     */
    public static function usage(int $companyId): array
    {
        $subscription = Subscription::where('company_id', $companyId)->latest()->first();
        $plan = $subscription?->plan;

        $userCount    = User::where('company_id', $companyId)->where('is_active', true)->count();
        $projectCount = \App\Models\Project::where('company_id', $companyId)->count();

        $maxUsers    = $plan?->max_users;
        $maxProjects = $plan?->max_projects;

        return [
            'users'    => ['used' => $userCount,    'max' => $maxUsers,    'unlimited' => $maxUsers    === null || $maxUsers    >= 9999],
            'projects' => ['used' => $projectCount, 'max' => $maxProjects, 'unlimited' => $maxProjects === null || $maxProjects >= 9999],
            'plan'     => $plan?->name,
        ];
    }

    // ── Helpers ────────────────────────────────────────────────────────────────

    private static function getLimit(int $companyId, string $field): ?int
    {
        $subscription = Subscription::where('company_id', $companyId)
            ->whereIn('status', ['trial', 'active', 'grace'])
            ->latest()
            ->first();

        if (!$subscription || !$subscription->plan) {
            return null; // pas de plan actif → pas de limite imposée
        }

        $value = $subscription->plan->{$field};

        // 9999 = illimité (convention CONSTRUIRO)
        if ($value === null || $value >= 9999) {
            return null;
        }

        return (int) $value;
    }
}
