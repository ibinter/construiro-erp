<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('payment_orders')) {
            return;
        }

        Schema::create('payment_orders', function (Blueprint $table) {
            $table->id();
            $table->string('reference')->unique(); // PAY-2026-XXXXXX
            $table->foreignId('company_id')->constrained('companies')->cascadeOnDelete();
            $table->foreignId('plan_id')->nullable()->constrained('subscription_plans')->nullOnDelete();
            $table->string('billing_cycle', 20)->default('monthly'); // monthly, yearly
            $table->decimal('amount', 15, 2);
            $table->string('currency', 10)->default('XOF');
            $table->string('payment_method_type'); // type from payment_method_configs
            $table->string('payment_method_sub')->nullable(); // ex: orange_money, cinetpay
            $table->string('status', 30)->default('pending'); // pending, submitted, confirmed, rejected, expired, cancelled
            $table->string('idempotency_key')->unique(); // prevents double activation
            $table->string('event_id')->nullable()->unique(); // for webhook dedup
            $table->string('gateway_transaction_id')->nullable();
            $table->string('proof_path')->nullable(); // storage path of uploaded proof
            $table->string('proof_sha256')->nullable(); // detect duplicate proof files
            $table->foreignId('confirmed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('confirmed_at')->nullable();
            $table->text('rejected_reason')->nullable();
            $table->timestamp('expires_at')->nullable(); // order expires after 48h
            $table->json('gateway_response')->nullable();
            $table->json('metadata')->nullable(); // extra fields per method
            $table->timestamps();
            $table->index(['company_id', 'status']);
            $table->index('status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payment_orders');
    }
};
