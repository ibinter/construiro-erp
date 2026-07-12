<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('subscription_plans', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->text('description')->nullable();
            $table->decimal('price_monthly', 10, 2)->default(0);
            $table->decimal('price_yearly', 10, 2)->default(0);
            $table->string('currency', 3)->default('XOF');
            $table->integer('max_users')->default(5);
            $table->integer('max_projects')->default(10);
            $table->integer('storage_gb')->default(5);
            $table->json('modules')->nullable(); // list of enabled modules, null = all
            $table->boolean('is_active')->default(true);
            $table->integer('trial_days')->default(14);
            $table->integer('sort_order')->default(0);
            $table->timestamps();
        });

        Schema::create('subscriptions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained()->cascadeOnDelete();
            $table->foreignId('plan_id')->constrained('subscription_plans');
            $table->string('status'); // trial, active, grace, expired, cancelled
            $table->string('billing_cycle')->default('monthly'); // monthly, yearly
            $table->timestamp('trial_ends_at')->nullable();
            $table->timestamp('starts_at')->nullable();
            $table->timestamp('ends_at')->nullable();
            $table->timestamp('grace_ends_at')->nullable(); // 7-day grace after expiry
            $table->timestamp('cancelled_at')->nullable();
            $table->string('activation_key')->nullable()->unique();
            $table->json('meta')->nullable();
            $table->timestamps();

            $table->index(['company_id', 'status']);
            $table->index('ends_at');
        });

        Schema::create('subscription_invoices', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained()->cascadeOnDelete();
            $table->foreignId('subscription_id')->constrained('subscriptions')->cascadeOnDelete();
            $table->string('reference')->unique();
            $table->decimal('amount', 10, 2);
            $table->string('currency', 3)->default('XOF');
            $table->string('payment_method')->nullable(); // mobile_money, bank_transfer, card
            $table->string('status')->default('pending'); // pending, paid, failed, refunded
            $table->timestamp('paid_at')->nullable();
            $table->json('payment_data')->nullable();
            $table->timestamps();

            $table->index(['company_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('subscription_invoices');
        Schema::dropIfExists('subscriptions');
        Schema::dropIfExists('subscription_plans');
    }
};
