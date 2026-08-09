<?php

namespace Database\Seeders;

use App\Models\SubscriptionPlan;
use App\Services\LicenseConfig;
use Illuminate\Database\Seeder;

class SubscriptionPlanSeeder extends Seeder
{
    public function run(): void
    {
        // Durée d'essai UNIQUE de la solution, lue depuis la source unique (cahier §D4/C1).
        $essai = LicenseConfig::essaiJours();

        $plans = [
            // Palier gratuit « Découverte » (cahier §3) — plafonné par le compteur métier (1 chantier).
            [
                'name' => 'Découverte',
                'slug' => 'decouverte',
                'description' => 'Palier gratuit à vie : 1 chantier, fonctions de base. Sans carte bancaire.',
                'price_monthly' => 0,
                'price_yearly' => 0,
                'currency' => 'XOF',
                'max_users' => 1,
                'max_projects' => 1,
                'storage_gb' => 1,
                'trial_days' => 0,
                'is_active'  => true,
                'sort_order' => 0,
            ],
            [
                'name' => 'Solo',
                'slug' => 'solo',
                'description' => 'Pour les artisans et auto-entrepreneurs BTP.',
                'price_monthly' => 15000,
                'price_yearly' => 150000,
                'currency' => 'XOF',
                'max_users' => 3,
                'max_projects' => 5,
                'storage_gb' => 2,
                'trial_days' => $essai,
                'is_active'  => true,
                'sort_order' => 1,
            ],
            [
                'name' => 'Starter',
                'slug' => 'starter',
                'description' => 'Pour les PME BTP démarrant leur digitalisation.',
                'price_monthly' => 39000,
                'price_yearly' => 390000,
                'currency' => 'XOF',
                'max_users' => 10,
                'max_projects' => 20,
                'storage_gb' => 10,
                'trial_days' => $essai,
                'is_active'  => true,
                'sort_order' => 2,
            ],
            [
                'name' => 'Pro',
                'slug' => 'pro',
                'description' => 'Pour les entreprises en croissance avec plusieurs chantiers simultanés.',
                'price_monthly' => 89000,
                'price_yearly' => 890000,
                'currency' => 'XOF',
                'max_users' => 20,
                'max_projects' => 50,
                'storage_gb' => 20,
                'trial_days' => $essai,
                'is_active'  => true,
                'sort_order' => 3,
            ],
            [
                'name' => 'Entreprise',
                'slug' => 'enterprise',
                'description' => 'Pour les groupes BTP avec des besoins illimités et un accompagnement dédié.',
                'price_monthly' => 189000,
                'price_yearly' => 1890000,
                'currency' => 'XOF',
                'max_users' => 9999,
                'max_projects' => 9999,
                'storage_gb' => 100,
                'trial_days' => $essai,
                'is_active'  => true,
                'sort_order' => 4,
            ],
        ];

        foreach ($plans as $plan) {
            SubscriptionPlan::updateOrCreate(['slug' => $plan['slug']], $plan);
        }
    }
}
