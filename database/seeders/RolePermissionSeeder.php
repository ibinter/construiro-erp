<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

/**
 * Génère toutes les permissions à partir de config/construiro.php,
 * crée le rôle super_admin (tous droits) et les 29 rôles-portails
 * avec un jeu de permissions par défaut.
 */
class RolePermissionSeeder extends Seeder
{
    public function run(): void
    {
        app(PermissionRegistrar::class)->forgetCachedPermissions();

        // 1) Générer les permissions « module.action » depuis la config.
        $defaultActions = config('construiro.default_actions', ['view', 'create', 'update', 'delete', 'export']);
        $allPermissions = [];

        foreach (config('construiro.modules', []) as $module => $def) {
            $actions = $def['actions'] ?? $defaultActions;
            foreach ($actions as $action) {
                $name = "{$module}.{$action}";
                $allPermissions[] = $name;
                Permission::findOrCreate($name, 'web');
            }
        }

        // 2) super_admin : tous les droits (voir aussi Gate::before dans AppServiceProvider).
        $superAdmin = Role::findOrCreate('super_admin', 'web');
        $superAdmin->syncPermissions(Permission::all());

        // ibig_superadmin : rôle réservé à l'équipe IBIG Soft pour la console globale.
        Role::findOrCreate('ibig_superadmin', 'web');

        // 3) Créer un rôle par portail avec ses permissions par défaut.
        foreach ($this->portalPermissions() as $portal => $rules) {
            $role = Role::findOrCreate($portal, 'web');
            $role->syncPermissions($this->expandRules($rules, $defaultActions));
        }

        app(PermissionRegistrar::class)->forgetCachedPermissions();
    }

    /**
     * Transforme une carte [module => actions] en liste de permissions concrètes.
     * actions peut valoir '*' (toutes) ou une liste explicite.
     */
    private function expandRules(array $rules, array $defaultActions): array
    {
        $modules = config('construiro.modules', []);
        $permissions = [];

        foreach ($rules as $module => $actions) {
            if (! isset($modules[$module])) {
                continue;
            }
            $available = $modules[$module]['actions'] ?? $defaultActions;
            $wanted = $actions === '*' ? $available : (array) $actions;

            foreach (array_intersect($wanted, $available) as $action) {
                $permissions[] = "{$module}.{$action}";
            }
        }

        return $permissions;
    }

    /**
     * Définition des droits par portail. '*' = CRUD complet, sinon liste d'actions.
     * Tous les portails ont au minimum l'accès au tableau de bord.
     */
    private function portalPermissions(): array
    {
        $ro = ['view'];             // lecture seule
        $rc = ['view', 'create'];   // consulter + créer

        return [
            // --- Direction / pilotage -------------------------------------------------
            'direction_generale' => [
                'dashboard' => '*', 'projects' => '*', 'sites' => '*', 'planning' => ['view'],
                'budget' => '*', 'treasury' => '*', 'cost_accounting' => '*', 'accounting' => $ro,
                'bi' => $ro, 'reports' => '*', 'ai' => '*', 'contracts' => $ro, 'invoicing' => $ro,
            ],
            'directeur_projet' => [
                'dashboard' => ['view'], 'projects' => '*', 'sites' => '*', 'planning' => '*',
                'budget' => '*', 'quotes' => '*', 'boq' => '*', 'contracts' => '*',
                'purchases' => ['view', 'create', 'update'], 'bi' => $ro, 'reports' => '*', 'documents' => '*', 'ai' => '*',
            ],
            'conducteur_travaux' => [
                'dashboard' => ['view'], 'sites' => '*', 'planning' => '*', 'materials' => '*',
                'purchases' => $rc, 'attendance' => '*', 'equipment' => $ro, 'reports' => ['view', 'export'],
                'documents' => $rc, 'qhse' => $rc,
            ],
            'chef_chantier' => [
                'dashboard' => ['view'], 'sites' => ['view', 'update'], 'attendance' => '*',
                'materials' => $rc, 'purchases' => $rc, 'documents' => $rc, 'qhse' => $rc,
                'planning' => $ro,
            ],
            'ouvrier' => [
                'dashboard' => ['view'], 'attendance' => ['view'], 'documents' => ['view'],
            ],

            // --- Magasin / Achats -----------------------------------------------------
            'magasinier' => [
                'dashboard' => ['view'], 'stocks' => '*', 'warehouses' => '*', 'materials' => '*',
                'purchases' => $ro, 'reports' => ['view', 'export'],
            ],
            'achats' => [
                'dashboard' => ['view'], 'purchases' => '*', 'suppliers' => '*', 'materials' => $ro,
                'stocks' => $ro, 'contracts' => $rc, 'reports' => ['view', 'export'],
            ],

            // --- Finance / RH ---------------------------------------------------------
            'comptabilite' => [
                'dashboard' => ['view'], 'accounting' => '*', 'cost_accounting' => '*', 'treasury' => '*',
                'invoicing' => '*', 'incoming_payments' => '*', 'outgoing_payments' => '*',
                'budget' => $ro, 'reports' => '*',
            ],
            'rh' => [
                'dashboard' => ['view'], 'hr' => '*', 'attendance' => '*', 'payroll' => '*',
                'documents' => $rc, 'reports' => ['view', 'export'],
            ],

            // --- Maintenance / Parc ---------------------------------------------------
            'maintenance' => [
                'dashboard' => ['view'], 'maintenance' => '*', 'equipment' => '*', 'machinery' => '*',
                'vehicles' => '*', 'fuel' => '*', 'reports' => ['view', 'export'],
            ],

            // --- QHSE / Qualité -------------------------------------------------------
            'qhse' => [
                'dashboard' => ['view'], 'qhse' => '*', 'documents' => $rc, 'reports' => ['view', 'export'],
            ],
            'qualite' => [
                'dashboard' => ['view'], 'quality' => '*', 'laboratory' => $ro, 'documents' => $rc,
                'reports' => ['view', 'export'],
            ],
            'laboratoire' => [
                'dashboard' => ['view'], 'laboratory' => '*', 'quality' => $ro, 'documents' => $rc,
            ],

            // --- Portails externes ----------------------------------------------------
            'client' => [
                'dashboard' => ['view'], 'projects' => $ro, 'sites' => $ro, 'invoicing' => $ro,
                'incoming_payments' => $ro, 'documents' => $ro, 'contracts' => $ro,
            ],
            'promoteur' => [
                'dashboard' => ['view'], 'projects' => $ro, 'sites' => $ro, 'invoicing' => $ro,
                'documents' => $ro, 'reports' => ['view'],
            ],
            'acquereur' => [
                'dashboard' => ['view'], 'projects' => $ro, 'invoicing' => $ro,
                'incoming_payments' => $ro, 'documents' => $ro,
            ],
            'fournisseur' => [
                'dashboard' => ['view'], 'purchases' => $ro, 'invoicing' => $rc, 'documents' => $ro,
            ],
            'sous_traitant' => [
                'dashboard' => ['view'], 'subcontractors' => $ro, 'contracts' => $ro,
                'attendance' => $ro, 'documents' => $rc, 'invoicing' => $rc,
            ],
            'architecte' => [
                'dashboard' => ['view'], 'projects' => $ro, 'documents' => '*', 'design_office' => $rc,
            ],
            'bureau_etudes' => [
                'dashboard' => ['view'], 'design_office' => '*', 'takeoff' => '*', 'boq' => '*',
                'quotes' => $rc, 'documents' => '*',
            ],
            'bureau_controle' => [
                'dashboard' => ['view'], 'quality' => $rc, 'qhse' => $ro, 'documents' => '*', 'sites' => $ro,
            ],
            'mission_controle' => [
                'dashboard' => ['view'], 'sites' => $ro, 'quality' => $rc, 'documents' => '*',
            ],
            'ingenieur_conseil' => [
                'dashboard' => ['view'], 'design_office' => $ro, 'quality' => $rc, 'documents' => '*',
            ],
            'banque' => [
                'dashboard' => ['view'], 'treasury' => $ro, 'invoicing' => $ro, 'documents' => $ro,
                'reports' => ['view'],
            ],
            'investisseur' => [
                'dashboard' => ['view'], 'projects' => $ro, 'reports' => ['view'], 'budget' => $ro,
            ],
            'administration' => [
                'dashboard' => ['view'], 'documents' => $rc, 'projects' => $ro,
            ],
            'sav' => [
                'dashboard' => ['view'], 'documents' => $rc, 'projects' => $ro,
            ],
            'recrutement' => [
                'dashboard' => ['view'], 'hr' => $rc, 'documents' => $rc,
            ],
            'ia' => [
                'dashboard' => ['view'], 'ai' => '*', 'reports' => ['view'],
            ],
        ];
    }
}
