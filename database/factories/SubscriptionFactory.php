<?php

namespace Database\Factories;

use App\Models\Company;
use App\Models\Subscription;
use App\Models\SubscriptionPlan;
use Illuminate\Database\Eloquent\Factories\Factory;

class SubscriptionFactory extends Factory
{
    protected $model = Subscription::class;

    public function definition(): array
    {
        return [
            'company_id'    => Company::factory(),
            'plan_id'       => SubscriptionPlan::factory(),
            'status'        => 'active',
            'billing_cycle' => 'monthly',
            'starts_at'     => now()->subDay(),
            'ends_at'       => now()->addMonth(),
        ];
    }
}
