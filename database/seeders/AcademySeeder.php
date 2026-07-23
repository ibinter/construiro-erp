<?php

namespace Database\Seeders;

use App\Models\TrainingCategory;
use App\Models\TrainingResource;
use Illuminate\Database\Seeder;

class AcademySeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            ['slug' => 'demarrage',     'name_fr' => 'Démarrage rapide',         'name_en' => 'Quick Start',      'icon' => '🚀', 'color' => '#F58220', 'sort_order' => 1],
            ['slug' => 'administration','name_fr' => 'Administration',            'name_en' => 'Administration',   'icon' => '⚙️', 'color' => '#1E1E1E', 'sort_order' => 2],
            ['slug' => 'modules-metier','name_fr' => 'Modules métier',            'name_en' => 'Business Modules', 'icon' => '🏗️', 'color' => '#3b82f6', 'sort_order' => 3],
            ['slug' => 'finance',       'name_fr' => 'Finance et comptabilité',   'name_en' => 'Finance',          'icon' => '💰', 'color' => '#22c55e', 'sort_order' => 4],
            ['slug' => 'rapports',      'name_fr' => 'Rapports et exports',       'name_en' => 'Reports',          'icon' => '📊', 'color' => '#8b5cf6', 'sort_order' => 5],
            ['slug' => 'mobile-pwa',    'name_fr' => 'Mobile et PWA',             'name_en' => 'Mobile & PWA',     'icon' => '📱', 'color' => '#06b6d4', 'sort_order' => 6],
            ['slug' => 'securite',      'name_fr' => 'Sécurité',                  'name_en' => 'Security',         'icon' => '🔒', 'color' => '#ef4444', 'sort_order' => 7],
            ['slug' => 'nouveautes',    'name_fr' => 'Nouveautés',                'name_en' => "What's New",       'icon' => '✨', 'color' => '#f59e0b', 'sort_order' => 8],
        ];

        // Ressources "à venir" par catégorie (is_published=false)
        $resourceTemplates = [
            'demarrage' => [
                ['title_fr' => 'Créer votre entreprise',          'title_en' => 'Set up your company',        'duration_minutes' => 5,  'level' => 'beginner'],
                ['title_fr' => 'Ajouter vos premiers utilisateurs','title_en' => 'Add your first users',       'duration_minutes' => 4,  'level' => 'beginner'],
                ['title_fr' => 'Paramétrer les modules',          'title_en' => 'Configure modules',          'duration_minutes' => 6,  'level' => 'beginner'],
                ['title_fr' => 'Votre premier projet BTP',        'title_en' => 'Your first BTP project',     'duration_minutes' => 8,  'level' => 'beginner'],
            ],
            'administration' => [
                ['title_fr' => 'Gérer les rôles et permissions',  'title_en' => 'Manage roles & permissions', 'duration_minutes' => 7,  'level' => 'intermediate'],
                ['title_fr' => 'Configuration SMTP et emails',    'title_en' => 'SMTP & email setup',         'duration_minutes' => 5,  'level' => 'intermediate'],
                ['title_fr' => 'Sauvegardes et restauration',     'title_en' => 'Backups & restore',          'duration_minutes' => 6,  'level' => 'advanced'],
            ],
            'modules-metier' => [
                ['title_fr' => 'Gestion de projets et chantiers', 'title_en' => 'Projects & sites management','duration_minutes' => 10, 'level' => 'beginner'],
                ['title_fr' => 'Devis et bons de commande',       'title_en' => 'Quotes & purchase orders',  'duration_minutes' => 8,  'level' => 'intermediate'],
                ['title_fr' => 'Gestion des employés et paie',    'title_en' => 'HR & payroll',               'duration_minutes' => 9,  'level' => 'intermediate'],
                ['title_fr' => 'Stocks et magasins',              'title_en' => 'Stock & warehouses',         'duration_minutes' => 7,  'level' => 'beginner'],
            ],
            'finance' => [
                ['title_fr' => 'Facturation et suivi des paiements','title_en' => 'Invoicing & payments',     'duration_minutes' => 8,  'level' => 'intermediate'],
                ['title_fr' => 'Comptabilité analytique',          'title_en' => 'Cost accounting',           'duration_minutes' => 10, 'level' => 'advanced'],
                ['title_fr' => 'Trésorerie et cash flow',          'title_en' => 'Treasury & cash flow',      'duration_minutes' => 7,  'level' => 'intermediate'],
            ],
            'rapports' => [
                ['title_fr' => 'Tableaux de bord et KPI',         'title_en' => 'Dashboards & KPIs',         'duration_minutes' => 6,  'level' => 'beginner'],
                ['title_fr' => 'Exports Excel et PDF',            'title_en' => 'Excel & PDF exports',       'duration_minutes' => 5,  'level' => 'beginner'],
                ['title_fr' => 'Rapports personnalisés',          'title_en' => 'Custom reports',            'duration_minutes' => 8,  'level' => 'advanced'],
            ],
            'mobile-pwa' => [
                ['title_fr' => 'Installer l\'application PWA',    'title_en' => 'Install the PWA app',       'duration_minutes' => 3,  'level' => 'beginner'],
                ['title_fr' => 'Utilisation hors connexion',      'title_en' => 'Offline usage',             'duration_minutes' => 5,  'level' => 'intermediate'],
            ],
            'securite' => [
                ['title_fr' => 'Authentification à deux facteurs','title_en' => 'Two-factor authentication', 'duration_minutes' => 4,  'level' => 'beginner'],
                ['title_fr' => 'Journaux d\'audit',               'title_en' => 'Audit logs',                'duration_minutes' => 5,  'level' => 'intermediate'],
            ],
            'nouveautes' => [
                ['title_fr' => 'Nouveautés de la version actuelle','title_en' => 'Current version highlights','duration_minutes' => 5,  'level' => 'beginner'],
                ['title_fr' => 'Feuille de route CONSTRUIRO',     'title_en' => 'CONSTRUIRO roadmap',        'duration_minutes' => 4,  'level' => 'beginner'],
            ],
        ];

        foreach ($categories as $catData) {
            $category = TrainingCategory::updateOrCreate(
                ['slug' => $catData['slug']],
                array_merge($catData, ['is_active' => true])
            );

            $templates = $resourceTemplates[$catData['slug']] ?? [];
            foreach ($templates as $i => $res) {
                TrainingResource::updateOrCreate(
                    ['category_id' => $category->id, 'title_fr' => $res['title_fr']],
                    [
                        'type'             => 'video',
                        'title_en'         => $res['title_en'],
                        'description_fr'   => null,
                        'description_en'   => null,
                        'url'              => null,
                        'thumbnail'        => null,
                        'duration_minutes' => $res['duration_minutes'],
                        'level'            => $res['level'],
                        'role_restriction' => null,
                        'is_published'     => false,
                        'sort_order'       => $i + 1,
                        'view_count'       => 0,
                    ]
                );
            }
        }
    }
}
