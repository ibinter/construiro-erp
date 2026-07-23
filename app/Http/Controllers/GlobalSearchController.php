<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class GlobalSearchController extends Controller
{
    /**
     * GET /search?q=terme — recherche globale inter-modules, filtrée par company_id et permissions.
     */
    public function index(Request $request): JsonResponse
    {
        $query = trim($request->string('q'));

        if (strlen($query) < 2) {
            return response()->json(['results' => [], 'total' => 0]);
        }

        $user      = $request->user();
        $companyId = $user->company_id;
        $results   = [];

        // Définition des modules à rechercher :
        // model       → classe Eloquent
        // label       → libellé humain
        // icon        → emoji affiché dans le dropdown
        // route       → nom de route Laravel pour le lien (null = pas de lien)
        // perm        → permission Spatie requise (null = accessible à tous)
        // fields      → colonnes LIKE à tester (premier = titre, second = sous-titre)
        // company     → true si la table possède une colonne company_id
        $searches = [
            'clients' => [
                'model'   => \App\Models\Client::class,
                'label'   => 'Client',
                'icon'    => '👤',
                'route'   => 'clients.show',
                'perm'    => 'clients.view',
                'fields'  => ['name', 'email'],
                'company' => true,
            ],
            'projects' => [
                'model'   => \App\Models\Project::class,
                'label'   => 'Projet',
                'icon'    => '🏗️',
                'route'   => 'projects.show',
                'perm'    => 'projects.view',
                'fields'  => ['name', 'code'],
                'company' => true,
            ],
            'quotes' => [
                'model'   => \App\Models\Quote::class,
                'label'   => 'Devis',
                'icon'    => '📋',
                'route'   => 'quotes.show',
                'perm'    => 'quotes.view',
                'fields'  => ['title', 'code'],
                'company' => true,
            ],
            'invoices' => [
                'model'   => \App\Models\Invoice::class,
                'label'   => 'Facture',
                'icon'    => '🧾',
                'route'   => 'invoices.show',
                'perm'    => 'invoicing.view',
                'fields'  => ['code', 'title'],
                'company' => true,
            ],
            'contracts' => [
                'model'   => \App\Models\Contract::class,
                'label'   => 'Contrat',
                'icon'    => '📝',
                'route'   => 'contracts.show',
                'perm'    => 'contracts.view',
                'fields'  => ['title', 'reference'],
                'company' => true,
            ],
            'employees' => [
                'model'   => \App\Models\Employee::class,
                'label'   => 'Employé',
                'icon'    => '👷',
                'route'   => 'hr.show',
                'perm'    => 'hr.view',
                'fields'  => ['first_name', 'last_name'],
                'company' => true,
            ],
            'suppliers' => [
                'model'   => \App\Models\Supplier::class,
                'label'   => 'Fournisseur',
                'icon'    => '🏪',
                'route'   => 'suppliers.show',
                'perm'    => 'suppliers.view',
                'fields'  => ['name', 'email'],
                'company' => true,
            ],
            'equipment' => [
                'model'   => \App\Models\Equipment::class,
                'label'   => 'Matériel',
                'icon'    => '🚜',
                'route'   => 'equipment.show',
                'perm'    => 'equipment.view',
                'fields'  => ['name', 'serial_number'],
                'company' => true,
            ],
            'help' => [
                'model'   => \App\Models\LandingFaq::class,
                'label'   => 'Aide',
                'icon'    => '❓',
                'route'   => null,
                'perm'    => null,
                'fields'  => ['question_fr', 'answer_fr'],
                'company' => false,
            ],
        ];

        foreach ($searches as $type => $config) {
            // Vérifier la permission Spatie si applicable
            if ($config['perm'] && ! $user->can($config['perm'])) {
                continue;
            }

            // Vérifier que la classe Eloquent existe
            if (! class_exists($config['model'])) {
                continue;
            }

            try {
                $q = $config['model']::query();

                // Restreindre au périmètre de l'entreprise
                if ($config['company']) {
                    $q->where('company_id', $companyId);
                }

                // Recherche LIKE sur les champs déclarés
                $q->where(function ($sub) use ($config, $query) {
                    foreach ($config['fields'] as $field) {
                        $sub->orWhere($field, 'LIKE', "%{$query}%");
                    }
                });

                $items = $q->limit(5)->get();

                foreach ($items as $item) {
                    // Pour les employés, concaténer prénom + nom
                    if ($type === 'employees') {
                        $title = trim(($item->first_name ?? '') . ' ' . ($item->last_name ?? ''));
                        $sub   = $item->position ?? '';
                    } else {
                        $title = $item->{$config['fields'][0]} ?? '';
                        $sub   = isset($config['fields'][1]) ? ($item->{$config['fields'][1]} ?? '') : '';
                    }

                    $results[] = [
                        'type'  => $type,
                        'label' => $config['label'],
                        'icon'  => $config['icon'],
                        'id'    => $item->id,
                        'title' => $title,
                        'sub'   => $sub,
                        'route' => $config['route'],
                    ];
                }
            } catch (\Throwable) {
                // Table inexistante ou modèle non migré — ignorer silencieusement
                continue;
            }
        }

        // Limiter à 20 résultats au total
        $results = array_slice($results, 0, 20);

        return response()->json([
            'results' => $results,
            'total'   => count($results),
            'query'   => $query,
        ]);
    }
}
