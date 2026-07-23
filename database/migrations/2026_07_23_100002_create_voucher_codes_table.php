<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('voucher_codes')) {
            return;
        }

        Schema::create('voucher_codes', function (Blueprint $table) {
            $table->id();
            $table->string('code', 20)->unique();
            $table->string('batch_id', 36)->nullable()->index(); // UUID batch
            $table->decimal('value', 15, 2);
            $table->string('currency', 10)->default('XOF');
            $table->string('plan_id_restriction')->nullable(); // si limité à un plan
            $table->boolean('is_used')->default(false);
            $table->foreignId('used_by_company_id')->nullable()->constrained('companies')->nullOnDelete();
            $table->foreignId('used_by_payment_order_id')->nullable()->constrained('payment_orders')->nullOnDelete();
            $table->timestamp('used_at')->nullable();
            $table->timestamp('expires_at')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
            $table->index(['is_used', 'expires_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('voucher_codes');
    }
};
