<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('payment_method_configs')) {
            return;
        }

        Schema::create('payment_method_configs', function (Blueprint $table) {
            $table->id();
            $table->string('type'); // mobile_money, bank_transfer_national, bank_transfer_international, electronic, money_transfer, cash_agency, check, crypto, voucher, cash_on_delivery, wire_transfer
            $table->string('name'); // Nom affiché
            $table->boolean('is_active')->default(false);
            $table->json('config')->nullable(); // API keys, account numbers, etc. (never in code)
            $table->json('countries')->nullable(); // Pays où disponible
            $table->text('instructions_fr')->nullable();
            $table->text('instructions_en')->nullable();
            $table->decimal('min_amount', 15, 2)->nullable();
            $table->decimal('max_amount', 15, 2)->nullable();
            $table->string('currency', 10)->default('XOF');
            $table->integer('sort_order')->default(0);
            $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
            $table->unique('type');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payment_method_configs');
    }
};
