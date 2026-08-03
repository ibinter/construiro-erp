<?php

namespace Database\Factories;

use App\Models\Company;
use App\Models\Project;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class ProjectFactory extends Factory
{
    protected $model = Project::class;

    public function definition(): array
    {
        return [
            'company_id'    => Company::factory(),
            'code'          => 'PROJ-' . strtoupper(Str::random(4)) . '-' . $this->faker->unique()->numberBetween(1, 9999),
            'name'          => $this->faker->sentence(3),
            'type'          => $this->faker->randomElement(Project::TYPES),
            'status'        => $this->faker->randomElement(Project::STATUSES),
            'budget_amount' => $this->faker->randomFloat(2, 1000000, 50000000),
            'currency'      => 'XOF',
            'progress'      => $this->faker->numberBetween(0, 100),
            'start_date'    => now()->subMonths(2),
            'end_date'      => now()->addMonths(4),
            'country'       => 'CI',
            'city'          => $this->faker->city(),
        ];
    }
}
