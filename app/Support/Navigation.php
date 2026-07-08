<?php

namespace App\Support;

use App\Models\User;

/**
 * Construit la navigation du portail unique en fonction du rôle et des
 * permissions de l'utilisateur. Source : config/construiro.php.
 *
 * Un seul portail, des menus adaptés : chaque module n'apparaît que si
 * l'utilisateur possède au moins la permission « module.view ».
 */
class Navigation
{
    /**
     * Retourne les groupes de modules autorisés pour l'utilisateur.
     *
     * @return array<int, array{key:string,label:string,items:array}>
     */
    public static function for(?User $user, string $locale = 'fr'): array
    {
        if (! $user) {
            return [];
        }

        $modules = config('construiro.modules', []);
        $groups  = config('construiro.module_groups', []);
        $sections = [];

        // Modules déjà dotés d'écrans dédiés (route réelle au lieu du générique /app/*).
        $realRoutes = [
            'dashboard'      => '/dashboard',
            'projects'       => '/projects',
            'quotes'         => '/quotes',
            'invoicing'      => '/invoices',
            'clients'        => '/clients',
            'suppliers'      => '/suppliers',
            'contracts'      => '/contracts',
            'materials'      => '/materials',
            'warehouses'     => '/warehouses',
            'stocks'         => '/stocks',
            'purchases'      => '/purchases',
            'subcontractors' => '/subcontractors',
            'equipment'      => '/equipment',
            'planning'       => '/planning',
            'hr'             => '/hr',
            'attendance'     => '/attendance',
            'payroll'        => '/payroll',
            'treasury'       => '/treasury',
            'qhse'           => '/hse',
            'quality'        => '/quality',
            // Vague 5
            'unit_prices'       => '/unit-prices',
            'takeoff'           => '/takeoff',
            'boq'               => '/boq',
            'design_office'     => '/design-office',
            'crm'               => '/crm',
            'tenders'           => '/tenders',
            'machinery'         => '/machinery',
            'vehicles'          => '/vehicles',
            'fuel'              => '/fuel',
            'maintenance'       => '/maintenance',
            'budget'            => '/budget',
            'cost_accounting'   => '/cost-accounting',
            'accounting'        => '/accounting',
            'incoming_payments' => '/incoming-payments',
            'outgoing_payments' => '/outgoing-payments',
            'laboratory'        => '/laboratory',
            'documents'         => '/documents',
            'e_signature'       => '/e-signature',
            'reports'           => '/reports',
            'ai'                => '/ai',
            'administration' => '/admin/users',
        ];

        foreach ($groups as $groupKey => $groupLabels) {
            $items = [];

            foreach ($modules as $moduleKey => $def) {
                if (($def['group'] ?? null) !== $groupKey) {
                    continue;
                }
                // Le module est visible si l'utilisateur peut le consulter.
                if (! $user->can("{$moduleKey}.view")) {
                    continue;
                }

                $items[] = [
                    'key'   => $moduleKey,
                    'label' => $def['name'][$locale] ?? $def['name']['fr'] ?? $moduleKey,
                    'icon'  => $def['icon'] ?? 'circle',
                    // Route dédiée si l'écran existe, sinon route générique du module.
                    'route' => $realRoutes[$moduleKey] ?? "/app/{$moduleKey}",
                ];
            }

            if ($items !== []) {
                $sections[] = [
                    'key'   => $groupKey,
                    'label' => $groupLabels[$locale] ?? $groupLabels['fr'] ?? $groupKey,
                    'items' => $items,
                ];
            }
        }

        return $sections;
    }

    /**
     * Métadonnées du portail d'accueil de l'utilisateur.
     *
     * @return array{key:string,label:string,group:string,icon:string}
     */
    public static function portal(?User $user, string $locale = 'fr'): array
    {
        $key = $user?->primaryPortal() ?? 'direction_generale';
        $portals = config('construiro.portals', []);
        $def = $portals[$key] ?? ['name' => ['fr' => 'Portail'], 'group' => 'internal', 'icon' => 'building-2'];

        return [
            'key'   => $key,
            'label' => $def['name'][$locale] ?? $def['name']['fr'] ?? $key,
            'group' => $def['group'] ?? 'internal',
            'icon'  => $def['icon'] ?? 'building-2',
        ];
    }
}
