<?php

/*
|--------------------------------------------------------------------------
| CONSTRUIRO ERP — Configuration métier
|--------------------------------------------------------------------------
|
| Source de vérité de l'architecture fonctionnelle :
|  - PORTAILS : les 29 espaces de travail adaptés au rôle de l'utilisateur.
|  - MODULES  : les 42 modules fonctionnels et leurs permissions.
|
| Le portail est UNIQUE : selon les rôles de l'utilisateur, l'application
| affiche le portail d'accueil et les menus autorisés. Ce fichier alimente
| le seeder des rôles/permissions et le middleware de navigation.
|
*/

return [

    // Devise et langue par défaut de la plateforme (réalités africaines).
    'default_currency' => 'XOF',
    'default_locale'   => 'fr',
    'locales'          => ['fr', 'en'], // pt, ar à venir

    /*
    |--------------------------------------------------------------------------
    | PORTAILS (29)
    |--------------------------------------------------------------------------
    | key      : identifiant technique + slug du rôle associé
    | group    : internal (collaborateurs) | external (partenaires/tiers)
    | home     : route Inertia d'accueil du portail
    */
    'portals' => [
        // --- Portails internes -------------------------------------------------
        'direction_generale'   => ['group' => 'internal', 'icon' => 'building-2',    'name' => ['fr' => 'Direction Générale',   'en' => 'Executive Management']],
        'directeur_projet'     => ['group' => 'internal', 'icon' => 'clipboard-list','name' => ['fr' => 'Directeur de Projet',  'en' => 'Project Director']],
        'conducteur_travaux'   => ['group' => 'internal', 'icon' => 'hard-hat',      'name' => ['fr' => 'Conducteur de Travaux','en' => 'Works Supervisor']],
        'chef_chantier'        => ['group' => 'internal', 'icon' => 'construction',  'name' => ['fr' => 'Chef de Chantier',     'en' => 'Site Manager']],
        'ouvrier'              => ['group' => 'internal', 'icon' => 'user',          'name' => ['fr' => 'Ouvrier',              'en' => 'Worker']],
        'magasinier'           => ['group' => 'internal', 'icon' => 'warehouse',     'name' => ['fr' => 'Magasinier',           'en' => 'Storekeeper']],
        'achats'               => ['group' => 'internal', 'icon' => 'shopping-cart', 'name' => ['fr' => 'Achats',               'en' => 'Procurement']],
        'comptabilite'         => ['group' => 'internal', 'icon' => 'calculator',    'name' => ['fr' => 'Comptabilité',         'en' => 'Accounting']],
        'rh'                   => ['group' => 'internal', 'icon' => 'users',         'name' => ['fr' => 'Ressources Humaines',  'en' => 'Human Resources']],
        'maintenance'          => ['group' => 'internal', 'icon' => 'wrench',        'name' => ['fr' => 'Maintenance',          'en' => 'Maintenance']],
        'qhse'                 => ['group' => 'internal', 'icon' => 'shield-check',   'name' => ['fr' => 'QHSE',                 'en' => 'HSE']],
        'qualite'              => ['group' => 'internal', 'icon' => 'badge-check',    'name' => ['fr' => 'Qualité',             'en' => 'Quality']],
        'laboratoire'          => ['group' => 'internal', 'icon' => 'flask-conical', 'name' => ['fr' => 'Laboratoire',          'en' => 'Laboratory']],

        // --- Portails externes -------------------------------------------------
        'client'               => ['group' => 'external', 'icon' => 'handshake',     'name' => ['fr' => 'Client / Maître d\'ouvrage', 'en' => 'Client / Owner']],
        'promoteur'            => ['group' => 'external', 'icon' => 'home',          'name' => ['fr' => 'Promoteur Immobilier', 'en' => 'Real Estate Developer']],
        'acquereur'            => ['group' => 'external', 'icon' => 'key-round',      'name' => ['fr' => 'Acquéreur',            'en' => 'Buyer']],
        'fournisseur'          => ['group' => 'external', 'icon' => 'truck',         'name' => ['fr' => 'Fournisseur',          'en' => 'Supplier']],
        'sous_traitant'        => ['group' => 'external', 'icon' => 'users-round',   'name' => ['fr' => 'Sous-traitant',        'en' => 'Subcontractor']],
        'architecte'           => ['group' => 'external', 'icon' => 'pen-tool',      'name' => ['fr' => 'Architecte',           'en' => 'Architect']],
        'bureau_etudes'        => ['group' => 'external', 'icon' => 'ruler',         'name' => ['fr' => 'Bureau d\'Études',      'en' => 'Design Office']],
        'bureau_controle'      => ['group' => 'external', 'icon' => 'clipboard-check','name' => ['fr' => 'Bureau de Contrôle',   'en' => 'Control Office']],
        'mission_controle'     => ['group' => 'external', 'icon' => 'camera',        'name' => ['fr' => 'Mission de Contrôle',  'en' => 'Supervision Mission']],
        'ingenieur_conseil'    => ['group' => 'external', 'icon' => 'graduation-cap','name' => ['fr' => 'Ingénieur Conseil',    'en' => 'Consulting Engineer']],
        'banque'               => ['group' => 'external', 'icon' => 'landmark',      'name' => ['fr' => 'Banque',               'en' => 'Bank']],
        'investisseur'         => ['group' => 'external', 'icon' => 'trending-up',   'name' => ['fr' => 'Investisseur',         'en' => 'Investor']],
        'administration'       => ['group' => 'external', 'icon' => 'building',      'name' => ['fr' => 'Administration Publique','en' => 'Public Authority']],
        'sav'                  => ['group' => 'external', 'icon' => 'life-buoy',      'name' => ['fr' => 'SAV',                  'en' => 'After-Sales']],
        'recrutement'          => ['group' => 'external', 'icon' => 'user-plus',     'name' => ['fr' => 'Recrutement',          'en' => 'Recruitment']],
        'ia'                   => ['group' => 'internal', 'icon' => 'sparkles',      'name' => ['fr' => 'Assistant IA',         'en' => 'AI Assistant']],
    ],

    /*
    |--------------------------------------------------------------------------
    | MODULES (42)
    |--------------------------------------------------------------------------
    | Chaque module génère des permissions « module.action ».
    | actions par défaut : view, create, update, delete, export.
    | group : regroupement pour la navigation.
    */
    'default_actions' => ['view', 'create', 'update', 'delete', 'export'],

    'modules' => [
        // Pilotage
        'dashboard'        => ['group' => 'pilotage', 'icon' => 'layout-dashboard', 'actions' => ['view'],           'name' => ['fr' => 'Tableau de bord',        'en' => 'Dashboard']],
        'projects'         => ['group' => 'pilotage', 'icon' => 'folder-kanban',   'name' => ['fr' => 'Projets',                'en' => 'Projects']],
        'sites'            => ['group' => 'pilotage', 'icon' => 'construction',    'name' => ['fr' => 'Chantiers',              'en' => 'Sites']],
        'planning'         => ['group' => 'pilotage', 'icon' => 'gantt-chart',     'name' => ['fr' => 'Planning & Gantt',       'en' => 'Planning & Gantt']],

        // Bureau d'études / avant-vente
        'design_office'    => ['group' => 'etudes',   'icon' => 'ruler',           'name' => ['fr' => 'Bureau d\'études',        'en' => 'Design Office']],
        'quotes'           => ['group' => 'etudes',   'icon' => 'file-text',       'name' => ['fr' => 'Devis',                  'en' => 'Quotes']],
        'takeoff'          => ['group' => 'etudes',   'icon' => 'calculator',      'name' => ['fr' => 'Métré',                  'en' => 'Take-off']],
        'boq'              => ['group' => 'etudes',   'icon' => 'list-checks',     'name' => ['fr' => 'DQE',                    'en' => 'BoQ']],
        'unit_prices'      => ['group' => 'etudes',   'icon' => 'tags',            'name' => ['fr' => 'BPU',                    'en' => 'Unit Price List']],
        'tenders'          => ['group' => 'etudes',   'icon' => 'gavel',           'name' => ['fr' => 'Appels d\'offres',        'en' => 'Tenders']],

        // Commercial / tiers
        'crm'              => ['group' => 'commercial','icon' => 'contact',        'name' => ['fr' => 'CRM',                    'en' => 'CRM']],
        'clients'          => ['group' => 'commercial','icon' => 'handshake',      'name' => ['fr' => 'Clients',                'en' => 'Clients']],
        'suppliers'        => ['group' => 'commercial','icon' => 'truck',          'name' => ['fr' => 'Fournisseurs',           'en' => 'Suppliers']],
        'subcontractors'   => ['group' => 'commercial','icon' => 'users-round',    'name' => ['fr' => 'Sous-traitants',         'en' => 'Subcontractors']],
        'contracts'        => ['group' => 'commercial','icon' => 'file-signature', 'name' => ['fr' => 'Contrats',               'en' => 'Contracts']],

        // Achats & stocks
        'purchases'        => ['group' => 'achats',   'icon' => 'shopping-cart',   'name' => ['fr' => 'Achats',                 'en' => 'Purchases']],
        'stocks'           => ['group' => 'achats',   'icon' => 'boxes',           'name' => ['fr' => 'Stocks',                 'en' => 'Stocks']],
        'warehouses'       => ['group' => 'achats',   'icon' => 'warehouse',       'name' => ['fr' => 'Magasins',               'en' => 'Warehouses']],
        'materials'        => ['group' => 'achats',   'icon' => 'package',         'name' => ['fr' => 'Matériaux',              'en' => 'Materials']],

        // Parc matériel
        'equipment'        => ['group' => 'parc',     'icon' => 'forklift',        'name' => ['fr' => 'Parc matériel',          'en' => 'Equipment Fleet']],
        'machinery'        => ['group' => 'parc',     'icon' => 'tractor',         'name' => ['fr' => 'Engins',                 'en' => 'Heavy Machinery']],
        'vehicles'         => ['group' => 'parc',     'icon' => 'car',             'name' => ['fr' => 'Véhicules',              'en' => 'Vehicles']],
        'fuel'             => ['group' => 'parc',     'icon' => 'fuel',            'name' => ['fr' => 'Carburant',              'en' => 'Fuel']],
        'maintenance'      => ['group' => 'parc',     'icon' => 'wrench',          'name' => ['fr' => 'Maintenance',            'en' => 'Maintenance']],

        // RH & paie
        'hr'               => ['group' => 'rh',       'icon' => 'users',           'name' => ['fr' => 'Ressources humaines',    'en' => 'Human Resources']],
        'attendance'       => ['group' => 'rh',       'icon' => 'fingerprint',     'name' => ['fr' => 'Pointage',               'en' => 'Attendance']],
        'payroll'          => ['group' => 'rh',       'icon' => 'banknote',        'name' => ['fr' => 'Paie',                   'en' => 'Payroll']],

        // Finance
        'budget'           => ['group' => 'finance',  'icon' => 'wallet',          'name' => ['fr' => 'Budget',                 'en' => 'Budget']],
        'cost_accounting'  => ['group' => 'finance',  'icon' => 'pie-chart',       'name' => ['fr' => 'Comptabilité analytique','en' => 'Cost Accounting']],
        'accounting'       => ['group' => 'finance',  'icon' => 'book',            'name' => ['fr' => 'Comptabilité générale',  'en' => 'General Accounting']],
        'treasury'         => ['group' => 'finance',  'icon' => 'coins',           'name' => ['fr' => 'Trésorerie',             'en' => 'Treasury']],
        'invoicing'        => ['group' => 'finance',  'icon' => 'receipt',         'name' => ['fr' => 'Facturation',            'en' => 'Invoicing']],
        'incoming_payments'=> ['group' => 'finance',  'icon' => 'arrow-down-circle','name' => ['fr' => 'Encaissements',         'en' => 'Incoming Payments']],
        'outgoing_payments'=> ['group' => 'finance',  'icon' => 'arrow-up-circle', 'name' => ['fr' => 'Décaissements',          'en' => 'Outgoing Payments']],

        // QHSE / Qualité
        'qhse'             => ['group' => 'qhse',     'icon' => 'shield-check',    'name' => ['fr' => 'QHSE',                   'en' => 'HSE']],
        'quality'          => ['group' => 'qhse',     'icon' => 'badge-check',     'name' => ['fr' => 'Contrôle qualité',       'en' => 'Quality Control']],
        'laboratory'       => ['group' => 'qhse',     'icon' => 'flask-conical',   'name' => ['fr' => 'Laboratoire',            'en' => 'Laboratory']],

        // Documents & transverse
        'documents'        => ['group' => 'transverse','icon' => 'files',          'name' => ['fr' => 'Gestion documentaire',   'en' => 'Document Management']],
        'e_signature'      => ['group' => 'transverse','icon' => 'pen-line',       'name' => ['fr' => 'Signature électronique', 'en' => 'E-Signature']],
        'bi'               => ['group' => 'transverse','icon' => 'chart-no-axes-combined', 'actions' => ['view'], 'name' => ['fr' => 'Tableau de bord BI', 'en' => 'BI Dashboard']],
        'reports'          => ['group' => 'transverse','icon' => 'bar-chart-3',    'name' => ['fr' => 'Rapports & BI',          'en' => 'Reports & BI']],
        'ai'               => ['group' => 'transverse','icon' => 'sparkles',       'name' => ['fr' => 'Intelligence Artificielle','en' => 'Artificial Intelligence']],
        'administration'   => ['group' => 'transverse','icon' => 'settings',       'name' => ['fr' => 'Administration',         'en' => 'Administration']],

        // Outils transverses (accessibles à tous les utilisateurs authentifiés)
        'academy'          => ['group' => 'outils',   'icon' => 'book-open',      'actions' => ['view'], 'name' => ['fr' => 'Académie',               'en' => 'Academy']],
        'import'           => ['group' => 'outils',   'icon' => 'upload',         'actions' => ['view', 'create'], 'name' => ['fr' => 'Import de données', 'en' => 'Data Import']],
    ],

    /*
    |--------------------------------------------------------------------------
    | Groupes de navigation (ordre + libellés)
    |--------------------------------------------------------------------------
    */
    'module_groups' => [
        'pilotage'   => ['fr' => 'Pilotage',            'en' => 'Steering'],
        'etudes'     => ['fr' => 'Bureau d\'études',     'en' => 'Design Office'],
        'commercial' => ['fr' => 'Commercial & Tiers',  'en' => 'Sales & Third Parties'],
        'achats'     => ['fr' => 'Achats & Stocks',     'en' => 'Procurement & Stocks'],
        'parc'       => ['fr' => 'Parc Matériel',       'en' => 'Equipment Fleet'],
        'rh'         => ['fr' => 'Ressources Humaines',  'en' => 'Human Resources'],
        'finance'    => ['fr' => 'Finances',            'en' => 'Finance'],
        'qhse'       => ['fr' => 'QHSE & Qualité',      'en' => 'HSE & Quality'],
        'transverse' => ['fr' => 'Transverse',          'en' => 'Cross-functional'],
        'outils'     => ['fr' => 'Outils & Ressources', 'en' => 'Tools & Resources'],
    ],
];
