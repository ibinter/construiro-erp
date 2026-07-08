<?php

namespace Database\Seeders;

use App\Models\Currency;
use Illuminate\Database\Seeder;

class CurrencySeeder extends Seeder
{
    public function run(): void
    {
        $currencies = [
            ['code' => 'XOF', 'name' => 'Franc CFA BCEAO',  'symbol' => 'FCFA', 'decimal_places' => 0, 'exchange_rate' => 1],
            ['code' => 'XAF', 'name' => 'Franc CFA BEAC',   'symbol' => 'FCFA', 'decimal_places' => 0, 'exchange_rate' => 1],
            ['code' => 'EUR', 'name' => 'Euro',             'symbol' => '€',    'decimal_places' => 2, 'exchange_rate' => 655.957],
            ['code' => 'USD', 'name' => 'Dollar américain', 'symbol' => '$',    'decimal_places' => 2, 'exchange_rate' => 600],
            ['code' => 'GHS', 'name' => 'Cedi ghanéen',     'symbol' => '₵',    'decimal_places' => 2, 'exchange_rate' => 45],
            ['code' => 'NGN', 'name' => 'Naira nigérian',   'symbol' => '₦',    'decimal_places' => 2, 'exchange_rate' => 0.4],
        ];

        foreach ($currencies as $currency) {
            Currency::updateOrCreate(['code' => $currency['code']], $currency);
        }
    }
}
