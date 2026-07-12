<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class CompanyFactory extends Factory
{
    public function definition(): array
    {
        $name = $this->faker->company();
        return [
            'name' => $name,
            'legal_name' => $name . ' SARL',
            'slug' => Str::slug($name) . '-' . Str::random(4),
            'country' => 'CI',
            'city' => $this->faker->city(),
            'base_currency' => 'XOF',
            'locale' => 'fr',
            'timezone' => 'Africa/Abidjan',
            'is_active' => true,
        ];
    }
}
