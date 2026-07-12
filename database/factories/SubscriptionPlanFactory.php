<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

class SubscriptionPlanFactory extends Factory
{
    public function definition(): array
    {
        return [
            'name' => 'Plan ' . $this->faker->word(),
            'slug' => $this->faker->unique()->slug(),
            'price_monthly' => 49000,
            'price_yearly' => 470000,
            'currency' => 'XOF',
            'max_users' => 10,
            'max_projects' => 20,
            'storage_gb' => 5,
            'is_active' => true,
            'trial_days' => 14,
            'sort_order' => 1,
        ];
    }
}
