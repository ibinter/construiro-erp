<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Comptes de trésorerie — caisse, banque ou mobile money.
 * Le solde courant n'est pas persisté : il se déduit du solde d'ouverture
 * augmenté des entrées et diminué des sorties (voir treasury_transactions).
 * Isolé par entreprise (multi-tenant).
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('cash_accounts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained()->cascadeOnDelete();

            $table->string('name');
            $table->string('type')->default('caisse');   // caisse, banque, mobile_money
            $table->string('bank_name')->nullable();      // Nom de la banque / opérateur
            $table->string('account_number')->nullable(); // N° de compte / téléphone
            $table->char('currency', 3)->default('XOF');
            $table->decimal('opening_balance', 18, 2)->default(0);
            $table->boolean('is_active')->default(true);

            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('cash_accounts');
    }
};
