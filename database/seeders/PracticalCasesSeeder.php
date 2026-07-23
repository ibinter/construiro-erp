<?php

namespace Database\Seeders;

use App\Models\TrainingCategory;
use App\Models\TrainingResource;
use Illuminate\Database\Seeder;

class PracticalCasesSeeder extends Seeder
{
    public function run(): void
    {
        $cases = [
            // Catégorie démarrage
            [
                'category_slug'  => 'demarrage',
                'title_fr'       => 'Créer et configurer votre première société',
                'description_fr' => 'Guide pas-à-pas : créer votre société dans CONSTRUIRO, inviter des collaborateurs, configurer les modules et lancer votre premier projet en 30 minutes.',
                'level'          => 'beginner',
                'duration_minutes' => 30,
            ],
            [
                'category_slug'  => 'demarrage',
                'title_fr'       => 'Inviter et gérer votre équipe',
                'description_fr' => 'Comment inviter vos collaborateurs, assigner les bons rôles (directeur projet, conducteur travaux, chef chantier) et contrôler les accès par module.',
                'level'          => 'beginner',
                'duration_minutes' => 15,
            ],

            // Catégorie modules-metier
            [
                'category_slug'  => 'modules-metier',
                'title_fr'       => 'Créer un projet de construction de A à Z',
                'description_fr' => 'Création d\'un projet BTP complet : définition du chantier, jalons, budget, affectation des ressources humaines et matérielles, suivi de l\'avancement.',
                'level'          => 'intermediate',
                'duration_minutes' => 45,
            ],
            [
                'category_slug'  => 'modules-metier',
                'title_fr'       => 'Établir un devis BTP professionnel',
                'description_fr' => 'Utiliser le module Devis & BOQ pour créer un devis avec métrés, prix unitaires, TVA et remises. Envoyer au client et suivre l\'approbation.',
                'level'          => 'intermediate',
                'duration_minutes' => 40,
            ],
            [
                'category_slug'  => 'modules-metier',
                'title_fr'       => 'Gérer le stock de matériaux sur chantier',
                'description_fr' => 'Réceptionner des livraisons, consommer des matériaux sur chantier, déclencher des réapprovisionnements automatiques, gérer plusieurs entrepôts.',
                'level'          => 'intermediate',
                'duration_minutes' => 35,
            ],
            [
                'category_slug'  => 'modules-metier',
                'title_fr'       => 'Planifier et pointer les présences RH',
                'description_fr' => 'Créer des équipes de chantier, pointer les présences journalières, gérer les congés et absences, exporter vers la paie.',
                'level'          => 'beginner',
                'duration_minutes' => 20,
            ],

            // Finance
            [
                'category_slug'  => 'finance',
                'title_fr'       => 'Facturer un client et suivre les paiements',
                'description_fr' => 'Créer une facture à partir d\'un devis approuvé, émettre la facture, enregistrer les règlements partiels ou totaux, gérer les retards.',
                'level'          => 'intermediate',
                'duration_minutes' => 30,
            ],
            [
                'category_slug'  => 'finance',
                'title_fr'       => 'Suivre la trésorerie de vos chantiers',
                'description_fr' => 'Tableau de bord trésorerie : entrées/sorties par projet, alertes de dépassement de budget, prévisionnel de trésorerie à 30/60/90 jours.',
                'level'          => 'advanced',
                'duration_minutes' => 25,
            ],

            // Rapports
            [
                'category_slug'  => 'rapports',
                'title_fr'       => 'Générer un rapport d\'avancement chantier',
                'description_fr' => 'Créer un rapport hebdomadaire d\'avancement : taux de réalisation par lot, photos de chantier, incidents HSE, écarts budget/réalisé.',
                'level'          => 'beginner',
                'duration_minutes' => 20,
            ],
            [
                'category_slug'  => 'rapports',
                'title_fr'       => 'Exporter vos données en Excel / PDF',
                'description_fr' => 'Exporter tous les modules clés (projets, factures, paie, stock) en Excel ou PDF. Formats personnalisables, envoi automatique par email.',
                'level'          => 'beginner',
                'duration_minutes' => 10,
            ],

            // Sécurité
            [
                'category_slug'  => 'securite',
                'title_fr'       => 'Configurer la double authentification (2FA)',
                'description_fr' => 'Activer et configurer le TOTP (Google Authenticator / Authy) pour votre compte, gérer les codes de secours, réinitialiser en cas de perte.',
                'level'          => 'beginner',
                'duration_minutes' => 10,
            ],
            [
                'category_slug'  => 'securite',
                'title_fr'       => 'Gérer les rôles et permissions de votre équipe',
                'description_fr' => 'Comprendre les 29 rôles CONSTRUIRO, personnaliser les permissions, créer des accès limités pour les sous-traitants et visiteurs.',
                'level'          => 'advanced',
                'duration_minutes' => 30,
            ],
        ];

        foreach ($cases as $i => $case) {
            $category = TrainingCategory::where('slug', $case['category_slug'])->first();

            if (! $category) {
                $this->command->warn("Catégorie introuvable : {$case['category_slug']} — cas pratique ignoré.");
                continue;
            }

            TrainingResource::updateOrCreate(
                [
                    'category_id' => $category->id,
                    'title_fr'    => $case['title_fr'],
                ],
                [
                    'type'             => 'document',
                    'title_en'         => $case['title_fr'], // placeholder EN = FR
                    'description_fr'   => $case['description_fr'],
                    'description_en'   => null,
                    'url'              => null,
                    'thumbnail'        => null,
                    'duration_minutes' => $case['duration_minutes'],
                    'level'            => $case['level'],
                    'role_restriction' => null,
                    'is_published'     => true,
                    'sort_order'       => 100 + $i, // après les ressources "à venir"
                    'view_count'       => 0,
                ]
            );
        }

        $this->command->info('PracticalCasesSeeder : ' . count($cases) . ' cas pratiques créés/mis à jour.');
    }
}
