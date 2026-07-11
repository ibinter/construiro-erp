<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('mobile_money_transactions', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('company_id');
            $table->unsignedBigInteger('invoice_id')->nullable();
            $table->decimal('amount', 15, 2);
            $table->string('currency', 10)->default('XOF');
            $table->string('phone_number', 20);
            $table->enum('operator', ['orange_money', 'mtn_momo', 'wave']);
            $table->string('reference', 64)->unique();
            $table->enum('status', ['pending', 'success', 'failed', 'expired'])->default('pending');
            $table->json('webhook_payload')->nullable();
            $table->timestamp('initiated_at')->nullable();
            $table->timestamp('confirmed_at')->nullable();
            $table->timestamps();

            $table->foreign('company_id')->references('id')->on('companies')->cascadeOnDelete();
            $table->foreign('invoice_id')->references('id')->on('invoices')->nullOnDelete();
            $table->index(['company_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('mobile_money_transactions');
    }
};
