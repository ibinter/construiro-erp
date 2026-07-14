<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AcademyController extends Controller
{
    private const CATALOG = [
        [
            'slug'        => 'demarrage',
            'title_fr'    => 'Démarrage rapide',
            'title_en'    => 'Quick Start',
            'icon'        => '🚀',
            'description' => 'Configurez CONSTRUIRO en moins de 30 minutes.',
            'lessons'     => [
                ['title' => 'Créer votre entreprise', 'duration' => '5 min', 'type' => 'video'],
                ['title' => 'Ajouter vos premiers utilisateurs', 'duration' => '4 min', 'type' => 'video'],
                ['title' => 'Paramétrer les modules', 'duration' => '6 min', 'type' => 'video'],
                ['title' => 'Votre premier projet BTP', 'duration' => '8 min', 'type' => 'video'],
            ],
        ],
        [
            'slug'        => 'projets',
            'title_fr'    => 'Gestion de projets',
            'title_en'    => 'Project Management',
            'icon'        => '🏗️',
            'description' => 'Maîtrisez le suivi de chantiers, plannings et budgets.',
            'lessons'     => [
                ['title' => 'Créer et configurer un projet', 'duration' => '7 min', 'type' => 'video'],
                ['title' => 'Planning Gantt & jalons', 'duration' => '10 min', 'type' => 'video'],
                ['title' => 'Suivi budgétaire en temps réel', 'duration' => '8 min', 'type' => 'video'],
                ['title' => 'Rapports d\'avancement', 'duration' => '6 min', 'type' => 'video'],
            ],
        ],
        [
            'slug'        => 'facturation',
            'title_fr'    => 'Facturation & devis',
            'title_en'    => 'Invoicing & Quotes',
            'icon'        => '📄',
            'description' => 'Créez des devis professionnels et gérez vos factures.',
            'lessons'     => [
                ['title' => 'Créer un devis avec QR code', 'duration' => '6 min', 'type' => 'video'],
                ['title' => 'Convertir un devis en facture', 'duration' => '4 min', 'type' => 'video'],
                ['title' => 'Suivi des paiements', 'duration' => '5 min', 'type' => 'video'],
                ['title' => 'Relances automatiques', 'duration' => '5 min', 'type' => 'video'],
            ],
        ],
        [
            'slug'        => 'rh',
            'title_fr'    => 'Ressources humaines',
            'title_en'    => 'Human Resources',
            'icon'        => '👷',
            'description' => 'Gérez vos équipes, contrats et paie.',
            'lessons'     => [
                ['title' => 'Ajouter un employé', 'duration' => '5 min', 'type' => 'video'],
                ['title' => 'Gérer les présences', 'duration' => '6 min', 'type' => 'video'],
                ['title' => 'Générer les fiches de paie', 'duration' => '7 min', 'type' => 'video'],
                ['title' => 'Contrats et avenants', 'duration' => '5 min', 'type' => 'video'],
            ],
        ],
        [
            'slug'        => 'ia',
            'title_fr'    => 'Assistant IA SARA',
            'title_en'    => 'AI Assistant SARA',
            'icon'        => '🤖',
            'description' => 'Exploitez SARA pour analyser vos données et générer des rapports.',
            'lessons'     => [
                ['title' => 'Présentation de SARA', 'duration' => '3 min', 'type' => 'video'],
                ['title' => 'Analyser vos finances avec SARA', 'duration' => '8 min', 'type' => 'video'],
                ['title' => 'Générer un rapport de chantier', 'duration' => '6 min', 'type' => 'video'],
                ['title' => 'Questions & réponses avancées', 'duration' => '7 min', 'type' => 'video'],
            ],
        ],
    ];

    public function index(): Response
    {
        return Inertia::render('Academy/Index', [
            'categories' => self::CATALOG,
        ]);
    }

    public function show(string $category): Response
    {
        $cat = collect(self::CATALOG)->firstWhere('slug', $category);

        abort_if(!$cat, 404);

        return Inertia::render('Academy/Category', [
            'category' => $cat,
        ]);
    }
}
