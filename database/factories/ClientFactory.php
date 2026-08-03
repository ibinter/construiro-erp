<?php

namespace Database\Factories;

use App\Models\Client;
use App\Models\Company;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class ClientFactory extends Factory
{
    protected $model = Client::class;

    public function definition(): array
    {
        return [
            'company_id'   => Company::factory(),
            'code'         => 'CLI-' . strtoupper(Str::random(4)) . '-' . $this->faker->unique()->numberBetween(1, 9999),
            'type'         => $this->faker->randomElement(Client::TYPES),
            'name'         => $this->faker->company(),
            'contact_name' => $this->faker->name(),
            'phone'        => $this->faker->phoneNumber(),
            'email'        => $this->faker->unique()->safeEmail(),
            'city'         => $this->faker->city(),
            'country'      => 'CI',
            'is_active'    => true,
        ];
    }
}
