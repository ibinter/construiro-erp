<?php

namespace Database\Seeders;

use App\Models\SubscriptionPlan;
use Illuminate\Database\Seeder;

class SubscriptionPlanSeeder extends Seeder
{
    public function run(): void
    {
        $plans = [
            [
                'name' => 'Starter',
                'slug' => 'starter',
                'description' => 'Pour les PME BTP démarrant leur digitalisation.',
                'price_monthly' => 49000,
                'price_yearly' => 470000,
                'currency' => 'XOF',
                'max_users' => 5,
                'max_projects' => 10,
                'storage_gb' => 5,
                'trial_days' => 14,
                'sort_order' => 1,
            ],
            [
                'name' => 'Pro',
                'slug' => 'pro',
                'description' => 'Pour les entreprises en croissance avec plusieurs chantiers simultanés.',
                'price_monthly' => 99000,
                'price_yearly' => 950000,
                'currency' => 'XOF',
                'max_users' => 20,
                'max_projects' => 50,
                'storage_gb' => 20,
                'trial_days' => 14,
                'sort_order' => 2,
            ],
            [
                'name' => 'Entreprise',
                'slug' => 'enterprise',
                'description' => 'Pour les groupes BTP avec des besoins illimités et un accompagnement dédié.',
                'price_monthly' => 199000,
                'price_yearly' => 1900000,
                'currency' => 'XOF',
                'max_users' => 9999,
                'max_projects' => 9999,
                'storage_gb' => 100,
                'trial_days' => 30,
                'sort_order' => 3,
            ],
        ];

        foreach ($plans as $plan) {
            SubscriptionPlan::updateOrCreate(['slug' => $plan['slug']], $plan);
        }
    }
}
