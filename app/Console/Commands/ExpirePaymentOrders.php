<?php
namespace App\Console\Commands;

use App\Models\PaymentOrder;
use Illuminate\Console\Command;

class ExpirePaymentOrders extends Command
{
    protected $signature = 'construiro:expire-payment-orders';
    protected $description = 'Expire payment orders older than 48h';

    public function handle(): void
    {
        $count = app(\App\Services\Payment\PaymentService::class)->expireOldOrders();
        $this->info("Expired {$count} payment order(s).");
    }
}
