<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Table des offres commerciales personnalisées créées par le SuperAdmin.
 * status : draft | sent | accepted | expired
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('custom_offers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained()->cascadeOnDelete();
            $table->foreignId('created_by')->constrained('users');
            $table->text('description');
            $table->float('discount_percent')->default(0);
            $table->date('valid_until')->nullable();
            $table->timestamp('sent_at')->nullable();
            $table->timestamp('accepted_at')->nullable();
            $table->string('status')->default('draft'); // draft, sent, accepted, expired
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('custom_offers');
    }
};
