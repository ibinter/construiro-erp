<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Transactions de trésorerie — entrées (in) et sorties (out) sur un compte.
 * L'agrégation de ces transactions donne le solde courant d'un compte
 * (solde d'ouverture + entrées − sorties). Isolé par entreprise (multi-tenant).
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('treasury_transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained()->cascadeOnDelete();
            $table->foreignId('cash_account_id')->constrained()->cascadeOnDelete();
            $table->foreignId('project_id')->nullable()->constrained()->nullOnDelete();       // Rattachement projet facultatif
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();   // Auteur de la transaction

            $table->string('type');                 // in, out
            $table->string('category')->nullable(); // encaissement_client, achat, salaire, carburant, autre
            $table->decimal('amount', 18, 2);
            $table->date('date');
            $table->string('reference')->nullable();
            $table->text('description')->nullable();

            $table->timestamps();

            $table->index('cash_account_id');
            $table->index('type');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('treasury_transactions');
    }
};
