<?php

namespace Database\Factories;

use App\Models\Company;
use App\Models\Invoice;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class InvoiceFactory extends Factory
{
    protected $model = Invoice::class;

    public function definition(): array
    {
        $subtotal   = $this->faker->randomFloat(2, 100000, 5000000);
        $taxRate    = 18;
        $taxAmount  = round($subtotal * $taxRate / 100, 2);
        $total      = round($subtotal + $taxAmount, 2);

        return [
            'company_id'  => Company::factory(),
            'code'        => 'FAC-' . strtoupper(Str::random(6)) . '-' . $this->faker->unique()->numberBetween(1, 9999),
            'status'      => $this->faker->randomElement(Invoice::STATUSES),
            'currency'    => 'XOF',
            'tax_rate'    => $taxRate,
            'subtotal'    => $subtotal,
            'tax_amount'  => $taxAmount,
            'total'       => $total,
            'amount_paid' => 0,
            'issue_date'  => now()->subDays($this->faker->numberBetween(0, 30)),
            'due_date'    => now()->addDays($this->faker->numberBetween(15, 60)),
        ];
    }
}
